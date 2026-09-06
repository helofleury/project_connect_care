export interface Customer {
  id: string;
  name: string;
  email: string;
  customerSince: string;
  mainDealership: string;
  warranty: string;
  currentMileage: number;
  nextServiceMileage: number;
  relationshipScore: number;
  loyaltyScore: number;
}

const mockCustomer: Customer = {
  id: "1",
  name: "João Silva",
  email: "joao.silva@email.com",
  customerSince: "2021",
  mainDealership: "Auto Premium",
  warranty: "Active",
  currentMileage: 32450,
  nextServiceMileage: 35000,
  relationshipScore: 87,
  loyaltyScore: 92,
};

export const customerService = {
  async getCustomerById(
    _customerId: string
  ): Promise<Customer> {
    // Customer API integration will be added here.

    return mockCustomer;
  },

  async updateCustomer(
    customerId: string,
    data: Partial<Customer>
  ): Promise<Customer> {
    // Customer update API integration will be added here.

    return {
      ...mockCustomer,
      ...data,
      id: customerId,
    };
  },
};