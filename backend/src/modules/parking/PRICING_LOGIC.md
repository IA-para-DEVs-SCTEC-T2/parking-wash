# Lógica de Precificação do Estacionamento

## Visão Geral

O sistema de precificação do ParkingWash implementa uma estratégia progressiva de cobrança baseada no tempo de permanência do veículo no estacionamento. A lógica garante que o cliente pague o valor mais justo de acordo com sua duração de estacionamento.

## Regras de Precificação

### Regra 1: Até 6 horas - Cobrança por Hora
- **Condição**: Duração ≤ 6 horas
- **Cálculo**: `ceil(duração_em_minutos / 60) × tarifa_horária`
- **Exemplo**: 
  - 30 minutos = 1 hora × R$ 10 = **R$ 10.00**
  - 1h 30min = 2 horas × R$ 10 = **R$ 20.00**
  - 6 horas = 6 horas × R$ 10 = **R$ 60.00**

### Regra 2: Mais de 6 horas até 24 horas - 1 Diária
- **Condição**: 6 horas < Duração ≤ 24 horas
- **Cálculo**: `tarifa_diária`
- **Exemplo**:
  - 7 horas = **R$ 60.00** (1 diária)
  - 12 horas = **R$ 60.00** (1 diária)
  - 24 horas = **R$ 60.00** (1 diária)

### Regra 3: Mais de 24 horas - Múltiplas Diárias + Fração
- **Condição**: Duração > 24 horas
- **Cálculo**:
  1. Calcular dias completos: `floor(duração_em_horas / 24) × tarifa_diária`
  2. Calcular horas restantes:
     - Se restante > 6 horas: adicionar 1 diária
     - Se restante ≤ 6 horas: adicionar `ceil(horas_restantes) × tarifa_horária`

- **Exemplos**:
  - 25 horas (1 dia + 1 hora):
    - 1 dia × R$ 60 = R$ 60
    - 1 hora × R$ 10 = R$ 10
    - **Total: R$ 70.00**
  
  - 28 horas (1 dia + 4 horas):
    - 1 dia × R$ 60 = R$ 60
    - 4 horas × R$ 10 = R$ 40 (≤ 6 horas)
    - **Total: R$ 100.00**
  
  - 31 horas (1 dia + 7 horas):
    - 1 dia × R$ 60 = R$ 60
    - 7 horas > 6 horas → 1 diária = R$ 60
    - **Total: R$ 120.00**
  
  - 52 horas (2 dias + 4 horas):
    - 2 dias × R$ 60 = R$ 120
    - 4 horas × R$ 10 = R$ 40 (≤ 6 horas)
    - **Total: R$ 160.00**
  
  - 55 horas (2 dias + 7 horas):
    - 2 dias × R$ 60 = R$ 120
    - 7 horas > 6 horas → 1 diária = R$ 60
    - **Total: R$ 180.00**

## Implementação

### Arquivo Principal
- **Localização**: `src/modules/parking/services/pricing.service.ts`
- **Método**: `PricingService.calculateProgressiveFee(entryTime, exitTime, hourlyRate, dailyRate)`

### Parâmetros
- `entryTime`: Data/hora de entrada (ISO 8601 ou objeto Date)
- `exitTime`: Data/hora de saída (ISO 8601 ou objeto Date)
- `hourlyRate`: Tarifa horária em Reais (ex: 10.00)
- `dailyRate`: Tarifa diária em Reais (ex: 60.00)

### Retorno
- Valor numérico formatado com 2 casas decimais

### Exemplo de Uso
```typescript
import { PricingService } from './services/pricing.service';

const entryTime = new Date('2024-01-01T10:00:00Z');
const exitTime = new Date('2024-01-02T17:00:00Z'); // 31 horas depois
const hourlyRate = 10.00;
const dailyRate = 60.00;

const fee = PricingService.calculateProgressiveFee(
  entryTime,
  exitTime,
  hourlyRate,
  dailyRate
);

console.log(fee); // 120.00
```

