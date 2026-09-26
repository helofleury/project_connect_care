# ConnectCare 360 — n8n para envio real

O backend envia um único evento para o webhook do n8n. O n8n não decide quem deve receber a mensagem: ele apenas executa o canal já escolhido pelo FastAPI.

## Payload recebido

```json
{
  "event": "connectcare.engagement",
  "event_version": "1.0",
  "customer": {
    "customer_id": 123,
    "name": "Heloísa",
    "last_name": "Jardim",
    "email": "cliente@email.com",
    "phone": "+5511999999999"
  },
  "recipient": {
    "channel": "whatsapp",
    "whatsapp": "+5511999999999",
    "email": null
  },
  "content": {
    "subject": "Seu veículo merece atenção",
    "body": "Olá, Heloísa! Identificamos um ponto que merece sua atenção..."
  },
  "engagement": {
    "type": "vehicle_alert",
    "priority": "HIGH",
    "should_send": true,
    "channel": "whatsapp",
    "reason": "..."
  }
}
```

## Fluxo no n8n

1. **Webhook** — método `POST`.
2. **Switch** — valor: `={{ $json.engagement.channel }}`.
3. Rota `whatsapp` → nó do provedor de WhatsApp.
4. Rota `email` → nó de e-mail/SMTP.
5. **Respond to Webhook** → HTTP 200.

### WhatsApp

No nó do provedor, use o número:

`={{ $json.recipient.whatsapp }}`

E a mensagem:

`={{ $json.content.body }}`

O número já chega normalizado em formato internacional brasileiro (`+55...`).

### E-mail

Destinatário:

`={{ $json.recipient.email }}`

Assunto:

`={{ $json.content.subject }}`

Corpo:

`={{ $json.content.body }}`

## Credenciais

O ZIP não inclui tokens ou credenciais reais. No n8n, configure a credencial do provedor de WhatsApp escolhido e a credencial SMTP/e-mail escolhida.

## Webhook do backend

No `backend/.env`:

```env
N8N_WEBHOOK_URL=https://SEU_N8N/webhook/connectcare-engagement
N8N_WEBHOOK_SECRET=um-segredo-forte
```

Opcionalmente, pode usar URLs separadas:

```env
N8N_WEBHOOK_URL_WHATSAPP=https://SEU_N8N/webhook/connectcare-whatsapp
N8N_WEBHOOK_URL_EMAIL=https://SEU_N8N/webhook/connectcare-email
```

Se as URLs específicas não existirem, o backend usa `N8N_WEBHOOK_URL`.

## Teste seguro

Antes de colocar o número real do cliente:

- cadastre uma conta de teste com um número de WhatsApp que você controla;
- escolha WhatsApp em **Perfil → Preferências de comunicação**;
- deixe **Alertas do veículo** ativado;
- configure o webhook do n8n;
- execute `POST /automation/run-daily` ou `POST /engagement/evaluate/{customer_id}`;
- confirme no n8n que `recipient.whatsapp` e `content.body` chegaram corretamente;
- só depois habilite o disparo real no provedor.

## Observação importante

O ConnectCare 360 não envia diretamente para o WhatsApp pelo FastAPI. O FastAPI escolhe o canal e entrega o evento ao n8n. O n8n é responsável pelo último trecho: provedor de WhatsApp ou serviço de e-mail.

## Segurança

Se `N8N_WEBHOOK_SECRET` estiver configurado, o backend envia o header `X-ConnectCare-Secret`. Valide esse header no início do workflow antes do Switch.
