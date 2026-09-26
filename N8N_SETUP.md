# ConnectCare 360 — Integração de Engagement com n8n

O ConnectCare 360 separa **decisão** de **entrega**:

- **FastAPI**: busca cliente, veículo e previsão de ML; aplica regras; respeita preferências; gera/personaliza a mensagem com IA; decide se existe comunicação relevante.
- **n8n**: recebe o webhook e executa a entrega no canal selecionado.

## Fluxo

```text
Scheduler / n8n Schedule Trigger
            ↓
POST /automation/run-daily
            ↓
FastAPI / Engagement
            ↓
Perfil + comportamento + ML
            ↓
Decisão de comunicação
            ↓
Preferências do cliente
            ↓
WhatsApp / E-mail / ambos / nenhum
            ↓
Webhook n8n
```

## Preferências

Cada categoria possui:

- Alertas do veículo
- Novidades
- Recomendações

Para cada uma, o cliente pode:

- ativar/desativar a categoria;
- selecionar WhatsApp;
- selecionar E-mail;
- selecionar os dois;
- não selecionar nenhum canal.

Assim, o cliente controla **onde** pode receber a comunicação, enquanto o Engagement decide **quando e por que** aquela comunicação é relevante.

## Payload enviado ao n8n

O evento usa estes campos principais:

- `event`: `connectcare.engagement`
- `customer`: dados básicos do cliente
- `recipient.whatsapp`: telefone em formato `+55...`
- `recipient.email`: e-mail cadastrado
- `recipient.channels`: canais autorizados
- `vehicle`: contexto do veículo
- `prediction`: resultado da previsão de ML
- `content.subject`: título
- `content.body`: mensagem
- `engagement.priority`: `HIGH`, `MEDIUM` ou `LOW`
- `engagement.should_send`: decisão de envio
- `engagement.channels`: canais autorizados para a comunicação
- `engagement.reason`: justificativa da decisão

## Roteamento no n8n

O backend pode chamar o webhook uma vez por canal quando o cliente autorizou os dois. Por isso, o campo superior `channel` também estará presente:

```text
channel = whatsapp
```

ou

```text
channel = email
```

Use um **Switch** ou **IF** no n8n com:

```text
{{$json.channel}}
```

### WhatsApp

Destinatário:

```text
{{$json.recipient.whatsapp}}
```

Mensagem:

```text
{{$json.content.body}}
```

### E-mail

Destinatário:

```text
{{$json.recipient.email}}
```

Assunto:

```text
{{$json.content.subject}}
```

Corpo:

```text
{{$json.content.body}}
```

> A integração está preparada para receber o evento. Para um envio real, ainda são necessárias as credenciais do provedor de WhatsApp/e-mail e a configuração dos respectivos nós no n8n.
