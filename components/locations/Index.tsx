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

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';

import globalStyles from '../../Global.styles';
import {stylesheet} from '../../Global.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Locations'>;

export default function Home({navigation}: Props) {
  return (
    <View>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text>Back</Text>
      </TouchableOpacity>
    </View>
  );
}
