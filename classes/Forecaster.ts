import {ForecastedData, RawWeatherData} from '../types';
import {binarySearchRound} from '../utils';
import DataFetcher from './DataFetcher';
import LocationManager from './LocationManager';

const weightMap: {
  [key: string]: number;
} = {
  moisture: 100,
  cloudcover: 70,
  windspeed: 50,
  visibility: 70,
  rain: 90,
};

const totalWeight = Object.keys(weightMap).reduce(
  (accumValue, currentValue) => (accumValue += weightMap[currentValue]),
  0,
);

interface WeightFunction {}

function numberPercentProximity(
  inputNumber: number,
  optimalNumber: number,
): number {
  return Math.max(
    inputNumber < optimalNumber
      ? inputNumber / optimalNumber
      : inputNumber / optimalNumber - (inputNumber / optimalNumber - 1) * 2,
    0,
  );
}

const weightFunctions /*: WeightFunction[] */ = [
  {
    for: 'cloudcover',
    check: (dataType: string): boolean => dataType.startsWith('cloudcover'),
    calculate: function (
      data: any,
      times: number[],
      targetTime: number,
    ): number {
      // Find what time is closest to target time
      const targetIndex = binarySearchRound(times, targetTime, (a, b) => a - b);

      const quality = 0.8;

      return quality * weightMap[this.for];
    },
  },

  {
    for: 'visibility',
    check: (dataType: string): boolean => dataType === 'visibility',
    calculate: function (
      data: any,
      times: number[],
      targetTime: number,
    ): number {
      const quality = 0.5;

      return quality * weightMap[this.for];
    },
  },
];

interface ForecastCalculationOptions {
  targetTime: number;
}

class Forecaster {
  calculateQuality(
    data: RawWeatherData,
    options: ForecastCalculationOptions,
  ): number {
    const relevantData = data.hourly;

    const dataTypes = Object.keys(relevantData);

    const totalPossibleWeight = weightFunctions.reduce(
      (accumValue, currentValue) =>
        (accumValue += dataTypes.find(type =>
          weightFunctions.find(func => func.check(type)),
        )
          ? weightMap[currentValue.for]
          : 0),
      0,
    );

    let accumWeight = 0;

    for (const weightFunction of weightFunctions) {
      const accumValues: any[] = [];

      dataTypes.forEach(type => {
        if (weightFunction.check(type)) accumValues.push(relevantData[type]);
      });

      if (accumValues.length === 0) continue;

      accumWeight += weightFunction.calculate(
        accumValues,
        relevantData.time,
        options.targetTime,
      );
    }

    return Math.round((accumWeight / totalPossibleWeight) * 100) / 100;
  }

  async getForecast() {
    const location = await LocationManager.getCurrentLocation();

    if (location == null) return; // TODO: handle properly

    const data = await DataFetcher.getWeatherData({
      // location: location,
      location: {
        latitude: 43.23,
        longitude: -79.9,
      },
    });

    // console.log(location, data);

    return data;
  }
}

export default new Forecaster();
