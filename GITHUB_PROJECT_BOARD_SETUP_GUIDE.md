# 🛠️ Guia Prático: Criar Cards no GitHub Project Board

## 📌 Pré-requisitos

- Repositório GitHub criado
- Acesso de administrador ao repositório
- GitHub Project Board habilitado

---

## 🚀 Passo 1: Criar o Project Board

### No GitHub:
1. Vá para o repositório
2. Clique em **"Projects"** (aba superior)
3. Clique em **"New project"**
4. Selecione **"Table"** ou **"Board"** (recomendado: Board para Kanban)
5. Nome: **"ParkingWash Development"**
6. Descrição: **"Quadro Kanban para desenvolvimento do projeto ParkingWash com metodologia Kanban e GitFlow"**
7. Clique em **"Create project"**

### Configurar Colunas:
1. Clique em **"+ Add column"**
2. Crie as seguintes colunas na ordem:
   - **Backlog**
   - **A Fazer**
   - **Em Andamento**
   - **Bloqueado**
   - **Em Revisão**
   - **Concluído**

---

## 📋 Passo 2: Criar Cards (Template)

### Estrutura de Card

Cada card deve ter:

```
Título: [Número]. [Nome da Tarefa]
Exemplo: 1. Criar Repositório e Configurar Colaboradores

Descrição:
---
## 📌 Informações Gerais

**Branch:** setup/initial-setup
**Tipo:** Setup
**Prioridade:** Alta
**Estimativa:** 1 dia

## 📝 Descrição
[Descrição clara da tarefa]

## 🎯 Objetivo
- [Objetivo 1]
- [Objetivo 2]
- [Objetivo 3]

## ✅ Critérios de Conclusão
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

## 🔗 Relacionado com
- Depende de: [Card X]
- Bloqueia: [Card Y]

## 📚 Documentação
- [Link para arquivo]
- [Link para commit]

## 💬 Notas
[Notas adicionais se necessário]
---
```

---

## 📊 Cards para Criar (Ordem Recomendada)

### ✅ Card 1: Criar Repositório e Configurar Colaboradores

```
Título: 1. Criar Repositório e Configurar Colaboradores

Descrição:
---
## 📌 Informações Gerais
**Branch:** setup/initial-setup
**Tipo:** Setup
**Prioridade:** Alta
**Estimativa:** 1 dia

## 📝 Descrição
Criar repositório privado no GitHub, adicionar colaboradores e configurar permissões iniciais.

## 🎯 Objetivo
- Estabelecer base para versionamento
- Configurar acesso de colaboradores
- Definir regras de proteção de branch

## ✅ Critérios de Conclusão
- [x] Repositório criado em GitHub
- [x] Colaboradores adicionados com permissões corretas
- [x] Branch `main` protegida
- [x] Branch `develop` criada
- [x] Regras de PR configuradas

## 🔗 Relacionado com
- Depende de: Nenhuma
- Bloqueia: Card 2, 3, 4

## 📚 Documentação
- Repositório: https://github.com/IA-para-DEVs-SCTEC-T2/parking-wash

## 💬 Notas
Primeira tarefa do projeto. Estabelece base para todo o desenvolvimento.
---
```

**Coluna:** Concluído
**Labels:** setup, high-priority
**Assignee:** [Seu nome]

---

### ✅ Card 2: Definir Domínio e Escopo da Aplicação

```
Título: 2. Definir Domínio e Escopo da Aplicação

Descrição:
---
## 📌 Informações Gerais
**Branch:** docs/project-scope
**Tipo:** Documentação
**Prioridade:** Alta
**Estimativa:** 1 dia

## 📝 Descrição
Definir o domínio (estacionamento + lavação), escopo das funcionalidades e restrições do projeto.

## 🎯 Objetivo
- Estabelecer limites claros do projeto
- Documentar funcionalidades principais
- Identificar restrições técnicas

## ✅ Critérios de Conclusão
- [x] Documento de escopo criado
- [x] Funcionalidades principais listadas
- [x] Restrições documentadas
- [x] Casos de uso definidos

## 🔗 Relacionado com
- Depende de: Card 1
- Bloqueia: Card 3

## 📚 Documentação
- `.kiro/specs/parking-wash/requirements.md`

## 💬 Notas
Define o escopo que guiará toda a arquitetura.
---
```

