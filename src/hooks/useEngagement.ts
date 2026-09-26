import { useCallback, useEffect, useState } from "react";
import { engagementService, type CommunicationPreferences, type EngagementDecision, type EngagementHistoryItem } from "../services/engagementService";

export function useEngagement(customerId: number | null) {
  const [decision, setDecision] = useState<EngagementDecision | null>(null);
  const [history, setHistory] = useState<EngagementHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!customerId) return;
    setHistoryLoading(true);
    try {
      const result = await engagementService.getHistory(customerId);
      setHistory(result);
      setDecision(result[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar engagement.");
    } finally {
      setHistoryLoading(false);
    }
  }, [customerId]);

  const evaluate = useCallback(async () => {
    if (!customerId) {
      setError("Cliente não identificado. Faça login novamente.");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await engagementService.evaluate(customerId);
      setDecision(result.decision);
      await refresh();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao executar o engagement.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [customerId, refresh]);

  useEffect(() => { void refresh(); }, [refresh]);
  return { decision, history, loading, historyLoading, error, evaluate, refresh };
}

export function useCommunicationPreferences(customerId: number | null) {
  const [preferences, setPreferences] = useState<CommunicationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try { setPreferences(await engagementService.getPreferences(customerId)); }
    catch (err) { setError(err instanceof Error ? err.message : "Erro ao carregar preferências."); }
    finally { setLoading(false); }
  }, [customerId]);

  const save = useCallback(async (next: CommunicationPreferences) => {
    if (!customerId) return;
    setSaving(true);
    setError(null);
    try { setPreferences(await engagementService.updatePreferences(customerId, next)); }
    catch (err) { setError(err instanceof Error ? err.message : "Erro ao salvar preferências."); throw err; }
    finally { setSaving(false); }
  }, [customerId]);

  useEffect(() => { void load(); }, [load]);
  return { preferences, loading, saving, error, save, reload: load };
}
