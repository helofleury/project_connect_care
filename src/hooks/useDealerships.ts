import { useCallback, useEffect, useState } from "react";

export interface Dealership {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  openingHours: string;
  available: boolean;
}

interface UseDealershipsReturn {
  dealerships: Dealership[];
  loading: boolean;
  error: string | null;
  refreshDealerships: () => Promise<void>;
  getDealershipById: (
    id: string
  ) => Dealership | undefined;
}

const mockDealerships: Dealership[] = [
  {
    id: "1",
    name: "Ford New América",
    address: "Av. das Nações, 1200",
    distance: "2,4 km",
    phone: "(11) 4000-0000",
    openingHours: "08h - 18h",
    available: true,
  },
  {
    id: "2",
    name: "Ford Center",
    address: "Av. Brasil, 850",
    distance: "4,7 km",
    phone: "(11) 4000-1111",
    openingHours: "08h - 18h",
    available: true,
  },
  {
    id: "3",
    name: "Ford Prime",
    address: "Rua Augusta, 520",
    distance: "6,3 km",
    phone: "(11) 4000-2222",
    openingHours: "09h - 18h",
    available: true,
  },
];

export function useDealerships(): UseDealershipsReturn {
  const [dealerships, setDealerships] =
    useState<Dealership[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const refreshDealerships = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Dealership service will be connected here.
      setDealerships(mockDealerships);
    } catch {
      setError(
        "Não foi possível carregar as concessionárias."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const getDealershipById = useCallback(
    (id: string) => {
      return dealerships.find(
        (dealership) => dealership.id === id
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