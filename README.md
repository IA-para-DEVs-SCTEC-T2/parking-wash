# ParkingWash

Sistema web de gerenciamento integrado de estacionamento e lavação de veículos.

## 1. Visão Geral

O **ParkingWash** é um sistema completo para gerenciar operações de estacionamento e serviços de lavação de veículos. Resolve o problema de controle manual de entrada/saída de veículos e fila de lavagem, que é propenso a erros e não gera dados para análise.

**Solução:** API REST com cálculo automático de tarifa, controle de fila de lavagem com máquina de estados, e interface web intuitiva.

### Tecnologias principais

- **Backend:** Node.js + Express + TypeScript
- **Frontend:** React + Vite + TypeScript
- **Banco de dados:** Supabase (PostgreSQL gerenciado)
- **Validação:** Zod
- **Testes:** Jest + fast-check (property-based testing)
- **CI/CD:** GitHub Actions

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

**Variáveis de ambiente do backend:**

| Variável | Descrição | Padrão | Obrigatório |
|----------|-----------|--------|------------|
| `SUPABASE_URL` | URL do projeto Supabase (encontre em: Supabase Dashboard → Settings → API → Project URL) | - | ✅ Sim |
| `SUPABASE_SERVICE_KEY` | Chave de serviço do Supabase com permissões de leitura/escrita (encontre em: Supabase Dashboard → Settings → API → service_role key) | - | ✅ Sim |
| `PORT` | Porta em que o servidor HTTP irá escutar | 3333 | ❌ Não |
| `HOURLY_RATE` | Taxa horária de estacionamento em reais | 10.00 | ❌ Não |
| `DAILY_RATE_CAP` | Teto máximo de cobrança diária em reais | 80.00 | ❌ Não |

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

**Variáveis de ambiente do frontend:**

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_URL` | URL base da API backend (usada pelo proxy do Vite em desenvolvimento) | http://localhost:3333 |

### Banco de Dados

1. Criar um novo projeto no Supabase
2. Copiar a URL e a chave de serviço para o `.env` do backend
3. Executar o script DDL em `backend/src/db/schema.sql` no SQL Editor do Supabase
4. Executar o script de seed em `backend/src/db/seed.sql` para popular os serviços de lavagem

## 3. Arquitetura

### Visão geral da arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│              http://localhost:5173                          │
│  - ParkingPanel: Check-in/Checkout de veículos             │
│  - WashQueue: Fila de lavagem com status                   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP REST
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                    │
│              http://localhost:3333                          │
│  - Validação com Zod                                        │
│  - Tratamento de erros centralizado                         │
│  - Três domínios principais (módulos)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           Supabase (PostgreSQL gerenciado)                  │
│  - Tabelas: parking, wash_orders, wash_services            │
│  - Autenticação e autorização                              │
└─────────────────────────────────────────────────────────────┘
```

### Três domínios principais

O backend é organizado em três domínios independentes:

#### 1. **Parking** (`backend/src/modules/parking/`)
Gerencia entrada e saída de veículos com cálculo automático de tarifa.

- **Endpoints:**
  - `POST /api/parking/checkin` — Registra entrada de veículo
  - `POST /api/parking/:id/checkout` — Registra saída e calcula tarifa
  - `GET /api/parking` — Lista veículos estacionados

- **Lógica:**
  - Impede check-in duplicado (mesma placa)
  - Calcula tarifa por hora com teto diário
  - Máquina de estados: `Parked` → `Exited`

#### 2. **Wash Orders** (`backend/src/modules/wash-orders/`)
Gerencia fila de lavagem com máquina de estados.

- **Endpoints:**
  - `POST /api/wash-orders` — Cria ordem de lavagem
  - `GET /api/wash-orders` — Lista ordens
  - `PATCH /api/wash-orders/:id/status` — Avança status

- **Lógica:**
  - Máquina de estados: `Waiting` → `InProgress` → `Completed`
  - Valida transições de status
  - Associa serviço de lavagem à ordem

