export type RootStackParamList = {
  Home: undefined;
};

export interface BaseCoordinates {
  latitude: number;
  longitude: number;
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
    rain: number[];
    relativehumidity_2m: number[];
    temperature_2m: number[];
    visibility: number[];
    windspeed_10m: number[];
    windspeed_80m: number[];
    windspeed_120m: number[];
    windspeed_180m: number[];
    time: number[];
    [key: string];
  };

  hourly_units: {
    cloudcover_high: string;
    cloudcover_mid: string;
    cloudcover_low: string;
    rain: string;
    relativehumidity_2m: string;
    temperature_2m: string;
    visibility: string;
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