**Coluna:** Concluído
**Labels:** docs, requirements
**Assignee:** [Seu nome]

---

### ✅ Card 3: Planejar Arquitetura com Suporte de IA

```
Título: 3. Planejar Arquitetura com Suporte de IA

Descrição:
---
## 📌 Informações Gerais
**Branch:** docs/architecture-design
**Tipo:** Arquitetura
**Prioridade:** Alta
**Estimativa:** 2 dias

## 📝 Descrição
Definir arquitetura do sistema (3 domínios: Parking, Wash Orders, Wash Services) com suporte de IA.

## 🎯 Objetivo
- Documentar decisões arquiteturais
- Definir estrutura de pastas
- Escolher tecnologias

## ✅ Critérios de Conclusão
- [x] Diagrama de arquitetura criado
- [x] Decisões técnicas documentadas
- [x] Estrutura de pastas definida
- [x] Tecnologias escolhidas e justificadas
- [x] Prompts de IA salvos em `docs/prompts/01-arquitetura.md`

## 🔗 Relacionado com
- Depende de: Card 2
- Bloqueia: Card 4, 5

## 📚 Documentação
- `docs/prompts/01-arquitetura.md`
- `.kiro/specs/parking-wash/design.md`

## 💬 Notas
Arquitetura de 3 domínios independentes com máquina de estados.
---
```

**Coluna:** Concluído
**Labels:** architecture, ai-generated
**Assignee:** [Seu nome]

---

### ✅ Card 4: Criar Estrutura Inicial do Projeto

```
Título: 4. Criar Estrutura Inicial do Projeto

Descrição:
---
## 📌 Informações Gerais
**Branch:** setup/project-structure
**Tipo:** Setup
**Prioridade:** Alta
**Estimativa:** 1 dia

## 📝 Descrição
Criar estrutura de pastas, arquivos de configuração (package.json, tsconfig.json, etc.) e README.md inicial.

## 🎯 Objetivo
- Estabelecer base para desenvolvimento
- Configurar ferramentas (TypeScript, ESLint, etc.)
- Criar README.md com instruções

## ✅ Critérios de Conclusão
- [x] Pastas criadas (backend, frontend, docs)
- [x] package.json configurado
- [x] tsconfig.json configurado
- [x] .gitignore criado
- [x] README.md inicial criado
- [x] .env.example criado

## 🔗 Relacionado com
- Depende de: Card 3
- Bloqueia: Card 5

## 📚 Documentação
- Commits: `setup: create project structure`, `setup: configure typescript and eslint`

## 💬 Notas
Estrutura pronta para desenvolvimento.
---
```

**Coluna:** Concluído
**Labels:** setup, infrastructure
**Assignee:** [Seu nome]

---

### ✅ Card 5: Gerar Código das Funcionalidades Principais (Ciclo 1)

```
Título: 5. Gerar Código das Funcionalidades Principais (Ciclo 1)

Descrição:
---
## 📌 Informações Gerais
**Branch:** feature/core-functionality-cycle1
**Tipo:** Feature
**Prioridade:** Alta
**Estimativa:** 3 dias

## 📝 Descrição
Gerar código das 3 funcionalidades principais com IA (Parking, Wash Orders, Wash Services).

## 🎯 Objetivo
- Implementar endpoints REST
- Criar serviços de negócio
- Implementar validação com Zod

## ✅ Critérios de Conclusão
- [x] Endpoints de Parking implementados (check-in, checkout, list)
- [x] Endpoints de Wash Orders implementados (create, list, update status)
- [x] Endpoints de Wash Services implementados (list)
- [x] Validação com Zod implementada
- [x] Tratamento de erros centralizado
- [x] Prompts salvos em `docs/prompts/02-backend.md`

## 🔗 Relacionado com
- Depende de: Card 4
- Bloqueia: Card 6

## 📚 Documentação
- `docs/prompts/02-backend.md`
- Branches: `feature/parking-module`, `feature/wash-orders-module`, `feature/wash-services-module`

## 💬 Notas
Primeiro ciclo de geração com IA. Código funcional mas pode ter bugs.
---
```

