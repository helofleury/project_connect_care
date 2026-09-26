import type { Vehicle } from "../types/vehicle";

const API_URL = "http://192.168.15.5:8000";

interface VehicleApiResponse {
  status: string;
  vehicle: {
    vin_hash: string;
    model: string;
    year: number;
    mileage: number;
    last_service_date: string | null;
    service_count: number;
    main_dealer: string | null;
    days_since_last_service: number | null;
  };
}

export interface VehicleHistoryItem {
  record_id: string;
  service_date: string | null;
  service_open_date: string | null;
  service_closed_date: string | null;
  dealer_code: string | null;
  service_dept_code: string | null;
  service_repair_type_code: string | null;
  service_code: string | null;
  maintenance_number: number | null;
  main_source: string | null;
  km: number | null;
  warranty_phase: string | null;
  data_quality_status: string | null;
  service_sequence: number | null;
}

interface VehicleHistoryApiResponse {
  status: string;
  vin_hash: string;
  total: number;
  history: VehicleHistoryItem[];
}

export const vehicleService = {
  async getVehicleByVin(
    vinHash: string
  ): Promise<Vehicle> {
    if (!vinHash) {
      throw new Error(
        "VIN do veículo não informado."
      );
    }

    const response = await fetch(
      `${API_URL}/vehicles/${vinHash}`
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao buscar veículo: ${response.status}`
      );
    }

    const data: VehicleApiResponse =
      await response.json();

    if (data.status !== "ok") {
      throw new Error(
        "Veículo não encontrado."
      );
    }

    return {
      id: data.vehicle.vin_hash,

      model: data.vehicle.model,

      year: Number(
        data.vehicle.year
      ),

      mileage: Number(
        data.vehicle.mileage
      ),

      nextServiceMileage:
        undefined,

      fuel: undefined,

      warranty: undefined,
    };
  },

  async getVehicleHistory(
    vinHash: string
  ): Promise<VehicleHistoryItem[]> {
    if (!vinHash) {
      throw new Error(
        "VIN do veículo não informado."
      );
    }

    const response = await fetch(
      `${API_URL}/vehicles/${vinHash}/history`
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao buscar histórico: ${response.status}`
      );
    }

    const data: VehicleHistoryApiResponse =
      await response.json();

    if (data.status !== "ok") {
      throw new Error(
        "Não foi possível encontrar o histórico do veículo."
      );
    }

    return data.history;
  },
};