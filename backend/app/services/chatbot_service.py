"""
Assistente virtual (chatbot com IA) do Ford Customer 360.

Usa a API do Google Gemini para responder, em português e em tom
amigável, perguntas do cliente sobre o próprio veículo.

Requisitos:
    python -m pip install google-genai python-dotenv

No arquivo backend/.env:
    GEMINI_API_KEY=sua_chave_aqui
    GEMINI_MODEL=gemini-3.6-flash
"""

import asyncio
import os
from typing import Optional

from dotenv import load_dotenv
from google import genai


# Carrega as variáveis do arquivo backend/.env
load_dotenv()


_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    global _client

    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY não configurada no arquivo backend/.env"
            )

        _client = genai.Client(api_key=api_key)

    return _client


SYSTEM_PROMPT = """
Você é o assistente virtual do app Ford ConnectCare 360, falando diretamente
com um cliente Ford pelo celular.

Regras de tom e conteúdo:

- Responda sempre em português do Brasil.
- Seja curto, simpático, claro e natural.
- Evite respostas excessivamente técnicas.
- Você pode falar sobre manutenção e revisões, agendamento na concessionária,
  garantia, cuidados com o veículo, ofertas e acessórios, e dúvidas gerais
  sobre o relacionamento do cliente com a Ford.

- NUNCA mencione termos técnicos internos como:
  "score", "probabilidade", "modelo de machine learning",
  "Random Forest", "K-Means", "segmento", "risco de evasão"
  ou qualquer outro jargão de análise de dados.

- Esses termos são de uso interno da Ford e não devem aparecer para o cliente.

- Se o cliente perguntar algo fora do escopo, como concorrentes ou assuntos
  não relacionados a carros Ford, responda educadamente que você é focado
  em ajudar com o relacionamento dele com a Ford.

- Se o cliente relatar um problema mecânico real, não tente diagnosticar
  o defeito à distância. Oriente o cliente a procurar ou agendar uma
  avaliação em uma concessionária autorizada Ford.

- Incentive, quando fizer sentido, o agendamento de revisões e o uso da
  rede autorizada Ford, sempre de forma consultiva e nunca insistente.

- Use as informações do veículo fornecidas no contexto para personalizar
  suas respostas.

- Nunca invente informações que não estejam disponíveis no contexto.

- Se uma informação não estiver disponível no contexto, diga claramente
  que não possui essa informação e sugira uma alternativa adequada.
""".strip()


def _is_retryable_error(exc: Exception) -> bool:
    """
    Identifica erros temporários da API que justificam uma nova tentativa.

    O Gemini pode retornar 503 quando o modelo está temporariamente
    sobrecarregado.
    """

    error_text = str(exc).upper()

    retryable_codes = (
        "503",
        "UNAVAILABLE",
        "SERVICE UNAVAILABLE",
        "HIGH DEMAND",
        "OVERLOADED",
        "RESOURCE EXHAUSTED",
    )

    return any(code in error_text for code in retryable_codes)


async def _generate_response(
    client: genai.Client,
    model: str,
    contents: list[dict],
    system: str,
):
    """
    Faz a chamada ao Gemini com retry automático para erros temporários.

    Tentativas:
        1ª tentativa -> imediatamente
        2ª tentativa -> após 1 segundo
        3ª tentativa -> após 2 segundos
        4ª tentativa -> após 4 segundos
    """

    max_attempts = 4

    for attempt in range(max_attempts):
        try:
            def _call():
                return client.models.generate_content(
                    model=model,
                    contents=contents,
                    config={
                        "system_instruction": system,
                        "max_output_tokens": 1000,
                        "temperature": 0.7,
},
                )

            return await asyncio.to_thread(_call)

        except Exception as exc:
            is_last_attempt = attempt == max_attempts - 1

            if not _is_retryable_error(exc) or is_last_attempt:
                raise

            wait_seconds = 2 ** attempt

            print(
                f"[chatbot_service] Gemini temporariamente indisponível "
                f"(tentativa {attempt + 1}/{max_attempts}). "
                f"Nova tentativa em {wait_seconds}s..."
            )

            await asyncio.sleep(wait_seconds)

    raise RuntimeError(
        "Não foi possível obter uma resposta do Gemini."
    )


async def ask_assistant(
    customer_context: dict,
    message: str,
    history: Optional[list[dict]] = None,
) -> str:

    client = _get_client()

    history = history or []

    model = os.getenv(
        "GEMINI_MODEL",
        "gemini-3.6-flash",
    )

    context_text = (
        f"Nome do cliente: "
        f"{customer_context.get('name') or 'não informado'}\n"

        f"Veículo: "
        f"{customer_context.get('model') or 'não informado'} "
        f"{customer_context.get('year') or ''}\n"

        f"Situação atual do veículo: "
        f"{customer_context.get('health_status') or 'não informado'}\n"

        f"Próxima revisão: "
        f"{customer_context.get('next_service_hint') or 'não informado'}\n"

        f"Concessionária principal: "
        f"{customer_context.get('main_dealer') or 'não informada'}\n"
    )

    system = (
        f"{SYSTEM_PROMPT}\n\n"
        "Contexto do cliente (uso interno, não repita literalmente):\n"
        f"{context_text}"
    )

    contents = []

    # Mantém apenas as últimas mensagens para não enviar
    # um histórico desnecessariamente grande para a API.
    for item in history[-10:]:

        role = item.get("role")
        content = item.get("content")

        if role not in ("user", "assistant") or not content:
            continue

        # Gemini utiliza "model" para mensagens do assistente.
        gemini_role = (
            "model"
            if role == "assistant"
            else "user"
        )

        contents.append(
            {
                "role": gemini_role,
                "parts": [
                    {
                        "text": content
                    }
                ],
            }
        )

    # Adiciona a mensagem atual do cliente.
    contents.append(
        {
            "role": "user",
            "parts": [
                {
                    "text": message
                }
            ],
        }
    )

    try:
        response = await _generate_response(
            client=client,
            model=model,
            contents=contents,
            system=system,
        )

    except Exception as exc:
        print(
            "[chatbot_service] Erro na API do Gemini: "
            f"{type(exc).__name__}: {exc}"
        )

        raise RuntimeError(
            f"Erro ao consultar o Gemini: {exc}"
        ) from exc

    reply = (response.text or "").strip()

    if not reply:
        return (
            "Desculpe, não consegui encontrar uma resposta agora. "
            "Pode tentar novamente?"
        )

    return reply