**Coluna:** Concluído
**Labels:** feature, ai-generated, backend
**Assignee:** [Seu nome]

---

### ✅ Card 6: Avaliar Saída da IA e Aplicar Refinamento (Ciclo 2)

```
Título: 6. Avaliar Saída da IA e Aplicar Refinamento (Ciclo 2)

Descrição:
---
## 📌 Informações Gerais
**Branch:** feature/code-refinement-cycle2
**Tipo:** Bug Fix / Refinement
**Prioridade:** Alta
**Estimativa:** 2 dias

## 📝 Descrição
Analisar código gerado, identificar problemas e aplicar refinamentos (Erro 503, UUID inválido, etc.).

## 🎯 Objetivo
- Corrigir bugs identificados
- Melhorar qualidade do código
- Documentar casos de refinamento

## ✅ Critérios de Conclusão
- [x] Erro 503 no checkout corrigido (import de PricingService)
- [x] Erro 422 de UUID inválido corrigido
- [x] Vehicle Type selection implementado
- [x] Casos de refinamento documentados
- [x] Testes passando

## 🔗 Relacionado com
- Depende de: Card 5
- Bloqueia: Card 7

## 📚 Documentação
- `README.md` - Seção "Casos de Refinamento"
- Branches: `fix/pricing-service-import`, `fix/vehicle-type-uuid`, `feature/vehicle-type-selection`

## 💬 Notas
Demonstra processo iterativo com IA. 3 bugs reais corrigidos.
---
```

**Coluna:** Concluído
**Labels:** bug-fix, refinement, ai-generated
**Assignee:** [Seu nome]

---

### ✅ Card 7-17: [Continuar com mesma estrutura...]

*[Seguir o mesmo padrão para os cards 7 a 17]*

---

### ⏳ Card 18: Gravar Vídeo de Demonstração

```
Título: 18. Gravar Vídeo de Demonstração

Descrição:
---
## 📌 Informações Gerais
**Branch:** docs/video-demo
**Tipo:** Documentação
**Prioridade:** Alta
**Estimativa:** 2 dias

## 📝 Descrição
Gravar vídeo de demonstração do sistema e publicar no YouTube como não listado.

## 🎯 Objetivo
- Demonstrar funcionalidades do sistema
- Explicar arquitetura
- Mostrar processo com IA

## ✅ Critérios de Conclusão
- [ ] Vídeo gravado (5-10 minutos)
- [ ] Demonstração de check-in/checkout
- [ ] Demonstração de fila de lavagem
- [ ] Explicação de arquitetura
- [ ] Publicado no YouTube (não listado)
- [ ] Link adicionado ao README.md

## 🔗 Relacionado com
- Depende de: Card 17
- Bloqueia: Card 19

## 📚 Documentação
- Link do YouTube no README.md

## 💬 Notas
Vídeo deve demonstrar o sistema funcionando e explicar o processo com IA.
---
```

**Coluna:** Em Andamento
**Labels:** documentation, video, demo
**Assignee:** [Seu nome]

---

### ⏳ Card 19: Revisar Checklist Final

```
Título: 19. Revisar Checklist Final

Descrição:
---
## 📌 Informações Gerais
**Branch:** docs/final-checklist
**Tipo:** Documentação
**Prioridade:** Alta
**Estimativa:** 1 dia

## 📝 Descrição
Revisar checklist final de requisitos e preparar para submissão.

## 🎯 Objetivo
- Garantir todos os requisitos atendidos
- Preparar documentação final
- Validar conformidade

## ✅ Critérios de Conclusão
- [ ] Checklist de requisitos revisado
- [ ] Todos os arquivos verificados
- [ ] Links validados
- [ ] Documentação completa
- [ ] Pronto para submissão

## 🔗 Relacionado com
- Depende de: Card 18
- Bloqueia: Card 20

## 📚 Documentação
- `FINAL_CHECKLIST.md`

## 💬 Notas
Última revisão antes da submissão.
---
```

