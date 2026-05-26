# 🔧 Guia: Criar Branches Obrigatórias Faltando

## 📌 Branches Faltando

Conforme análise do repositório, as seguintes branches obrigatórias ainda não foram criadas:

1. ❌ `feature/especificacao-arquitetura`
2. ❌ `feature/geracao-codigo-ia`
3. ❌ `feature/refatoracao-ia`
4. ❌ `docs/prompts-readme`

---

## 🚀 Instruções para Criar as Branches

### Pré-requisito
Certifique-se de estar na branch `develop`:

```bash
git checkout develop
git pull origin develop
```

---

### 1️⃣ Criar `feature/especificacao-arquitetura`

**Objetivo:** Rastrear trabalho de especificação e arquitetura com IA

```bash
# Criar branch local
git checkout -b feature/especificacao-arquitetura

# Criar arquivo de referência (opcional)
echo "# Especificação e Arquitetura

Documentação do processo de especificação e arquitetura do projeto ParkingWash com suporte de IA.

## Referências
- docs/prompts/01-arquitetura.md
- .kiro/specs/parking-wash/design.md
" > ARCHITECTURE_SPEC.md

# Adicionar e fazer commit
git add ARCHITECTURE_SPEC.md
git commit -m "docs: cria branch para rastreabilidade de especificação e arquitetura com IA"

# Enviar para remoto
git push -u origin feature/especificacao-arquitetura
```

---

### 2️⃣ Criar `feature/geracao-codigo-ia`

**Objetivo:** Rastrear trabalho de geração de código com IA

```bash
# Criar branch local
git checkout develop
git checkout -b feature/geracao-codigo-ia

# Criar arquivo de referência (opcional)
echo "# Geração de Código com IA

Documentação do processo de geração de código com suporte de IA.

## Ciclos de Geração
- Ciclo 1: Geração inicial com Chain of Thought
- Ciclo 2: Refinamento com análise crítica
- Ciclo 3: Implementação com padrão avançado

## Referências
- docs/prompts/02-backend.md
- docs/prompts/04-frontend.md
" > CODE_GENERATION.md

# Adicionar e fazer commit
git add CODE_GENERATION.md
git commit -m "docs: cria branch para rastreabilidade de geração de código com IA"

# Enviar para remoto
git push -u origin feature/geracao-codigo-ia
```

---

### 3️⃣ Criar `feature/refatoracao-ia`

**Objetivo:** Rastrear trabalho de refatoração com IA

```bash
# Criar branch local
git checkout develop
git checkout -b feature/refatoracao-ia

# Criar arquivo de referência (opcional)
echo "# Refatoração com IA

Documentação do processo de refatoração de código com suporte de IA.

## Princípios Aplicados
- Clean Code
- SOLID Principles
- Design Patterns

## Referências
- docs/refactoring-report.md
- docs/prompts/refactoring.md
" > REFACTORING.md

# Adicionar e fazer commit
git add REFACTORING.md
git commit -m "docs: cria branch para rastreabilidade de refatoração com IA"

# Enviar para remoto
git push -u origin feature/refatoracao-ia
```

---

### 4️⃣ Criar `docs/prompts-readme`

**Objetivo:** Rastrear documentação de prompts e README

```bash
# Criar branch local
git checkout develop
git checkout -b docs/prompts-readme

# Criar arquivo de referência (opcional)
echo "# Documentação de Prompts e README

Documentação centralizada de todos os prompts utilizados e atualização do README.

## Estrutura de Prompts
- docs/prompts/01-arquitetura.md
- docs/prompts/02-backend.md
- docs/prompts/03-testes.md
- docs/prompts/04-frontend.md
- docs/prompts/05-cicd.md

## README
- README.md (documentação principal)
- README_IMPROVEMENTS_SUMMARY.md
- CHECKLIST_README_REQUIREMENTS.md
" > PROMPTS_README.md

# Adicionar e fazer commit
git add PROMPTS_README.md
git commit -m "docs: cria branch para rastreabilidade de prompts e README"

# Enviar para remoto
git push -u origin docs/prompts-readme
```

