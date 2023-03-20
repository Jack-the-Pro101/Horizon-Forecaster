import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackScreenProps} from '@react-navigation/stack';
import {
  FlatList,
  StyleSheet,
  View,
  Switch,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import globalStyles, {stylesheet} from '../../Global.styles';
import {Setting as SettingType} from '../../Settings';
import {RootStackParamList, SettingsStackParamList} from '../../types';
import Text from '../global/CustomText';

type Props = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, 'Setting'>,
  StackScreenProps<RootStackParamList>
>;

const renderers = {
  renderSwitch: (setting: SettingType) => (
    <View style={styles.setting}>
      <View style={styles.setting__text}>
        <Text fontWeight={500} style={styles.setting__name}>
          {setting.name}
        </Text>
        {setting.description && (
          <Text style={styles.setting__description}>{setting.description}</Text>
        )}
      </View>
      <Switch style={{flex: 1}} />
    </View>
  ),
};

function renderSetting(setting: SettingType) {
  switch (setting.type) {
    case 'boolean':
      return renderers.renderSwitch(setting);
    default:
      return <Text>[Data type not supported]</Text>;
  }
}

export default function Setting({navigation, route}: Props) {
  const setting = route.params;

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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={32} />
            </TouchableOpacity>

            <Text style={{fontSize: 18, marginLeft: 8}}>
              Settings {'>'} {setting.displayTitle}
            </Text>
          </View>
        </View>
      </View>
      <View style={stylesheet.body}>
        <FlatList
          style={styles.settings}
          data={setting.items}
          keyExtractor={item => item.id}
          renderItem={info => renderSetting(info.item)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  settings: {
    padding: 4,
  },

  setting: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  setting__text: {
    maxWidth: '90%',
  },

  setting__name: {
    fontSize: 16,
    color: globalStyles.clrNeutral900,
  },

  setting__description: {
    fontSize: 14,
    color: globalStyles.clrNeutral700,
  },
});
