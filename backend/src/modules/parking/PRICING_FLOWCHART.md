# Fluxograma de Precificação

## Árvore de Decisão

```
┌─────────────────────────────────────────────────────────────┐
│  Calcular Duração: exit_time - entry_time                  │
│  Converter para horas: durationMs / 3600000                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Duração ≤ 6 horas?    │
        └────────┬───────────────┘
                 │
        ┌────────┴────────┐
        │ SIM             │ NÃO
        ▼                 ▼
    ┌─────────────┐   ┌──────────────────┐
    │ REGRA 1     │   │ Duração ≤ 24h?   │
    │ Cobrança    │   └────┬─────────────┘
    │ por Hora    │        │
    │             │   ┌────┴────┐
    │ Fórmula:    │   │ SIM      │ NÃO
    │ ceil(min/60)│   ▼          ▼
    │ × hourly    │ ┌──────┐  ┌──────────────┐
    │             │ │REGRA2│  │ REGRA 3      │
    │ Exemplo:    │ │Cobrança
    │ 3h = R$30   │ │1 Diária
    │ 6h = R$60   │ │      │  │ Múltiplas    │
    └─────────────┘ │Fórmula:
    │ daily_rate │  │ Diárias + Fração
    │             │  │
    │ Exemplo:    │  │ Fórmula:
    │ 7h = R$60   │  │ fullDays × daily
    │ 24h = R$60  │  │ + (resto > 6h ?
    └─────────────┘  │   daily : 
                     │   ceil(resto) × hourly)
                     │
                     │ Exemplo:
                     │ 31h = R$120
                     │ 28h = R$100
                     │ 55h = R$180
                     └──────────────┘
```

## Fluxo de Checkout Completo

```
┌──────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO CLICA EM "CHECKOUT"                              │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. SISTEMA RECUPERA REGISTRO DE ESTACIONAMENTO              │
│    - ID do registro                                          │
│    - entry_time                                              │
│    - vehicle_type_id                                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. SISTEMA CALCULA DURAÇÃO                                  │
│    exit_time = NOW()                                         │
│    durationMs = exit_time - entry_time                       │
│    durationMinutes = floor(durationMs / 60000)              │
│    durationHours = durationMinutes / 60                      │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. SISTEMA RECUPERA TARIFAS                                 │
│    IF vehicle_type_id EXISTS:                               │
│      hourlyRate = vehicle_type.hourly_rate                  │
│      dailyRate = vehicle_type.daily_rate                    │
│    ELSE:                                                     │
│      hourlyRate = config.HOURLY_RATE                        │
│      dailyRate = config.DAILY_RATE_CAP                      │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. SISTEMA CHAMA PRICINGSERVICE.CALCULATEPROGRESSIVEFEE()   │
│    fee = calculateProgressiveFee(                           │
│      entryTime,                                              │
│      exitTime,                                               │
│      hourlyRate,                                             │
│      dailyRate                                               │
│    )                                                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ ÁRVORE DE DECISÃO      │
        │ (veja acima)           │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Retorna: fee       │
        │ (formatado 2 casas)│
        └────────┬───────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. SISTEMA ATUALIZA REGISTRO                                │
│    UPDATE parking_records SET:                              │
│      status = 'Exited'                                       │
│      exit_time = NOW()                                       │
│      duration_minutes = durationMinutes                      │
│      total_amount = fee                                      │
│      applied_daily_rate = (durationHours > 6)               │
│    WHERE id = recordId                                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. SISTEMA RETORNA DADOS PARA CONFIRMAÇÃO                   │
│    {                                                         │
│      id: "...",                                              │
│      licensePlate: "ABC-1234",                              │
│      entryTime: "2024-01-01T10:00:00Z",                     │
│      exitTime: "2024-01-02T17:00:00Z",                      │
│      durationMinutes: 1860,                                  │
│      totalAmount: 120.00,                                    │
│      appliedDailyRate: true,                                │
│      status: "Exited"                                        │
│    }                                                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. OPERADOR VISUALIZA MODAL COM INFORMAÇÕES                 │
│    - Placa do veículo                                        │
│    - Tipo de veículo                                         │
│    - Hora de entrada                                         │
│    - Hora de saída                                           │
│    - Tempo estacionado                                       │
│    - Tarifa horária                                          │
│    - Tarifa diária                                           │
│    - VALOR A PAGAR                                           │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 9. OPERADOR CONFIRMA CHECKOUT                               │
│    - Clica em "Confirmar"                                    │
│    - Sistema processa pagamento                              │
│    - Registro é finalizado                                   │
└──────────────────────────────────────────────────────────────┘
```

