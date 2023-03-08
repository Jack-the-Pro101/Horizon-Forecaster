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

export interface RenderedLocationProfile extends LocationProfile {
  id: string;
}

export interface LocationProfiles {
  [key: string]: LocationProfile;
}

type ActiveLocationProfile = string | null;

const storeKeyName = 'location_profiles';
const storeActiveName = 'location_active';

type EventType = 'selectedLocation' | 'locations';

class LocationManager {
  selectedLocationId: string | null = null;
  selectedLocation: LocationProfile | null = null;
  permissionsGranted: null | boolean = null;

  private events: {
    [key in EventType]: Function[];
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
      this.setActiveLocation(null);
    } else if (activeLocation != null && this.permissionsGranted) {
      this.setActiveLocation(
        JSON.parse(activeLocation) as RenderedLocationProfile,
      );
    }
  }

  addEventStateUpdater(type: keyof typeof this.events, setFunction: any) {
    this.events[type].push(setFunction);
  }

  removeEventStateUpdater(type: keyof typeof this.events, setFunction: any) {
    this.events[type] = this.events[type].filter(func => func === setFunction);
  }

  emitEvent(type: keyof typeof this.events, data: any) {
    for (let i = 0, n = this.events[type].length; i < n; ++i) {
      this.events[type][i](data);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (this.permissionsGranted || (await this.checkPermission())) return true;

    const osPermission = permissionMap[Platform.OS];

    if (osPermission == null) return false;

    const result = await request(osPermission[0]); // BUG: THIS PROMISE PREVENTS FUNCTION FROM RESOLVING! INIT APP LOAD FAILS! FIND FIX.

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

  async setActiveLocation(location: RenderedLocationProfile | null) {
    if (location != null) {
      this.selectedLocation = location;
      this.selectedLocationId = location.id;
      await AsyncStorage.setItem(storeActiveName, JSON.stringify(location));
    } else {
      const location = await this.getCurrentLocation();

      this.selectedLocation = {
        name: 'Current location',
        administration: '',
        country: '',
        gps: true,
        latitude: location!.latitude,
        longitude: location!.longitude,
      };
      this.selectedLocationId = null;
      await AsyncStorage.setItem(storeActiveName, JSON.stringify(null));
    }

    this.emitEvent('selectedLocation', this.selectedLocation);
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
