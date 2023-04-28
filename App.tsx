import 'react-native-gesture-handler';
import 'react-native-get-random-values';

import React, {
  useEffect,
  useLayoutEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import Text from './components/global/CustomText';

import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from './components/home/Index';
import Forecasts from './components/home/Forecasts';
import Location from './components/locations/Index';
import LocationSearch from './components/locations/Search';
import Settings from './components/settings/Index';
import Setting from './components/settings/Setting';

import {NavigationDarkTheme} from './Global.styles';
import {
  LocationStackParamList,
  RootStackParamList,
  SettingsStackParamList,
} from './types';
import locationManager, {LocationProfile} from './classes/LocationManager';

import SettingsManager from './Settings';

const Stack = createNativeStackNavigator<RootStackParamList>();
const LocationStack = createNativeStackNavigator<LocationStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

// @ts-expect-error
export const LocationContext = React.createContext<LocationContextProps>();

interface LocationContextProps {
  location: LocationProfile | null;
  setLocation: (location: LocationProfile) => void;
}

function LocationScreen() {
  return (
    <LocationStack.Navigator
      initialRouteName="Index"
      screenOptions={{headerShown: false}}>
      <LocationStack.Screen name="Index" component={Location} />
      <LocationStack.Screen name="Search" component={LocationSearch} />
    </LocationStack.Navigator>
  );
}

function SettingsScreen() {
  return (
    <SettingsStack.Navigator
      initialRouteName="Index"
      screenOptions={{headerShown: false}}>
      <SettingsStack.Screen name="Index" component={Settings} />
      <SettingsStack.Screen
        name="Setting"
        component={Setting}
        options={{animation: 'slide_from_right'}}
      />
    </SettingsStack.Navigator>
  );
}

function HomeStackScreen() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Forecasts" component={Forecasts} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="Locations"
        component={LocationScreen}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}

const App = () => {
  const isDark = useColorScheme() === 'dark';

  // TODO: Change to use my theme instead of default

  // theme={isDark ? NavigationDarkTheme : DefaultTheme}

  const [location, setLocation] = useState(locationManager.selectedLocation);

  useEffect(() => {
    locationManager.addEventStateUpdater('selectedLocation', setLocation);

    return () =>
      locationManager.removeEventStateUpdater('selectedLocation', setLocation);
  }, [setLocation]);

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <NavigationContainer
        theme={NavigationDarkTheme}
        fallback={<Text>Loading</Text>}>
        <LocationContext.Provider value={{location, setLocation}}>
          <HomeStackScreen />
        </LocationContext.Provider>
      </NavigationContainer>
    </>
  );
};

export default App;
