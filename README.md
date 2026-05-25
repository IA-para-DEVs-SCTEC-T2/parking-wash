# ParkingWash

Sistema web de gerenciamento integrado de estacionamento e lavação de veículos.

## 1. Visão Geral

O **ParkingWash** resolve o problema de controle manual de entrada/saída de veículos e fila de lavagem, que é propenso a erros e não gera dados para análise.

**Solução:** API REST com cálculo automático de tarifa e controle de fila de lavagem com máquina de estados.

### Funcionalidades principais

- ✅ Check-in e checkout de veículos com cálculo automático de tarifa
- ✅ Fila de lavagem com controle de status (Waiting → InProgress → Completed)
- ✅ Testes automatizados com property-based testing (fast-check)
- ✅ Pipeline CI/CD com GitHub Actions
- ✅ Documentação completa do processo de desenvolvimento com IA

## 2. Execução

### Pré-requisitos

- Node.js 20+
- Conta no Supabase (gratuita em https://supabase.com)

### Backend

```bash
cd backend

# Copiar variáveis de ambiente
cp .env.example .env
# Preencher SUPABASE_URL e SUPABASE_SERVICE_KEY no .env

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
# Servidor rodará em http://localhost:3333
```

### Frontend

```bash
cd frontend

# Copiar variáveis de ambiente
cp .env.example .env

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
# Aplicação rodará em http://localhost:5173
```

### Banco de Dados

1. Criar um novo projeto no Supabase
2. Copiar a URL e a chave de serviço para o `.env` do backend
3. Executar o script DDL em `backend/src/db/schema.sql` no SQL Editor do Supabase
4. Executar o script de seed em `backend/src/db/seed.sql` para popular os serviços de lavagem

## 3. Arquitetura

```
Frontend (React + Vite)
        ↓ HTTP REST
Backend (Node.js + Express)
        ↓ SQL
Supabase (PostgreSQL)
```

### Decisões técnicas

- **Express**: simplicidade e familiaridade para demonstração
- **Supabase**: banco PostgreSQL gerenciado sem configuração de servidor
- **Zod**: validação de entrada com mensagens de erro claras
- **Jest + fast-check**: testes unitários com mock do banco para execução rápida
- **React + Vite**: frontend SPA rápido e moderno

### Estrutura de pastas

```
parking-wash/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuração (env.ts)
│   │   ├── db/              # Cliente Supabase e scripts DDL
│   │   ├── middleware/      # Erros e validação
│   │   ├── modules/         # Domínios (parking, wash-orders, wash-services)
│   │   ├── app.ts           # Express app
│   │   └── server.ts        # Inicialização do servidor
│   ├── tests/               # Testes com Jest + fast-check
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.ts
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # Cliente HTTP
│   │   ├── components/      # React components (ParkingPanel, WashQueue)
│   │   ├── hooks/           # Custom hooks (useElapsedTime, useAutoRefresh)
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── docs/
│   └── prompts/             # Documentação de ciclos de IA
│       ├── 01-arquitetura.md
│       ├── 02-backend.md
│       ├── 03-testes.md
│       ├── 04-frontend.md
│       └── 05-cicd.md
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions pipeline
└── README.md
```

## 4. Uso de IA

Este projeto foi desenvolvido com foco em **processo de desenvolvimento com IA**, não apenas no código.

### Padrões de prompting aplicados

- **Prompt estruturado**: contexto + restrições + formato de saída esperado
- **Prompt iterativo**: análise crítica e refinamento baseado em feedback

### Ciclos de refinamento

Cada etapa do desenvolvimento foi documentada em `docs/prompts/`:

1. **01-arquitetura.md** — Design do sistema (3+ ciclos de refinamento)
2. **02-backend.md** — Implementação dos endpoints (erros da IA e correções)
3. **03-testes.md** — Estratégia de testes (cenários não cobertos)
4. **04-frontend.md** — Componentes React (iterações de design)
5. **05-cicd.md** — Pipeline CI/CD (ajustes de workflow)

Cada arquivo contém:
- Prompt utilizado (texto completo)
- Resposta obtida da IA (texto completo)
- Análise crítica (limitações identificadas)
- Refinamento aplicado (mudanças baseadas na análise)

## 5. Exemplos de uso da API

### Cenário válido — Check-in e Checkout

**Check-in:**
```bash
curl -X POST http://localhost:3333/api/parking/checkin \
  -H "Content-Type: application/json" \
  -d '{"licensePlate": "ABC-1234"}'
```

Resposta (HTTP 201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "licensePlate": "ABC-1234",
  "entryTime": "2024-01-15T10:00:00Z",
  "status": "Parked"
}
```

**Checkout (após 90 minutos):**
```bash
curl -X POST http://localhost:3333/api/parking/550e8400-e29b-41d4-a716-446655440000/checkout
```

Resposta (HTTP 200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "licensePlate": "ABC-1234",
  "entryTime": "2024-01-15T10:00:00Z",
  "exitTime": "2024-01-15T11:30:00Z",
  "durationMinutes": 90,
  "totalAmount": 20.00,
  "status": "Exited"
}
```

### Cenário inválido — Veículo já estacionado

```bash
curl -X POST http://localhost:3333/api/parking/checkin \
  -H "Content-Type: application/json" \
  -d '{"licensePlate": "ABC-1234"}'
```

Resposta (HTTP 409):
```json
{
  "error": "Veículo com placa ABC-1234 já está estacionado",
  "statusCode": 409
}
```

### Cenário válido — Fila de lavagem

**Criar ordem:**
```bash
curl -X POST http://localhost:3333/api/wash-orders \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "ABC-1234",
    "washServiceId": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

Resposta (HTTP 201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "licensePlate": "ABC-1234",
  "washService": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Lavagem Simples",
    "price": 30.00
  },
  "status": "Waiting",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Avançar status (Waiting → InProgress):**
```bash
curl -X PATCH http://localhost:3333/api/wash-orders/550e8400-e29b-41d4-a716-446655440002/status \
  -H "Content-Type: application/json" \
  -d '{"status": "InProgress"}'
```

Resposta (HTTP 200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "licensePlate": "ABC-1234",
  "washService": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Lavagem Simples",
    "price": 30.00
  },
  "status": "InProgress",
  "createdAt": "2024-01-15T10:00:00Z",
  "startedAt": "2024-01-15T10:05:00Z"
}
```

### Cenário inválido — Transição de status inválida

```bash
curl -X PATCH http://localhost:3333/api/wash-orders/550e8400-e29b-41d4-a716-446655440002/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Completed"}'
```

Resposta (HTTP 422):
```json
{
  "error": "Transição inválida: Waiting → Completed. Permitido: Waiting→InProgress→Completed",
  "statusCode": 422
}
```

## 6. Testes

### Backend

```bash
cd backend

# Executar todos os testes
npm test

# Com cobertura
npm test -- --coverage

# Lint
npm run lint
```

### Frontend

```bash
cd frontend

# Executar testes
npm test
```

## 7. CI/CD

O projeto inclui um workflow GitHub Actions que:

1. **Backend job:**
   - Instala dependências
   - Executa lint
   - Executa testes (com mocks do Supabase)

2. **Frontend job:**
   - Instala dependências
   - Executa build

O workflow é acionado em:
- Push para `main` ou `develop`
- Pull requests para `main`

## 8. Variáveis de Ambiente

### Backend (`backend/.env`)

```env
# URL do projeto Supabase
SUPABASE_URL=https://your-project-id.supabase.co

# Chave de serviço do Supabase (service_role)
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Porta do servidor (padrão: 3333)
PORT=3333

# Taxa horária de estacionamento em reais (padrão: 10.00)
HOURLY_RATE=10.00

# Teto máximo de cobrança diária em reais (padrão: 80.00)
DAILY_RATE_CAP=80.00
```

### Frontend (`frontend/.env`)

```env
# URL base da API backend
VITE_API_URL=http://localhost:3333
```

## 9. Contribuindo

Este é um projeto acadêmico focado em demonstrar o processo de desenvolvimento com IA. Contribuições são bem-vindas!

## 10. Licença

MIT
