import {Text, TextProps} from 'react-native';

const fontWeightMap = {
  100: 'Inter-Thin',
  200: 'Inter-ExtraLight',
  300: 'Inter-Light',
  400: 'Inter-Regular',
  500: 'Inter-Medium',
  600: 'Inter-SemiBold',
  700: 'Inter-Bold',
  800: 'Inter-ExtraBold',
  900: 'Inter-Black',
};

interface CustomTextProps extends TextProps {
  fontWeight?: keyof typeof fontWeightMap;
}

export default function CustomText(props: CustomTextProps) {
  return (
    <Text
      {...props}
      style={{
        ...(props.style as Object),
        fontFamily: fontWeightMap[props.fontWeight || 400],
      }}>
      {props.children}
    </Text>
  );
}
