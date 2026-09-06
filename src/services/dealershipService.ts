export interface Dealership {
  id: string;
  name: string;
  address: string;
  city: string;
  distance: string;
  rating: number;
  phone: string;
  openingHours: string;
  services: string[];
}

const mockDealerships: Dealership[] = [
  {
    id: "1",
    name: "Auto Premium",
    address: "Av. Paulista, 1000",
    city: "São Paulo",
    distance: "2.4 km",
    rating: 4.8,
    phone: "(11) 3000-0000",
    openingHours: "08:00 - 18:00",
    services: [
      "Maintenance",
      "Oil Change",
      "Vehicle Inspection",
    ],
  },
  {
    id: "2",
    name: "Prime Motors",
    address: "Av. Faria Lima, 1500",
    city: "São Paulo",
    distance: "4.1 km",
    rating: 4.6,
    phone: "(11) 3000-1111",
    openingHours: "08:00 - 19:00",
    services: [
      "Maintenance",
      "Tire Service",
      "Vehicle Inspection",
    ],
  },
  {
    id: "3",
    name: "Car Center",
    address: "Rua Augusta, 500",
    city: "São Paulo",
    distance: "5.7 km",
    rating: 4.5,
    phone: "(11) 3000-2222",
    openingHours: "09:00 - 18:00",
    services: [
      "Maintenance",
      "Brake Service",
      "Oil Change",
    ],
  },
];

export const dealershipService = {
  async getDealerships(): Promise<Dealership[]> {
    // Dealership API integration will be added here.

    return mockDealerships;
  },

  async getDealershipById(
    dealershipId: string
  ): Promise<Dealership | null> {
    // Dealership API integration will be added here.

    return (
      mockDealerships.find(
        (dealership) => dealership.id === dealershipId
      ) ?? null
    );
  },
};