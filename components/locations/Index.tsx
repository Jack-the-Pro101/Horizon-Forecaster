import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  View,
  Dimensions,
  Switch,
} from 'react-native';

import Text from '../global/CustomText';

import Ionicons from 'react-native-vector-icons/Ionicons';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  CoreGeocodeLocation,
  LocationStackParamList,
  RootStackParamList,
} from '../../types';

import type {StackScreenProps} from '@react-navigation/stack';
import {CompositeScreenProps} from '@react-navigation/native';

import globalStyles, {stylesheet} from '../../Global.styles';

import locationManager, {
  LocationProfile,
  LocationProfiles,
  RenderedLocationProfile,
} from '../../classes/LocationManager';

import {useContext, useEffect, useState, useMemo} from 'react';
import {LocationContext} from '../../App';

type Props = CompositeScreenProps<
  NativeStackScreenProps<LocationStackParamList, 'Index'>,
  StackScreenProps<RootStackParamList>
>;

export default function Home({navigation, route}: Props) {
  const {location} = useContext(LocationContext);
  const [locations, setLocations] = useState<RenderedLocationProfile[]>([]);

  const [editing, setEditing] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const [gpsEnabled, setGpsEnabled] = useState(
    locationManager.selectedLocation?.gps || false,
  );
  const toggleGpsSwitch = () =>
    setGpsEnabled(previousState => {
      const newState = !previousState;

      locationManager.setActiveLocation(
        newState && locationManager.selectedLocation != null
          ? null
          : locations[0],
      );

      return newState;
    });

  locationManager.addEventStateUpdater(
    'locations',
    (profiles: LocationProfiles) =>
      setLocations(convertProfileToRendered(profiles)),
  );

  function convertProfileToRendered(
    profiles: LocationProfiles,
  ): RenderedLocationProfile[] {
    return Object.keys(profiles).map(profile => {
      return {...profiles[profile], id: profile};
    });
  }

  useEffect(() => {
    (async () => {
      setLocations(
        convertProfileToRendered(await locationManager.getAllLocations()),
      );
    })();
  }, []);

  const data = route.params;

  useMemo(() => {
    if (data == null) return;

    locationManager.saveLocation({
      name: data.name,
      administration: data.admin1,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
    });
  }, [data?.id]);

  function selectLocation(data: RenderedLocationProfile, isEditing = false) {
    if (isEditing) {
      setSelectedLocations(values => {
        if (selectedLocations.includes(data.id)) {
          return values.filter(value => value !== data.id);
        } else {
          return [...values, data.id];
        }
      });
    } else {
      locationManager.setActiveLocation(data);
      if (data != null) setGpsEnabled(false);
    }
  }

  function renderLocation(data: RenderedLocationProfile) {
    if (data.id === locationManager.selectedLocationId) return null;

    return (
      <TouchableOpacity
        style={styles.location}
        activeOpacity={0.9}
        onPress={() => selectLocation(data, editing)}
        onLongPress={() => {
          setEditing(true);
          selectLocation(data, true);
        }}>
        <View
          style={editing ? styles['location__contents--editing'] : undefined}>
          <Ionicons
            name={
              selectedLocations.includes(data.id)
                ? 'checkmark-circle'
                : 'ellipse-outline'
            }
            size={24}
            style={
              editing
                ? {
                    ...styles['location__circle-icon'],
                    ...styles['location__circle-icon--editing'],
                  }
                : styles['location__circle-icon']
            }
          />
          <Text style={styles.location__heading} fontWeight={600}>
            {data.name}
          </Text>
          <Text style={styles.location__subheading} fontWeight={500}>
            {data.administration}, {data.country}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

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

            <Text style={{fontSize: 18, marginLeft: 8}}>Locations</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Ionicons name="add-outline" size={32} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={stylesheet.body}>
        <View style={{marginBottom: 24}}>
          <View style={stylesheet.flexBlock}>
            <Text style={styles.heading}>Current Location</Text>
            <View style={stylesheet.flexBlock}>
              <Text>Use GPS</Text>
              <Switch
                trackColor={{
                  true: globalStyles.clrPrimary300,
                  false: globalStyles.clrPrimary200,
                }}
                thumbColor={globalStyles.clrPrimary500}
                onValueChange={toggleGpsSwitch}
                value={gpsEnabled}
              />
            </View>
          </View>
          {location ? (
            <View style={{...styles.location, ...styles['location--current']}}>
              {location.gps ? (
                <>
                  <Text style={styles.location__heading} fontWeight={600}>
                    Using GPS
                  </Text>
                  <Text style={styles.location__subheading} fontWeight={500}>
                    {location.latitude.toFixed(2)},{' '}
                    {location.longitude.toFixed(2)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.location__heading} fontWeight={500}>
                    {location.name}
                  </Text>
                  <Text style={styles.location__subheading} fontWeight={500}>
                    {location.administration}, {location.country}
                  </Text>
                </>
              )}
            </View>
          ) : (
            <Text style={{textAlign: 'center', margin: 16}}>
              Location unavailable.
            </Text>
          )}
        </View>

        <Text style={styles.heading}>Saved Locations</Text>

        <FlatList
          data={locations}
          renderItem={data => renderLocation(data.item)}
          ListEmptyComponent={
            <Text style={{textAlign: 'center', marginVertical: 16}}>
              No saved locations.
            </Text>
          }
          keyExtractor={item => item.id}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 16,
    color: globalStyles.clrNeutral900,
    marginBottom: 4,
  },

  location: {
    borderRadius: 8,
    padding: 8,
    backgroundColor: globalStyles.clrNeutral200,
    marginBottom: 6,
    position: 'relative',
  },

  'location--current': {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: globalStyles.clrPrimary300,
    borderStyle: 'solid',
  },

  'location__contents--editing': {
    paddingLeft: 32,
  },

  'location__circle-icon': {
    position: 'absolute',
    alignSelf: 'center',
    left: 0,
    display: 'none',
    color: globalStyles.clrPrimary500,
  },

  'location__circle-icon--editing': {
    display: 'flex',
  },

  location__heading: {
    fontSize: 14,
    color: globalStyles.clrNeutral800,
  },

  location__subheading: {
    fontSize: 14,
    color: globalStyles.clrNeutral700,
  },
});
