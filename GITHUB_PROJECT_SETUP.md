# Configuração do Quadro do GitHub (Project Board)

## Passo 1: Criar o Project Board

1. Vá para: https://github.com/IA-para-DEVs-SCTEC-T2/parking-wash/projects
2. Clique em "New project"
3. **Nome:** "ParkingWash Development"
4. **Descrição:** "Quadro de desenvolvimento do sistema ParkingWash"
5. **Template:** Selecione "Table" ou "Board"
6. Clique em "Create project"

## Passo 2: Configurar Colunas

Crie as seguintes colunas no quadro:

1. **Backlog** - Tarefas não iniciadas
2. **À fazer** - Tarefas prontas para começar
3. **Em andamento** - Tarefas em desenvolvimento
4. **Bloqueado** - Tarefas aguardando algo
5. **Em revisão** - Tarefas aguardando revisão/PR
6. **Concluído** - Tarefas finalizadas

## Passo 3: Adicionar Issues ao Quadro

1. Vá para a aba "Issues"
2. Crie as 26 issues conforme o template em `ISSUES_TO_CREATE.md`
3. Para cada issue criada, adicione ao project board:
   - Clique na issue
   - Clique em "Projects" na barra lateral
   - Selecione "ParkingWash Development"
   - Escolha a coluna apropriada

## Passo 4: Configurar Automação

1. Vá para "Project settings"
2. Ative "Automation":
   - Pull requests merged → Move to "Concluído"
   - Issues closed → Move to "Concluído"
   - Pull requests opened → Move to "Em revisão"

## Passo 5: Adicionar Colaboradores

1. Vá para "Settings" → "Collaborators"
2. Clique em "Add people"
3. Adicione os colaboradores obrigatórios do projeto

## Estrutura do Quadro

```
┌─────────────────────────────────────────────────────────────┐
│                  ParkingWash Development                    │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────┤
│ Backlog  │ À fazer  │ Em anda- │ Bloqueado│ Em revi- │ Con- │
│          │          │ mento    │          │ são      │ cluído│
├──────────┼──────────┼──────────┼──────────┼──────────┼──────┤
│ Issue 1  │ Issue 5  │ Issue 10 │ Issue 15 │ Issue 20 │ Issue│
│ Issue 2  │ Issue 6  │ Issue 11 │ Issue 16 │ Issue 21 │ 25   │
│ Issue 3  │ Issue 7  │ Issue 12 │ Issue 17 │ Issue 22 │ Issue│
│ Issue 4  │ Issue 8  │ Issue 13 │ Issue 18 │ Issue 23 │ 26   │
│          │ Issue 9  │ Issue 14 │ Issue 19 │ Issue 24 │      │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────┘
```

## Próximos Passos

1. ✅ Criar o Project Board
2. ✅ Configurar as colunas
3. ✅ Criar as 26 issues
4. ✅ Adicionar issues ao quadro
5. ✅ Configurar automação
6. ✅ Adicionar colaboradores

## Links Úteis

- **Project Board:** https://github.com/IA-para-DEVs-SCTEC-T2/parking-wash/projects
- **Issues:** https://github.com/IA-para-DEVs-SCTEC-T2/parking-wash/issues
- **Settings:** https://github.com/IA-para-DEVs-SCTEC-T2/parking-wash/settings
- **Collaborators:** https://github.com/IA-para-DEVs-SCTEC-T2/parking-wash/settings/access
