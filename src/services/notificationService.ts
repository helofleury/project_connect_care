import { API_URL } from "../constants/demo";

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  channel: "whatsapp" | "email" | "sms";
  profile: string;
  icon: string;
  created_at: string;
  unread: boolean;
  action?: "schedule" | "recommendation" | "history";
}

interface NotificationResponse {
  status: string;
  notifications: CustomerNotification[];
  message?: string;
}

export async function getCustomerNotifications(vinHash: string): Promise<CustomerNotification[]> {
  const response = await fetch(`${API_URL}/vehicles/${vinHash}/notifications`);
  if (!response.ok) throw new Error(`Erro ao buscar notificações: ${response.status}`);
  const data: NotificationResponse = await response.json();
  if (data.status !== "ok") throw new Error(data.message || "Não foi possível carregar as notificações.");
  return data.notifications;
}

export const notificationService = { getCustomerNotifications };
