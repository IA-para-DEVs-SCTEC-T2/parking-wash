# Changelog — Configurações de Vagas e Tarifas

**Branch:** `feature/settings-spots-tariffs`  
**Data:** 27/05/2026  
**Base:** `feature/improvements-may27`

---

## Resumo

Implementação do painel de configurações do sistema, permitindo ao operador alterar o número de vagas (estacionamento e lavagem) e as tarifas de todos os serviços diretamente pela interface, sem necessidade de acesso ao banco de dados.

---

## Funcionalidades Implementadas

### 1. Módulo de Configurações (Backend)

**Arquivos criados:**
- `backend/src/modules/settings/settings.service.ts`
- `backend/src/modules/settings/settings.controller.ts`
- `backend/src/modules/settings/settings.router.ts`

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/settings` | Retorna configurações atuais (totalSpots, washSpots) |
| PATCH | `/api/settings` | Atualiza configurações `{ totalSpots?, washSpots? }` |

**Comportamento:**
- Tenta salvar no Supabase (tabela `parking_settings`)
- Se a tabela não existir, usa fallback em memória (persiste enquanto o servidor roda)
- Valores padrão: 30 vagas de estacionamento, 5 vagas de lavagem
- Configurável via variáveis de ambiente: `TOTAL_PARKING_SPOTS`, `TOTAL_WASH_SPOTS`

---

### 2. Atualização de Tarifas de Lavagem (Backend)

**Arquivos alterados:**
- `backend/src/modules/wash-services/wash-services.service.ts` — Adicionado método `updatePrice()`
- `backend/src/modules/wash-services/wash-services.controller.ts` — Adicionado handler `patchWashServicePrice()`
- `backend/src/modules/wash-services/wash-services.router.ts` — Adicionada rota PATCH

**Endpoint:**
| Método | Rota | Descrição |
|--------|------|-----------|
| PATCH | `/api/wash-services/:id` | Atualiza preço do serviço `{ price: number }` |

---

### 3. Modal de Configurações (Frontend)

**Arquivos criados:**
- `frontend/src/components/Dashboard/SettingsModal.tsx`
- `frontend/src/components/Dashboard/SettingsModal.css`
- `frontend/src/api/settings.ts`

**Funcionalidades do modal:**
- Botão "⚙️ Configurações" no Dashboard
- Input para total de vagas de estacionamento
- Input para total de vagas de lavagem
- Inputs para tarifa horária e diária de cada tipo de veículo (Moto, Carro, Motorhome)
- Inputs para preço de cada serviço de lavagem
- Botão "Salvar Configurações" que persiste tudo de uma vez
- Feedback visual de sucesso/erro
- Responsivo (adapta em mobile)

---

### 4. Indicador de Vagas (Frontend)

**Arquivos criados:**
- `frontend/src/components/Dashboard/OccupancyBar.tsx`
- `frontend/src/components/Dashboard/OccupancyBar.css`

**Componente reutilizável `OccupancyBar`:**
- Props: `occupied` (número), `total` (número)
- Barra visual com cores: verde (< 70%), amarelo (70-90%), vermelho (> 90%)
- Mostra: "X livres / Y total" + percentual + status textual
- Status: Disponível, Moderado, Quase lotado, LOTADO

**Onde é usado:**
- **Estacionamento** (`ParkingPanel.tsx`): mostra vagas de estacionamento ocupadas vs total
- **Lavagem** (`WashQueue.tsx`): mostra vagas de lavagem ocupadas (Waiting + InProgress) vs total

---

### 5. Histórico de Lavagens com Busca

**Arquivos alterados:**
- `backend/src/modules/wash-orders/wash-orders.service.ts` — Adicionado `listHistory()`, filtro por data
- `backend/src/modules/wash-orders/wash-orders.controller.ts` — Adicionado `getWashOrdersHistory()`
- `backend/src/modules/wash-orders/wash-orders.router.ts` — Adicionada rota GET `/history`
- `frontend/src/components/WashQueue/WashQueue.tsx` — Botão "Histórico" + busca por placa
- `frontend/src/api/washOrders.ts` — Adicionado `listWashOrdersHistory()`

**Endpoint:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/wash-orders/history?limit=50` | Últimas 50 lavagens concluídas (todos os dias) |

