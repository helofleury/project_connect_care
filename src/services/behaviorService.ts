const API_URL = "http://192.168.15.5:8000";

export interface VehicleSegment {
  vin_hash: string;
  segment_id: number;
  segment_name: string;
  distance_to_centroid: number | null;
  model_version: string | null;

  vehicle: {
    model: string | null;
    year: number | null;
    service_count: number | null;
    days_since_last_service: number | null;
    avg_days_between_services: number | null;
    dealer_loyalty_ratio: number | null;
    schedule_rate: number | null;
    last_km: number | null;
  };
}

interface VehicleSegmentApiResponse {
  status: string;
  segment?: VehicleSegment;
  message?: string;
}

export async function getVehicleSegment(
  vinHash: string
): Promise<VehicleSegment> {
  try {
    const response = await fetch(
      `${API_URL}/vehicles/${vinHash}/segment`
    );

    if (!response.ok) {
      throw new Error(
        `Erro HTTP ao buscar segmento: ${response.status}`
      );
    }

    const data: VehicleSegmentApiResponse =
      await response.json();

    if (data.status !== "ok" || !data.segment) {
      throw new Error(
        data.message || "Segmento do veículo não encontrado."
      );
    }

    return data.segment;
  } catch (error) {
    console.error(
      "Erro ao buscar segmento do veículo:",
      error
    );

    throw error;
  }
}

export const behaviorService = {
  getVehicleSegment,
};