import { useCallback, useEffect, useState } from "react";
import { getCustomerProfile, type CustomerProfile } from "../services/profileService";

export function useCustomerProfile(vinHash?: string) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!vinHash) {
      setProfile(null);
      setError("Veículo não informado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setProfile(await getCustomerProfile(vinHash));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar seu perfil.");
    } finally {
      setLoading(false);
    }
  }, [vinHash]);

  useEffect(() => { refreshProfile(); }, [refreshProfile]);

  return { profile, loading, error, refreshProfile };
}
