---
trigger: always_on
description: Regra sempre ativa para conferência obrigatória do GitHub no início de cada conversa, fluxo híbrido AI Studio ⇄ GitHub ⇄ Antigravity, padrão de commits e Quality Gate.
---

# Regras de Git, Commits & Sincronização Híbrida (`AI Studio ⇄ GitHub ⇄ Antigravity`)

## 1. Filosofia de Trabalho Dual (Google AI Studio + Google Antigravity)
Este projeto opera em **arquitetura híbrida de desenvolvimento** combinando o **Google AI Studio** e o **Google Antigravity (IDE Local)** sobre o mesmo repositório oficial (`https://github.com/issacarbarbosa/issa-academy.git`, branch `main`):
- **Google AI Studio:** Aproveitado para iterações visuais rápidas, ajustes multimodais de UI/UX, síntese sonora Web Audio API e pré-visualização em nuvem.
- **Google Antigravity:** Aproveitado para engenharia local profunda, execução de hooks nativos (`.agents/hooks/`), refatorações em larga escala e automação via CLI local.

---

## 2. Check-in Obrigatório no Início de CADA Nova Conversa
**REGRA INEGOCIÁVEL:** Sempre que uma nova conversa/sessão for iniciada (seja no **Google AI Studio** ou no **Antigravity**), na **primeira resposta ou ação**, o agente DEVE verificar se o projeto local está sincronizado com a versão mais recente da branch `main` no GitHub:

1. Execute o script automatizado de conferência:
   ```bash
   bash .agents/skills/github-hybrid-sync/scripts/sync-check.sh
   ```
2. O que o script faz automaticamente:
   - Caso o ambiente (como o container do AI Studio) tenha iniciado sem a pasta `.git`, ele inicializa o repositório Git local, adiciona o remoto `origin` (`https://github.com/issacarbarbosa/issa-academy.git`) e busca `origin/main`.
   - Compara o `HEAD` local com `origin/main`.
   - Caso haja commits mais novos no GitHub feitos no outro ambiente, aplica a atualização (`git pull --rebase origin main` ou sincronização limpa) para **jamais sobrescrever** trabalho feito na outra ferramenta.

---

## 3. Como Enviar Atualizações para o GitHub (`git push`)
- **No Antigravity (IDE Local):**
  - Após aprovar o Quality Gate, execute `git push origin main` usando as credenciais locais do Git.
- **No Google AI Studio (Container Cloud):**
  - Utilize a variável de ambiente `$GITHUB_TOKEN` configurada na aba **Secrets** do AI Studio:
    ```bash
    bash .agents/skills/github-hybrid-sync/scripts/sync-check.sh --push "feat: descrição concisa da mudança"
    ```
  - **Atenção ao Escopo do Token (`workflow`):** Tokens clássicos do GitHub com escopo apenas `repo` (sem `workflow`) são rejeitados pelo GitHub se o commit alterar arquivos dentro de `.github/workflows/`. Portanto, no AI Studio, mantenha `.github/workflows/deploy.yml` inalterado em relação a `origin/main` e mantenha `package-lock.json` atualizado via `npm install --package-lock-only`.

---

## 4. Padrão de Commits & Portão de Qualidade (Quality Gate)
- Sempre crie commits seguindo o padrão **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`) com descrição em letras minúsculas.
- Antes de realizar qualquer commit ou push, execute obrigatoriamente o ciclo de validação (`node .agents/skills/deploy-helper/scripts/pre-deploy-check.js`):
  1. **Checagem de Tipos:** `npm run typecheck` (`tsc --noEmit`)
  2. **Linter:** `npm run lint`
  3. **Testes Unitários (110 testes):** `npm run test` (Vitest 92 testes + `musicMath.test.ts` 18 testes)
  4. **Build de Produção + PWA:** `npm run build`
  5. **Documentação Viva:** Atualize `ROADMAP.md` (e execute `npm run map` se arquivos/pastas foram criados ou removidos).
- **Proteção de Segredos (`.env`):** Nunca versione arquivos `.env` ou chaves privadas no Git.
