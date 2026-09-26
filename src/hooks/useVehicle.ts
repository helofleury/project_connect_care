import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { Vehicle } from "../types/vehicle";
import { vehicleService } from "../services/vehicleService";

interface UseVehicleReturn {
  vehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  refreshVehicle: () => Promise<void>;
}

const DEMO_VIN =
  "7c1878b6f55e26922eb1955d2c1ea5689999868cb58cfb373b6742ce34a45b28";

export function useVehicle(
  customerId?: string
): UseVehicleReturn {
  const [vehicle, setVehicle] =
    useState<Vehicle | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refreshVehicle =
    useCallback(async () => {
      if (!customerId) {
        setVehicle(null);
        setError(
          "Não foi possível identificar o cliente."
        );
        setLoading(false);

        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data =
          await vehicleService.getVehicleByVin(
            DEMO_VIN
          );

        setVehicle(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os dados do veículo.";

        setVehicle(null);
        setError(message);
      } finally {
        setLoading(false);
      }
    }, [customerId]);

  useEffect(() => {
    refreshVehicle();
  }, [refreshVehicle]);

  return {
    vehicle,
    loading,
    error,
    refreshVehicle,
  };
}