import { useCallback, useEffect, useState } from "react";

export interface Vehicle {
  id: string;
  model: string;
  year: number;
  fuel: string;
  mileage: number;
  nextServiceMileage: number;
  warranty: string;
}

interface UseVehicleReturn {
  vehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  refreshVehicle: () => Promise<void>;
}

const mockVehicle: Vehicle = {
  id: "vehicle-1",
  model: "Ranger XLT 2.2 4x4",
  year: 2022,
  fuel: "Diesel",
  mileage: 13000,
  nextServiceMileage: 5200,
  warranty: "Válida até 16/03/2027",
};

export function useVehicle(): UseVehicleReturn {
  const [vehicle, setVehicle] =
    useState<Vehicle | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const refreshVehicle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Vehicle service will be connected here.
      setVehicle(mockVehicle);
    } catch {
      setError(
        "Não foi possível carregar os dados do veículo."
      );
    } finally {
      setLoading(false);
    }
  }, []);

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