---
name: deploy-helper
description: Use esta skill quando o usuário solicitar validações de pré-deploy, checagem do portão de qualidade ou publicação da aplicação no GitHub Pages.
---

# Deploy Helper Skill

## Quando usar esta skill
Use esta skill quando o usuário solicitar o deploy da aplicação, validação pré-deploy ou verificação de integridade antes de publicar em produção.

## Como usar
1. Execute a suíte completa de qualidade (Quality Gate):
   - `npm run typecheck` (Checagem estrita de tipos TypeScript)
   - `npm run lint` (ESLint para padrões de código)
   - `npm run test` (Vitest para testes unitários)
   - `npm run build` (Build de produção via Vite)
2. Se todas as etapas passarem com sucesso (0 erros), verifique se há arquivos não comitados via `git status`.
3. O deploy do **Issa Academy** é automatizado via **GitHub Actions** (`.github/workflows/deploy.yml`):
   - Ao fazer push para a branch `main` do repositório oficial (`issacarbarbosa/issa-academy`), o pipeline compila os bundles e publica automaticamente no GitHub Pages (`https://issacarbarbosa.github.io/issa-academy/`).
4. Se o usuário solicitar deploy imediato e o repositório estiver limpo e validado:
   - Realize o push para a branch `main`: `git push origin main`
