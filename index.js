/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import SettingsManager from './Settings';
import Notifier from './classes/Notifier';

SettingsManager.init();
Notifier.init();

AppRegistry.registerComponent(appName, () => App);
