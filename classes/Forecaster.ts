import {ForecastedData, RawWeatherData} from '../types';
import {binarySearchRound} from '../utils';
import DataFetcher from './DataFetcher';
import locationManager from './LocationManager';
import LocationManager from './LocationManager';

type WeightMap = {[key: string]: number}

const weightMap: WeightMap = {
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

interface WeightFunctionResult {
  result: number,
  reasoning: [{
    name: string,
    result: number
  }]
}

interface WeightFunction {
  for: string;
  weights: WeightMap;
  check: (dataType: string) => boolean;
  calculate: (data: any[], weights: WeightMap, times: number[], targetTime: number) => WeightFunctionResult;
}

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

interface ForecastCalculationOptions {
  targetTime: number;
}

class ForecastFactory {
  totalPossibleWeight: number;
  weights: WeightMap;
  weightingFunctions: WeightFunction[];
  relevantData: any[];
  dataTypes: string[];

  constructor(weights: WeightMap, weightingFunctions: WeightFunction[], data: any[]) {
    this.relevantData = data;
    this.weights = weights;
    this.weightingFunctions = weightingFunctions;
    const dataTypes = Object.keys(data);
    this.dataTypes = dataTypes;

    this.totalPossibleWeight = weightingFunctions.reduce(
      (accumValue, currentValue) =>
        (accumValue += dataTypes.find(type =>
          weightingFunctions.find(func => func.check(type)),
        )
          ? weights[currentValue.for]
          : 0),
      0,
    );
  }

  calculate(options: ForecastCalculationOptions) {
    let accumWeight = 0;

    for (const weightFunction of this.weightingFunctions) {
      const accumValues: any[] = [];

      this.dataTypes.forEach(type => {
        if (weightFunction.check(type))
          accumValues.push(this.relevantData[type]);
      });

      if (accumValues.length === 0) continue;

      const calculation = weightFunction.calculate(
        accumValues,
        this.weights,
        this.relevantData.time,
        options.targetTime,
      );

      accumWeight += calculation.result;
    }

    return accumWeight;
  }
}

class Forecaster {
  calculateQuality(
    data: RawWeatherData,
    options: ForecastCalculationOptions,
  ): number {
    const relevantData = data.hourly;
    const calculator = new ForecastFactory(
      weightMap,
      [
        {
          for: 'cloudcover',
          check: (dataType: string): boolean => dataType.startsWith('cloudcover'),
          calculate: function (
            data: any[],
            weights: WeightMap,
            times: number[],
            targetTime: number,
          ) {
            // Find what time is closest to target time
            const targetIndex = binarySearchRound(times, targetTime, (a, b) => a - b);

            const quality = 0.8;

            return {result: quality * weights[this.for], reasoning: []};
          },
        }
      ],
      relevantData,
    );

    return (
      Math.round(
        (calculator.calculate(options) /
          calculator.totalPossibleWeight) *
          100,
      ) / 100
    );
  }

  async getForecast() {
    const location = locationManager.selectedLocation;

    if (location == null) return; // TODO: handle properly

    const data = await DataFetcher.getWeatherData({
      location: location,
    });

    // console.log(location, data);

    return data;
  }
}

export default new Forecaster();
