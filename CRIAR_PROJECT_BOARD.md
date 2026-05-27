# 📊 Guia Passo a Passo: Criar Project Board no GitHub

## ✅ Passo 1: Acessar a página de Projects

1. Vá para: **https://github.com/IA-para-DEVs-SCTEC-T2/parking-wash/projects**
2. Você verá a página de Projects do repositório

## ✅ Passo 2: Criar novo Project

1. Clique no botão **"New project"** (verde, no canto superior direito)
2. Preencha os campos:
   - **Project name:** `ParkingWash Development`
   - **Description:** `Quadro de desenvolvimento do sistema ParkingWash com controle de tarefas`
   - **Template:** Selecione **"Table"** (mais simples) ou **"Board"** (tipo Kanban)
3. Clique em **"Create project"**

## ✅ Passo 3: Configurar as Colunas

Se escolheu "Board", você terá colunas padrão. Modifique-as para:

### Colunas necessárias:
1. **Backlog** - Tarefas não iniciadas
2. **À fazer** - Tarefas prontas para começar
3. **Em andamento** - Tarefas em desenvolvimento
4. **Bloqueado** - Tarefas aguardando algo
5. **Em revisão** - Tarefas aguardando revisão/PR
6. **Concluído** - Tarefas finalizadas

**Como adicionar/editar colunas:**
- Clique em "..." (três pontos) na coluna
- Selecione "Edit column"
- Mude o nome conforme necessário
- Clique em "Save"

## ✅ Passo 4: Adicionar Issues ao Project

### Opção A: Adicionar Issues Existentes

1. Clique em "Add cards" ou "+" no topo do project
2. Selecione as issues que deseja adicionar
3. Arraste cada issue para a coluna apropriada

### Opção B: Criar Issues Diretamente

1. Vá para a aba **"Issues"** do repositório
2. Clique em **"New issue"**
3. Preencha o título e descrição
4. Clique em **"Submit new issue"**
5. Na issue criada, clique em **"Projects"** na barra lateral
6. Selecione **"ParkingWash Development"**
7. Escolha a coluna apropriada

## ✅ Passo 5: Organizar Issues no Quadro

**Distribuição sugerida das 26 issues:**

### Backlog (5 issues)
- Issues 1-5: Tarefas de setup e configuração

### À fazer (5 issues)
- Issues 6-10: Próximas tarefas prontas

### Em andamento (5 issues)
- Issues 11-15: Tarefas em desenvolvimento

### Bloqueado (3 issues)
- Issues 16-18: Tarefas aguardando dependências

### Em revisão (5 issues)
- Issues 19-23: Tarefas em revisão de PR

### Concluído (3 issues)
- Issues 24-26: Tarefas finalizadas

## ✅ Passo 6: Configurar Automação (Opcional)

1. Clique em **"⚙️ Settings"** (engrenagem) no topo do project
2. Ative **"Automation"**:
   - ✅ Pull requests merged → Move to "Concluído"
   - ✅ Issues closed → Move to "Concluído"
   - ✅ Pull requests opened → Move to "Em revisão"

## ✅ Passo 7: Adicionar Colaboradores

1. Vá para **Settings** → **Collaborators**
2. Clique em **"Add people"**
3. Digite o nome de usuário do GitHub
4. Selecione o nível de acesso:
   - **Pull access** - Apenas leitura
   - **Push access** - Leitura e escrita
   - **Admin access** - Controle total
5. Clique em **"Add"**

## 📸 Resultado Final

Seu quadro deve ficar assim:

```
┌─────────────────────────────────────────────────────────────────┐
│                  ParkingWash Development                        │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│ Backlog  │ À fazer  │ Em anda- │ Bloqueado│ Em revi- │ Concluído│
│          │          │ mento    │          │ são      │          │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Issue 1  │ Issue 6  │ Issue 11 │ Issue 16 │ Issue 19 │ Issue 24 │
│ Issue 2  │ Issue 7  │ Issue 12 │ Issue 17 │ Issue 20 │ Issue 25 │
│ Issue 3  │ Issue 8  │ Issue 13 │ Issue 18 │ Issue 21 │ Issue 26 │
│ Issue 4  │ Issue 9  │ Issue 14 │          │ Issue 22 │          │
│ Issue 5  │ Issue 10 │ Issue 15 │          │ Issue 23 │          │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

## 🔗 Links Úteis

- **Project Board:** https://github.com/IA-para-DEVs-SCTEC-T2/parking-wash/projects
- **Issues:** https://github.com/IA-para-DEVs-SCTEC-T2/parking-wash/issues
- **Repositório:** https://github.com/IA-para-DEVs-SCTEC-T2/parking-wash
- **Settings:** https://github.com/IA-para-DEVs-SCTEC-T2/parking-wash/settings

## ✅ Checklist de Conclusão

- [ ] Project Board criado
- [ ] 6 colunas configuradas
- [ ] Issues adicionadas ao quadro
- [ ] Automação ativada
- [ ] Colaboradores adicionados
- [ ] Quadro pronto para uso

**Pronto! Seu quadro está configurado e pronto para gerenciar o desenvolvimento do ParkingWash! 🎉**
