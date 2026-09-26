# Engagement automático — ConnectCare 360

## Fluxo

1. Um agendador, como o Schedule Trigger do n8n, chama `POST /automation/run-daily`.
2. O FastAPI busca os clientes ativos.
3. Para cada cliente, o backend busca veículo e previsão de ML.
4. As regras determinísticas calculam prioridade.
5. O backend consulta as preferências do cliente.
6. Se houver comunicação relevante e ela ainda não tiver sido enviada naquele dia, o backend monta a mensagem.
7. O webhook do n8n recebe o evento com `channel`, `customer`, `vehicle`, `prediction` e `engagement`.
8. O n8n envia pelo WhatsApp ou e-mail.

## Endpoints

- `POST /engagement/evaluate/{customer_id}` — avaliação manual para teste.
- `GET /engagement/{customer_id}` — histórico.
- `GET /engagement/preferences/{customer_id}` — preferências.
- `PUT /engagement/preferences/{customer_id}` — atualiza preferências.
- `POST /automation/run-daily` — avaliação automática em lote.

## n8n

Configure `N8N_WEBHOOK_URL` no backend. O payload enviado ao n8n possui:

- `event`
- `customer.customer_id`
- `customer.name`
- `customer.email`
- `customer.phone`
- `vehicle`
- `prediction`
- `engagement.channel`
- `engagement.priority`
- `engagement.title`
- `engagement.message`

No n8n, use um Switch pelo campo `engagement.channel` para direcionar para WhatsApp ou E-mail.

## Teste sem n8n

A avaliação continua funcionando mesmo sem webhook configurado. Nesse caso `delivery_status` fica `not_configured`; a decisão e a mensagem continuam sendo registradas no PostgreSQL.

## Teste da automação

No Swagger, execute `POST /automation/run-daily?limit=2`. Para envio real, o webhook do n8n precisa estar configurado e o fluxo do n8n precisa estar ativo.
