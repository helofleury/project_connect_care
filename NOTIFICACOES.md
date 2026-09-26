# Notificações inteligentes — ConnectCare 360

## Como ficou

- `GET /vehicles/{vin_hash}/notifications` monta a caixa de entrada do app usando o mesmo perfil e canal da comunicação.
- `POST /vehicles/{vin_hash}/recommendations/auto-notify` agora escolhe a melhor recomendação disponível e aplica o perfil antes de enviar ao n8n.
- A caixa de entrada salva o estado de lido/não lido localmente com AsyncStorage.
- Os 6 perfis estão ligados a canais:
  - Cliente Urbano Leve → WhatsApp
  - Motorista de Aplicativo → WhatsApp
  - Usuário Off-Road → E-mail
  - Cliente Premium de Baixa Quilometragem → E-mail
  - Cliente Econômico → SMS
  - Cliente Profissional Autônomo → WhatsApp

## n8n

O backend envia `channel`, `profile`, `customer`, `vehicle`, `recommendation` e `prediction` para o webhook configurado em `N8N_WEBHOOK_URL`.

No n8n, use um `Switch` pelo campo `channel`:

- `whatsapp` → WhatsApp Business Cloud API / Twilio
- `email` → Gmail/SMTP
- `sms` → Twilio/Zenvia

Para a automação diária, use um `Schedule Trigger` e chame:

`POST /automation/run-daily`

O backend já possui deduplicação por recomendação/dia e não deve disparar novamente uma recomendação confirmada.

## Push no celular (próxima etapa)

Para notificação nativa na barra do Android/iOS, adicione `expo-notifications`, registre um Expo Push Token por usuário e salve esse token no backend. Depois o n8n pode chamar a Expo Push API para enviar a notificação. Isso é separado do WhatsApp/SMS/E-mail.
