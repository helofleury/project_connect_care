import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  predictionService,
  type VehiclePrediction,
  type VehicleMLPrediction,
  type NextMaintenancePrediction,
} from "../services/predictionService";

interface UseVehiclePredictionReturn {
  prediction: VehiclePrediction | null;

  mlPrediction: VehicleMLPrediction | null;

  nextMaintenance: NextMaintenancePrediction | null;

  loading: boolean;

  error: string | null;

  refreshPrediction: () => Promise<void>;
}

export function useVehiclePrediction(
  vinHash?: string
): UseVehiclePredictionReturn {
  const [prediction, setPrediction] =
    useState<VehiclePrediction | null>(null);

  const [mlPrediction, setMLPrediction] =
    useState<VehicleMLPrediction | null>(null);

  const [nextMaintenance, setNextMaintenance] =
    useState<NextMaintenancePrediction | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refreshPrediction =
    useCallback(async () => {
      if (!vinHash) {
        setPrediction(null);
        setMLPrediction(null);
        setNextMaintenance(null);

        setError(
          "VIN do veículo não informado."
        );

        setLoading(false);

        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [
          riskData,
          mlData,
          maintenanceData,
        ] = await Promise.all([
          predictionService.getVehiclePrediction(
            vinHash
          ),

          predictionService.getVehicleMLPrediction(
            vinHash
          ),

          predictionService.getNextMaintenancePrediction(
            vinHash
          ),
        ]);

        setPrediction(riskData);

        setMLPrediction(mlData);

        setNextMaintenance(
          maintenanceData
        );

      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as previsões.";

        setPrediction(null);
        setMLPrediction(null);
        setNextMaintenance(null);

        setError(message);

      } finally {
        setLoading(false);
      }
    }, [vinHash]);

  useEffect(() => {
    refreshPrediction();
  }, [refreshPrediction]);

  return {
    prediction,

    mlPrediction,

    nextMaintenance,

    loading,

    error,

    refreshPrediction,
  };
}