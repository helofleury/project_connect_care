import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  vehicleService,
  type VehicleHistoryItem,
} from "../services/vehicleService";

interface UseVehicleHistoryReturn {
  history: VehicleHistoryItem[];
  loading: boolean;
  error: string | null;
  refreshHistory: () => Promise<void>;
}

export function useVehicleHistory(
  vinHash?: string
): UseVehicleHistoryReturn {
  const [history, setHistory] = useState<
    VehicleHistoryItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const refreshHistory =
    useCallback(async () => {
      if (!vinHash) {
        setHistory([]);
        setError(
          "VIN do veículo não informado."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data =
          await vehicleService.getVehicleHistory(
            vinHash
          );

        setHistory(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o histórico.";

        setHistory([]);
        setError(message);
      } finally {
        setLoading(false);
      }
    }, [vinHash]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  return {
    history,
    loading,
    error,
    refreshHistory,
  };
}