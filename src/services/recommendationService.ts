const API_URL = "http://192.168.15.5:8000";

import type { Recommendation } from "../types/recommendation";

interface RecommendationApiItem {
  type: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  action: string;
}

interface RecommendationApiResponse {
  status: string;
  vin_hash: string;
  vehicle: {
    model: string;
    year: number | null;
    last_km: number | null;
  };
  recommendations: RecommendationApiItem[];
  total: number;
}

interface NotificationApiResponse {
  status: string;
  message: string;
  vin_hash: string;
  recommendation: {
    priority: string;
    title: string;
    description: string;
    action: string;
  };
  notification: {
    status: string;
    n8n_status_code?: number;
  };
}

const DEMO_VIN =
  "7c1878b6f55e26922eb1955d2c1ea5689999868cb58cfb373b6742ce34a45b28";

/**
 * Configuração visual das recomendações.
 *
 * Cada tipo possui:
 * - ícone
 * - categoria usada nos filtros
 * - texto do botão
 */
const RECOMMENDATION_CONFIG: Record<
  string,
  {
    icon: string;
    category: "MAINTENANCE" | "ACCESSORY" | "SERVICE" | "OTHER";
    actionLabel: string;
  }
> = {
  MAINTENANCE: {
    icon: "construct-outline",
    category: "MAINTENANCE",
    actionLabel: "Agendar agora",
  },

  PREVENTIVE: {
    icon: "medkit-outline",
    category: "MAINTENANCE",
    actionLabel: "Ver detalhes",
  },

  ACCESSORY: {
    icon: "car-outline",
    category: "ACCESSORY",
    actionLabel: "Ver acessórios",
  },

  ACCESSORIES: {
    icon: "car-outline",
    category: "ACCESSORY",
    actionLabel: "Ver acessórios",
  },

  SERVICE: {
    icon: "calendar-outline",
    category: "SERVICE",
    actionLabel: "Agendar serviço",
  },

  SERVICES: {
    icon: "calendar-outline",
    category: "SERVICE",
    actionLabel: "Agendar serviço",
  },

  LOYALTY: {
    icon: "people-outline",
    category: "SERVICE",
    actionLabel: "Encontrar concessionária",
  },

  SERVICE_PATTERN: {
    icon: "analytics-outline",
    category: "SERVICE",
    actionLabel: "Ver detalhes",
  },

  DATA_QUALITY: {
    icon: "warning-outline",
    category: "OTHER",
    actionLabel: "Ver detalhes",
  },

  MONITORING: {
    icon: "eye-outline",
    category: "OTHER",
    actionLabel: "Ver detalhes",
  },
};

/**
 * Configuração padrão para qualquer tipo
 * que ainda não esteja cadastrado acima.
 */
const DEFAULT_RECOMMENDATION_CONFIG = {
  icon: "bulb-outline",
  category: "OTHER" as const,
  actionLabel: "Ver detalhes",
};

function mapRecommendation(
  recommendation: RecommendationApiItem,
  index: number
): Recommendation {
  const config =
    RECOMMENDATION_CONFIG[recommendation.type] ??
    DEFAULT_RECOMMENDATION_CONFIG;

  return {
    id: `${recommendation.type}-${index}`,

    title: recommendation.title,

    description: recommendation.description,

    actionLabel: config.actionLabel,

    icon: config.icon,

    highlighted:
      recommendation.priority === "HIGH",
  };
}

export const recommendationService = {
  async getRecommendations(
    _customerId?: string
  ): Promise<Recommendation[]> {
    const response = await fetch(
      `${API_URL}/vehicles/${DEMO_VIN}/recommendations`
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao buscar recomendações: ${response.status}`
      );
    }

    const data: RecommendationApiResponse =
      await response.json();

    if (data.status !== "ok") {
      throw new Error(
        "Não foi possível carregar as recomendações."
      );
    }

    return data.recommendations.map(
      mapRecommendation
    );
  },

  async sendRecommendationNotification(
    email: string,
    name: string = "Cliente ConnectCare"
  ): Promise<NotificationApiResponse> {
    const response = await fetch(
      `${API_URL}/vehicles/${DEMO_VIN}/recommendations/notify`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          name,
        }),
      }
    );

    if (!response.ok) {
      let message =
        `Erro ao enviar recomendação: ${response.status}`;

      try {
        const errorData = await response.json();

        if (errorData?.detail) {
          message = errorData.detail;
        }
      } catch {
        // Mantém a mensagem padrão
      }

      throw new Error(message);
    }

    const data: NotificationApiResponse =
      await response.json();

    if (data.status !== "ok") {
      throw new Error(
        "Não foi possível enviar a recomendação."
      );
    }

    return data;
  },
};