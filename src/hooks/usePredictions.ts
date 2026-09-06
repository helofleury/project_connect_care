import { useCallback, useEffect, useState } from "react";

export interface Prediction {
  id: string;
  title: string;
  description: string;
  value?: string;
  icon?: string;
}

interface UsePredictionsReturn {
  predictions: Prediction[];
  loading: boolean;
  error: string | null;
  refreshPredictions: () => Promise<void>;
}

const mockPredictions: Prediction[] = [
  {
    id: "1",
    title: "Continue em dia com sua Ford",
    description:
      "Mantenha seu Ford com ótimo desempenho e valor de revenda.",
    icon: "🚙",
  },
  {
    id: "2",
    title: "Próxima manutenção prevista",
    description:
      "Sua próxima revisão está próxima.",
    value: "5.200 km",
    icon: "🔧",
  },
  {
    id: "3",
    title: "Uso de garantia",
    description:
      "Você possui itens de garantia disponíveis.",
    value: "Elegível para 2 itens",
    icon: "🛡️",
  },
];

export function usePredictions(): UsePredictionsReturn {
  const [predictions, setPredictions] = useState<
    Prediction[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const refreshPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Prediction service will be connected here.
      setPredictions(mockPredictions);
    } catch {
      setError(
        "Não foi possível carregar as previsões."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPredictions();
  }, [refreshPredictions]);

  return {
    predictions,
    loading,
    error,
    refreshPredictions,
  };
}