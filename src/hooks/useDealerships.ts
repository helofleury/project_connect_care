import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { dealershipService } from "../services/dealershipService";
import type { Dealership } from "../types/dealership";

interface UseDealershipsReturn {
  dealerships: Dealership[];
  loading: boolean;
  error: string | null;
  refreshDealerships: () => Promise<void>;
  getDealershipById: (
    id: string
  ) => Dealership | undefined;
}

export function useDealerships(): UseDealershipsReturn {
  const [dealerships, setDealerships] =
    useState<Dealership[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refreshDealerships =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await dealershipService.getDealerships();

        setDealerships(data);
      } catch {
        setError(
          "Não foi possível carregar as concessionárias."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  const getDealershipById =
    useCallback(
      (id: string) => {
        return dealerships.find(
          (dealership) =>
            dealership.id === id
        );
      },
      [dealerships]
    );

  useEffect(() => {
    refreshDealerships();
  }, [refreshDealerships]);

  return {
    dealerships,
    loading,
    error,
    refreshDealerships,
    getDealershipById,
  };
}