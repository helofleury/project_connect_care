import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Customer360: undefined;
  Behavior: undefined;
  Prediction: undefined;
  Engagement: undefined;
  Recommendation: undefined;
  DealershipSelection: undefined;
  DealershipDetails: {
    dealershipId: string;
  };
  Scheduling: {
    dealershipId: string;
  };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};