import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import BackgroundFetch from 'react-native-background-fetch';
import {Alert, Platform} from 'react-native';
import SettingsManager from '../Settings';
import Forecaster from './Forecaster';
import {getNearestSunEvent} from '../utils';

const NOTIFY_CHANNEL_ID = 'horizon-forecaster';

class Notifier {
  constructor() {
    if (SettingsManager.settingsMap['notifications']['notify_all']) this.init();
  }

  async init() {
    BackgroundFetch.stop();

    PushNotification.createChannel(
      {
        channelId: NOTIFY_CHANNEL_ID,
        channelName: 'Horizon Forecaster',
      },
      created => {},
    );

    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);

        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);

        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: Platform.OS === 'ios',
    });

    await BackgroundFetch.configure(
      {
        enableHeadless: true,
        minimumFetchInterval: 15,
        stopOnTerminate: false,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      },
      event,
      timeout,
    );

    BackgroundFetch.registerHeadlessTask(event);

    async function event(event: string | {taskId: string; timeout: boolean}) {
      const isActive = typeof event;

      // @ts-expect-error
      const taskId = isActive === 'string' ? event : event.taskId;
      // @ts-expect-error
      const isTimeout = isActive === 'string' ? '' : event.timeout;

      if (isTimeout) return timeout(taskId);

      const weatherData = await Forecaster.getForecast();

      if (
        weatherData == null ||
        !SettingsManager.settingsMap['notifications']['items']['notify_all']
          .value
      )
        return BackgroundFetch.finish(taskId);

      const sunEvent = getNearestSunEvent(weatherData);
      const type = sunEvent[0];
      const shouldPredictTomorrow = sunEvent[1];

      const forecast = Forecaster.calculateQuality(weatherData, {
        targetTime:
          weatherData.daily[type][1 + (shouldPredictTomorrow ? 1 : 0)],
      });

      if (
        forecast >=
        SettingsManager.settingsMap['notifications']['items']['notify_thres']
          .value
      ) {
        PushNotification.localNotification({
          channelId: NOTIFY_CHANNEL_ID,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} quality: ${
            forecast * 100
          }%`,
          message: `Heads up: predicted ${type} quality (${
            forecast * 100
          }%) meets notify threshold of ${
            SettingsManager.settingsMap['notifications']['items'][
              'notify_thres'
            ].value * 100
          }%.`,
        });
      }

      BackgroundFetch.finish(taskId);
    }

    function timeout(taskId: string) {
      console.error('Failed to start background task: ' + taskId);
      BackgroundFetch.finish(taskId);
    }

    await BackgroundFetch.start();
  }
}

export default new Notifier();
