# Ciclo 2: Implementação do Backend

## Prompt Utilizado

```
Você é um desenvolvedor TypeScript especializado em Node.js + Express. Preciso que você implemente o backend do ParkingWash seguindo esta arquitetura:

**Contexto:**
- Stack: Node.js + Express + TypeScript
- Banco: Supabase (PostgreSQL)
- Validação: Zod
- Testes: Jest com mocks

**Módulos a implementar:**

1. **Infraestrutura (config, db, middleware):**
   - env.ts: leitura de variáveis com fallback seguro
   - supabase.ts: cliente singleton
   - errors.ts: hierarquia de erros (AppError, ValidationError, ConflictError, NotFoundError, ServiceUnavailableError)
   - error.middleware.ts: tratamento centralizado
   - validate.middleware.ts: validação com Zod
   - app.ts e server.ts: inicialização

2. **Módulo Parking:**
   - parking.types.ts: interfaces (ParkingRecord, CheckInRequest, CheckInResponse, CheckOutResponse)
   - parking.validator.ts: schema Zod para check-in
   - parking.service.ts: lógica de negócio (checkIn, checkOut, calculateFee, listRecords)
   - parking.controller.ts: handlers HTTP
   - parking.router.ts: rotas

3. **Módulo Wash-Orders:**
   - wash-orders.types.ts: interfaces
   - wash-orders.validator.ts: schemas Zod
   - wash-orders.service.ts: lógica (createOrder, advanceStatus, listOrders)
   - wash-orders.controller.ts: handlers
   - wash-orders.router.ts: rotas

4. **Módulo Wash-Services:**
   - wash-services.service.ts: listActiveServices()
   - wash-services.controller.ts: handler
   - wash-services.router.ts: rotas

**Requisitos específicos:**
- Validação de placa: legado (AAA-9999) ou Mercosul (AAA9A99)
- Cálculo de tarifa: duration_minutes = Math.max(1, Math.floor((exit_time - entry_time) / 60_000)), hours = Math.ceil(duration_minutes / 60), total_amount = Math.min(hours * HOURLY_RATE, DAILY_RATE_CAP)
- Máquina de estados para WashOrder: Waiting → InProgress → Completed
- Timestamps em ISO 8601 UTC
- Erros padronizados com statusCode
- Mocking do Supabase nos testes

Por favor, forneça o código completo para cada arquivo, seguindo as melhores práticas de TypeScript e Express.
```

## Resposta Obtida da IA

A IA forneceu código completo para:

1. **env.ts**: Leitura de variáveis com fallback seguro
2. **supabase.ts**: Cliente singleton com createClient
3. **errors.ts**: Hierarquia de erros com classes estendendo AppError
4. **error.middleware.ts**: Middleware que trata AppError e erros genéricos
5. **validate.middleware.ts**: Middleware que valida com Zod
6. **app.ts e server.ts**: Inicialização do Express
7. **parking.types.ts**: Interfaces bem definidas
8. **parking.validator.ts**: Schema Zod com regex de placa
9. **parking.service.ts**: Implementação de checkIn, checkOut, calculateFee, listRecords
10. **parking.controller.ts**: Handlers que chamam o service
11. **parking.router.ts**: Rotas registradas
12. **wash-orders.types.ts, validator.ts, service.ts, controller.ts, router.ts**: Implementação completa
13. **wash-services.service.ts, controller.ts, router.ts**: Implementação completa

## Limitações Identificadas

1. **Falta de tratamento de erro de duplicata em checkIn**: A resposta inicial não verificava se a placa já estava estacionada (status=Parked) antes de inserir novo registro.

2. **Falta de validação de transição de estado**: O advanceStatus não validava se a transição era válida (ex: Waiting→Completed deveria ser rejeitado).

3. **Falta de busca de WashService antes de criar ordem**: O createOrder não verificava se o serviço existia e estava ativo.

4. **Falta de tratamento de erro de checkout duplo**: O checkOut não verificava se o veículo já tinha sido saído (status=Exited).

5. **Falta de mapeamento de erro do Supabase para ServiceUnavailableError**: Erros de conexão com o banco não eram mapeados para HTTP 503.

6. **Falta de serialização de resposta**: Os timestamps não eram convertidos para camelCase na resposta (ex: entry_time → entryTime).

## Mudanças Aplicadas

1. **Verificação de duplicata em checkIn**: Adicionada query `select().eq('license_plate', licensePlate).eq('status', 'Parked')` antes de inserir. Se encontrar registro, lança ConflictError.

2. **Validação de transição de estado**: Adicionada lógica em advanceStatus que verifica se a transição é válida:
   - Waiting → InProgress: OK
   - InProgress → Completed: OK
   - Qualquer outra: ValidationError

3. **Busca de WashService**: Adicionada query `select().eq('id', washServiceId).single()` em createOrder. Se não encontrar ou `is_active=false`, lança ValidationError.

4. **Verificação de checkout duplo**: Adicionada verificação em checkOut: se `status=Exited`, lança ValidationError com mensagem "Este veículo já realizou checkout".

5. **Mapeamento de erro do Supabase**: Adicionado try-catch em todos os métodos do service que chama `mapSupabaseError()` para converter erros de conexão em ServiceUnavailableError.

6. **Serialização de resposta**: Adicionada função `serializeRecord()` que converte snake_case para camelCase (ex: entry_time → entryTime, exit_time → exitTime).

7. **Formatação de total_amount**: Adicionado `.toFixed(2)` ao retornar total_amount para garantir 2 casas decimais.
