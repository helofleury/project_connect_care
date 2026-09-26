# Engagement — lógica para apresentação

O ConnectCare 360 usa uma separação clara entre **decisão** e **entrega**.

```text
Perfil + comportamento + veículo
            ↓
     Análise preditiva
            ↓
     Engagement / IA
            ↓
   Quando comunicar? Por quê?
            ↓
 Preferências do cliente
            ↓
 WhatsApp / E-mail / ambos / nenhum
            ↓
        n8n / Webhook
```

## Regra de negócio

O cliente controla os canais de comunicação. O backend analisa os dados e decide se existe uma comunicação relevante.

- **Preferências** definem onde o cliente aceita receber a mensagem.
- **ML + regras de negócio** definem a prioridade e a relevância do contato.
- **Gemini** pode personalizar o texto da comunicação sem alterar a decisão do backend.
- **n8n** recebe o evento e executa a entrega.

O cliente pode escolher, em cada categoria, WhatsApp, E-mail, os dois ou nenhum.

## Frase sugerida para apresentação

> O usuário controla suas preferências de comunicação, enquanto o ConnectCare 360 utiliza análise preditiva e inteligência artificial para identificar o momento adequado de entrar em contato com ele. A comunicação respeita os canais escolhidos e pode ser encaminhada para WhatsApp, e-mail ou ambos.

## Importante

A tela de Engagement não possui mais o botão “Avaliar agora”. A avaliação foi pensada para ser acionada automaticamente pelo scheduler, por exemplo um Schedule Trigger do n8n chamando `POST /automation/run-daily`.
