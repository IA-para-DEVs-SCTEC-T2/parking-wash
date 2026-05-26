# Script para limpar arquivos desnecessários antes de fazer push
# Este script remove arquivos de documentação temporária e scripts de criação de branches

Write-Host "🧹 Limpando arquivos desnecessários..." -ForegroundColor Green
Write-Host ""

# Lista de arquivos de documentação a remover
$docsToRemove = @(
    "ACAO_NECESSARIA_USUARIO.md",
    "ACAO_URGENTE_PROMPT_TRAVADO.md",
    "ANALISE_REQUISITOS_E_PROXIMOS_PASSOS.md",
    "BRANCHES_CRIADAS_COM_SUCESSO.md",
    "CHECKLIST_FINAL_SUBMISSAO.md",
    "COMECE_AQUI.md",
    "COMPLETE_PROJECT_SUMMARY.md",
    "CRIAR_BRANCHES_AGORA.md",
    "EXECUTE_BRANCHES_CREATION.md",
    "FINAL_SUMMARY_AND_NEXT_STEPS.md",
    "LEIA_PRIMEIRO.md",
    "MANUAL_BRANCH_CREATION.md",
    "PROXIMOS_PASSOS_FINAIS.md",
    "QUICK_START_GUIDE.md",
    "README_FINAL_ACTIONS.md",
    "RESOLVER_PROMPT_TRAVADO.md",
    "RESOLVING_GIT_ISSUE.md",
    "RESUMO_EXECUTIVO.txt",
    "RESUMO_FINAL_100_PORCENTO.md",
    "STATUS_FINAL.txt"
)

# Lista de scripts a remover
$scriptsToRemove = @(
    "create_all_issues.py",
    "create_board_and_issues.py",
    "create_branches.bat",
    "create_branches.ps1",
    "create_branches.sh",
    "create_branches_api.ps1",
    "create_branches_automated.ps1",
    "create_branches_via_github.md",
    "create_branches_with_input.ps1",
    "create_issues.py",
    "create_pr.py",
    "create_pr_direct.py",
    "fix_and_pr.ps1",
    "fix_develop_branch.py",
    "merge_and_push.bat",
    "merge_via_api.py"
)

$removedCount = 0
$skippedCount = 0

# Remover arquivos de documentação
Write-Host "📄 Removendo arquivos de documentação..." -ForegroundColor Yellow
foreach ($file in $docsToRemove) {
    $path = Join-Path -Path (Get-Location) -ChildPath $file
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "  ✅ Removido: $file"
        $removedCount++
    } else {
        Write-Host "  ⏭️  Não encontrado: $file"
        $skippedCount++
    }
}

Write-Host ""

# Remover scripts
Write-Host "🔧 Removendo scripts..." -ForegroundColor Yellow
foreach ($file in $scriptsToRemove) {
    $path = Join-Path -Path (Get-Location) -ChildPath $file
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "  ✅ Removido: $file"
        $removedCount++
    } else {
        Write-Host "  ⏭️  Não encontrado: $file"
        $skippedCount++
    }
}

Write-Host ""
Write-Host "="*60
Write-Host "✅ Limpeza Concluída!" -ForegroundColor Green
Write-Host "  Arquivos removidos: $removedCount"
Write-Host "  Arquivos não encontrados: $skippedCount"
Write-Host "="*60
Write-Host ""

# Próximos passos
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Remover backend/.env do git:"
Write-Host "     git rm --cached backend/.env"
Write-Host ""
Write-Host "  2. Adicionar .env ao .gitignore:"
Write-Host "     echo '.env' >> .gitignore"
Write-Host ""
Write-Host "  3. Commit:"
Write-Host "     git add -A"
Write-Host "     git commit -m 'chore: clean up temporary files and remove secrets'"
Write-Host ""
Write-Host "  4. Testar:"
Write-Host "     npm run build"
Write-Host "     npm test"
Write-Host "     npm run lint"
Write-Host ""
Write-Host "  5. Push:"
Write-Host "     git push origin develop"
Write-Host ""

Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
