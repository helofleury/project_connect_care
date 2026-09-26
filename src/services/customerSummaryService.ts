const API_URL = "http://192.168.15.5:8000";

export type HealthStatus = "em_dia" | "atencao" | "revisar";

export interface CustomerSummary {
  health: {
    status: HealthStatus;
    message: string;
    color: "success" | "warning" | "danger";
    tips: string[];
  };

  next_maintenance: {
    date: string | null;
    km: number | null;
    message: string;
  };

  profile: {
    name: string;
    description: string;
  } | null;
}

interface CustomerSummaryApiResponse {
  status: string;
  vin_hash: string;
  summary?: CustomerSummary;
  message?: string;
}

/**
 * Busca a visão 100% amigável do veículo, já traduzida pelo backend
 * (sem nenhum termo técnico de Machine Learning).
 */
export async function getCustomerSummary(
  vinHash: string
): Promise<CustomerSummary> {
  if (!vinHash) {
    throw new Error("VIN do veículo não informado.");
  }

  const response = await fetch(
    `${API_URL}/vehicles/${vinHash}/customer-summary`
  );

  if (!response.ok) {
    throw new Error(`Erro ao buscar resumo do veículo: ${response.status}`);
  }

  const data: CustomerSummaryApiResponse = await response.json();

  if (data.status !== "ok" || !data.summary) {
    throw new Error(
      data.message || "Não foi possível carregar as informações do veículo."
    );
  }

  return data.summary;
}

export const customerSummaryService = {
  getCustomerSummary,
};
