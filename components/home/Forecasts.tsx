import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useMemo, useState} from 'react';
import {SectionList, StyleSheet, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import globalStyles, {stylesheet} from '../../Global.styles';
import {RootStackParamList, UpcomingForecast} from '../../types';
import Text from '../global/CustomText';

type Props = NativeStackScreenProps<RootStackParamList, 'Forecasts'>;

interface RenderedForecast {
  time: number;
  data: Omit<UpcomingForecast, 'date'>[];
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
});

export default function Forecasts({navigation, route}: Props) {
  const [renderedForecast, setRenderedForecast] = useState<RenderedForecast[]>(
    [],
  );

  const forecastData = route.params;
  useMemo(() => {
    const displayForecast: RenderedForecast[] = [];

    for (const forecast of forecastData.upcoming) {
      const search = displayForecast.findIndex(
        cast => cast.time === forecast.date,
      );
      if (search !== -1) {
        displayForecast[search].data.push({
          quality: forecast.quality,
          type: forecast.type,
        });
      } else {
        displayForecast.push({
          time: forecast.date,
          data: [
            {
              quality: forecast.quality,
              type: forecast.type,
            },
          ],
        });
      }
    }

    setRenderedForecast(displayForecast);
  }, [forecastData.upcoming]);

  return (
    <>
      <View style={stylesheet.navbar}>
        <View style={stylesheet.navbar__content}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Ionicons name="arrow-back" size={32} />
            </TouchableOpacity>

            <Text style={{fontSize: 18, marginLeft: 8}}>7-day Forecast</Text>
          </View>
        </View>
      </View>

      <SectionList
        style={styles.forecast__list}
        sections={renderedForecast}
        renderSectionHeader={({section}) => (
          <Text style={styles.forecast__heading} fontWeight={500}>
            {dateFormatter.format(section.time * 1000)}
          </Text>
        )}
        renderItem={({item}) => (
          <View
            style={{
              ...stylesheet.flexBlock,
              ...styles.forecast__item,
            }}>
            <Text style={styles.forecast__type}>{item.type}</Text>
            <Text style={styles.forecast__result} fontWeight={500}>
              {(item.quality * 100).toFixed(0)}%
            </Text>
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  forecast__list: {
    padding: 6,
  },

  forecast__item: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  forecast__heading: {
    marginTop: 6,
    paddingTop: 10,
    fontSize: 16,
    borderBottomColor: globalStyles.clrNeutral200,
    borderBottomWidth: 1,
  },

  forecast__type: {
    textTransform: 'capitalize',
    color: globalStyles.clrNeutral800,
  },

  forecast__result: {
    color: globalStyles.clrNeutral900,
    fontSize: 16,
  },
});
