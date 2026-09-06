export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  version: string;
  color: string;
  mileage: number;
  lastMaintenance: string;
  nextMaintenance: string;
  warrantyStatus: "active" | "expired";
}

const mockVehicle: Vehicle = {
  id: "vehicle-1",
  brand: "Toyota",
  model: "Corolla",
  year: 2023,
  version: "XEi 2.0",
  color: "Silver",
  mileage: 32450,
  lastMaintenance: "2026-04-15",
  nextMaintenance: "2026-10-15",
  warrantyStatus: "active",
};

export const vehicleService = {
  async getVehicleByCustomerId(
    _customerId: string
  ): Promise<Vehicle> {
    // Vehicle API integration will be added here.

    return mockVehicle;
  },

  async getVehicleById(
    _vehicleId: string
  ): Promise<Vehicle> {
    // Vehicle API integration will be added here.

    return mockVehicle;
  },
};