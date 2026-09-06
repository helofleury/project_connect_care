import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import AppNavigator from "./src/navigation/AppNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";
import { useAuth } from "./src/hooks/useAuth";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}

      <StatusBar style="auto" />
    </NavigationContainer>
  );
}