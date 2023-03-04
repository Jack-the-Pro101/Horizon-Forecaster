import {Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

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

class LocationManager {
  activeLocation = null;
  permissionsGranted: null | boolean = null;

  async init() {
    await this.checkPermission();
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

  async saveLocation() {}

  async deleteLocation() {}
}

const locationManager = new LocationManager();
locationManager.init();

export default locationManager;
