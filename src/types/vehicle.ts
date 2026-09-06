export type WarrantyStatus = "active" | "expired";

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
  warrantyStatus: WarrantyStatus;
}