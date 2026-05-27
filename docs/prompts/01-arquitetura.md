# Ciclo 1: Arquitetura do Sistema

## Prompt Utilizado

```
Você é um arquiteto de software especializado em sistemas web. Preciso que você projete a arquitetura de um sistema chamado ParkingWash com as seguintes características:

1. **Funcionalidades principais:**
   - Check-in e checkout de veículos com cálculo automático de tarifa
   - Fila de lavagem com máquina de estados (Waiting → InProgress → Completed)
   - Listagem de registros com filtros por status

2. **Stack técnico:**
   - Backend: Node.js + Express + TypeScript
   - Frontend: React + Vite + TypeScript
   - Banco de dados: Supabase (PostgreSQL gerenciado)
   - Validação: Zod
   - Testes: Jest + fast-check (property-based testing)

3. **Requisitos não-funcionais:**
   - Separação clara de responsabilidades (camadas)
   - Validação de entrada na borda
   - Tratamento centralizado de erros
   - Testes com mocks do banco de dados
   - Pipeline CI/CD com GitHub Actions

Por favor, forneça:
- Diagrama da arquitetura em camadas
- Estrutura de pastas do projeto
- Interfaces TypeScript principais
- Endpoints da API REST
- Modelos de dados (DDL SQL)
- Estratégia de testes (property-based + example-based)
- Hierarquia de erros
```

## Resposta Obtida da IA

A IA forneceu uma resposta completa incluindo:

1. **Diagrama de arquitetura** em Mermaid mostrando fluxo Frontend → API → Supabase
2. **Estrutura de pastas** bem organizada com separação clara entre config, db, middleware e modules
3. **Interfaces TypeScript** para ParkingRecord, WashOrder, WashService com tipos bem definidos
4. **Endpoints REST** documentados com métodos HTTP, caminhos e descrições
5. **Modelos de dados** com DDL SQL completo incluindo índices
6. **Validação de placa** com regex para formatos legado (AAA-9999) e Mercosul (AAA9A99)
7. **Máquina de estados** para WashOrder com transições válidas
8. **Middleware de erro** centralizado com formato padronizado
9. **Estratégia de testes** com property-based testing usando fast-check
10. **Geradores (arbitraries)** reutilizáveis para testes

## Limitações Identificadas

1. **Falta de detalhes sobre configuração de ambiente**: A resposta não especificava como as tarifas (HOURLY_RATE, DAILY_RATE_CAP) seriam lidas de variáveis de ambiente com fallback seguro.

2. **Fórmula de cálculo de tarifa ambígua**: A resposta inicial não deixava claro se o cálculo era `Math.ceil(duration_minutes / 60) * HOURLY_RATE` ou `Math.floor(...)`, e como o teto diário seria aplicado.

3. **Falta de especificação de timestamps**: Não estava claro se os timestamps deveriam ser em ISO 8601 UTC ou em outro formato.

4. **Cobertura de testes incompleta**: A resposta não mapeava explicitamente quais requisitos cada teste de propriedade validava.

5. **Falta de detalhes sobre mocking do Supabase**: Não havia exemplo concreto de como mockar o cliente Supabase nos testes.

## Mudanças Aplicadas

1. **Configuração de ambiente refinada**: Adicionado `env.ts` com leitura de `HOURLY_RATE` e `DAILY_RATE_CAP` com fallback seguro (se <= 0, usar padrão).

2. **Fórmula de cálculo explícita**: Documentado que `duration_minutes = Math.max(1, Math.floor((exit_time - entry_time) / 60_000))`, `hours = Math.ceil(duration_minutes / 60)`, e `total_amount = Math.min(hours * HOURLY_RATE, DAILY_RATE_CAP)`.

3. **Timestamps em ISO 8601 UTC**: Especificado que todos os timestamps devem estar em formato ISO 8601 UTC (ex: "2024-01-15T10:00:00Z").

4. **Mapeamento de requisitos para testes**: Criada tabela explícita mapeando cada requisito para a propriedade ou cenário de teste correspondente.

5. **Exemplo concreto de mock**: Adicionado código TypeScript mostrando como mockar o Supabase com `jest.mock()` e configurar retornos esperados.

6. **Propriedades de teste numeradas**: Cada propriedade foi numerada (P1-P12) e vinculada aos requisitos específicos que valida.

