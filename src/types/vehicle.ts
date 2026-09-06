export type WarrantyStatus = "active" | "expired";

export interface Vehicle {
  id: string;
  model: string;
  year: number;
  mileage: number;
  nextServiceMileage?: number;
  fuel?: string;
  warranty?: string;
}