#### 3. **Wash Services** (`backend/src/modules/wash-services/`)
Catálogo de serviços de lavagem disponíveis.

- **Endpoints:**
  - `GET /api/wash-services` — Lista serviços disponíveis

- **Lógica:**
  - Dados populados via seed (não há criação/edição)
  - Exemplo: "Lavagem Simples" (R$30), "Lavagem Premium" (R$50)

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
│   │   │   ├── parking/
│   │   │   │   ├── parking.controller.ts
│   │   │   │   ├── parking.router.ts
│   │   │   │   ├── parking.service.ts
│   │   │   │   ├── parking.types.ts
│   │   │   │   └── parking.validator.ts
│   │   │   ├── wash-orders/
│   │   │   │   ├── wash-orders.controller.ts
│   │   │   │   ├── wash-orders.router.ts
│   │   │   │   ├── wash-orders.service.ts
│   │   │   │   ├── wash-orders.types.ts
│   │   │   │   └── wash-orders.validator.ts
│   │   │   └── wash-services/
│   │   │       ├── wash-services.controller.ts
│   │   │       ├── wash-services.router.ts
│   │   │       ├── wash-services.service.ts
│   │   │       └── wash-services.types.ts
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

Este projeto foi desenvolvido com foco em **processo de desenvolvimento com IA**, não apenas no código. O objetivo é documentar como a IA foi utilizada em cada etapa do desenvolvimento, incluindo os prompts, respostas, análises críticas e refinamentos.

### Padrões de prompting aplicados

- **Prompt estruturado**: contexto + restrições + formato de saída esperado
- **Prompt iterativo**: análise crítica e refinamento baseado em feedback
- **Prompt com exemplos**: demonstração de padrões esperados
- **Prompt com restrições**: limitações e regras de negócio

### Ciclos de refinamento documentados

Cada etapa do desenvolvimento foi documentada em `docs/prompts/`:

1. **01-arquitetura.md** — Design do sistema (3+ ciclos de refinamento)
   - Definição de domínios
   - Escolha de tecnologias
   - Estrutura de pastas

2. **02-backend.md** — Implementação dos endpoints (erros da IA e correções)
   - Endpoints REST
   - Validação com Zod
   - Tratamento de erros

3. **03-testes.md** — Estratégia de testes (cenários não cobertos)
   - Testes unitários com Jest
   - Property-based testing com fast-check
   - Cobertura de casos extremos

4. **04-frontend.md** — Componentes React (iterações de design)
   - Componentes reutilizáveis
   - Hooks customizados
   - Integração com API

5. **05-cicd.md** — Pipeline CI/CD (ajustes de workflow)
   - GitHub Actions
   - Testes automatizados
   - Build e deploy

Cada arquivo contém:
- **Prompt utilizado** (texto completo)
- **Resposta obtida da IA** (texto completo)
- **Análise crítica** (limitações identificadas)
- **Refinamento aplicado** (mudanças baseadas na análise)

## 5. Exemplos de uso da API

### Exemplo 1: Check-in e Checkout de Veículo

#### Check-in (Entrada)

**Requisição:**
```bash
curl -X POST http://localhost:3333/api/parking/checkin \
  -H "Content-Type: application/json" \
  -d '{"licensePlate": "ABC-1234"}'
```

**Resposta (HTTP 201 - Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "licensePlate": "ABC-1234",
  "entryTime": "2024-01-15T10:00:00Z",
  "status": "Parked"
}
```

#### Checkout (Saída com cálculo de tarifa)

**Requisição:**
```bash
curl -X POST http://localhost:3333/api/parking/550e8400-e29b-41d4-a716-446655440000/checkout
```

**Resposta (HTTP 200 - OK, após 90 minutos):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "licensePlate": "ABC-1234",
  "entryTime": "2024-01-15T10:00:00Z",
  "exitTime": "2024-01-15T11:30:00Z",
  "durationMinutes": 90,
  "totalAmount": 15.00,
  "status": "Exited"
}
```

