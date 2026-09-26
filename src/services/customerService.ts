import type { Customer } from "../types/customer";

const API_URL = "http://192.168.15.5:8000";

interface CustomerApiResponse {
  status: string;

  customer: {
    customer_id: number;
    firebase_uid: string;
    name: string;
    last_name: string;
    email: string;
    phone: string;
    vin_hash: string;
  };
}

export const customerService = {
  async getCustomerById(
    customerId: string
  ): Promise<Customer> {
    if (!customerId) {
      throw new Error(
        "ID do cliente não informado."
      );
    }

    const response = await fetch(
      `${API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebase_uid: customerId,
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.detail ||
          `Erro ao buscar dados do cliente: ${response.status}`
      );
    }

    const data: CustomerApiResponse =
      await response.json();

    if (
      data.status !== "ok" ||
      !data.customer
    ) {
      throw new Error(
        "Não foi possível encontrar os dados do cliente."
      );
    }

    const customer = data.customer;

    return {
      id: customer.firebase_uid,

      name: customer.name,

      email: customer.email,

      customerSince: "",

      mainDealership: "Não informado",

      warranty: "Não informado",

      currentMileage: 0,

      nextServiceMileage: 0,

      relationshipScore: 0,

      loyaltyScore: 0,
    };
  },

  async updateCustomer(
    customerId: string,
    data: Partial<Customer>
  ): Promise<Customer> {
    throw new Error(
      "A atualização de dados do cliente ainda não está disponível pela API."
    );
  },
};