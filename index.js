/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import SettingsManager from './Settings';
import Notifier from './classes/Notifier';

(async () => {
  await SettingsManager.init();

  Notifier;

  AppRegistry.registerComponent(appName, () => App);
})();
