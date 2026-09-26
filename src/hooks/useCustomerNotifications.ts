import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCustomerNotifications, type CustomerNotification } from "../services/notificationService";

const READ_KEY = "@connectcare360:read-notifications";

export function useCustomerNotifications(vinHash?: string) {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (!vinHash) return;
    setLoading(true);
    setError(null);
    try {
      const [items, rawRead] = await Promise.all([
        getCustomerNotifications(vinHash),
        AsyncStorage.getItem(READ_KEY),
      ]);
      const readIds: string[] = rawRead ? JSON.parse(rawRead) : [];
      setNotifications(items.map(item => ({ ...item, unread: !readIds.includes(item.id) })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar as notificações.");
    } finally {
      setLoading(false);
    }
  }, [vinHash]);

  const markAllRead = useCallback(async () => {
    const ids = notifications.map(n => n.id);
    await AsyncStorage.setItem(READ_KEY, JSON.stringify(ids));
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }, [notifications]);

  useEffect(() => { refreshNotifications(); }, [refreshNotifications]);

  return {
    notifications,
    unreadCount: notifications.filter(n => n.unread).length,
    loading,
    error,
    refreshNotifications,
    markAllRead,
  };
}
