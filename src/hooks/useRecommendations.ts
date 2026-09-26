import { useCallback, useEffect, useState } from "react";

import type { Recommendation } from "../types/recommendation";
import { recommendationService } from "../services/recommendationService";

interface UseRecommendationsReturn {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
}

export function useRecommendations(): UseRecommendationsReturn {
  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data =
        await recommendationService.getRecommendations();

      setRecommendations(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as recomendações.";

      setRecommendations([]);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

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