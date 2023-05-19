import {useEffect, useState, useContext} from 'react';

import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Text as TextNative,
  View,
  RefreshControl,
  ImageBackground,
} from 'react-native';

import {Drawer} from 'react-native-drawer-layout';
import NetInfo from '@react-native-community/netinfo';

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

import {BackHandler} from 'react-native';
import {getNearestSunEvent} from '../../utils';
import PushNotification from 'react-native-push-notification';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface LastRefresh {
  time: number;
  locationId: string | null;
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: 'numeric',
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
});

const MINS_TO_MS = 1000 * 60;

export default function Home({navigation, route}: Props) {
  const {location} = useContext(LocationContext);

  const [weatherData, setWeatherData] = useState<RawWeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [refreshKey, setRefreshKey] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<LastRefresh>({
    time: 0,
    locationId: '',
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (location == null) return;

    (async () => {
      const network = await NetInfo.fetch();

      if (
        !network.isInternetReachable ||
        (lastRefresh.time + MINS_TO_MS > Date.now() &&
          lastRefresh.locationId === locationManager.selectedLocationId)
      ) {
        setRefreshing(false);

        if (network.isInternetReachable === false) {
          Alert.alert(
            'No network connection',
            'Cannot fetch weather data without network access. Please connect to the internet.',
          );
        }

        return;
      }

      setRefreshing(true);

      const data = await Forecaster.getForecast();

      if (data == null) {
        if (locationManager.selectedLocation == null)
          Alert.alert(
            'Failed to fetch weather',
            'Weather data could not be fetched. Are you connected to the internet?',
          );
        setRefreshing(false);

        return;
      }

      setWeatherData(data);

      const sunEvent = getNearestSunEvent(data);
      const type = sunEvent[0];
      const shouldPredictTomorrow = sunEvent[1];

      const quality = Forecaster.calculateQuality(data, {
        targetTime: data.daily[type][1 + (shouldPredictTomorrow ? 1 : 0)],
      });

      const upcoming: UpcomingForecast[] = [];

      for (let i = 1; i < 8; i++) {
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
      setLastRefresh({
        time: Date.now(),
        locationId: locationManager.selectedLocationId,
      });
    })();
  }, [location, refreshKey]);

  useEffect(() => {
    function handleBack() {
      if (drawerOpen) {
        setDrawerOpen(false);
        return true;
      }
      return false;
    }

    function closeDrawer() {
      setDrawerOpen(false);
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBack,
    );

    navigation.addListener('blur', closeDrawer);

    return () => {
      backHandler.remove();
      navigation.removeListener('blur', closeDrawer);
    };
  }, [drawerOpen]);

  return (
    <Drawer
      open={drawerOpen}
      onOpen={() => setDrawerOpen(true)}
      onClose={() => setDrawerOpen(false)}
      drawerStyle={{backgroundColor: globalStyles.clrNeutral100}}
      renderDrawerContent={() => (
        <View style={stylesheet.drawer}>
          <Text style={stylesheet.drawer__title} fontWeight={600}>
            Horizon - Forecaster
          </Text>

          <ScrollView style={stylesheet.drawer__items}>
            <TouchableOpacity
              style={stylesheet.drawer__item}
              onPress={() => navigation.navigate('Settings')}>
              <Ionicons
                name="settings"
                size={24}
                style={stylesheet.drawer__icon}
              />
              <Text style={stylesheet.drawer__text}>Settings</Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                style={stylesheet['drawer__icon-arrow']}
              />
            </TouchableOpacity>
            <TouchableOpacity style={stylesheet.drawer__item}>
              <Ionicons
                name="information-circle"
                size={24}
                style={stylesheet.drawer__icon}
              />
              <Text style={stylesheet.drawer__text}>About</Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                style={stylesheet['drawer__icon-arrow']}
              />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}>
      <View style={stylesheet.navbar}>
        <View style={stylesheet.navbar__content}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setDrawerOpen(true)}>
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
            tintColor={globalStyles.clrPrimary600}
            progressBackgroundColor={globalStyles.clrNeutral200}
            colors={[globalStyles.clrPrimary600]}
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
                : (forecast.current.quality * 100).toFixed(0)}
              %
            </Text>
            <Text style={styles.forecast__subtext}>
              {forecast?.current
                ? forecast.current.type.charAt(0).toUpperCase() +
                  forecast.current.type.slice(1)
                : 'Loading'}{' '}
              quality
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

              <Text
                style={{fontSize: 22, color: globalStyles.clrNeutral800}}
                fontWeight={500}>
                {weatherData == null
                  ? '...'
                  : timeFormatter.format(weatherData.daily.sunrise[1] * 1000)}
              </Text>
            </View>
            <View style={styles.section__item}>
              <Text fontWeight={400}>Sunset</Text>

              <Text
                style={{fontSize: 22, color: globalStyles.clrNeutral800}}
                fontWeight={500}>
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
              forecast.upcoming.slice(2, 5).map((forecast, i) => (
                <View style={styles.forecasts__item} key={i}>
                  <Text style={styles.forecasts__title}>
                    {dateFormatter.format(forecast.date * 1000)}
                  </Text>
                  <Text style={styles.forecasts__result} fontWeight={600}>
                    {(forecast.quality * 100).toFixed(0)}%
                  </Text>
                  <Text style={styles.forecasts__time}>{forecast.type}</Text>
                </View>
              ))
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text>Made by: Emperor of Bluegaria</Text>
        </View>
      </ScrollView>
    </Drawer>
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
    position: 'relative',
  },

  hero__bg: {},

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
  },

  forecasts: {},

  forecasts__list: {
    display: 'flex',
    flexDirection: 'row',
  },

  forecasts__item: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
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
