import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { Customer } from "../types/customer";
import { customerService } from "../services/customerService";

interface UseCustomerReturn {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  refreshCustomer: () => Promise<void>;
}

export function useCustomer(
  customerId?: string
): UseCustomerReturn {
  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refreshCustomer =
    useCallback(async () => {
      if (!customerId) {
        setCustomer(null);
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
          await customerService.getCustomerById(
            customerId
          );

        setCustomer(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os dados do cliente.";

        setError(message);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    }, [customerId]);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  return {
    customer,
    loading,
    error,
    refreshCustomer,
  };
}