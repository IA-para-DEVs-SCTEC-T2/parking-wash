# 📦 Guia de Entrega - ParkingWash

## ✅ Status do Projeto

O projeto **ParkingWash** está **100% funcional** e pronto para entrega na faculdade.

### Componentes Implementados

- ✅ **Backend**: Express.js + TypeScript com 3 domínios (Parking, Wash Orders, Wash Services)
- ✅ **Frontend**: React + Vite com componentes para gerenciamento de estacionamento e fila de lavagem
- ✅ **Banco de Dados**: Supabase (com mock database para desenvolvimento local)
- ✅ **Testes**: Jest + fast-check (property-based testing)
- ✅ **CI/CD**: GitHub Actions workflow
- ✅ **Documentação**: Completa com exemplos de uso

---

## 🚀 Como Executar

### Opção 1: Script Automático (Recomendado)

```powershell
# No diretório raiz do projeto
.\start-dev.ps1
```

Este script:
- Verifica Node.js e npm
- Limpa portas anteriores
- Inicia backend e frontend em paralelo
- Aguarda backend ficar pronto
- Exibe URLs de acesso

### Opção 2: Comando npm

```bash
# No diretório raiz do projeto
npm run dev
```

### Opção 3: Manual (Dois terminais)

**Terminal 1:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 URLs de Acesso

Após iniciar, acesse:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3333
- **API Parking**: http://localhost:3333/api/parking
- **API Wash Services**: http://localhost:3333/api/wash-services
- **API Wash Orders**: http://localhost:3333/api/wash-orders

---

## 📊 Dados de Teste

O sistema vem com dados mock pré-carregados:

### Estacionamentos
- **ABC1234** - Veículo ativo (estacionado há 1 hora)
- **XYZ5678** - Veículo finalizado (saiu com tarifa de R$10.00)

### Serviços de Lavagem
- **Lavagem Básica** - R$30.00 (30 min)
- **Lavagem Premium** - R$60.00 (60 min)

---

## 🧪 Testes

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

### Lint

```bash
npm run lint
```

---

## 📁 Estrutura do Projeto

```
parking-wash/
├── backend/                    # API Express + TypeScript
│   ├── src/
│   │   ├── modules/           # Domínios (parking, wash-orders, wash-services)
│   │   ├── middleware/        # Validação e tratamento de erros
│   │   ├── db/                # Cliente Supabase e scripts SQL
│   │   ├── config/            # Configuração de ambiente
│   │   ├── app.ts             # Express app
│   │   └── server.ts          # Inicialização
│   ├── tests/                 # Testes com Jest + fast-check
│   ├── package.json
│   └── .env                   # Variáveis de ambiente
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── api/               # Cliente HTTP
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── .env
│
├── package.json               # Scripts raiz
├── start-dev.ps1             # Script de inicialização
└── README.md                 # Documentação completa
```

---

## 🔧 Configuração de Ambiente

### Backend (.env)

```env
# Supabase (opcional - usa mock se não configurado)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-chave-de-servico

# Servidor
PORT=3333

# Tarifas
HOURLY_RATE=10.00
DAILY_RATE_CAP=80.00
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3333
```

---

## 📝 Funcionalidades Principais

### 1. Gerenciamento de Estacionamento

- ✅ Check-in de veículos
- ✅ Check-out com cálculo automático de tarifa
- ✅ Listagem de veículos estacionados
- ✅ Histórico de saídas
- ✅ Integração com API FIPE (dados de veículos)

### 2. Fila de Lavagem

- ✅ Criar ordem de lavagem
- ✅ Máquina de estados (Waiting → InProgress → Completed)
- ✅ Listagem de ordens
- ✅ Atualização de status

### 3. Serviços de Lavagem

- ✅ Catálogo de serviços
- ✅ Preços e durações
- ✅ Associação com ordens

---

## 🐛 Troubleshooting

### Erro: "Port 3333 already in use"

```powershell
# Matar processo na porta 3333
Get-Process -Name node | Stop-Process -Force
```

### Erro: "Cannot find module"

```bash
# Reinstalar dependências
npm run install:all
```

### Frontend mostra erro 503

- Verifique se o backend está rodando em http://localhost:3333
- Verifique se a variável `VITE_API_URL` está correta no `.env` do frontend

### Supabase não conecta

- Se não tiver credenciais reais, o sistema usa mock database automaticamente
- Para usar Supabase real, configure `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` no `.env`

---

## 📚 Documentação Adicional

- **README.md** - Documentação completa do projeto
- **backend/src/db/schema.sql** - Schema do banco de dados
- **backend/src/db/seed.sql** - Dados iniciais
- **.github/workflows/ci.yml** - Pipeline CI/CD

---

## 🎓 Para a Faculdade

### O que entregar

1. ✅ Código-fonte completo (este repositório)
2. ✅ Documentação (README.md + GUIA_ENTREGA.md)
3. ✅ Testes automatizados (backend + frontend)
4. ✅ CI/CD configurado (GitHub Actions)
5. ✅ Aplicação funcionando (execute `npm run dev`)

### Como demonstrar

1. Execute `npm run dev` ou `.\start-dev.ps1`
2. Abra http://localhost:5173 no navegador
3. Teste as funcionalidades:
   - Fazer check-in de um veículo
   - Fazer check-out e ver tarifa calculada
   - Criar ordem de lavagem
   - Atualizar status da ordem

### Pontos fortes do projeto

- ✅ Arquitetura limpa com separação de domínios
- ✅ Validação robusta com Zod
- ✅ Tratamento de erros centralizado
- ✅ Testes com property-based testing
- ✅ Frontend responsivo e intuitivo
- ✅ CI/CD automatizado
- ✅ Documentação completa
- ✅ Funciona sem Supabase real (mock database)

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique se Node.js 20+ está instalado
2. Verifique se as portas 3333 e 5173 estão livres
3. Limpe cache: `npm run install:all`
4. Reinicie os servidores

---

## 🎉 Pronto para Entrega!

O projeto está 100% funcional e pronto para apresentação na faculdade.

**Última atualização**: 2024-01-15
**Status**: ✅ Pronto para Produção
