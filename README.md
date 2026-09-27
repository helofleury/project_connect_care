# 🚗 ConnectCare 360

**ConnectCare 360** é uma solução desenvolvida para a Ford, utilizando dados reais de veículos e histórico de manutenção para transformar informações do pós-venda em experiências personalizadas para cada cliente.

A solução combina Machine Learning, IA e automação para prever riscos de manutenção, segmentar clientes, gerar recomendações personalizadas e realizar comunicações por diferentes canais. O objetivo é impulsionar o VIN Share na América Latina e aumentar a retenção de clientes no pós-venda, fortalecendo o relacionamento entre clientes, veículos e concessionárias.


## 📌 Sobre o projeto

O ConnectCare 360 foi desenvolvido para melhorar o relacionamento entre clientes, veículos e concessionárias no pós-venda automotivo.

A plataforma combina:

* 🚘 **Histórico real de manutenção** dos veículos
* 📊 **Predição de risco** de manutenção
* 🧩 **Segmentação de clientes** por comportamento
* 💡 **Recomendações** personalizadas
* 🔔 **Notificações** e preferências de comunicação
* 🤖 **Assistente virtual** com IA
* 📱 **Aplicativo mobile** com visão 360º do cliente e veículo
* 🔄 **Automação de comunicações** via n8n

---

## ✨ Principais funcionalidades

* 🔐 **Cadastro e autenticação** de clientes com Firebase
* 🚘 **Visão 360º** do veículo e histórico de serviços
* 📊 **Predição de risco** utilizando regras de negócio e Random Forest
* 🧩 **Segmentação** utilizando K-Means
* 🗓️ **Estimativa** da próxima manutenção
* 💡 **Recomendações personalizadas** de manutenção e serviços
* 🔔 **Central de notificações**
* 🤝 **Motor de engajamento** baseado no perfil e preferências do cliente
* 📡 **Integração com n8n** para automação de WhatsApp, e-mail e SMS
* 🤖 **Chatbot com IA** para dúvidas sobre o veículo
* 🏬 **Seleção de concessionárias** e agendamento de serviços
* 🌗 **Tema claro e escuro**

---

## 🏗️ Arquitetura

```text
┌─────────────────────────┐
│    App Mobile           │
│  React Native + Expo    │
└────────────┬────────────┘
             │ REST API
             ▼
┌─────────────────────────┐
│       FastAPI           │
│ Regras + ML + IA        │
└──────┬───────────┬──────┘
       │           │
       ▼           ▼
┌───────────┐  ┌────────────┐
│ Firebase  │  │ PostgreSQL │
│   Auth    │  │   Dados    │
└───────────┘  └─────┬──────┘
                      │
                      ▼
                ┌──────────┐
                │   n8n    │
                │ WhatsApp │
                │ E-mail   │
                │ SMS      │
                └──────────┘


```

## 🛠️ Tecnologias

### Mobile
* React Native
* Expo
* TypeScript
* React Navigation
* Firebase Authentication
* AsyncStorage
* Expo Camera

### Backend
* Python
* FastAPI
* PostgreSQL
* Pydantic
* Pandas
* scikit-learn
* Joblib
* HTTPX

### IA, Machine Learning e Automação
* Random Forest
* K-Means
* Gemini / Anthropic
* n8n

---

## 📂 Estrutura do projeto

```text
connectcare-360/
│
├── App.tsx
│
├── src/
│   ├── screens/
│   ├── navigation/
│   ├── contexts/
│   ├── services/
│   ├── components/
│   ├── theme/
│   ├── types/
│   ├── hooks/
│   ├── utils/
│   └── firebase.ts
│
└── backend/
    ├── app/
    │   ├── main.py
    │   ├── database.py
    │   ├── routes/
    │   └── services/
    │
    ├── scripts/
    │   ├── import_vehicles.py
    │   ├── import_service_history.py
    │   ├── train_random_forest.py
    │   └── train_kmeans.py
    │
    ├── models/
    └── sql/
```
> 📁 Os arquivos de dados utilizados no processamento do projeto não são versionados no repositório devido ao seu tamanho.
>
> ```text
> backend/data/
> ├── ford_service_history_tratado.csv
> └── ford_vehicle_360.csv
> ```

# 🚀 Como executar
## Backend

1. Navegue até a pasta do backend:
 
```bash
cd backend
```
 
2. Crie um ambiente virtual:
 
```bash
python -m venv venv
```
 
3. Ative o ambiente virtual:
 
**Windows**
```bash
venv\Scripts\activate
```
 
**Linux/Mac**
```bash
source venv/bin/activate
```
 
4. Instale as dependências:
 
```bash
pip install -r requirements.txt
```
 
5. Execute o servidor:
 
```bash
uvicorn app.main:app --reload
```
 
A API será executada em:
 
```text
http://localhost:8000
```
## App Mobile
1. Instale as dependências:
 
```bash
npm install
```
 
2. Inicie o servidor de desenvolvimento do Expo:
 
```bash
npx expo start
```
> ⚠️ Configure as credenciais do Firebase e a URL da API antes de iniciar o aplicativo.

## 📦 APK Android

A versão final do aplicativo foi gerada utilizando **Expo EAS Build**.

Para gerar uma nova versão do APK:

```bash
eas build --platform android --profile preview
```
> Para testes em dispositivo físico, o backend deve estar acessível pelo endereço IP da máquina na mesma rede do dispositivo.

# 🎥 Demonstração
 
Veja a solução funcionando:
[Assista ao vídeo no YouTube](https://youtube.com/shorts/y6JVX-H46rM?is=dhoJwkxd4xT9L7se)
 
# 👥 Integrantes
- **Heloísa Fleury Jardim** - RM556378
- **Juan Fuentes Rufino** - RM557673
- **Paulo Henrique Monteiro Golovanevsky** - RM555300
- **Pedro Henrique Silva Batista** - RM55813
- **Rickelmyn de Souza Ruescas** - RM556055

