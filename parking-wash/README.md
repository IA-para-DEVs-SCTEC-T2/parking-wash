# 🅿️ ParkingWash

Sistema de gerenciamento de estacionamento e lavagem de veículos.

## Funcionalidades

### Estacionamento
- Check-in de veículos com seleção de tipo (Moto, Carro, Motorhome)
- Checkout com cálculo automático de tarifa progressiva
- Consulta de dados do veículo por placa (mock FIPE)
- Histórico de checkouts com busca por placa e paginação
- Indicador visual de vagas (ocupadas/livres)

### Lavagem
- Fila de lavagem com status (Aguardando → Em Andamento → Concluído)
- Histórico de lavagens com busca por placa e paginação
- Indicador de vagas de lavagem

### Dashboard
- Faturamento total do dia (estacionamento + lavagem)
- Métricas separadas por atividade
- Últimos checkouts e lavagens
- Configurações (tarifas, vagas)

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Express + TypeScript + tsx |
| Banco de Dados | Supabase (PostgreSQL) |
| Testes | Jest + fast-check (property-based) |
| CI/CD | GitHub Actions |

## Como Executar

### Pré-requisitos
- Node.js 20+
- npm

### 1. Instalar dependências

```bash
cd parking-wash/backend && npm install
cd ../frontend && npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp backend/.env.example backend/.env
# Editar backend/.env com suas credenciais do Supabase
```

### 3. Iniciar o projeto

```bash
# Terminal 1 - Backend
cd parking-wash/backend
npm run dev
# Rodando em http://localhost:3333

# Terminal 2 - Frontend
cd parking-wash/frontend
npm run dev
# Rodando em http://localhost:5173
```

## Estrutura do Projeto

```
parking-wash/
├── backend/
│   ├── src/
│   │   ├── config/          # Variáveis de ambiente
│   │   ├── db/              # Schema, migrations, Supabase client
│   │   ├── middleware/      # Erros, validação
│   │   └── modules/
│   │       ├── parking/     # Check-in, checkout, histórico
│   │       ├── vehicle-types/ # Tipos de veículo e tarifas
│   │       ├── wash-orders/ # Fila de lavagem
│   │       ├── wash-services/ # Serviços disponíveis
│   │       ├── billing/     # Relatório de faturamento
│   │       ├── notifications/ # Alertas de tempo limite
│   │       └── settings/    # Configurações (vagas, etc.)
│   └── tests/               # Testes unitários e PBT
├── frontend/
│   ├── src/
│   │   ├── api/             # Funções de chamada à API
│   │   ├── components/      # Componentes React
│   │   ├── hooks/           # Hooks customizados
│   │   ├── types/           # Interfaces TypeScript
│   │   └── utils/           # Utilitários (pricing, formatação)
│   └── public/
└── .github/workflows/       # CI/CD pipeline
```

## API Endpoints

### Estacionamento
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/parking/checkin` | Check-in de veículo |
| POST | `/api/parking/:id/checkout` | Checkout com pagamento |
| GET | `/api/parking` | Listar veículos (filtro por status) |
| GET | `/api/parking/history` | Histórico de checkouts |
| GET | `/api/parking/dashboard` | Métricas do dia |
| GET | `/api/parking/fipe/:placa` | Consulta dados do veículo |

### Lavagem
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/wash-orders` | Criar ordem de lavagem |
| PATCH | `/api/wash-orders/:id/status` | Avançar status |
| GET | `/api/wash-orders` | Listar ordens |
| GET | `/api/wash-orders/history` | Histórico de lavagens |
| GET | `/api/wash-orders/dashboard` | Métricas de lavagem |

### Configurações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/vehicle-types` | Listar tipos de veículo |
| PATCH | `/api/vehicle-types/:id` | Atualizar tarifas |
| GET | `/api/wash-services` | Listar serviços de lavagem |
| PATCH | `/api/wash-services/:id` | Atualizar preço |
| GET | `/api/settings` | Configurações gerais |
| PATCH | `/api/settings` | Atualizar configurações |

## Regras de Precificação

- **1ª hora:** Valor fixo (ex: R$ 10 para Carro)
- **Frações adicionais:** R$ 5 por cada 30 min
- **Diária:** Aplica automaticamente quando valor horário atinge o teto (ex: R$ 60)
- **Excedente 24h:** Inicia nova cobrança

Ver detalhes em `PRICING_IMPLEMENTATION_RULES.md`.

## Testes

```bash
cd parking-wash/backend
npm test
```

## Licença

Projeto acadêmico — Senai 2026.
