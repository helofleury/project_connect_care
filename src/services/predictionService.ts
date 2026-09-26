const API_URL = "http://192.168.15.5:8000";

/* =====================================================
   RISCO DO VEÍCULO
===================================================== */

export interface VehiclePrediction {
  vin_hash: string;
  model: string;
  year: number | null;
  risk_score: number;
  risk_level: string;
  reasons: string[];
  indicators: {
    service_count: number | null;
    days_since_last_service: number | null;
    avg_days_between_services: number | null;
    service_interval_variability: number | null;
    dealer_loyalty_ratio: number | null;
    high_recency_risk: boolean;
    low_dealer_loyalty: boolean;
    irregular_service_pattern: boolean;
    km_regression_count: number | null;
    invalid_km_count: number | null;
    temporal_warning_count: number | null;
  };
}

interface PredictionApiResponse {
  status: string;
  prediction: VehiclePrediction;
}

/**
 * Previsão de risco do veículo
 */
export async function getVehiclePrediction(
  vinHash: string
): Promise<VehiclePrediction> {
  if (!vinHash) {
    throw new Error("VIN do veículo não informado.");
  }

  const response = await fetch(
    `${API_URL}/vehicles/${vinHash}/prediction`
  );

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar previsão: ${response.status}`
    );
  }

  const data: PredictionApiResponse =
    await response.json();

  if (
    data.status !== "ok" ||
    !data.prediction
  ) {
    throw new Error(
      "Não foi possível obter a previsão do veículo."
    );
  }

  return data.prediction;
}


/* =====================================================
   MACHINE LEARNING - RANDOM FOREST
===================================================== */

export interface VehicleMLPrediction {
  vin_hash: string;

  model_name: string;

  target_name: string;

  probability: number | null;

  probability_percent: number | null;

  predicted_class: number;

  classification: string;

  model_version: string | null;

  vehicle: {
    model: string;
    year: number | null;
    service_count: number | null;
    last_service_date: string | null;
    last_km: number | null;
  };
}

interface MLPredictionApiResponse {
  status: string;

  prediction?: VehicleMLPrediction;

  message?: string;
}

/**
 * Resultado da previsão feita pelo Random Forest.
 */
export async function getVehicleMLPrediction(
  vinHash: string
): Promise<VehicleMLPrediction> {
  if (!vinHash) {
    throw new Error("VIN do veículo não informado.");
  }

  const response = await fetch(
    `${API_URL}/vehicles/${vinHash}/ml-prediction`
  );

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar previsão de Machine Learning: ${response.status}`
    );
  }

  const data: MLPredictionApiResponse =
    await response.json();

  if (
    data.status !== "ok" ||
    !data.prediction
  ) {
    throw new Error(
      data.message ||
        "Não foi possível obter a previsão do Random Forest."
    );
  }

  return data.prediction;
}


/* =====================================================
   PRÓXIMA MANUTENÇÃO
===================================================== */

export interface NextMaintenancePrediction {
  vin_hash: string;

  last_service_date: string;

  last_km: number | null;

  service_count: number;

  average_interval_days: number;

  average_km_per_day: number | null;

  estimated_next_service_date: string;

  estimated_next_km: number | null;

  methodology: string;
}

interface NextMaintenanceApiResponse {
  status: string;

  prediction?: NextMaintenancePrediction;

  message?: string;
}

/**
 * Estima a próxima manutenção com base no histórico real.
 */
export async function getNextMaintenancePrediction(
  vinHash: string
): Promise<NextMaintenancePrediction> {
  if (!vinHash) {
    throw new Error("VIN do veículo não informado.");
  }

  const response = await fetch(
    `${API_URL}/vehicles/${vinHash}/next-maintenance`
  );

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar próxima manutenção: ${response.status}`
    );
  }

  const data: NextMaintenanceApiResponse =
    await response.json();

  if (
    data.status !== "ok" ||
    !data.prediction
  ) {
    throw new Error(
      data.message ||
        "Não foi possível estimar a próxima manutenção."
    );
  }

  return data.prediction;
}


/* =====================================================
   OBJETO DO SERVICE
===================================================== */

export const predictionService = {
  getVehiclePrediction,
  getVehicleMLPrediction,
  getNextMaintenancePrediction,
};