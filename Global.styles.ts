import {DefaultTheme} from '@react-navigation/native';
import {StyleSheet, Appearance, StatusBar} from 'react-native';

export const colors = {
  clrNeutralRaw100: '210, 10%, 10%',
  clrNeutralRaw200: '210, 5%, 20%',
  clrNeutralRaw300: '210, 3%, 30%',
  clrNeutralRaw400: '210, 2%, 40%',
  clrNeutralRaw500: '210, 2%, 55%',
  clrNeutralRaw600: '210, 1%, 65%',
  clrNeutralRaw700: '0, 0%, 75%',
  clrNeutralRaw800: '0, 0%, 90%',
  clrNeutralRaw900: '0, 0%, 100%',

  clrPrimaryRaw100: '214, 100%, 10%',
  clrPrimaryRaw200: '214, 100%, 20%',
  clrPrimaryRaw300: '214, 100%, 30%',
  clrPrimaryRaw400: '214, 100%, 40%',
  clrPrimaryRaw500: '214, 100%, 50%',
  clrPrimaryRaw600: '214, 100%, 60%',
  clrPrimaryRaw700: '214, 100%, 70%',
  clrPrimaryRaw800: '214, 100%, 80%',
  clrPrimaryRaw900: '214, 100%, 90%',

  clrAccentRaw100: '42, 5%, 10%',
  clrAccentRaw200: '42, 25%, 20%',
  clrAccentRaw300: '42, 75%, 30%',
  clrAccentRaw400: '42, 100%, 40%',
  clrAccentRaw500: '42, 100%, 50%',
  clrAccentRaw600: '42, 100%, 60%',
  clrAccentRaw700: '42, 100%, 70%',
  clrAccentRaw800: '42, 100%, 80%',
  clrAccentRaw900: '42, 100%, 90%',

  clrDangerRaw100: '10, 85%, 10%',
  clrDangerRaw200: '10, 88%, 20%',
  clrDangerRaw300: '10, 95%, 30%',
  clrDangerRaw400: '10, 100%, 40%',
  clrDangerRaw500: '10, 100%, 50%',
  clrDangerRaw600: '10, 100%, 60%',
  clrDangerRaw700: '10, 100%, 70%',
  clrDangerRaw800: '10, 100%, 80%',
  clrDangerRaw900: '10, 100%, 90%',

  clrOkRaw100: '131, 87%, 10%',
  clrOkRaw200: '131, 87%, 20%',
  clrOkRaw300: '131, 87%, 30%',
  clrOkRaw400: '131, 87%, 40%',
  clrOkRaw500: '131, 87%, 50%',
  clrOkRaw600: '131, 87%, 60%',
  clrOkRaw700: '131, 87%, 70%',
  clrOkRaw800: '131, 87%, 80%',
  clrOkRaw900: '131, 87%, 90%',

  clrNeutral100: 'hsl(210, 10%, 10%)',
  clrNeutral200: 'hsl(210, 5%, 20%)',
  clrNeutral300: 'hsl(210, 3%, 30%)',
  clrNeutral400: 'hsl(210, 2%, 40%)',
  clrNeutral500: 'hsl(210, 2%, 55%)',
  clrNeutral600: 'hsl(210, 1%, 65%)',
  clrNeutral700: 'hsl(0, 0%, 75%)',
  clrNeutral800: 'hsl(0, 0%, 90%)',
  clrNeutral900: 'hsl(0, 0%, 100%)',

  clrPrimary100: 'hsl(214, 100%, 10%)',
  clrPrimary200: 'hsl(214, 100%, 20%)',
  clrPrimary300: 'hsl(214, 100%, 30%)',
  clrPrimary400: 'hsl(214, 100%, 40%)',
  clrPrimary500: 'hsl(214, 100%, 50%)',
  clrPrimary600: 'hsl(214, 100%, 60%)',
  clrPrimary700: 'hsl(214, 100%, 70%)',
  clrPrimary800: 'hsl(214, 100%, 80%)',
  clrPrimary900: 'hsl(214, 100%, 90%)',

  clrAccent100: 'hsl(42, 5%, 10%)',
  clrAccent200: 'hsl(42, 25%, 20%)',
  clrAccent300: 'hsl(42, 75%, 30%)',
  clrAccent400: 'hsl(42, 100%, 40%)',
  clrAccent500: 'hsl(42, 100%, 50%)',
  clrAccent600: 'hsl(42, 100%, 60%)',
  clrAccent700: 'hsl(42, 100%, 70%)',
  clrAccent800: 'hsl(42, 100%, 80%)',
  clrAccent900: 'hsl(42, 100%, 90%)',

  clrDanger100: 'hsl(10, 85%, 10%)',
  clrDanger200: 'hsl(10, 88%, 20%)',
  clrDanger300: 'hsl(10, 95%, 30%)',
  clrDanger400: 'hsl(10, 100%, 40%)',
  clrDanger500: 'hsl(10, 100%, 50%)',
  clrDanger600: 'hsl(10, 100%, 60%)',
  clrDanger700: 'hsl(10, 100%, 70%)',
  clrDanger800: 'hsl(10, 100%, 80%)',
  clrDanger900: 'hsl(10, 100%, 90%)',

  clrOk100: 'hsl(131, 87%, 10%)',
  clrOk200: 'hsl(131, 87%, 20%)',
  clrOk300: 'hsl(131, 87%, 30%)',
  clrOk400: 'hsl(131, 87%, 40%)',
  clrOk500: 'hsl(131, 87%, 50%)',
  clrOk600: 'hsl(131, 87%, 60%)',
  clrOk700: 'hsl(131, 87%, 70%)',
  clrOk800: 'hsl(131, 87%, 80%)',
  clrOk900: 'hsl(131, 87%, 90%)',
};

