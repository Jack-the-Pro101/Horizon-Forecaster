import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  View,
  Dimensions,
} from 'react-native';

import Text from '../global/CustomText';

import Ionicons from 'react-native-vector-icons/Ionicons';

import globalStyles, {stylesheet} from '../../Global.styles';

import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  CoreGeocodeLocation,
  LocationStackParamList,
  RawGeocodeLocation,
  RootStackParamList,
} from '../../types';
import {StackScreenProps} from '@react-navigation/stack';
import {useRef, useState} from 'react';
import DataFetcher from '../../classes/DataFetcher';

type Props = CompositeScreenProps<
  NativeStackScreenProps<LocationStackParamList, 'Search'>,
  StackScreenProps<RootStackParamList>
>;

export default function Search({navigation}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<CoreGeocodeLocation[]>([]);
  const [loading, setLoading] = useState(false);

  const searchRef = useRef<TextInput>(null);

  async function search() {
    if (searchRef.current) searchRef.current.blur();

    setLoading(true);
    const data = await DataFetcher.getGeocode(searchQuery);

    if (data != null) {
      setResults(
        data.results!.map(result => {
          return {
            id: result.id,
            name: result.name,
            country: result.country,
            admin1: result.admin1,
            latitude: result.latitude,
            longtitude: result.longtitude,
            timezone: result.timezone,
          };
        }),
      );
    } else {
      if (results.length > 0) setResults([]);
    }

    setLoading(false);
  }

  function renderResult(data: CoreGeocodeLocation) {
    return (
      <TouchableOpacity
        style={styles.result__item}
        onPress={() => navigation.navigate('Index', data)}>
        <Text style={styles.result__heading} fontWeight={600}>
          {data.name}
        </Text>
        <Text style={styles.result__subheading}>
          {data.admin1}, {data.country}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{flex: 1}}>
      <View style={styles.search__bar}>
        <TextInput
          style={styles.search__input}
          placeholder="Search location..."
          keyboardType="web-search"
          autoFocus
          ref={searchRef}
          cursorColor={globalStyles.clrPrimary500}
          onChangeText={text => setSearchQuery(text)}
          onSubmitEditing={() => search()}
        />

        <TouchableOpacity onPress={() => search()}>
          <Ionicons name="search" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        renderItem={data => renderResult(data.item)}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.result__error}>No results found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: globalStyles.clrNeutral100,
  },

  search__bar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
  },

  search__input: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    flex: 1,
  },

  result__item: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },

  result__heading: {
    color: globalStyles.clrNeutral900,
    fontSize: 14,
  },

  result__subheading: {
    fontSize: 14,
    color: globalStyles.clrNeutral800,
  },

  result__error: {
    textAlign: 'center',
    color: globalStyles.clrNeutral800,
    marginVertical: 16,
  },
});
