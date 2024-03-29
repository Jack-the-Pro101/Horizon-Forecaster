import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackScreenProps} from '@react-navigation/stack';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import globalStyles, {stylesheet} from '../../Global.styles';
import {settings} from '../../Settings';
import {RootStackParamList, SettingsStackParamList} from '../../types';
import Text from '../global/CustomText';

import SettingsManager from '../../Settings';

type Props = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, 'Index'>,
  StackScreenProps<RootStackParamList>
>;

export default function Settings({navigation}: Props) {
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

            <Text style={{fontSize: 18, marginLeft: 8}}>Settings</Text>
          </View>
        </View>
      </View>
      <View style={stylesheet.body}>
        <FlatList
          data={settings}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 1,
                backgroundColor: globalStyles.clrNeutral200,
              }}></View>
          )}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.setting}
              onPress={() => navigation.navigate('Setting', item)}>
              <Text style={styles.setting__title} fontWeight={500}>
                {item.displayTitle}
              </Text>
              <Ionicons name="chevron-forward" size={24} />
            </TouchableOpacity>
          )}
        />

        <View style={styles.reset}>
          <TouchableOpacity
            style={styles.reset__btn}
            onPress={() =>
              Alert.alert(
                'Confirm Resets',
                'Are you sure you want to reset all settings to their defaults?',
                [
                  {
                    text: 'Yes',
                    isPreferred: true,
                    onPress: SettingsManager.resetSettings,
                  },
                  {
                    text: 'No',
                  },
                ],
              )
            }>
            <Text style={styles.reset__text}>Reset Defaults</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  setting: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 12,
  },

  setting__title: {
    fontSize: 16,
    color: globalStyles.clrNeutral900,
  },

  reset: {
    alignItems: 'center',
  },

  reset__btn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: globalStyles.clrDanger500,
  },

  reset__text: {
    color: globalStyles.clrDanger500,
    fontSize: 16,
  },
});