**Cálculo da tarifa:**
- Taxa horária: R$10.00/hora
- Duração: 90 minutos = 1.5 horas
- Valor: 1.5 × 10.00 = R$15.00
- Teto diário: R$80.00 (não aplicável neste caso)

### Exemplo 2: Fila de Lavagem com Máquina de Estados

#### Criar Ordem de Lavagem

**Requisição:**
```bash
curl -X POST http://localhost:3333/api/wash-orders \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "ABC-1234",
    "washServiceId": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

**Resposta (HTTP 201 - Created):**
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

#### Avançar Status: Waiting → InProgress

**Requisição:**
```bash
curl -X PATCH http://localhost:3333/api/wash-orders/550e8400-e29b-41d4-a716-446655440002/status \
  -H "Content-Type: application/json" \
  -d '{"status": "InProgress"}'
```

**Resposta (HTTP 200 - OK):**
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

#### Avançar Status: InProgress → Completed

**Requisição:**
```bash
curl -X PATCH http://localhost:3333/api/wash-orders/550e8400-e29b-41d4-a716-446655440002/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Completed"}'
```

**Resposta (HTTP 200 - OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "licensePlate": "ABC-1234",
  "washService": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Lavagem Simples",
    "price": 30.00
  },
  "status": "Completed",
  "createdAt": "2024-01-15T10:00:00Z",
  "startedAt": "2024-01-15T10:05:00Z",
  "completedAt": "2024-01-15T10:35:00Z"
}
```

### Exemplo 3: Erro — Transição de Status Inválida

**Requisição (tentativa de pular estado):**
```bash
curl -X PATCH http://localhost:3333/api/wash-orders/550e8400-e29b-41d4-a716-446655440002/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Completed"}'
```

**Resposta (HTTP 422 - Unprocessable Entity):**
```json
{
  "error": "Transição inválida: Waiting → Completed. Permitido: Waiting→InProgress→Completed",
  "statusCode": 422
}
```

### Exemplo 4: Erro — Veículo Já Estacionado

**Requisição (check-in duplicado):**
```bash
curl -X POST http://localhost:3333/api/parking/checkin \
  -H "Content-Type: application/json" \
  -d '{"licensePlate": "ABC-1234"}'
```

**Resposta (HTTP 409 - Conflict):**
```json
{
  "error": "Veículo com placa ABC-1234 já está estacionado",
  "statusCode": 409
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

## 8. Histórico de Mudanças

### v1.1.0 - Correções de Integração Frontend-Backend

**Mudanças principais:**

- ✅ **Normalização de tipos**: Convertido todos os tipos de resposta da API para camelCase (licensePlate, entryTime, etc.)
- ✅ **Tratamento de erros robusto**: Melhorado tratamento de erros em todos os componentes do frontend
- ✅ **Componentes do ParkingPanel**: Criados componentes faltantes (CheckInForm, VehicleCard, ElapsedTimer, CheckoutModal, ParkingPanel)
- ✅ **Suporte a WebSocket**: Adicionado suporte ao pacote `ws` para Node.js 20
- ✅ **Arquivos de entrada**: Criados main.tsx, App.tsx, index.html para o frontend
- ✅ **Tipos TypeScript**: Criados tipos para parking e washOrders no frontend

**Arquivos modificados:**
- `backend/src/modules/parking/parking.types.ts` — Normalização para camelCase
- `backend/src/modules/parking/parking.service.ts` — Transformação de snake_case para camelCase
- `backend/src/db/supabase.ts` — Adicionado suporte a WebSocket
- `frontend/src/components/ParkingPanel/*` — Novos componentes
- `frontend/src/App.tsx` — Componente principal
- `frontend/src/main.tsx` — Ponto de entrada

**Testes realizados:**
- ✅ Check-in com placa válida
- ✅ Listagem de veículos estacionados
- ✅ Tratamento de erros de API
- ✅ Recompilação do frontend com HMR

## 9. Contribuindo

Este é um projeto acadêmico focado em demonstrar o processo de desenvolvimento com IA. Contribuições são bem-vindas!

## 10. Licença

MIT