## Integração com Tipos de Veículo

Cada tipo de veículo pode ter suas próprias tarifas:

```typescript
// Exemplo de tipo de veículo
{
  id: "uuid-123",
  name: "Carro",
  code: "CAR",
  hourly_rate: 10.00,
  daily_rate: 60.00,
  is_active: true
}
```

Durante o checkout, o sistema:
1. Recupera o tipo de veículo associado ao registro de estacionamento
2. Usa as tarifas específicas do tipo de veículo
3. Aplica a lógica progressiva de precificação
4. Armazena o resultado em `total_amount`

## Testes

Testes abrangentes estão disponíveis em:
- **Localização**: `src/modules/parking/services/pricing.service.test.ts`

Os testes cobrem:
- Cobrança por hora (até 6 horas)
- Cobrança de 1 diária (6-24 horas)
- Cobrança de múltiplas diárias com frações (> 24 horas)
- Casos extremos (1 minuto, exatamente 6 horas, etc.)
- Formatação de valores

## Configuração

As tarifas padrão são definidas em `src/config/env.ts`:

```typescript
export const config = {
  hourlyRate: parseFloat(process.env.HOURLY_RATE ?? '10.00'),
  dailyRateCap: parseFloat(process.env.DAILY_RATE_CAP ?? '80.00'),
  // ... outras configurações
};
```

### Variáveis de Ambiente
- `HOURLY_RATE`: Tarifa horária padrão (padrão: 10.00)
- `DAILY_RATE_CAP`: Tarifa diária padrão (padrão: 80.00)

## Notas Importantes

1. **Arredondamento**: Horas são sempre arredondadas para cima (ceil)
2. **Mínimo**: Qualquer permanência é cobrada no mínimo como 1 hora
3. **Precisão**: Todos os valores são formatados com 2 casas decimais
4. **Dia = 24 horas**: Um dia completo é sempre 24 horas, não importa o horário de entrada/saída
5. **Fuso Horário**: O sistema usa timestamps ISO 8601 (UTC) para garantir consistência

## Fluxo de Checkout

```
1. Usuário clica em "Checkout"
2. Sistema calcula duração (exit_time - entry_time)
3. Sistema recupera tipo de veículo e suas tarifas
4. Sistema aplica lógica progressiva de precificação
5. Sistema armazena:
   - total_amount: valor calculado
   - applied_daily_rate: booleano indicando se tarifa diária foi aplicada
   - duration_minutes: duração em minutos
6. Sistema retorna dados para confirmação do operador
7. Operador confirma e processa pagamento
```

## Exemplos de Cálculo Prático

### Cenário 1: Moto estacionada por 3 horas
- Tarifa horária: R$ 5.00
- Tarifa diária: R$ 30.00
- Duração: 3 horas
- **Cálculo**: 3 horas × R$ 5.00 = **R$ 15.00**

### Cenário 2: Carro estacionado por 8 horas
- Tarifa horária: R$ 10.00
- Tarifa diária: R$ 60.00
- Duração: 8 horas
- **Cálculo**: 1 diária = **R$ 60.00**

### Cenário 3: Motorhome estacionado por 2 dias e 3 horas
- Tarifa horária: R$ 15.00
- Tarifa diária: R$ 100.00
- Duração: 51 horas
- **Cálculo**:
  - 2 dias × R$ 100 = R$ 200
  - 3 horas × R$ 15 = R$ 45 (≤ 6 horas)
  - **Total: R$ 245.00**

### Cenário 4: Carro estacionado por 2 dias e 7 horas
- Tarifa horária: R$ 10.00
- Tarifa diária: R$ 60.00
- Duração: 55 horas
- **Cálculo**:
  - 2 dias × R$ 60 = R$ 120
  - 7 horas > 6 horas → 1 diária = R$ 60
  - **Total: R$ 180.00**
