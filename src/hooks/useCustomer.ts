import { useCallback, useEffect, useState } from "react";

export interface Customer {
  id: string;
  name: string;
  email: string;
  customerSince: string;
  mainDealership: string;
  warranty: string;
  currentMileage: number;
  nextServiceMileage: number;
  relationshipScore: number;
  loyaltyScore: number;
}

interface UseCustomerReturn {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  refreshCustomer: () => Promise<void>;
}

const mockCustomer: Customer = {
  id: "1",
  name: "João",
  email: "joao@email.com",
  customerSince: "16/03/2022",
  mainDealership: "Ford New América",
  warranty: "Válida até 16/03/2027",
  currentMileage: 13000,
  nextServiceMileage: 5200,
  relationshipScore: 820,
  loyaltyScore: 620,
};

export function useCustomer(): UseCustomerReturn {
  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const refreshCustomer = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Customer service will be connected here.
      setCustomer(mockCustomer);
    } catch {
      setError("Não foi possível carregar os dados do cliente.");
    } finally {
      setLoading(false);
    }
  }, []);

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