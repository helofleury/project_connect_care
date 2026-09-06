export type PredictionType =
  | "maintenance"
  | "purchase"
  | "engagement";

export interface Prediction {
  id: string;
  title: string;
  description: string;
  value?: string;
  icon: string;
}