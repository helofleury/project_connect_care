import { API_URL } from "../constants/demo";

export type EngagementPriority = "HIGH" | "MEDIUM" | "LOW";
export type EngagementChannel = "whatsapp" | "email";
export type DeliveryStatus = "sent" | "partial" | "not_sent" | "not_configured" | "failed";

export interface EngagementDecision {
  decision_id: number;
  created_at: string;
  should_send: boolean;
  priority: EngagementPriority;
  channel: string;
  channels: EngagementChannel[];
  title: string;
  message: string;
  reason: string;
  delivery_status: DeliveryStatus;
}

export interface EngagementEvaluation {
  status: string;
  customer: { customer_id: number; name: string };
  vehicle: { model: string | null; year: number | null; service_count: number | null; days_since_last_service: number | null; high_recency_risk: boolean; low_dealer_loyalty: boolean; irregular_service_pattern: boolean; km_regression_count: number | null; last_km: number | null };
  prediction: { probability: number | null; predicted_class: string | null };
  preferences: CommunicationPreferences;
  decision: EngagementDecision;
  ai_enabled: boolean;
}

export interface EngagementHistoryItem extends EngagementDecision {}

export interface CommunicationPreferences {
  news_channels: EngagementChannel[];
  alert_channels: EngagementChannel[];
  recommendation_channels: EngagementChannel[];
  allow_news: boolean;
  allow_alerts: boolean;
  allow_recommendations: boolean;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof data === "object" && data !== null && "detail" in data ? String((data as { detail: unknown }).detail) : `Erro HTTP ${response.status}`;
    throw new Error(detail);
  }
  return data as T;
}

export const engagementService = {
  async evaluate(customerId: number): Promise<EngagementEvaluation> {
    return request<EngagementEvaluation>(`${API_URL}/engagement/evaluate/${customerId}`, { method: "POST" });
  },
  async getHistory(customerId: number): Promise<EngagementHistoryItem[]> {
    const data = await request<{ history: EngagementHistoryItem[] }>(`${API_URL}/engagement/${customerId}`);
    return data.history;
  },
  async getPreferences(customerId: number): Promise<CommunicationPreferences> {
    const data = await request<{ preferences: CommunicationPreferences }>(`${API_URL}/engagement/preferences/${customerId}`);
    return data.preferences;
  },
  async updatePreferences(customerId: number, preferences: CommunicationPreferences): Promise<CommunicationPreferences> {
    const data = await request<{ preferences: CommunicationPreferences }>(`${API_URL}/engagement/preferences/${customerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });
    return data.preferences;
  },
};
