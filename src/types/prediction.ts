export type PredictionType =
  | "maintenance"
  | "purchase"
  | "engagement";

export interface Prediction {
  id: string;
  title: string;
  description: string;
  probability: number;
  date: string;
  type: PredictionType;
}