# Referência Rápida - Precificação do Estacionamento

## Tabela de Preços Rápida

| Duração | Regra | Cálculo | Exemplo (R$10/h, R$60/dia) |
|---------|-------|---------|---------------------------|
| 30 min | Hora | 1h × tarifa | R$ 10.00 |
| 1h 30min | Hora | 2h × tarifa | R$ 20.00 |
| 3 horas | Hora | 3h × tarifa | R$ 30.00 |
| 6 horas | Hora | 6h × tarifa | R$ 60.00 |
| 7 horas | Diária | 1 diária | R$ 60.00 |
| 12 horas | Diária | 1 diária | R$ 60.00 |
| 24 horas | Diária | 1 diária | R$ 60.00 |
| 25 horas | Diária + Hora | 1 dia + 1h | R$ 70.00 |
| 28 horas | Diária + Hora | 1 dia + 4h | R$ 100.00 |
| 31 horas | Diária + Diária | 1 dia + 1 dia | R$ 120.00 |
| 48 horas | Diária × 2 | 2 dias | R$ 120.00 |
| 52 horas | Diária × 2 + Hora | 2 dias + 4h | R$ 160.00 |
| 55 horas | Diária × 3 | 2 dias + 1 dia | R$ 180.00 |

## Regras em Uma Linha

```
≤ 6h: ceil(min/60) × hourly_rate
> 6h ≤ 24h: daily_rate
> 24h: floor(h/24) × daily_rate + (resto > 6h ? daily_rate : ceil(resto) × hourly_rate)
```

## Código de Uso

```typescript
import { PricingService } from './services/pricing.service';

// Calcular tarifa
const fee = PricingService.calculateProgressiveFee(
  new Date('2024-01-01T10:00:00Z'),  // entrada
  new Date('2024-01-02T17:00:00Z'),  // saída (31 horas depois)
  10.00,  // tarifa horária
  60.00   // tarifa diária
);

console.log(fee); // 120.00
```

## Variáveis de Ambiente

```env
HOURLY_RATE=10.00      # Tarifa por hora
DAILY_RATE_CAP=60.00   # Tarifa por dia (24h)
```

## Arquivo Principal

📁 `src/modules/parking/services/pricing.service.ts`

## Testes

📁 `src/modules/parking/services/pricing.service.test.ts`

Executar: `npm test -- pricing.service.test.ts`

## Documentação Completa

📄 `PRICING_LOGIC.md` - Guia técnico detalhado

## Fluxo de Checkout

```
CheckIn → Armazena entry_time
   ↓
CheckOut → Calcula duração
   ↓
PricingService.calculateProgressiveFee()
   ↓
Armazena total_amount
   ↓
Retorna para confirmação
```

## Dicas

✅ **Bom**: DAILY_RATE < 24 × HOURLY_RATE (incentiva permanências longas)
❌ **Ruim**: DAILY_RATE > 24 × HOURLY_RATE (penaliza permanências longas)

Exemplo:
- ✅ HOURLY_RATE = R$ 10, DAILY_RATE = R$ 60 (24h = R$ 240 > R$ 60)
- ❌ HOURLY_RATE = R$ 10, DAILY_RATE = R$ 300 (24h = R$ 240 < R$ 300)

## Casos de Teste Principais

```typescript
// Até 6h - por hora
calculateProgressiveFee(entry, exit, 10, 60) // 3h = R$ 30

// 6-24h - 1 diária
calculateProgressiveFee(entry, exit, 10, 60) // 7h = R$ 60

// >24h - múltiplas diárias
calculateProgressiveFee(entry, exit, 10, 60) // 31h = R$ 120
calculateProgressiveFee(entry, exit, 10, 60) // 28h = R$ 100
```

## Integração com Tipos de Veículo

Cada tipo de veículo tem suas próprias tarifas:

```sql
SELECT id, name, hourly_rate, daily_rate 
FROM vehicle_types 
WHERE is_active = true;
```

Durante checkout, o sistema usa as tarifas do tipo de veículo associado.

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Valor muito alto | Reduzir HOURLY_RATE ou DAILY_RATE_CAP |
| Valor muito baixo | Aumentar HOURLY_RATE ou DAILY_RATE_CAP |
| Arredondamento errado | Verificar se duração está em minutos |
| Tipo de veículo não encontrado | Usar tarifas padrão do config |

## Contato

Para dúvidas, consulte `PRICING_LOGIC.md` ou revise os testes em `pricing.service.test.ts`.