**Frontend:**
- Botão "📋 Histórico" alterna entre fila ativa e histórico
- Campo de busca por placa com filtro em tempo real
- Tabela com: Placa, Serviço, Tipo Veículo, Criado em, Concluído em, Valor

---

### 6. Responsividade

**Arquivos alterados:**
- `frontend/src/App.css` — Media queries para 768px e 480px
- `frontend/src/components/Dashboard/Dashboard.css` — Grid responsivo
- `frontend/src/components/Dashboard/SettingsModal.css` — Modal responsivo
- `frontend/src/components/WashQueue/WashQueue.css` — Tabela e header responsivos

**Melhorias:**
- Header e navegação empilham em mobile
- Modal de configurações ocupa 95% da tela em mobile
- Tabela de histórico esconde colunas menos importantes em telas < 480px
- Inputs ocupam largura total em mobile
- Botões empilham verticalmente em mobile

---

### 7. Reordenação da Navegação

**Arquivo alterado:** `frontend/src/App.tsx`

- Ordem anterior: Dashboard → Estacionamento → Fila de Lavagem
- Ordem nova: **Estacionamento → Fila de Lavagem → Dashboard**
- Aba padrão ao abrir: Estacionamento

---

## Arquivos Modificados (resumo)

### Backend (7 arquivos)
```
M  backend/src/app.ts
M  backend/src/modules/wash-orders/wash-orders.controller.ts
M  backend/src/modules/wash-orders/wash-orders.router.ts
M  backend/src/modules/wash-orders/wash-orders.service.ts
M  backend/src/modules/wash-services/wash-services.controller.ts
M  backend/src/modules/wash-services/wash-services.router.ts
M  backend/src/modules/wash-services/wash-services.service.ts
+  backend/src/modules/settings/settings.service.ts
+  backend/src/modules/settings/settings.controller.ts
+  backend/src/modules/settings/settings.router.ts
```

### Frontend (10 arquivos)
```
M  frontend/src/App.css
M  frontend/src/api/washServices.ts
M  frontend/src/components/Dashboard/Dashboard.css
M  frontend/src/components/Dashboard/Dashboard.tsx
M  frontend/src/components/ParkingPanel/ParkingPanel.tsx
M  frontend/src/components/WashQueue/WashQueue.css
M  frontend/src/components/WashQueue/WashQueue.tsx
+  frontend/src/api/settings.ts
+  frontend/src/components/Dashboard/OccupancyBar.tsx
+  frontend/src/components/Dashboard/OccupancyBar.css
+  frontend/src/components/Dashboard/SettingsModal.tsx
+  frontend/src/components/Dashboard/SettingsModal.css
```

---

## Como Testar

1. Abrir o sistema no navegador (`http://localhost:5173`)
2. Ir para a aba **Dashboard**
3. Clicar em **⚙️ Configurações**
4. Alterar número de vagas e tarifas
5. Clicar em **Salvar Configurações**
6. Verificar que o indicador de vagas atualiza no Estacionamento e na Lavagem
7. Fazer um checkout e verificar que a nova tarifa é aplicada

---

## Próximos Passos Sugeridos

- [ ] Criar tabela `parking_settings` no Supabase para persistência permanente
- [ ] Adicionar autenticação para proteger o modal de configurações (apenas admin)
- [ ] Bloquear check-in quando estacionamento estiver lotado
- [ ] Adicionar notificação visual quando restam poucas vagas
- [ ] Exportar relatório de configurações alteradas (log de auditoria)