## Matriz de Decisão - Exemplos Práticos

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ENTRADA: Duração em Horas                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  0.5h (30 min)  ──→ ≤ 6h  ──→ REGRA 1  ──→ 1h × R$10 = R$10.00       │
│                                                                         │
│  3h             ──→ ≤ 6h  ──→ REGRA 1  ──→ 3h × R$10 = R$30.00       │
│                                                                         │
│  6h             ──→ ≤ 6h  ──→ REGRA 1  ──→ 6h × R$10 = R$60.00       │
│                                                                         │
│  7h             ──→ > 6h  ──→ REGRA 2  ──→ 1 diária = R$60.00        │
│                  ≤ 24h                                                 │
│                                                                         │
│  12h            ──→ > 6h  ──→ REGRA 2  ──→ 1 diária = R$60.00        │
│                  ≤ 24h                                                 │
│                                                                         │
│  24h            ──→ > 6h  ──→ REGRA 2  ──→ 1 diária = R$60.00        │
│                  ≤ 24h                                                 │
│                                                                         │
│  25h (1d + 1h)  ──→ > 24h ──→ REGRA 3  ──→ 1d + 1h = R$70.00        │
│                                                                         │
│  28h (1d + 4h)  ──→ > 24h ──→ REGRA 3  ──→ 1d + 4h = R$100.00       │
│                  resto ≤ 6h                                            │
│                                                                         │
│  31h (1d + 7h)  ──→ > 24h ──→ REGRA 3  ──→ 1d + 1d = R$120.00       │
│                  resto > 6h                                            │
│                                                                         │
│  48h (2d)       ──→ > 24h ──→ REGRA 3  ──→ 2d = R$120.00            │
│                                                                         │
│  52h (2d + 4h)  ──→ > 24h ──→ REGRA 3  ──→ 2d + 4h = R$160.00       │
│                  resto ≤ 6h                                            │
│                                                                         │
│  55h (2d + 7h)  ──→ > 24h ──→ REGRA 3  ──→ 2d + 1d = R$180.00       │
│                  resto > 6h                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Pseudocódigo da Lógica

```pseudocode
FUNÇÃO calculateProgressiveFee(entryTime, exitTime, hourlyRate, dailyRate):
  
  durationMs = exitTime - entryTime
  durationMinutes = MAX(1, FLOOR(durationMs / 60000))
  durationHours = durationMinutes / 60
  
  SE durationHours ≤ 6:
    hours = CEIL(durationMinutes / 60)
    fee = hours × hourlyRate
    RETORNA fee
  
  SE durationHours ≤ 24:
    RETORNA dailyRate
  
  // Mais de 24 horas
  fullDays = FLOOR(durationHours / 24)
  remainingHours = durationHours MOD 24
  
  totalFee = fullDays × dailyRate
  
  SE remainingHours > 6:
    totalFee = totalFee + dailyRate
  SENÃO SE remainingHours > 0:
    fractionalHours = CEIL(remainingHours)
    totalFee = totalFee + (fractionalHours × hourlyRate)
  
  RETORNA totalFee
FIM FUNÇÃO
```

## Integração com Banco de Dados

```sql
-- Recuperar tarifas do tipo de veículo
SELECT hourly_rate, daily_rate 
FROM vehicle_types 
WHERE id = $1 AND is_active = true;

-- Atualizar registro com valor calculado
UPDATE parking_records 
SET 
  status = 'Exited',
  exit_time = NOW(),
  duration_minutes = $1,
  total_amount = $2,
  applied_daily_rate = $3
WHERE id = $4;
```

## Casos de Teste Críticos

```
┌─────────────────────────────────────────────────────────────┐
│ TESTE 1: Mínimo (1 minuto)                                 │
│ Entrada: 1 minuto                                           │
│ Esperado: 1 hora × tarifa = R$10.00                        │
│ Status: ✅ PASSA                                            │
├─────────────────────────────────────────────────────────────┤
│ TESTE 2: Limite Regra 1 (6 horas)                          │
│ Entrada: 6 horas                                            │
│ Esperado: 6 horas × tarifa = R$60.00                       │
│ Status: ✅ PASSA                                            │
├─────────────────────────────────────────────────────────────┤
│ TESTE 3: Transição Regra 1→2 (6h 1min)                     │
│ Entrada: 6 horas 1 minuto                                   │
│ Esperado: 1 diária = R$60.00                               │
│ Status: ✅ PASSA                                            │
├─────────────────────────────────────────────────────────────┤
│ TESTE 4: Limite Regra 2 (24 horas)                         │
│ Entrada: 24 horas                                           │
│ Esperado: 1 diária = R$60.00                               │
│ Status: ✅ PASSA                                            │
├─────────────────────────────────────────────────────────────┤
│ TESTE 5: Transição Regra 2→3 (24h 1min)                    │
│ Entrada: 24 horas 1 minuto                                  │
│ Esperado: 1 diária + 1 hora = R$70.00                      │
│ Status: ✅ PASSA                                            │
├─────────────────────────────────────────────────────────────┤
│ TESTE 6: Fração ≤ 6h (28 horas)                            │
│ Entrada: 28 horas (1 dia + 4 horas)                        │
│ Esperado: 1 diária + 4 horas = R$100.00                    │
│ Status: ✅ PASSA                                            │
├─────────────────────────────────────────────────────────────┤
│ TESTE 7: Fração > 6h (31 horas)                            │
│ Entrada: 31 horas (1 dia + 7 horas)                        │
│ Esperado: 1 diária + 1 diária = R$120.00                   │
│ Status: ✅ PASSA                                            │
├─────────────────────────────────────────────────────────────┤
│ TESTE 8: Múltiplos dias (55 horas)                         │
│ Entrada: 55 horas (2 dias + 7 horas)                       │
│ Esperado: 2 diárias + 1 diária = R$180.00                  │
│ Status: ✅ PASSA                                            │
└─────────────────────────────────────────────────────────────┘
```

## Resumo Visual

```
DURAÇÃO          REGRA    FÓRMULA                    EXEMPLO
─────────────────────────────────────────────────────────────
≤ 6h             1        ceil(min/60) × hourly     3h = R$30
> 6h ≤ 24h       2        daily                     7h = R$60
> 24h            3        days × daily + frac       31h = R$120
```
