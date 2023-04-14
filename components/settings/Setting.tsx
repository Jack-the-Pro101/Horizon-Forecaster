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
import {SetStateAction, useEffect, useRef, useState} from 'react';

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

type SettingsRenderFunction = (
  setting: SettingType,
  section: SettingsSection,
  settingsState: [any, SetStateAction<any>],
) => JSX.Element;

const renderers: {
  renderSwitch: SettingsRenderFunction;
  renderInput: SettingsRenderFunction;
} = {
  renderSwitch: (setting, section, settingsState) => {
    const [state, updateState] = settingsState;

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
          value={state[section.id]['items'][setting.id].value}
          onValueChange={() => {
            updateState((value: any) =>
              SettingsManager.editSetting(
                section.id,
                setting.id,
                value,
                !value[section.id]['items'][setting.id].value,
              ),
            );

            SettingsManager.saveSettings();
          }}
        />
      </View>
    );
  },

  renderInput: (setting, section, settingsState) => {
    const [state, updateState] = settingsState;

    return (
      <View style={styles.setting}>
        <RenderSettingText
          name={setting.name}
          description={setting.description}
        />
        <TextInput
          style={styles.setting__input}
          keyboardType={setting.keyboardType}
          value={state[section.id]['items'][setting.id].value.toString()}
          onChangeText={text => {
            updateState((value: any) =>
              SettingsManager.editSetting(section.id, setting.id, value, text),
            );
          }}
          onEndEditing={e => {
            updateState((value: any) => {
              const updatedValue = SettingsManager.editSetting(
                section.id,
                setting.id,
                value,
                Number(e.nativeEvent.text),
              );

              SettingsManager.saveSettings();

              return updatedValue;
            });
          }}
        />
      </View>
    );
  },
};

function renderSetting(
  setting: SettingType,
  settingSection: SettingsSection,
  state: [any, SetStateAction<any>],
) {
  switch (setting.type) {
    case 'boolean':
      return renderers.renderSwitch(setting, settingSection, state);
    case 'number':
    case 'string':
      return renderers.renderInput(setting, settingSection, state);
    default:
      return <Text>[Data type not supported]</Text>;
  }
}

export default function Setting({navigation, route}: Props) {
  const setting = route.params;

  const settingsState = useState(SettingsManager.settingsMap);

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
          renderItem={info => renderSetting(info.item, setting, settingsState)}
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
