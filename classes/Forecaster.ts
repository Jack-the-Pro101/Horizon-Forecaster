import {ForecastedData, RawWeatherData, WeatherDataOptions} from '../types';
import {binarySearchRound} from '../utils';
import DataFetcher from './DataFetcher';
import locationManager from './LocationManager';

type HourlyRawWeatherData = RawWeatherData['hourly'];

type WeightMap = {[key: string]: number};

const weightMap: WeightMap = {
  moisture: 120,
  cloudcover: 85,
  windspeed: 50,
  visibility: 70,
  rain: 90,
};

type WeightFunctionResultReason = {
  name: string;
  result: number;
};

interface WeightFunctionResult {
  result: number;
  reasoning: WeightFunctionResultReason[];
}

type SortedWeightFunctionData = {
  type: string;
  data: number[];
};

interface WeightFunction {
  for: string;
  check: (dataType: string) => boolean;
  calculate: (
    data: SortedWeightFunctionData[],
    weights: WeightMap,
    times: number[],
    targetTime: number,
    sorted: boolean,
  ) => WeightFunctionResult;
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

type WeightAdjusterFunction = (adjustments: WeightMap, data: any) => void;

function dynamicWeightAdjuster(
  map: WeightMap,
  values: SortedWeightFunctionData[],
  adjustmentFunctions: {[key: string]: WeightAdjusterFunction},
) {
  const adjustments = {...map};
  for (const key in adjustments) {
    adjustments[key] = 1;
  }

  for (const value of values) {
    if (adjustmentFunctions[value.type] == null) continue;

    const simplifiedValues = {};
    // @ts-expect-error
    values.map(value => (simplifiedValues[value.type] = value.data));

    adjustmentFunctions[value.type](adjustments, simplifiedValues);
  }

  for (const key in adjustments) {
    map[key] *= adjustments[key];
  }
}

interface ForecastCalculationOptions {
  targetTime: number;
}

class ForecastFactory {
  totalPossibleWeight: number;
  weights: WeightMap;
  weightingFunctions: WeightFunction[];
  relevantData: Partial<HourlyRawWeatherData> | SortedWeightFunctionData[];
  dataTypes: string[];

