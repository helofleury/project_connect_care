import { useCallback, useEffect, useState } from "react";

import {
  customerSummaryService,
  type CustomerSummary,
} from "../services/customerSummaryService";

interface UseCustomerSummaryReturn {
  summary: CustomerSummary | null;
  loading: boolean;
  error: string | null;
  refreshSummary: () => Promise<void>;
}

export function useCustomerSummary(
  vinHash?: string
): UseCustomerSummaryReturn {
  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSummary = useCallback(async () => {
    if (!vinHash) {
      setSummary(null);
      setError("VIN do veículo não informado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await customerSummaryService.getCustomerSummary(vinHash);
      setSummary(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as informações do veículo.";

      setSummary(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [vinHash]);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  return {
    summary,
    loading,
    error,
    refreshSummary,
  };
}
