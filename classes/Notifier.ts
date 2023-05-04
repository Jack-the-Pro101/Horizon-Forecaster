import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import BackgroundFetch from 'react-native-background-fetch';
import {Platform} from 'react-native';
import SettingsManager from '../Settings';
import Forecaster from './Forecaster';
import {getNearestSunEvent} from '../utils';

class Notifier {
  constructor() {
    if (SettingsManager.settingsMap['notifications']['notify_all']) this.init();
  }

  init() {
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

    BackgroundFetch.configure(
      {
        minimumFetchInterval: 30,
      },
      async taskId => {
        const weatherData = await Forecaster.getForecast();

        if (weatherData == null) return BackgroundFetch.finish(taskId);

        const forecast = Forecaster.calculateQuality(weatherData, {
          targetTime: weatherData.daily.sunset[1],
        });

        const sunEvent = getNearestSunEvent(weatherData);
        const type = sunEvent[0];
        const shouldPredictTomorrow = sunEvent[1];

        if (
          forecast >=
          SettingsManager.settingsMap['notifications']['notify_thres']
        ) {
        }

        BackgroundFetch.finish(taskId);
      },
      taskId => {
        console.error('Failed to start background task: ' + taskId);
      },
    );
  }
}

export default new Notifier();
