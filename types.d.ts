import {LocationProfile} from './classes/LocationManager';
import {NavigatorScreenParams} from '@react-navigation/native';
import {SettingsSection} from './Settings';

export type RootStackParamList = {
  Home: undefined;
  Forecasts: ForecastResult;
  Locations: undefined;
  Settings: undefined;
};

export type LocationStackParamList = {
  Asdf: NavigatorScreenParams<RootStackParamList>;
  Index: CoreGeocodeLocation | undefined;
  Search: undefined;
};

export type SettingsStackParamList = {
  Asdf: NavigatorScreenParams<RootStackParamList>;
  Index: undefined;
  Setting: SettingsSection;
};

export interface BaseCoordinates {
  latitude: number;
  longitude: number;
  elevation: number | null;
}

export interface WeatherDataOptions {
  location: BaseCoordinates;
}

export interface RawWeatherData {
  daily: {
    sunrise: number[];
    sunset: number[];
    time: number[];
    [key: string];
  };

  daily_units: {
    sunrise: string;
    sunset: string;
    time: string;
    [key: string];
  };

  elevation: number;

  generationtime_ms: number;

  hourly: {
    cloudcover_high: number[];
    cloudcover_mid: number[];
    cloudcover_low: number[];
    precipitation: number[];
    rain: number[];
    relativehumidity_150hPa: number[];
    relativehumidity_500hPa: number[];
    relativehumidity_1000hPa: number[];
    temperature_2m: number[];
    visibility: number[];
    windspeed_80m: number[];
    windspeed_120m: number[];
    windspeed_180m: number[];
    time: number[];
    // [key: string]: number[];
  };

  hourly_units: {
    cloudcover_high: string;
    cloudcover_mid: string;
    cloudcover_low: string;
    precipitation: string;
    rain: string;
    temperature_2m: string;
    visibility: string;
    relativehumidity_150hPa: string;
    relativehumidity_500hPa: string;
    relativehumidity_1000hPa: string;
    windspeed_10m: string;
    windspeed_80m: string;
    windspeed_120m: string;
    windspeed_180m: string;
    [key: string];
  };

  latitude: number;
  longitude: number;

  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
}

export interface ForecastedData {
  sunsetQuality: number;
  info: {
    sunrise: Date;
    sunset: Date;
  };
}

export interface RawGeocodeLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  feature_code: string;
  country_code: string;
  admin1_id: number;
  admin2_id: number;
  admin3_id: number;
  admin4_id: number;
  timezone: string;
  population: number;
  postcodes: string[];
  country_id: number;
  country: string;
  admin1: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
}

export interface RawGeocodeData {
  generationtime_ms: number;
  results?: RawGeocodeLocation[];
}

export interface CoreGeocodeLocation
  extends Omit<
    RawGeocodeLocation,
    | 'feature_code'
    | 'admin2'
    | 'admin3'
    | 'admin4'
    | 'country_id'
    | 'country_code'
    | 'population'
    | 'admin1_id'
    | 'admin2_id'
    | 'admin3_id'
    | 'admin4_id'
    | 'postcodes'
  > {}

type SunTime = 'sunrise' | 'sunset';

interface Forecast {
  quality: number;
  type: SunTime;
}

interface UpcomingForecast extends Forecast {
  date: number;
}

export interface ForecastResult {
  current: Forecast;
  upcoming: UpcomingForecast[];
}
