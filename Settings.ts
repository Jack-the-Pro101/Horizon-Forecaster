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
    ],
  },
];
