import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BehaviorScreen from "../screens/BehaviorScreen";
import Customer360Screen from "../screens/Customer360Screen";
import DealershipDetailsScreen from "../screens/DealershipDetailsScreen";
import DealershipSelectionScreen from "../screens/DealershipSelectionScreen";
import EngagementScreen from "../screens/EngagementScreen";
import PredictionScreen from "../screens/PredictionScreen";
import RecommendationScreen from "../screens/RecommendationScreen";
import SchedulingScreen from "../screens/SchedulingScreen";

import type { AppStackParamList } from "./types";

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Customer360"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Customer360"
        component={Customer360Screen}
      />

      <Stack.Screen
        name="Behavior"
        component={BehaviorScreen}
      />

      <Stack.Screen
        name="Prediction"
        component={PredictionScreen}
      />

      <Stack.Screen
        name="Engagement"
        component={EngagementScreen}
      />

      <Stack.Screen
        name="Recommendation"
        component={RecommendationScreen}
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
    </Stack.Navigator>
  );
};

export default AppNavigator;