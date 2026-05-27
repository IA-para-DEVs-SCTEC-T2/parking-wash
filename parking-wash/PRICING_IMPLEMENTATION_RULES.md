# Changelog — ParkingWash

## Branch: `feature/pricing-rules-toast-receipt`

### Commit 2: `feat: pricing rules (6h threshold) + toast notifications + checkout receipt`

**Data:** 27/05/2026

#### Lógica de Cálculo de Estacionamento (Nova)

Implementada lógica de precificação baseada em regras:

| Regra | Condição | Cálculo |
|-------|----------|---------|
| 1 | Permanência ≤ 6 horas | Horas (arredondado p/ cima) × R$ 10,00 |
| 2 | Permanência > 6 horas (mesmo dia) | Diária fixa R$ 60,00 |
| 3 | Múltiplos dias completos | Dias × R$ 60,00 |
| 4a | Dias + horas restantes ≤ 6h | Dias × R$ 60 + Horas × R$ 10 |
| 4b | Dias + horas restantes > 6h | (Dias + 1) × R$ 60 |

**Exemplos:**
- 2h → R$ 20,00
- 5h → R$ 50,00
- 8h → R$ 60,00 (diária, pois > 6h)
- 2 dias + 2h → R$ 140,00 (2 × R$60 + 2 × R$10)
- 2 dias + 8h → R$ 180,00 (3 × R$60)

#### Toast de Notificação

- Componente reutilizável `Toast` com 3 tipos: success, error, info
- Animação slide-in/out, auto-dismiss após 5 segundos
- Hook `useToast` para uso simplificado
- Integrado no check-in e checkout

#### Recibo de Checkout

- Modal de recibo exibido após confirmação do pagamento
- Header verde animado com "Checkout Realizado!"
- Dados: placa, entrada, saída, permanência, cálculo aplicado, pagamento, total
- Botão "Imprimir" que imprime **somente o recibo** (CSS `@media print`)
- Formato otimizado para impressão em 80mm (cupom)

#### Redesign do Cálculo de Preço no Modal

- Removida seleção manual de tarifa (agora é automática pelas regras)
- Exibe breakdown: diárias + horas com valores individuais
- Nota explicativa da regra aplicada
- Botão de confirmação mostra o valor: "Pagar R$ X,XX"

#### Arquivos Alterados

**Backend:**
- `backend/src/modules/parking/services/pricing.service.ts` — Reescrito com lógica de regras (threshold 6h)
- `backend/src/modules/parking/parking.service.ts` — Checkout usa `PricingService.calculateFee()`

**Frontend:**
- `frontend/src/utils/pricing.ts` — Cálculo espelhado no frontend para exibição em tempo real
- `frontend/src/App.tsx` — Integração do ToastContainer global
- `frontend/src/components/ParkingPanel/ParkingPanel.tsx` — Prop `onToast`, toast no check-in
- `frontend/src/components/ParkingPanel/CheckoutModal.tsx` — Cálculo automático, recibo pós-checkout
- `frontend/src/components/ParkingPanel/PricingCalculation.tsx` — Novo layout com breakdown
- `frontend/src/components/ParkingPanel/PricingCalculation.css` — Estilos do novo layout
- `frontend/src/components/ParkingPanel/CheckoutReceipt.tsx` — **Novo** componente de recibo
- `frontend/src/components/ParkingPanel/CheckoutReceipt.css` — **Novo** estilos + print
- `frontend/src/components/Toast/Toast.tsx` — **Novo** componente de toast
- `frontend/src/components/Toast/Toast.css` — **Novo** estilos do toast
- `frontend/src/hooks/useToast.ts` — **Novo** hook para gerenciar toasts
- `frontend/src/index.css` — Estilos globais de impressão (`@media print`)

---

## Branch: `feature/wash-queue-vehicle-type-fix`

### Commit 1: `feat: fix vehicle type in wash orders + add timestamps`

**Data:** 27/05/2026

#### Fix: Tipo de Veículo não populando na Fila de Lavagem

**Problema:** O formulário de nova ordem de lavagem usava IDs hardcoded (`'1'`, `'2'`, `'3'`) que não correspondiam aos UUIDs reais do banco de dados. Além disso, o `vehicleTypeId` selecionado não era enviado ao backend.

**Solução:**
- `NewOrderForm` agora busca tipos de veículo da API (`/api/vehicle-types`)
- O UUID real do tipo selecionado é enviado ao backend na criação da ordem
- Backend aceita `vehicleTypeId` opcional no body da request
- Resposta da API inclui dados completos do `vehicleType` (id, name, code)

#### Feature: Data/Hora de Entrada, Saída e Permanência

Implementado no `WashOrderCard`:
- **Entrada** — data/hora de criação da ordem
- **Início** — data/hora que o serviço começou
- **Saída** — data/hora de conclusão
- **Permanência** — timer em tempo real (HH:MM:SS) que atualiza a cada segundo

#### Arquivos Alterados

**Backend:**
- `backend/src/modules/wash-orders/wash-orders.validator.ts` — Schema aceita `vehicleTypeId` opcional
- `backend/src/modules/wash-orders/wash-orders.controller.ts` — Passa `vehicleTypeId` ao service
- `backend/src/modules/wash-orders/wash-orders.service.ts` — Usa `vehicleTypeId` do request, retorna dados na resposta

**Frontend:**
- `frontend/src/components/WashQueue/NewOrderForm.tsx` — Busca tipos da API, envia UUID real
- `frontend/src/components/WashQueue/WashOrderCard.tsx` — Exibe timestamps + timer de permanência
- `frontend/src/components/WashQueue/WashOrderCard.css` — Estilos para elapsed-time
- `frontend/src/api/washOrders.ts` — `createWashOrder` aceita `vehicleTypeId`
- `frontend/src/types/washOrders.ts` — `CreateWashOrderRequest` inclui `vehicleTypeId?`