  constructor(
    weights: WeightMap,
    weightingFunctions: WeightFunction[],
    data: HourlyRawWeatherData | SortedWeightFunctionData[],
  ) {
    this.relevantData = data;
    this.weights = weights;
    this.weightingFunctions = weightingFunctions;
    const dataTypes = Array.isArray(data)
      ? data.map(data => data.type)
      : Object.keys(data);
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

  calculate(options: ForecastCalculationOptions, sorted = false) {
    let accumWeight = 0;

    for (const weightFunction of this.weightingFunctions) {
      const accumValues: SortedWeightFunctionData[] = sorted
        ? (this.relevantData as SortedWeightFunctionData[])
        : [];

      if (!sorted) {
        this.dataTypes.forEach(type => {
          if (weightFunction.check(type))
            accumValues.push({
              type,
              data: (this.relevantData as HourlyRawWeatherData)[
                type as keyof HourlyRawWeatherData
              ]!,
            });
        });
      }

      if (accumValues.length === 0) continue;

      const calculation = weightFunction.calculate(
        accumValues,
        this.weights,
        sorted ? [] : (this.relevantData as HourlyRawWeatherData).time!,
        options.targetTime,
        sorted,
      );

      accumWeight += calculation.result;
    }

    return sorted ? accumWeight / this.totalPossibleWeight : accumWeight;
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
          check: dataType => dataType.startsWith('cloudcover'),
          calculate: function (data, weights, times, targetTime) {
            // Find what time is closest to target time
            const targetIndex = binarySearchRound(
              times,
              targetTime,
              (a, b) => a - b,
            );

            const cloudCoverWeightMap: WeightMap = {
              cloudcover_high: 120,
              cloudcover_mid: 70,
              cloudcover_low: 87,
            };

            // Note: not done
            dynamicWeightAdjuster(cloudCoverWeightMap, data, {
              cloudcover_high: (adjustments, data: any) => {
                const totalCloudCover =
                  data['cloudcover_high'][targetIndex] +
                  data['cloudcover_mid'][targetIndex] +
                  data['cloudcover_low'][targetIndex];

                if (totalCloudCover > 210) {
                  adjustments['cloudcover_high'] -= Math.max(
                    numberPercentProximity(
                      data['cloudcover_low'][targetIndex],
                      20,
                    ),
                    0,
                  );
                } else {
                  adjustments['cloudcover_high'] -= Math.max(
                    numberPercentProximity(
                      data['cloudcover_low'][targetIndex],
                      20,
                    ) / 2,
                    0,
                  );
                  adjustments['cloudcover_high'] -= Math.max(
                    numberPercentProximity(
                      data['cloudcover_mid'][targetIndex],
                      40,
                    ) / 2,
                    0,
                  );
                }
              },
            });

            console.log(cloudCoverWeightMap);

            const calculator = new ForecastFactory(
              cloudCoverWeightMap,
              [
                {
                  for: 'cloudcover_high',
                  check: function (dataType) {
                    return dataType === this.for;
                  },
                  calculate: function (sortedData, weights, times, targetTime) {
                    const data = sortedData.find(data =>
                      this.check(data.type),
                    )!.data;

                    const cloudcovers = [
                      data[targetTime],
                      data[targetTime + 1],
                    ];

                    let accumWeight = 0;

                    function expoParabolaGenerator(input: number): number {
                      if (input > 85) {
                        // Use parabola, vertex form

                        return ((-1 * (input - 90)) ^ (2 + 100)) / 100;
                      } else {
                        // Exponential function: f(x)

                        return Math.min(1.053 ^ input, 100) / 100;
                      }
                    }

                    for (const cloudcover of cloudcovers) {
                      accumWeight += expoParabolaGenerator(cloudcover);
                    }

                    accumWeight /= cloudcovers.length;

                    const reason =
                      'Adequate, but not excess high cloud cover allows sunlight to be reflected off the clouds while not being blocked completely.';

                    return {
                      result: accumWeight * weights[this.for],
                      reasoning: [],
                    };
                  },
                },
                {
                  for: 'cloudcover_mid',
                  check: function (dataType) {
                    return dataType === this.for;
                  },
                  calculate: function (sortedData, weights, times, targetTime) {
                    const data = sortedData.find(data =>
                      this.check(data.type),
                    )!.data;

                    const cloudcovers = [
                      data[targetTime],
                      data[targetTime + 1],
                    ];

                    let accumWeight = 0;

                    for (const cloudcover of cloudcovers) {
                      accumWeight += numberPercentProximity(cloudcover, 15);
                    }

                    accumWeight /= cloudcovers.length;

                    const reason =
                      'Adequate, but not excess high cloud cover allows sunlight to be reflected off the clouds while not being blocked completely.';

                    return {
                      result: accumWeight * weights[this.for],
                      reasoning: [],
                    };
                  },
                },
                {
                  for: 'cloudcover_low',
                  check: function (dataType) {
                    return dataType === this.for;
                  },
                  calculate: function (sortedData, weights, times, targetTime) {
                    const data = sortedData.find(data =>
                      this.check(data.type),
                    )!.data;

                    const cloudcovers = [
                      data[targetTime],
                      data[targetTime + 1],
                    ];

                    let accumWeight = 0;

                    for (const cloudcover of cloudcovers) {
                      accumWeight += numberPercentProximity(cloudcover, 10);
                    }

                    accumWeight /= cloudcovers.length;

                    const reason =
                      'Adequate, but not excess high cloud cover allows sunlight to be reflected off the clouds while not being blocked completely.';

                    return {
                      result: accumWeight * weights[this.for],
                      reasoning: [],
                    };
                  },
                },
              ],
              data,
            );

            const result = calculator.calculate(
              {targetTime: targetIndex},
              true,
            );

            return {
              result: result * weights[this.for],
              reasoning: [],
            };
          },
        },
        {
          for: 'moisture',
          check: dataType => dataType.startsWith('relativehumidity'),
          calculate: function (data, weights, times, targetTime, sorted) {
            const targetIndex = binarySearchRound(
              times,
              targetTime,
              (a, b) => a - b,
            );

            const moistureWeightMap: WeightMap = {
              relativehumidity_150hPa: 110,
              relativehumidity_500hPa: 85,
              relativehumidity_1000hPa: 40,
            };

            const calculator = new ForecastFactory(
              moistureWeightMap,
              [
                {
                  for: 'relativehumidity_1000hPa',
                  check: function (dataType) {
                    return dataType === this.for;
                  },
                  calculate(sortedData, weights, times, targetTime, sorted) {
                    const data = sortedData.find(data =>
                      this.check(data.type),
                    )!.data;

                    const moisturesLow = [
                      data[targetTime],
                      data[targetTime + 1],
                    ];

                    let accumWeight = 0;

                    for (const moisture of moisturesLow) {
                      accumWeight += numberPercentProximity(moisture, 40);
                    }

                    accumWeight /= moisturesLow.length;

                    return {
                      result: accumWeight * weights[this.for],
                      reasoning: [],
                    };
                  },
                },
                {
                  for: 'relativehumidity_500hPa',
                  check: function (dataType) {
                    return dataType === this.for;
                  },
                  calculate(sortedData, weights, times, targetTime, sorted) {
                    const data = sortedData.find(data =>
                      this.check(data.type),
                    )!.data;

                    const moisturesMid = [
                      data[targetTime],
                      data[targetTime + 1],
                    ];

                    let accumWeight = 0;

                    for (const moisture of moisturesMid) {
                      accumWeight += numberPercentProximity(moisture, 15);
                    }

                    accumWeight /= moisturesMid.length;

                    return {
                      result: accumWeight * weights[this.for],
                      reasoning: [],
                    };
                  },
                },
                {
                  for: 'relativehumidity_150hPa',
                  check: function (dataType) {
                    return dataType === this.for;
                  },
                  calculate(sortedData, weights, times, targetTime, sorted) {
                    const data = sortedData.find(data =>
                      this.check(data.type),
                    )!.data;

                    const moisturesHigh = [
                      data[targetTime],
                      data[targetTime + 1],
                    ];

                    let accumWeight = 0;

                    for (const moisture of moisturesHigh) {
                      accumWeight += numberPercentProximity(moisture, 3);
                    }

                    accumWeight /= moisturesHigh.length;

                    return {
                      result: accumWeight * weights[this.for],
                      reasoning: [],
                    };
                  },
                },
              ],
              data,
            );

            const result = calculator.calculate(
              {targetTime: targetIndex},
              true,
            );

            return {
              result: result * weights[this.for],
              reasoning: [],
            };
          },
        },
        {
          for: 'visibility',
          check: function (dataType) {
            return dataType === this.for;
          },
          calculate: function (sortedData, weights, times, targetTime) {
            const data = sortedData[0].data;

            const targetIndex = binarySearchRound(
              times,
              targetTime,
              (a, b) => a - b,
            );

            const visibilities = [data[targetIndex], data[targetIndex + 1]];

            let accumWeight = 0;

            for (const visibility of visibilities) {
              accumWeight += Math.min(visibility / 16000, 1);
            }

            accumWeight /= visibilities.length;

            return {
              result: accumWeight * weights[this.for],
              reasoning: [],
            };
          },
        },
      ],
      relevantData,
    );

    const result = calculator.calculate(options);

    return Math.round((result / calculator.totalPossibleWeight) * 100) / 100;
  }

  async getForecast() {
    const location = locationManager.selectedLocation;

    if (location == null) return; // TODO: handle properly

    const data = await DataFetcher.getWeatherData({
      location: location,
      timezone: location.timezone,
    });

    return data;
  }
}

export default new Forecaster();
