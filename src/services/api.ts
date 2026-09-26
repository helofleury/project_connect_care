const API_URL = "http://192.168.15.5:8000";

export async function testApiConnection() {
  try {
    const response = await fetch(`${API_URL}/db-test`);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
    throw error;
  }
}