---
trigger: model_decision
description: Leia esta regra ao criar commits, analisar o histórico do git ou preparar Pull Requests.
---

# Regras de Git & Commits

## Padrão de Commits
- Sempre crie commits seguindo o padrão **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`).
- Use letras minúsculas na descrição (ex: `feat: add clef selector in game`).
- Faça commits atômicos, pequenos e focados em apenas uma alteração lógica por vez.
- Evite commits genéricos como "update code" ou "bug fix".

## Geração de Pull Requests (PRs)
- Antes de criar um PR ou finalizar o desenvolvimento, analise o histórico do git usando `git log` ou `git diff`.
- Escreva um resumo conciso contendo as mudanças efetuadas, justificativas técnicas e testes validados.

## Portão de Qualidade antes do Commit (Quality Gate)
- Antes de realizar qualquer commit local ou entregar uma funcionalidade, execute o ciclo de validação para garantir a integridade do código:
  1. **Checagem de Tipos:** `npm run typecheck`
  2. **Linter:** `npm run lint`
  3. **Testes Unitários:** `npm run test`
  4. **Build de Produção:** `npm run build`
- Se qualquer uma das etapas falhar, corrija os erros antes de prosseguir com o commit.
