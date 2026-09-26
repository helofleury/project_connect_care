import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Customer360Screen from "../screens/Customer360Screen";
import VehicleHealthScreen from "../screens/VehicleHealthScreen";
import PredictionScreen from "../screens/PredictionScreen";
import EngagementScreen from "../screens/EngagementScreen";
import RecommendationScreen from "../screens/RecommendationScreen";
import { useTheme } from "../contexts/ThemeContext";
import type { AppTabParamList } from "./types";

const Tab = createBottomTabNavigator<AppTabParamList>();

const ICONS: Record<keyof AppTabParamList, keyof typeof Ionicons.glyphMap> = {
  Customer360: "home-outline",
  VehicleHealth: "car-sport-outline",
  Prediction: "analytics-outline",
  Engagement: "chatbox-ellipses-outline",
  Recommendation: "gift-outline",
};

export default function AppTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Customer360"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginBottom: 3 },
        tabBarStyle: {
          height: 64,
          paddingTop: 5,
          paddingBottom: 5,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          elevation: 10,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size - 1} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Customer360" component={Customer360Screen} options={{ title: "Início" }} />
      <Tab.Screen name="VehicleHealth" component={VehicleHealthScreen} options={{ title: "Veículo" }} />
      <Tab.Screen name="Prediction" component={PredictionScreen} options={{ title: "Previsão" }} />
      <Tab.Screen name="Engagement" component={EngagementScreen} options={{ title: "Contato" }} />
      <Tab.Screen name="Recommendation" component={RecommendationScreen} options={{ title: "Benefícios" }} />
    </Tab.Navigator>
  );
}
