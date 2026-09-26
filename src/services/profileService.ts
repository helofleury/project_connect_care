import { API_URL } from "../constants/demo";

export type CustomerProfileKey =
  | "urbano_leve"
  | "motorista_aplicativo"
  | "usuario_offroad"
  | "premium_baixa_km"
  | "cliente_economico"
  | "profissional_autonomo";

export interface CustomerProfile {
  key: CustomerProfileKey;
  name: string;
  icon: string;
  description: string;
  preferred_channel: "whatsapp" | "email" | "sms";
}

interface ProfileResponse {
  status: string;
  profile?: CustomerProfile;
  message?: string;
}

export async function getCustomerProfile(vinHash: string): Promise<CustomerProfile> {
  const response = await fetch(`${API_URL}/vehicles/${vinHash}/profile`);
  if (!response.ok) throw new Error(`Erro ao buscar perfil: ${response.status}`);
  const data: ProfileResponse = await response.json();
  if (data.status !== "ok" || !data.profile) {
    throw new Error(data.message || "Não foi possível identificar seu perfil.");
  }
  return data.profile;
}

export const profileService = { getCustomerProfile };
