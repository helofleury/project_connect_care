export interface Prediction {
  id: string;
  title: string;
  description: string;
  probability: number;
  date: string;
  type: "maintenance" | "purchase" | "engagement";
}

const mockPredictions: Prediction[] = [
  {
    id: "1",
    title: "Scheduled maintenance",
    description:
      "The customer is likely to schedule a vehicle maintenance service.",
    probability: 92,
    date: "Next 30 days",
    type: "maintenance",
  },
  {
    id: "2",
    title: "Service engagement",
    description:
      "The customer has a high probability of responding to a service reminder.",
    probability: 84,
    date: "Next 15 days",
    type: "engagement",
  },
  {
    id: "3",
    title: "Vehicle upgrade",
    description:
      "The customer may consider upgrading their vehicle in the future.",
    probability: 68,
    date: "Next 12 months",
    type: "purchase",
  },
];

export const predictionService = {
  async getPredictions(
    _customerId: string
  ): Promise<Prediction[]> {
    // Prediction API or AI model integration will be added here.

    return mockPredictions;
  },
};