class Styles {
  private isDarkCache = this.isDark;
  private isDarkCached = false;

  get isDark(): boolean {
    if (this.isDarkCached) return this.isDarkCache;

    const theme = Appearance.getColorScheme() === 'dark';

    if (!this.isDarkCached) {
      this.isDarkCached = true;
      this.isDarkCache = theme;

      setTimeout(() => {
        this.isDarkCached = false;
      }, 1000);
    }

    return theme;
  }

  get clrNeutral100() {
    return this.isDark ? colors.clrNeutral100 : colors.clrNeutral900;
  }
  get clrNeutral200() {
    return this.isDark ? colors.clrNeutral200 : colors.clrNeutral800;
  }
  get clrNeutral300() {
    return this.isDark ? colors.clrNeutral300 : colors.clrNeutral700;
  }
  get clrNeutral400() {
    return this.isDark ? colors.clrNeutral400 : colors.clrNeutral600;
  }
  get clrNeutral500() {
    return colors.clrNeutral500;
  }
  get clrNeutral600() {
    return this.isDark ? colors.clrNeutral600 : colors.clrNeutral400;
  }
  get clrNeutral700() {
    return this.isDark ? colors.clrNeutral700 : colors.clrNeutral300;
  }
  get clrNeutral800() {
    return this.isDark ? colors.clrNeutral800 : colors.clrNeutral200;
  }
  get clrNeutral900() {
    return this.isDark ? colors.clrNeutral900 : colors.clrNeutral100;
  }

  get clrPrimary100() {
    return this.isDark ? colors.clrPrimary100 : colors.clrPrimary900;
  }
  get clrPrimary200() {
    return this.isDark ? colors.clrPrimary200 : colors.clrPrimary800;
  }
  get clrPrimary300() {
    return this.isDark ? colors.clrPrimary300 : colors.clrPrimary700;
  }
  get clrPrimary400() {
    return this.isDark ? colors.clrPrimary400 : colors.clrPrimary600;
  }
  get clrPrimary500() {
    return colors.clrPrimary500;
  }
  get clrPrimary600() {
    return this.isDark ? colors.clrPrimary600 : colors.clrPrimary400;
  }
  get clrPrimary700() {
    return this.isDark ? colors.clrPrimary700 : colors.clrPrimary300;
  }
  get clrPrimary800() {
    return this.isDark ? colors.clrPrimary800 : colors.clrPrimary200;
  }
  get clrPrimary900() {
    return this.isDark ? colors.clrPrimary900 : colors.clrPrimary100;
  }

  get clrAccent100() {
    return this.isDark ? colors.clrAccent100 : colors.clrAccent900;
  }
  get clrAccent200() {
    return this.isDark ? colors.clrAccent200 : colors.clrAccent800;
  }
  get clrAccent300() {
    return this.isDark ? colors.clrAccent300 : colors.clrAccent700;
  }
  get clrAccent400() {
    return this.isDark ? colors.clrAccent400 : colors.clrAccent600;
  }
  get clrAccent500() {
    return colors.clrAccent500;
  }
  get clrAccent600() {
    return this.isDark ? colors.clrAccent600 : colors.clrAccent400;
  }
  get clrAccent700() {
    return this.isDark ? colors.clrAccent700 : colors.clrAccent300;
  }
  get clrAccent800() {
    return this.isDark ? colors.clrAccent800 : colors.clrAccent200;
  }
  get clrAccent900() {
    return this.isDark ? colors.clrAccent900 : colors.clrAccent100;
  }

  get clrDanger100() {
    return this.isDark ? colors.clrDanger100 : colors.clrDanger900;
  }
  get clrDanger200() {
    return this.isDark ? colors.clrDanger200 : colors.clrDanger800;
  }
  get clrDanger300() {
    return this.isDark ? colors.clrDanger300 : colors.clrDanger700;
  }
  get clrDanger400() {
    return this.isDark ? colors.clrDanger400 : colors.clrDanger600;
  }
  get clrDanger500() {
    return colors.clrDanger500;
  }
  get clrDanger600() {
    return this.isDark ? colors.clrDanger600 : colors.clrDanger400;
  }
  get clrDanger700() {
    return this.isDark ? colors.clrDanger700 : colors.clrDanger300;
  }
  get clrDanger800() {
    return this.isDark ? colors.clrDanger800 : colors.clrDanger200;
  }
  get clrDanger900() {
    return this.isDark ? colors.clrDanger900 : colors.clrDanger100;
  }
}

const styles = new Styles();

export const NavigationDarkTheme = {
  dark: styles.isDark,
  colors: {
    ...DefaultTheme.colors,
    primary: styles.clrPrimary500,
    background: styles.clrNeutral100,
    // card: colors.clrNeutral900,
    // text: colors.clrNeutral900,
    // border: 'rgb(216, 216, 216)',
    // notification: 'rgb(255, 59, 48)',
  },
};

export const stylesheet = StyleSheet.create({
  body: {
    padding: 4,
    paddingTop: StatusBar.currentHeight,
    flex: 1,
  },
});

export default styles;
