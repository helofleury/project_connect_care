import { useCallback, useEffect, useState } from "react";

import {
  behaviorService,
  type VehicleSegment,
} from "../services/behaviorService";

interface UseBehaviorReturn {
  segment: VehicleSegment | null;
  loading: boolean;
  error: string | null;
  refreshSegment: () => Promise<void>;
}

export function useBehavior(
  vinHash?: string
): UseBehaviorReturn {
  const [segment, setSegment] =
    useState<VehicleSegment | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const refreshSegment = useCallback(async () => {
    if (!vinHash) {
      setSegment(null);
      setError("VIN do veículo não informado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data =
        await behaviorService.getVehicleSegment(vinHash);

      setSegment(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o perfil comportamental.";

      setSegment(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [vinHash]);

  useEffect(() => {
    refreshSegment();
  }, [refreshSegment]);

  return {
    segment,
    loading,
    error,
    refreshSegment,
  };
}