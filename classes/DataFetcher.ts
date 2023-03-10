import {WeatherDataOptions, RawWeatherData, RawGeocodeData} from '../types';
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
  async getGeocode(query: string): Promise<RawGeocodeData | null> {
    const request = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query,
      )}`,
    );

    if (request.ok) {
      const data = (await request.json()) as RawGeocodeData;

      return data.results != null ? data : null;
    } else {
      return null;
    }
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

      console.log(data);

      return data;
    } else {
      return null;
    }
  }
}

export default new DataFetcher();
