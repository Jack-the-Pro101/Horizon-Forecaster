import {KeyboardTypeOptions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SettingsSection {
  displayTitle: string;
  id: string;
  items: Setting[];
}

export interface Setting {
  name: string;
  id: string;
  description?: string;
  default: any;
  type: 'boolean' | 'number' | 'string';
  keyboardType?: KeyboardTypeOptions;
}

export const settings: SettingsSection[] = [
  {
    displayTitle: 'General',
    id: 'general',
    items: [
      {
        name: 'Severe weather bar',
        id: 'weather_bar',
        description:
          'Toggles whether or not to display a sticky warning bar when severe weather is detected.',
        default: true,
        type: 'boolean',
      },
    ],
  },
  {
    displayTitle: 'Notifications',
    id: 'notifications',
    items: [
      {
        name: 'Receive notifications',
        id: 'notif_all',
        description: 'This option toggles all notifications.',
        default: true,
        type: 'boolean',
      },
      {
        name: 'Notify Threshold',
        id: 'notif_thres',
        description: 'Notify if percentage matches or exceeds setting.',
        default: 0.5,
        type: 'number',
        keyboardType: 'numeric',
      },
    ],
  },
];

const storageKey = 'settings';

interface SettingsMap {
  // @ts-expect-error
  [key: string];
}

class SettingsManager {
  settingsMap: SettingsMap;

  constructor() {
    this.settingsMap = settings
      .map(setting => {
        return {
          ...setting,
          items: setting.items.reduce((obj, item) => {
            // @ts-expect-error
            item.value = item.default;
            // @ts-expect-error
            obj[item.id] = item;

            return obj;
          }, {}),
        };
      })
      // @ts-expect-error
      .reduce((obj, item) => ((obj[item.id] = item), obj), {});
  }

  async init() {
    const savedSettings = await AsyncStorage.getItem(storageKey);

    if (savedSettings == null) return;

    this.settingsMap = {
      ...this.settingsMap,
      ...JSON.parse(savedSettings),
    };
  }

  editSetting(sectionId: string, settingId: string, value: any) {
    const newValue = !value[sectionId]['items'][settingId].value;

    const newObject = {
      ...value,
    };

    newObject[sectionId]['items'][settingId].value = newValue;

    return newObject;
  }

  async saveSettings() {
    await AsyncStorage.setItem(storageKey, JSON.stringify(this.settingsMap));
  }
}

export default new SettingsManager();
