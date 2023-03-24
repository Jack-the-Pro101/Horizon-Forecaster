import {useEffect, useState, useContext} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Text as TextNative,
  View,
  RefreshControl,
} from 'react-native';

import Text from '../global/CustomText';

import globalStyles, {stylesheet} from '../../Global.styles';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import AntDesignIcons from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  ForecastResult,
  RawWeatherData,
  RootStackParamList,
  UpcomingForecast,
} from '../../types';
import Forecaster from '../../classes/Forecaster';
import locationManager from '../../classes/LocationManager';
import {LocationContext} from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const MINS_TO_MS = 1000 * 60;

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: 'numeric',
});

export default function Home({navigation, route}: Props) {
  const {location} = useContext(LocationContext);

  const [weatherData, setWeatherData] = useState<RawWeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [refreshKey, setRefreshKey] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);

  useEffect(() => {
    (async () => {
      const data = await Forecaster.getForecast();

      if (data == null) return; // TODO: Handle properly

      setWeatherData(data);

      const currentDate = Date.now();

      const offsetSunrise = data.daily.sunrise[1] * 1000 + MINS_TO_MS * 10;
      const offsetSunset = data.daily.sunset[1] * 1000 + MINS_TO_MS * 10;

      const type =
        Math.abs(offsetSunrise - currentDate) <
        Math.abs(offsetSunset - currentDate)
          ? currentDate > offsetSunrise
            ? 'sunset'
            : 'sunrise'
          : currentDate > offsetSunset
          ? 'sunrise'
          : 'sunset';

      // Math.abs(offsetSunrise - currentDate) <
      // Math.abs(offsetSunset - currentDate)
      //   ? 'sunrise'
      //   : 'sunset';

      const quality = Forecaster.calculateQuality(data, {
        targetTime: data.daily[type][1],
      });

      const upcoming: UpcomingForecast[] = [];

      for (let i = 1; i < 7; i++) {
        const upcomingSunrise = Forecaster.calculateQuality(data, {
          targetTime: data.daily.sunrise[i],
        });
        const upcomingSunset = Forecaster.calculateQuality(data, {
          targetTime: data.daily.sunset[i],
        });

        upcoming.push(
          {
            date: data.daily.time[i],
            quality: upcomingSunrise,
            type: 'sunrise',
          },
          {
            date: data.daily.time[i],
            quality: upcomingSunset,
            type: 'sunset',
          },
        );
      }

      setForecast({
        current: {
          quality: quality,
          type: type,
        },
        upcoming,
      });

      setRefreshing(false);
      setLastRefresh(Date.now());
    })();
  }, [refreshKey]);

  useEffect(() => {
    if (Date.now() - lastRefresh < MINS_TO_MS) {
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    setRefreshKey(value => !value);
    setLastRefresh(Date.now());
  }, [location]);

  return (
    <>
      <View style={stylesheet.navbar}>
        <View style={stylesheet.navbar__content}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Settings')}>
            <AntDesignIcons name="bars" size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Locations')}>
            <Text style={{flex: 1}}>
              <Ionicons name="location-outline" size={24} />
              {location == null
                ? locationManager.permissionsGranted
                  ? 'Loading...'
                  : 'CONFIGURE >'
                : location.name}
            </Text>
          </TouchableOpacity>
        </View>
        {/*<View style={styles.navbar__alerts}>
          <TouchableOpacity style={styles.navbar__alert} activeOpacity={0.5}>
            <Text>ALERT: Possible Extreme Weather</Text>
          </TouchableOpacity>
        </View> */}
      </View>

      <ScrollView
        style={stylesheet.body}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshKey(value => !value);
              setRefreshing(true);
            }}
          />
        }>
        <View style={{...styles.section, ...styles.section__hero}}>
          <View style={styles.forecast}>
            <Text style={styles.forecast__text} fontWeight={600}>
              {forecast?.current == null
                ? '...'
                : (forecast.current.quality * 100).toFixed(1)}
              %
            </Text>
            <Text style={styles.forecast__subtext}>
              {forecast?.current?.type || 'Loading'} quality
            </Text>
          </View>
        </View>
        <View style={{...styles.section}}>
          <Text style={styles.section__heading} fontWeight={500}>
            Information
          </Text>

          <View style={styles.section__list}>
            <View style={styles.section__item}>
              <Text fontWeight={400}>Sunrise</Text>

              <Text style={{fontSize: 22}} fontWeight={500}>
                {weatherData == null
                  ? '...'
                  : timeFormatter.format(weatherData.daily.sunrise[1] * 1000)}
              </Text>
            </View>
            <View style={styles.section__item}>
              <Text fontWeight={400}>Sunset</Text>

              <Text style={{fontSize: 22}} fontWeight={500}>
                {weatherData == null
                  ? '...'
                  : timeFormatter.format(weatherData.daily.sunset[1] * 1000)}
              </Text>
            </View>
          </View>
        </View>
        <View style={{...styles.section}}>
          <Text style={styles.section__heading} fontWeight={500}>
            Details
          </Text>
        </View>
        <TouchableOpacity
          style={{...styles.section, ...styles.forecasts}}
          activeOpacity={0.9}
          disabled={forecast == null}
          onPress={() => navigation.navigate('Forecasts', forecast!)}>
          <View style={stylesheet.flexBlock}>
            <Text style={styles.section__heading} fontWeight={500}>
              7-Day Forecast
            </Text>
            <Ionicons name="chevron-forward" size={24} />
          </View>
          <View style={styles.forecasts__list}>
            {forecast?.upcoming == null ? (
              <View>
                <Text>Loading...</Text>
              </View>
            ) : (
              <>
                <View style={styles.forecasts__item}>
                  <Text style={styles.forecasts__title}>
                    {forecast.upcoming[1].type}
                  </Text>
                  <Text style={styles.forecasts__result} fontWeight={600}>
                    {(forecast.upcoming[1].quality * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.forecasts__time}>
                    {forecast.upcoming[1].type}
                  </Text>
                </View>
                <View style={styles.forecasts__item}>
                  <Text style={styles.forecasts__title}>
                    {forecast.upcoming[2].type}
                  </Text>
                  <Text style={styles.forecasts__result} fontWeight={600}>
                    {(forecast.upcoming[2].quality * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.forecasts__time}>
                    {forecast.upcoming[2].type}
                  </Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text>Made by: Emperor of Bluegaria</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  navbar__alerts: {
    display: 'flex',
    backgroundColor: globalStyles.clrDanger400,
  },

  navbar__alert: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  section: {
    padding: 4,
    marginBottom: 16,
  },

  section__list: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: -4,
  },

  section__item: {
    padding: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: globalStyles.clrNeutral400,
    flex: 1,
    borderRadius: 4,
    margin: 4,
  },

  section__heading: {
    fontSize: 18,
    marginBottom: 6,
  },

  section__hero: {
    paddingVertical: 128,
    paddingTop: 142,
    marginBottom: 0,
  },

  forecast: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  forecast__text: {
    fontSize: 64,
    lineHeight: 64,
    textAlign: 'center',
    color: globalStyles.clrNeutral900,
  },

  forecast__subtext: {
    color: globalStyles.clrNeutral700,
    fontSize: 16,
    textTransform: 'capitalize',
  },

  forecasts: {},

  forecasts__list: {
    display: 'flex',
    flexDirection: 'row',
  },

  forecasts__item: {
    flex: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  forecasts__title: {
    color: globalStyles.clrNeutral700,
    fontSize: 14,
    marginBottom: 16,
  },

  forecasts__result: {
    color: globalStyles.clrNeutral900,
    fontSize: 18,
  },

  forecasts__time: {
    color: globalStyles.clrNeutral700,
    fontSize: 14,
  },

  footer: {
    borderTopColor: globalStyles.clrNeutral200,
    borderTopWidth: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 128,
    marginTop: 64,
    padding: 8,
  },
});
