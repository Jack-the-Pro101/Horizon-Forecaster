import React, {useEffect, useState, type PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from './components/home/Index';
import {NavigationDarkTheme} from './Global.styles';
import {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const isDark = useColorScheme() === 'dark';

  // TODO: Change to use my theme instead of default

  // theme={isDark ? NavigationDarkTheme : DefaultTheme}

  return (
    <NavigationContainer theme={NavigationDarkTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
