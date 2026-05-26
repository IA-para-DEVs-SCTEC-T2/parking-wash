# Ciclo 3: Testes com Property-Based Testing

## Prompt Utilizado

```
Você é um especialista em testes automatizados com foco em property-based testing. Preciso que você implemente uma estratégia de testes completa para o backend do ParkingWash usando Jest + fast-check.

**Contexto:**
- Framework: Jest
- Property-based testing: fast-check
- Banco de dados: Supabase (será mockado com jest.mock)
- Linguagem: TypeScript

**Requisitos:**

1. **Geradores (arbitraries) reutilizáveis em tests/arbitraries.ts:**
   - legacyPlateArb: placa legado (AAA-9999)
   - mercosulPlateArb: placa Mercosul (AAA9A99)
   - validPlateArb: qualquer placa válida
   - invalidPlateArb: string que não é placa válida
   - timestampPairArb: par (entry_time, exit_time) com entry < exit
   - durationMinutesArb: inteiro de 1 a 1440
   - hourlyRateArb: float positivo
   - dailyRateCapArb: float positivo

2. **Testes de exemplo em tests/parking.service.test.ts:**
   - Check-in válido (201)
   - Check-in com placa duplicada (409)
   - Check-in com placa inválida (422)
   - Checkout com cálculo de tarifa por hora
   - Checkout com aplicação do teto diário
   - Checkout de registro inexistente (404)
   - Checkout de veículo já saído (422)
   - Listagem sem filtro
   - Listagem com filtro de status
   - Listagem retornando lista vazia

3. **Testes de propriedade em tests/parking.service.test.ts:**
   - Property 1: check-in com placa válida sempre cria registro Parked
   - Property 2: placas inválidas são sempre rejeitadas
   - Property 4: cálculo de tarifa é determinístico para qualquer duração
   - Property 11: tarifas configuráveis são aplicadas corretamente

4. **Testes de exemplo em tests/wash-order.service.test.ts:**
   - Criação de ordem válida (201)
   - Criação com serviço inativo (422)
   - Criação com serviço inexistente (422)
   - Transição Waiting→InProgress
   - Transição InProgress→Completed
   - Transição inválida Waiting→Completed (422)
   - Ordem inexistente (404)

5. **Testes de propriedade em tests/wash-order.service.test.ts:**
   - Property 7: transições válidas atualizam status e timestamps
   - Property 8: transições inválidas são sempre rejeitadas

**Padrão de mock:**
```typescript
jest.mock('../src/db/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));
```

Por favor, forneça o código completo para os testes, seguindo as melhores práticas de Jest e fast-check.
```

## Resposta Obtida da IA

A IA forneceu:

1. **arbitraries.ts**: Geradores bem estruturados usando fc.tuple, fc.stringMatching, fc.oneof, fc.integer, fc.float
2. **parking.service.test.ts**: 10+ testes de exemplo cobrindo cenários válidos e inválidos
3. **Testes de propriedade**: Property 1, 2, 4, 11 implementadas com fc.assert e fc.property
4. **wash-order.service.test.ts**: 7+ testes de exemplo
5. **Testes de propriedade**: Property 7, 8 implementadas
6. **Mock do Supabase**: Configurado corretamente com jest.mock

## Limitações Identificadas

1. **Falta de teste para erro de infraestrutura (503)**: A resposta não incluía teste para quando o Supabase retorna erro de conexão.

2. **Falta de teste para listagem com filtro inválido (400)**: Não havia teste validando que status inválido retorna HTTP 400.

3. **Falta de teste para checkout com status inválido**: Não havia teste para quando o registro não está em status "Parked".

4. **Falta de teste para criação de ordem com placa inválida**: Não havia teste validando que placa inválida é rejeitada na criação de ordem.

5. **Falta de teste para criação de ordem com washServiceId ausente**: Não havia teste para campo obrigatório ausente.

6. **Falta de teste para listagem de ordens com filtro inválido (400)**: Não havia teste validando que status inválido retorna HTTP 400.

7. **Falta de teste para ordem inexistente em advanceStatus**: Não havia teste para quando a ordem não existe.

8. **Falta de teste para serviço de lavagem indisponível (503)**: Não havia teste para quando o Supabase está indisponível ao listar serviços.

## Mudanças Aplicadas

1. **Teste de erro de infraestrutura**: Adicionado teste que mocka `supabase.insert.mockResolvedValue({ error: new Error('Connection failed') })` e verifica que retorna ServiceUnavailableError.

2. **Teste de filtro inválido em parking**: Adicionado teste que chama `listRecords('InvalidStatus')` e verifica que retorna erro 400.

3. **Teste de checkout com status inválido**: Adicionado teste que cria registro com status "Exited" e tenta fazer checkout, verificando que retorna erro 422.

4. **Teste de criação de ordem com placa inválida**: Adicionado teste que chama `createOrder('INVALID', serviceId)` e verifica que retorna ValidationError.

5. **Teste de criação de ordem com washServiceId ausente**: Adicionado teste que chama `createOrder(plate, undefined)` e verifica que retorna ValidationError.

6. **Teste de filtro inválido em wash-orders**: Adicionado teste que chama `listOrders('InvalidStatus')` e verifica que retorna erro 400.

7. **Teste de ordem inexistente em advanceStatus**: Adicionado teste que chama `advanceStatus('non-existent-id', 'InProgress')` e verifica que retorna NotFoundError.

8. **Teste de serviço indisponível**: Adicionado teste que mocka `supabase.from.mockImplementation(() => { throw new Error('Connection failed') })` e verifica que retorna ServiceUnavailableError.

9. **Cobertura de testes expandida**: Adicionados testes para cenários de borda (lista vazia, múltiplos registros, timestamps em ISO 8601).
