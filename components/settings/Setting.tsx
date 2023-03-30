import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StackScreenProps} from '@react-navigation/stack';
import {
  FlatList,
  StyleSheet,
  View,
  Switch,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import globalStyles, {stylesheet} from '../../Global.styles';
import {Setting as SettingType, SettingsSection} from '../../Settings';
import {RootStackParamList, SettingsStackParamList} from '../../types';
import Text from '../global/CustomText';

import SettingsManager from '../../Settings';
import {useEffect, useRef, useState} from 'react';

SettingsManager;

type Props = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, 'Setting'>,
  StackScreenProps<RootStackParamList>
>;

function RenderSettingText({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  return (
    <View style={styles.setting__text}>
      <Text fontWeight={500} style={styles.setting__name}>
        {name}
      </Text>
      {description && (
        <Text style={styles.setting__description}>{description}</Text>
      )}
    </View>
  );
}

const renderers = {
  renderSwitch: (setting: SettingType, section: SettingsSection) => {
    const [value, setValue] = useState<boolean>(
      SettingsManager.settingsMap[section.id][setting.id],
    );

    const firstRun = useRef(true);

    useEffect(() => {
      if (firstRun.current) return;

      (async () => {
        firstRun.current = false;

        await SettingsManager.editSetting(section.id, setting.id, value);
      })();
    }, [value]);

    return (
      <View style={styles.setting}>
        <RenderSettingText
          name={setting.name}
          description={setting.description}
        />
        <Switch
          style={{flex: 1}}
          trackColor={{
            true: globalStyles.clrPrimary300,
            false: globalStyles.clrPrimary200,
          }}
          thumbColor={globalStyles.clrPrimary500}
          value={value}
          onValueChange={() => setValue(val => !val)}
        />
      </View>
    );
  },

  renderInput: (setting: SettingType, section: SettingsSection) => (
    <View style={styles.setting}>
      <RenderSettingText
        name={setting.name}
        description={setting.description}
      />
      <TextInput
        style={styles.setting__input}
        keyboardType={setting.keyboardType}
        value={setting.default.toString()}
      />
    </View>
  ),
};

function renderSetting(setting: SettingType, settingSection: SettingsSection) {
  switch (setting.type) {
    case 'boolean':
      return renderers.renderSwitch(setting, settingSection);
    case 'number':
    case 'string':
      return renderers.renderInput(setting, settingSection);
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
          renderItem={info => renderSetting(info.item, setting)}
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
    marginBottom: 16,
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

  setting__input: {
    borderColor: globalStyles.clrNeutral300,
    borderWidth: 1,
    textAlign: 'center',
    flex: 1,
  },
});
