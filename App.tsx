import 'react-native-get-random-values';

import React, {useEffect, useState, type PropsWithChildren} from 'react';
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
import Location from './components/locations/Index';
import LocationSearch from './components/locations/Search';

import {NavigationDarkTheme} from './Global.styles';
import {LocationStackParamList, RootStackParamList} from './types';
import locationManager, {LocationProfile} from './classes/LocationManager';

const Stack = createNativeStackNavigator<RootStackParamList>();
const LocationStack = createNativeStackNavigator<LocationStackParamList>();

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
    <NavigationContainer
      theme={NavigationDarkTheme}
      fallback={<Text>Loading</Text>}>
      <LocationContext.Provider value={{location, setLocation}}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="Locations"
            component={LocationScreen}
            options={{animation: 'slide_from_right'}}
          />
        </Stack.Navigator>
      </LocationContext.Provider>
    </NavigationContainer>
  );
};

export default App;
