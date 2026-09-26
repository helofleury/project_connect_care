import { createNativeStackNavigator } from "@react-navigation/native-stack";

import VehicleScreen from "../screens/VehicleScreen";
import HistoryScreen from "../screens/HistoryScreen";
import DealershipDetailsScreen from "../screens/DealershipDetailsScreen";
import DealershipSelectionScreen from "../screens/DealershipSelectionScreen";
import SchedulingScreen from "../screens/SchedulingScreen";
import AssistantScreen from "../screens/AssistantScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CommunicationPreferencesScreen from "../screens/CommunicationPreferencesScreen";
import AppTabNavigator from "./AppTabNavigator";

import FloatingChatbot from "../components/FloatingChatbot";

import type { AppStackParamList } from "./types";

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <>
      <Stack.Navigator
        initialRouteName="Tabs"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={AppTabNavigator}
        />

        <Stack.Screen
          name="Vehicle"
          component={VehicleScreen}
        />

        <Stack.Screen
          name="History"
          component={HistoryScreen}
        />

        <Stack.Screen
          name="DealershipSelection"
          component={DealershipSelectionScreen}
        />

        <Stack.Screen
          name="DealershipDetails"
          component={DealershipDetailsScreen}
        />

        <Stack.Screen
          name="Scheduling"
          component={SchedulingScreen}
        />

        <Stack.Screen
          name="Assistant"
          component={AssistantScreen}
          options={{
            presentation: "modal",
          }}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ presentation: "modal" }}
        />

        <Stack.Screen
          name="CommunicationPreferences"
          component={CommunicationPreferencesScreen}
          options={{ presentation: "modal" }}
        />
      </Stack.Navigator>

      <FloatingChatbot />
    </>
  );
};

export default AppNavigator;