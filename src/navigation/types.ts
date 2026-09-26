import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Customer360: undefined;
  VehicleHealth: undefined;
  Recommendation: undefined;
  Engagement: undefined;
  Prediction: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<AppTabParamList>;

  Vehicle: undefined;

  History: undefined;

  DealershipSelection: undefined;

  DealershipDetails: {
    dealershipId: string;
  };

  Scheduling: {
    dealershipId: string;
  };

  Assistant: undefined;

  Profile: undefined;
  CommunicationPreferences: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;

  App: NavigatorScreenParams<AppStackParamList>;
};