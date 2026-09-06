export type RecommendationPriority =
  | "high"
  | "medium"
  | "low";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
  icon?: string;
  highlighted?: boolean;
  
}