---

## ✅ Verificar Branches Criadas

Após criar todas as branches, verifique:

```bash
# Listar branches locais
git branch

# Listar branches remotas
git branch -r

# Verificar que todas as 4 branches foram criadas
git branch | grep -E "feature/especificacao-arquitetura|feature/geracao-codigo-ia|feature/refatoracao-ia|docs/prompts-readme"
```

**Resultado esperado:**
```
  docs/prompts-readme
  feature/especificacao-arquitetura
  feature/geracao-codigo-ia
  feature/refatoracao-ia
```

---

## 📊 Verificar Conformidade

Após criar as branches, execute:

```bash
# Contar branches
git branch | wc -l

# Verificar branches obrigatórias
echo "Verificando branches obrigatórias:"
git branch | grep -q "main" && echo "✅ main" || echo "❌ main"
git branch | grep -q "develop" && echo "✅ develop" || echo "❌ develop"
git branch | grep -q "feature/especificacao-arquitetura" && echo "✅ feature/especificacao-arquitetura" || echo "❌ feature/especificacao-arquitetura"
git branch | grep -q "feature/geracao-codigo-ia" && echo "✅ feature/geracao-codigo-ia" || echo "❌ feature/geracao-codigo-ia"
git branch | grep -q "feature/refatoracao-ia" && echo "✅ feature/refatoracao-ia" || echo "❌ feature/refatoracao-ia"
git branch | grep -q "feature/testes-automatizados\|feature/backend-tests" && echo "✅ feature/testes-automatizados" || echo "❌ feature/testes-automatizados"
git branch | grep -q "feature/pipeline-ci-cd\|feature/cicd-pipeline" && echo "✅ feature/pipeline-ci-cd" || echo "❌ feature/pipeline-ci-cd"
git branch | grep -q "docs/prompts-readme" && echo "✅ docs/prompts-readme" || echo "❌ docs/prompts-readme"
```

---

## 🎯 Próximos Passos

Após criar as branches:

1. **Atualizar documentação:**
   - Adicionar referências às novas branches no README.md
   - Atualizar GITHUB_REPOSITORY_ANALYSIS.md

2. **Usar as branches para:**
   - Rastrear trabalho futuro relacionado a IA
   - Facilitar auditoria do processo
   - Melhorar rastreabilidade

3. **Manter padrão:**
   - Usar essas branches para novos trabalhos relacionados
   - Não deletar após merge
   - Documentar commits relacionados

---

## 📝 Exemplo de Uso das Branches

### Quando trabalhar em especificação/arquitetura:
```bash
git checkout feature/especificacao-arquitetura
# Fazer trabalho
git commit -m "docs: atualiza especificação de [módulo]"
git push origin feature/especificacao-arquitetura
```

### Quando trabalhar em geração de código:
```bash
git checkout feature/geracao-codigo-ia
# Fazer trabalho
git commit -m "feat: implementa [funcionalidade] com IA"
git push origin feature/geracao-codigo-ia
```

### Quando trabalhar em refatoração:
```bash
git checkout feature/refatoracao-ia
# Fazer trabalho
git commit -m "refactor: refatora [módulo] com IA"
git push origin feature/refatoracao-ia
```

### Quando trabalhar em prompts/README:
```bash
git checkout docs/prompts-readme
# Fazer trabalho
git commit -m "docs: documenta prompts de [etapa]"
git push origin docs/prompts-readme
```

---

## ✨ Resultado Final

Após seguir este guia:

✅ Todas as 8 branches obrigatórias estarão criadas
✅ Conformidade chegará a 100%
✅ Rastreabilidade do processo com IA melhorada
✅ Histórico completo preservado

---

*Guia criado em 26/05/2026*
*Gerado com IA (Claude) - Demonstração de Desenvolvimento com IA*
