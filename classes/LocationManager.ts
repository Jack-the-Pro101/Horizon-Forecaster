import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {uuidv4 as uuid} from '../utils';

import {
  request,
  check,
  PERMISSIONS,
  Permission,
} from 'react-native-permissions';
import {BaseCoordinates} from '../types';

const permissionMap: Partial<{
  [K in typeof Platform.OS]: Permission[];
}> = {
  android: [
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  ],

  ios: [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, PERMISSIONS.IOS.LOCATION_ALWAYS],
};

export interface LocationProfile {
  name: string;
  administration: string;
  country: string;
  gps?: boolean;
  longitude: number;
  latitude: number;
}

export interface LocationProfiles {
  [key: string]: LocationProfile;
}

type ActiveLocationProfile = string | null;

const storeKeyName = 'location_profiles';
const storeActiveName = 'location_active';

class LocationManager {
  selectedLocationId: string | null = null;
  selectedLocation: LocationProfile | null = null;
  permissionsGranted: null | boolean = null;

  private events: {
    [key: string]: any[];
  } = {
    selectedLocation: [],
    locations: [],
  };

  async init() {
    const granted = await this.checkPermission();

    if (!granted) await this.requestPermission();

    const activeLocation = (await AsyncStorage.getItem(
      storeActiveName,
    )) as ActiveLocationProfile;

    if (activeLocation == null && this.permissionsGranted) {
      const location = await this.getCurrentLocation();

      this.selectedLocation = {
        name: 'Current location',
        administration: '',
        country: '',
        gps: true,
        latitude: location!.latitude,
        longitude: location!.longitude,
      };
      this.emitEvent('selectedLocation', this.selectedLocation);
    } else if (activeLocation != null && this.permissionsGranted) {
      this.selectedLocation = JSON.parse(activeLocation);

      this.emitEvent('selectedLocation', this.selectedLocation);
    }
  }

  addEventStateUpdater(type: any, setFunction: any) {
    this.events[type].push(setFunction);
  }

  emitEvent(type: any, data: any) {
    for (let i = 0, n = this.events[type].length; i < n; ++i) {
      this.events[type][i](data);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (this.permissionsGranted || (await this.checkPermission())) return true;

    const osPermission = permissionMap[Platform.OS];

    if (osPermission == null) return false;

    const result = await request(osPermission[0]);

    if (result === 'granted') {
      this.permissionsGranted = true;
      return true;
    }

    this.permissionsGranted = false;
    return false;
  }

  async checkPermission(): Promise<boolean> {
    const osPermission = permissionMap[Platform.OS];

    if (osPermission == null) return false;

    const result = await Promise.all(
      osPermission.map(permission => check(permission)),
    );

    if (result.includes('granted')) {
      this.permissionsGranted = true;

      return true;
    } else {
      this.permissionsGranted = false;

      return false;
    }
  }

  async getCurrentLocation(): Promise<BaseCoordinates | null> {
    if (await this.requestPermission()) {
      const coordinates = await new Promise<BaseCoordinates | null>(
        (resolve, reject) => {
          Geolocation.getCurrentPosition(
            ({coords}) => {
              resolve({latitude: coords.latitude, longitude: coords.longitude});
            },
            error => {
              console.error(error);
              reject(null);
            },
          );
        },
      );

      return coordinates;
    }

    return null;
  }

  async getAllLocations() {
    const profiles = JSON.parse(
      (await AsyncStorage.getItem(storeKeyName)) || '{}',
    ) as LocationProfiles;

    return profiles;
  }

  async getLocation(id: string): Promise<LocationProfile | null> {
    const profiles = await this.getAllLocations();

    return profiles[id];
  }

  async saveLocation(location: LocationProfile) {
    const profiles = await this.getAllLocations();

    console.log(profiles, location);

    profiles[uuid()] = location;

    await AsyncStorage.setItem(storeKeyName, JSON.stringify(profiles));

    this.emitEvent('locations', profiles);
  }

  async deleteLocation(id: string) {
    const profiles = await this.getAllLocations();

    delete profiles[id];

    await AsyncStorage.setItem(storeKeyName, JSON.stringify(profiles));

    this.emitEvent('locations', profiles);
  }
}

const locationManager = new LocationManager();

(async () => await locationManager.init())();

export default locationManager;
