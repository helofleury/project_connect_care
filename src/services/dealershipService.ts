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
  available: boolean;
}

const mockDealerships: Dealership[] = [
  {
    id: "1",
    name: "Ford New América",
    address: "Av. das Nações, 1200",
    city: "São Paulo",
    distance: "2,4 km",
    rating: 4.8,
    phone: "(11) 4000-0000",
    openingHours: "08h - 18h",
    services: [
      "Revisão programada",
      "Troca de óleo",
      "Diagnóstico do veículo",
    ],
    available: true,
  },
  {
    id: "2",
    name: "Ford Center",
    address: "Av. Brasil, 850",
    city: "São Paulo",
    distance: "4,7 km",
    rating: 4.6,
    phone: "(11) 4000-1111",
    openingHours: "08h - 18h",
    services: [
      "Revisão programada",
      "Troca de pneus",
      "Diagnóstico do veículo",
    ],
    available: true,
  },
  {
    id: "3",
    name: "Ford Prime",
    address: "Rua Augusta, 520",
    city: "São Paulo",
    distance: "6,3 km",
    rating: 4.5,
    phone: "(11) 4000-2222",
    openingHours: "09h - 18h",
    services: [
      "Revisão programada",
      "Troca de óleo",
      "Serviço de freios",
    ],
    available: true,
  },
];

export const dealershipService = {
  async getDealerships(): Promise<Dealership[]> {
    // Futuramente:
    // return api.get("/dealerships");

    return mockDealerships;
  },

  async getDealershipById(
    dealershipId: string
  ): Promise<Dealership | null> {
    // Futuramente:
    // return api.get(`/dealerships/${dealershipId}`);

    return (
      mockDealerships.find(
        (dealership) => dealership.id === dealershipId
      ) ?? null
    );
  },
};