const API_URL = "http://192.168.15.5:8000";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatbotApiResponse {
  status: string;
  reply?: string;
  detail?: string;
}

/**
 * Envia a mensagem do cliente para o assistente virtual com IA,
 * junto com o histórico recente da conversa (para manter contexto).
 */
export async function sendChatMessage(
  vinHash: string,
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const response = await fetch(`${API_URL}/chatbot/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vin_hash: vinHash,
      message,
      history,
    }),
  });

  if (!response.ok) {
    let detail = `Erro ao falar com o assistente: ${response.status}`;

    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        detail = errorData.detail;
      }
    } catch {
      // mantém a mensagem padrão
    }

    throw new Error(detail);
  }

  const data: ChatbotApiResponse = await response.json();

  if (data.status !== "ok" || !data.reply) {
    throw new Error(data.detail || "O assistente não conseguiu responder agora.");
  }

  return data.reply;
}

export const chatbotService = {
  sendChatMessage,
};
