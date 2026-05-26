# Ciclo 5: Pipeline CI/CD com GitHub Actions

## Prompt Utilizado

```
Você é um especialista em DevOps e CI/CD. Preciso que você crie um workflow GitHub Actions para o ParkingWash com os seguintes requisitos:

**Contexto:**
- Repositório: GitHub
- Branches: main e develop
- Backend: Node.js + TypeScript + Jest
- Frontend: React + Vite + TypeScript
- Banco de dados: Supabase (será mockado nos testes)

**Requisitos:**

1. **Trigger:**
   - Push para main ou develop
   - Pull requests para main

2. **Jobs:**
   - Backend job:
     - Checkout do código
     - Setup Node.js (versão 20)
     - npm ci (instalar dependências)
     - npm run lint (executar linter)
     - npm test -- --runInBand --forceExit (executar testes com mocks)
     - Variáveis de ambiente mock: SUPABASE_URL=mock, SUPABASE_SERVICE_KEY=mock, HOURLY_RATE=10, DAILY_RATE_CAP=80
     - Job falha se lint ou testes falharem

   - Frontend job:
     - Checkout do código
     - Setup Node.js (versão 20)
     - npm ci (instalar dependências)
     - npx vite build (executar build)
     - Executar somente após sucesso do job de backend (needs: [backend])
     - Job falha se build falhar

3. **Configuração:**
   - Arquivo: .github/workflows/ci.yml
   - Formato: YAML
   - Usar actions padrão do GitHub (actions/checkout, actions/setup-node)

4. **Comportamento esperado:**
   - Se backend falhar, frontend não executa
   - Se qualquer job falhar, workflow é marcado como falho
   - Pull requests com falhas não podem ser mergeadas (se branch protection estiver ativada)

Por favor, forneça o arquivo ci.yml completo com todas as configurações.
```

## Resposta Obtida da IA

A IA forneceu um workflow GitHub Actions com:

1. **Trigger correto**: push e pull_request para main e develop
2. **Job backend**: checkout, setup Node.js, npm ci, npm run lint, npm test
3. **Job frontend**: checkout, setup Node.js, npm ci, npx vite build
4. **Variáveis de ambiente**: SUPABASE_URL, SUPABASE_SERVICE_KEY, HOURLY_RATE, DAILY_RATE_CAP
5. **Dependência entre jobs**: frontend com `needs: [backend]`
6. **Estrutura YAML**: bem formatada e válida

## Limitações Identificadas

1. **Falta de especificação de working directory**: O workflow não especificava `working-directory: backend` e `working-directory: frontend` para os comandos npm.

2. **Falta de cache de dependências**: O workflow não utilizava cache do npm para acelerar instalações em runs subsequentes.

3. **Falta de upload de artefatos**: O build do frontend não era armazenado como artefato para possível deploy posterior.

4. **Falta de tratamento de erro explícito**: Não havia configuração explícita de `continue-on-error: false` (padrão, mas não documentado).

5. **Falta de versão específica do Node.js**: Usava `node-version: '20'` sem especificar patch version (ex: '20.10.0').

6. **Falta de timeout**: Não havia timeout configurado para os jobs, que poderiam ficar pendurados indefinidamente.

7. **Falta de notificação de falha**: Não havia step para notificar sobre falhas (ex: comentário em PR).

## Mudanças Aplicadas

1. **Working directory especificado**: Adicionado `working-directory: ./backend` e `working-directory: ./frontend` em cada step que executa comando npm.

2. **Cache de dependências**: Adicionado step `actions/cache@v3` com chave `npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}` para cachear node_modules.

3. **Upload de artefatos**: Adicionado step `actions/upload-artifact@v3` após build do frontend para armazenar `frontend/dist/` como artefato.

4. **Timeout configurado**: Adicionado `timeout-minutes: 10` em cada job para evitar que fiquem pendurados.

5. **Versão específica do Node.js**: Alterado para `node-version: '20.10.0'` para garantir consistência.

6. **Tratamento de erro explícito**: Adicionado `continue-on-error: false` em steps críticos (lint, test, build).

7. **Notificação de falha**: Adicionado step condicional `if: failure()` que comenta em PRs quando há falha.

8. **Melhor estrutura de jobs**: Reorganizado para deixar claro que frontend depende de backend com `needs: [backend]`.

9. **Variáveis de ambiente no job**: Movidas para seção `env:` do job em vez de estar em cada step.

10. **Documentação inline**: Adicionados comentários explicando cada step para facilitar manutenção futura.
