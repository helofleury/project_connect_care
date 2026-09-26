import os
import asyncio
import json
from urllib.request import Request, urlopen


def _post_webhook(url: str, payload: dict, webhook_secret: str | None = None) -> int:
    request = Request(
        url,
        data=json.dumps(payload, default=str).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            **({"X-ConnectCare-Secret": webhook_secret} if webhook_secret else {}),
        },
        method="POST",
    )
    with urlopen(request, timeout=15) as response:
        return response.status


async def send_recommendation_email(payload: dict):
    """
    Mantido por compatibilidade com o restante do backend.
    Sempre envia para o webhook único do n8n (fluxo de e-mail).
    """

    n8n_webhook_url = os.getenv("N8N_WEBHOOK_URL")

    if not n8n_webhook_url:
        raise RuntimeError("N8N_WEBHOOK_URL não configurada")

    status_code = await asyncio.to_thread(
        _post_webhook, n8n_webhook_url, payload
    )

    return {
        "status": "ok",
        "n8n_status_code": status_code,
    }


async def send_customer_notification(payload: dict, channel: str = "email"):
    """
    Envio de notificação multicanal (WhatsApp / SMS / E-mail).

    A automação de disparo (regras de negócio, template, canal ideal) já é
    decidida pelo backend antes de chamar esta função - aqui só cuidamos do
    envio em si.

    Por padrão, os três canais usam o MESMO webhook do n8n (N8N_WEBHOOK_URL),
    e é o próprio fluxo do n8n quem decide, olhando o campo "channel" do
    payload, se deve mandar e-mail, WhatsApp (ex: nó do WhatsApp Business
    API / Twilio) ou SMS (ex: nó da Twilio/Zenvia).

    Se preferir, é possível configurar um webhook específico por canal
    definindo as variáveis de ambiente:
      N8N_WEBHOOK_URL_WHATSAPP
      N8N_WEBHOOK_URL_SMS
      N8N_WEBHOOK_URL_EMAIL
    Quando a variável específica não existir, cai no N8N_WEBHOOK_URL padrão.
    """

    channel_env_map = {
        "whatsapp": "N8N_WEBHOOK_URL_WHATSAPP",
        "sms": "N8N_WEBHOOK_URL_SMS",
        "email": "N8N_WEBHOOK_URL_EMAIL",
    }

    specific_env_var = channel_env_map.get(channel, "N8N_WEBHOOK_URL_EMAIL")

    webhook_url = os.getenv(specific_env_var) or os.getenv("N8N_WEBHOOK_URL")

    if not webhook_url:
        raise RuntimeError(
            f"Nenhum webhook configurado para o canal '{channel}'. "
            "Defina N8N_WEBHOOK_URL (ou a variável específica do canal) no .env."
        )

    payload_with_channel = {**payload, "channel": channel}

    # Opcional: protege o webhook com um segredo compartilhado.
    # O n8n pode validar o header X-ConnectCare-Secret antes de continuar.
    webhook_secret = os.getenv("N8N_WEBHOOK_SECRET")

    status_code = await asyncio.to_thread(
        _post_webhook, webhook_url, payload_with_channel, webhook_secret
    )

    return {
        "status": "ok",
        "channel": channel,
        "n8n_status_code": status_code,
    }