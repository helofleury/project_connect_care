import { useCallback, useEffect, useState } from "react";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  icon?: string;
  highlighted?: boolean;
}

interface UseRecommendationsReturn {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
}

const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    title: "Agendar Revisão",
    description:
      "Detectamos que seu veículo está próximo da manutenção.",
    actionLabel: "Agendar agora",
    icon: "🔧",
    highlighted: true,
  },
  {
    id: "2",
    title: "Troca de pneus",
    description:
      "Seus pneus estão próximos do limite de uso.",
    actionLabel: "Ver detalhes",
    icon: "🚗",
  },
  {
    id: "3",
    title: "Acessórios para Ranger",
    description:
      "Confira acessórios recomendados para o seu veículo.",
    actionLabel: "Ver detalhes",
    icon: "🧰",
  },
  {
    id: "4",
    title: "Fale com a concessionária",
    description:
      "Tire dúvidas ou agende outros serviços.",
    actionLabel: "Ver detalhes",
    icon: "💬",
  },
];

export function useRecommendations(): UseRecommendationsReturn {
  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const refreshRecommendations = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        // Recommendation service will be connected here.
        setRecommendations(mockRecommendations);
      } catch {
        setError(
          "Não foi possível carregar as recomendações."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refreshRecommendations,
  };
}