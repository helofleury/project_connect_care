import { useCallback, useEffect, useState } from "react";

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Font from "expo-font";

import AppNavigator from "./src/navigation/AppNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";

function RootNavigator() {
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();

  if (loading) {
    return null;
  }

  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <AppNavigator /> : <AuthNavigator />}
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsReady, setFontsReady] = useState(false);

  const loadFonts = useCallback(async () => {
    try {
      // Carrega a fonte de ícones (Ionicons) UMA única vez, no início do
      // app. Sem isso, cada ícone que aparece na tela tenta baixar a
      // fonte por conta própria — se o celular não alcançar o servidor
      // do Metro (fora da mesma rede, firewall na porta 8081, etc.),
      // isso gera um erro "ExpoAsset.downloadAsync ... rejected" PARA
      // CADA ícone simultâneo na tela.
      await Font.loadAsync(Ionicons.font);
    } catch (error) {
      // Não travamos o app por causa disso: os ícones podem não
      // aparecer, mas o resto do app continua funcionando. O aviso
      // ajuda a identificar rapidamente um problema de rede entre o
      // celular e o computador rodando o Expo.
      console.warn(
        "[App] Não foi possível carregar a fonte de ícones (Ionicons). " +
          "Isso geralmente indica que o celular não está alcançando o " +
          "servidor do Metro (mesma rede Wi-Fi? firewall na porta 8081?).",
        error
      );
    } finally {
      setFontsReady(true);
    }
  }, []);

  useEffect(() => {
    loadFonts();
  }, [loadFonts]);

  if (!fontsReady) {
    return <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}