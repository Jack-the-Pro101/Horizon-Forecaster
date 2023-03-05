import {WeatherDataOptions, RawWeatherData} from '../types';
import locationManager from './LocationManager';

export const API_SOURCES = [
  {
    name: 'General (global)',
    capabilities: [
      'temperature',
      'humiditiy',
      'rain',
      'cloudcover_low',
      'cloudcover_med',
      'cloudcover_high',
      'windspeed',
      'sunrise',
      'sunset',
    ],
  },
];

class DataFetcher {
  async refresh() {
    // await this.getWeatherData(locationManager.selectedLocation.coordinates);
  }

  async getWeatherData(
    options: WeatherDataOptions,
  ): Promise<RawWeatherData | null> {
    const {location} = options;

    const request = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,relativehumidity_2m,rain,cloudcover_low,cloudcover_mid,cloudcover_high,visibility,windspeed_10m,windspeed_80m,windspeed_120m,windspeed_180m&daily=sunrise,sunset&timeformat=unixtime&timezone=America%2FNew_York&past_days=1`,
    );

    if (request.ok) {
      const data = (await request.json()) as RawWeatherData;

      // this.sunrise = data.daily.sunrise[1];
      // this.sunset = data.daily.sunset[1];

      return data;
    } else {
      return null;
    }
  }
}

export default new DataFetcher();
