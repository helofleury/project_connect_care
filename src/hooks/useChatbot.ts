import { useCallback, useState } from "react";

import { chatbotService, type ChatMessage } from "../services/chatbotService";

export interface DisplayChatMessage extends ChatMessage {
  id: string;
}

interface UseChatbotReturn {
  messages: DisplayChatMessage[];
  sending: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
}

const WELCOME_MESSAGE: DisplayChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Olá! Sou o Zyro, assistente inteligente do seu Ford. Posso te ajudar com dúvidas sobre revisão, agendamento, garantia e ofertas. Como posso ajudar hoje?",
};

export function useChatbot(vinHash?: string): UseChatbotReturn {
  const [messages, setMessages] = useState<DisplayChatMessage[]>([
    WELCOME_MESSAGE,
  ]);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();

      if (!trimmed || !vinHash) {
        return;
      }

      const userMessage: DisplayChatMessage = {
        id: `${Date.now()}-user`,
        role: "user",
        content: trimmed,
      };

      const historyForApi: ChatMessage[] = [...messages, userMessage].map(
        ({ role, content }) => ({ role, content })
      );

      setMessages((current) => [...current, userMessage]);
      setSending(true);
      setError(null);

      try {
        const reply = await chatbotService.sendChatMessage(
          vinHash,
          trimmed,
          historyForApi.slice(0, -1)
        );

        setMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-assistant`,
            role: "assistant",
            content: reply,
          },
        ]);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível falar com o assistente agora.";

        setError(message);

        setMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-error`,
            role: "assistant",
            content:
              "Desculpe, tive um problema para responder agora. Tente novamente em instantes.",
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [messages, vinHash]
  );

  return {
    messages,
    sending,
    error,
    sendMessage,
  };
}
