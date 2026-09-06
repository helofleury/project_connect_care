export type RecommendationPriority =
  | "high"
  | "medium"
  | "low";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  priority: RecommendationPriority;
  dealershipId?: string;
}