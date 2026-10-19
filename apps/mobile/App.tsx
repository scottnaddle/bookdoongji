import { DefaultTheme, NavigationContainer, type Theme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/lib/theme";

/** 책둥지 내비게이션 테마 — 웹과 같은 숲 녹색 + 종이색 */
const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.nest600,
    background: colors.paper,
    card: colors.white,
    text: colors.nest900,
    border: colors.line,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <AppNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