**Coluna:** A Fazer
**Labels:** documentation, checklist
**Assignee:** [Seu nome]

---

### ⏳ Card 20: Submeter Links no AVA

```
Título: 20. Submeter Links no AVA

Descrição:
---
## 📌 Informações Gerais
**Branch:** docs/submission
**Tipo:** Documentação
**Prioridade:** Alta
**Estimativa:** 1 dia

## 📝 Descrição
Submeter links do repositório, vídeo e documentação no AVA.

## 🎯 Objetivo
- Finalizar entrega do projeto
- Cumprir requisitos de submissão
- Documentar entrega

## ✅ Critérios de Conclusão
- [ ] Link do repositório GitHub enviado
- [ ] Link do vídeo YouTube enviado
- [ ] Link do README.md enviado
- [ ] Confirmação de recebimento

## 🔗 Relacionado com
- Depende de: Card 19
- Bloqueia: Nenhuma

## 📚 Documentação
- Links de submissão

## 💬 Notas
Finalização do projeto.
---
```

**Coluna:** A Fazer
**Labels:** documentation, submission
**Assignee:** [Seu nome]

---

## 🎯 Instruções para Mover Cards

### Fluxo de Movimento

1. **Backlog → A Fazer**
   - Quando a tarefa está pronta para começar
   - Dependências foram atendidas

2. **A Fazer → Em Andamento**
   - Quando você começa a trabalhar
   - Cria a branch correspondente

3. **Em Andamento → Bloqueado** (se necessário)
   - Quando há dependência não atendida
   - Adicione comentário explicando o bloqueio

4. **Em Andamento → Em Revisão**
   - Quando o trabalho está pronto
   - Cria Pull Request

5. **Em Revisão → Concluído**
   - Quando PR é aprovado e merged
   - Adicione link do commit

---

## 📝 Exemplo de Comentário em Card

```
## Progresso

**Data:** 26/05/2026
**Status:** Em Andamento
**Progresso:** 60%

### O que foi feito:
- [x] Endpoints de Parking implementados
- [x] Validação com Zod
- [ ] Tratamento de erros
- [ ] Testes

### Próximos passos:
- Implementar tratamento de erros
- Criar testes unitários
- Validar com Postman

### Bloqueadores:
Nenhum no momento

### PR relacionado:
#123 - feature/parking-module
```

---

## 🏷️ Labels Recomendadas

Crie as seguintes labels no repositório:

- **setup** - Configuração inicial
- **feature** - Nova funcionalidade
- **bug-fix** - Correção de bug
- **refinement** - Refinamento de código
- **documentation** - Documentação
- **architecture** - Arquitetura
- **ai-generated** - Gerado com IA
- **backend** - Backend
- **frontend** - Frontend
- **tests** - Testes
- **ci-cd** - Pipeline CI/CD
- **high-priority** - Alta prioridade
- **medium-priority** - Média prioridade
- **low-priority** - Baixa prioridade
- **blocked** - Bloqueado
- **in-review** - Em revisão

---

## 📊 Automação (Opcional)

### Configurar Automação de Cards

1. Vá para **Project settings**
2. Clique em **Automation**
3. Configure:
   - **Pull requests**: Mover para "Em Revisão" quando PR criado
   - **Issues**: Mover para "A Fazer" quando issue criada
   - **Commits**: Mover para "Concluído" quando PR merged

---

## ✅ Checklist de Configuração

- [ ] Project Board criado
- [ ] 6 colunas configuradas
- [ ] 20 cards criados
- [ ] Labels criadas
- [ ] Automação configurada
- [ ] Descrições completas em cada card
- [ ] Relacionamentos entre cards definidos
- [ ] Assignees atribuídos
- [ ] Prioridades definidas

---

## 🎉 Resultado Final

Após seguir este guia, você terá:

✅ Quadro Kanban completo e organizado
✅ Rastreabilidade entre planejamento e execução
✅ Documentação clara de cada tarefa
✅ Processo real de desenvolvimento refletido
✅ Demonstração de acompanhamento efetivo

---

*Guia criado em 26/05/2026*
*Gerado com IA (Claude) - Demonstração de Desenvolvimento com IA*
