# Engagement AI — Teste de apresentação

## 1. Backend

Entre em `backend/` e ative seu ambiente virtual.

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Acesse o Swagger em `http://127.0.0.1:8000/docs`.

## 2. Banco

O fluxo usa as tabelas já existentes `customers`, `vehicles` e `ml_predictions`.
A tabela `engagement_decisions` é criada automaticamente na primeira avaliação.

Também existe o script manual em `backend/sql/engagement.sql`.

## 3. IA

A chave do Gemini é opcional para testar o fluxo.

- Sem `GEMINI_API_KEY`: o backend executa toda a decisão normalmente e usa uma mensagem local determinística.
- Com `GEMINI_API_KEY`: o backend mantém `should_send`, `priority` e `channel` calculados pelas regras e usa o Gemini somente para personalizar título/mensagem.

Isso evita que a IA altere a prioridade de um cliente entre execuções.

## 4. Endpoint principal

No Swagger:

`POST /engagement/evaluate/{customer_id}`

Use um `customer_id` real existente no seu PostgreSQL.

Depois teste outro `customer_id`. Cada execução busca os dados pelo ID informado e grava a decisão vinculada ao mesmo cliente.

## 5. App

Na raiz:

```bash
npm install
npx expo start
```

O endereço da API está em `src/constants/demo.ts`:

```ts
export const API_URL = "http://192.168.15.5:8000";
```

Altere para o IP local do computador que estiver executando o FastAPI, se necessário.

Faça login, abra a aba **Contato/Engagement** e toque em **Avaliar agora**.

## Fluxo demonstrável

1. Login do cliente.
2. App identifica o `customer_id`.
3. App chama `POST /engagement/evaluate/{customer_id}`.
4. FastAPI busca cliente + veículo + previsão de ML.
5. FastAPI calcula a prioridade de forma determinística.
6. Gemini, se configurado, personaliza apenas a mensagem.
7. Decisão é salva em PostgreSQL.
8. App exibe prioridade, canal, mensagem e justificativa.
9. O histórico mostra as avaliações daquele cliente.

O n8n pode ser conectado depois para executar a ação de comunicação (WhatsApp/e-mail), mas não é necessário para demonstrar a decisão do agente.
