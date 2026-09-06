export interface Recommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  priority: "high" | "medium" | "low";
  dealershipId?: string;
}

const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    title: "Schedule your next maintenance",
    description:
      "Your vehicle is approaching the recommended service mileage.",
    reason:
      "Your current mileage is close to the recommended maintenance interval.",
    priority: "high",
    dealershipId: "1",
  },
  {
    id: "2",
    title: "Vehicle inspection",
    description:
      "A complete inspection can help keep your vehicle in optimal condition.",
    reason:
      "Regular inspections can prevent unexpected maintenance issues.",
    priority: "medium",
    dealershipId: "2",
  },
  {
    id: "3",
    title: "Explore vehicle upgrades",
    description:
      "Explore new vehicle options based on your profile.",
    reason:
      "Your customer profile indicates potential interest in a future upgrade.",
    priority: "low",
  },
];

export const recommendationService = {
  async getRecommendations(
    _customerId: string
  ): Promise<Recommendation[]> {
    // Recommendation engine integration will be added here.

    return mockRecommendations;
  },
};