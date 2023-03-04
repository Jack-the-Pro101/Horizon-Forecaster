import {useEffect} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Text as TextNative,
  View,
} from 'react-native';

import Text from '../global/CustomText';

import globalStyles from '../../Global.styles';
import {stylesheet} from '../../Global.styles';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import AntDesignIcons from 'react-native-vector-icons/AntDesign';

import {RootStackParamList} from '../../types';
import Forecaster from '../../classes/Forecaster';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({navigation}: Props) {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    (async () => {
      const data = await Forecaster.getForecast();

      if (data == null) return; // TODO: Handle properly

      const quality = Forecaster.calculateQuality(data, {
        targetTime: data.daily?.sunset[3],
      });

      console.log(quality);
    })();
  }, []);

  return (
    <View style={stylesheet.body}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.navbar}>
        <View style={styles.navbar__content}>
          <TouchableOpacity activeOpacity={0.7}>
            <AntDesignIcons name="bars" size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.navbar__alerts}>
          <TouchableOpacity style={styles.navbar__alert} activeOpacity={0.5}>
            <Text>ALERT: Possible Extreme Weather</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        <View style={{...styles.section, ...styles.section__hero}}>
          <View style={styles.forecast}>
            <Text style={styles.forecast__text} fontWeight={600}>
              100%
            </Text>
            <Text style={styles.forecast__subtext}>Sunset quality</Text>
          </View>
        </View>
        <View style={{...styles.section}}>
          <Text style={styles.section__heading} fontWeight={500}>
            Information
          </Text>
        </View>
        <View style={{...styles.section}}>
          <Text style={styles.section__heading} fontWeight={500}>
            Details
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: globalStyles.clrNeutral200,
  },

  navbar__content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

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
  },

  section__heading: {
    fontSize: 18,
  },

  section__hero: {
    paddingVertical: 128,
    paddingTop: 142,
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
  },
});
