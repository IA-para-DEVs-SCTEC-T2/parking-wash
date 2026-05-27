# Regras de Precificação — ParkingWash

## Regras de Cobrança

### 1. Primeira Hora (até 60 minutos)
- **Valor fixo: R$ 10,00**
- Qualquer permanência de 1 minuto até 60 minutos cobra R$ 10,00

### 2. Frações Adicionais (após a primeira hora)
- **R$ 5,00 por cada 30 minutos** (ou fração de 30 min)
- Exemplos:
  - 1h01 a 1h30 → R$ 15,00 (10 + 5)
  - 1h31 a 2h00 → R$ 20,00 (10 + 5 + 5)
  - 2h01 a 2h30 → R$ 25,00 (10 + 5 + 5 + 5)
  - 3h00 → R$ 30,00 (10 + 4×5)
  - 4h00 → R$ 40,00 (10 + 6×5)
  - 5h00 → R$ 50,00 (10 + 8×5)

### 3. Diária (teto automático)
- **Valor: R$ 60,00**
- Aplica automaticamente quando o cálculo horário atinge ou ultrapassa R$ 60
- Isso ocorre a partir de ~5h30 de permanência (10 + 9×5 = 55, 10 + 10×5 = 60)
- Qualquer permanência de 5h31 até 24h00 cobra R$ 60,00

### 4. Excedente (após 24 horas)
- Após 24h, inicia-se **nova cobrança**
- Cada bloco de 24h = 1 diária (R$ 60)
- O período restante após os blocos de 24h segue as regras 1-3

---

## Tabela de Exemplos

| Permanência | Cálculo | Total |
|-------------|---------|-------|
| 15 min | 1ª hora | R$ 10,00 |
| 45 min | 1ª hora | R$ 10,00 |
| 1h00 | 1ª hora | R$ 10,00 |
| 1h15 | 10 + 5 (1 fração) | R$ 15,00 |
| 1h30 | 10 + 5 (1 fração) | R$ 15,00 |
| 1h45 | 10 + 5 + 5 (2 frações) | R$ 20,00 |
| 2h00 | 10 + 5 + 5 (2 frações) | R$ 20,00 |
| 2h30 | 10 + 5 + 5 + 5 (3 frações) | R$ 25,00 |
| 3h00 | 10 + 4×5 | R$ 30,00 |
| 4h00 | 10 + 6×5 | R$ 40,00 |
| 5h00 | 10 + 8×5 | R$ 50,00 |
| 5h30 | 10 + 9×5 = 55 | R$ 55,00 |
| 6h00 | 10 + 10×5 = 60 → Diária | R$ 60,00 |
| 8h00 | Diária (teto) | R$ 60,00 |
| 12h00 | Diária (teto) | R$ 60,00 |
| 24h00 | 1 diária | R$ 60,00 |
| 25h00 | 1 diária + 1ª hora | R$ 70,00 |
| 25h30 | 1 diária + 10 + 5 | R$ 75,00 |
| 26h00 | 1 diária + 10 + 5 + 5 | R$ 80,00 |
| 30h00 | 1 diária + diária (excedente >5h30) | R$ 120,00 |
| 48h00 | 2 diárias | R$ 120,00 |
| 49h30 | 2 diárias + 10 + 5 | R$ 135,00 |

---

## Tarifas por Tipo de Veículo

Os valores acima são para **Carro** (tipo padrão). Cada tipo tem suas próprias tarifas:

| Tipo | 1ª Hora | Fração 30min | Diária |
|------|---------|--------------|--------|
| Motocicleta | R$ 5,00 | R$ 2,50* | R$ 30,00 |
| Carro | R$ 10,00 | R$ 5,00 | R$ 60,00 |
| Motorhome | R$ 20,00 | R$ 10,00* | R$ 120,00 |

> *A fração é sempre 50% do valor da primeira hora (R$ 5 para fração de R$ 10/hora)

**Nota**: A fração fixa de R$ 5,00 é usada para todos os tipos no momento. Os valores por tipo de veículo afetam apenas a primeira hora e a diária.

---

## Implementação Técnica

### Backend
- Arquivo: `backend/src/modules/parking/services/pricing.service.ts`
- Classe: `PricingService`
- Método principal: `calculateFee(entry, exit, hourlyRate, dailyRate)`

### Frontend
- Arquivo: `frontend/src/utils/pricing.ts`
- Função: `calculatePricing(entryTime, hourlyRate, dailyRate)`

### Fluxo no Checkout
1. Backend calcula a tarifa automaticamente baseado na duração
2. Não há mais opção manual de "aplicar diária" — a diária é aplicada automaticamente quando o valor horário atinge o teto
3. O frontend exibe o cálculo em tempo real no modal de checkout

---

## Configuração

Variáveis de ambiente (valores padrão):
```
HOURLY_RATE=10.00      # Valor da primeira hora (Carro)
DAILY_RATE_CAP=60.00   # Valor da diária (Carro)
```

Tarifas por tipo de veículo são configuráveis via API:
```
PATCH /api/vehicle-types/:id
{ "hourlyRate": 10, "dailyRate": 60 }
```
