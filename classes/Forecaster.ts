import {ForecastedData, RawWeatherData} from '../types';
import {binarySearch} from '../utils';
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

const weightFunctions /*: WeightFunction[] */ = [
  {
    for: 'cloudcover',
    check: (dataType: string): boolean => dataType.startsWith('cloudcover'),
    calculate: function (
      data: any,
      times: number[],
      targetTime: number,
    ): number {
      const targetIndex = binarySearch(times, targetTime, (a, b) => a - b);

      // if target index les than 0
      //   targetindex = -(targetindex + 1)

      //   low = times[targetindex - 1] but if target index 0 low is null
      //   high = times[targetindex] but if target index is times.length then high is null

      //   if low is null low = times[targetindex]
      //   if high is null high = low

      //   figure out is targettime closer to low or high then set index to it

      console.log(times[targetIndex], targetIndex);

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

    console.log(totalPossibleWeight);

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
      location: location,
    });

    console.log(location, data);

    return data;
  }
}

export default new Forecaster();
