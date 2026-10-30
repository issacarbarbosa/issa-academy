---
name: github-hybrid-sync
description: Use this skill at the start of every new conversation (in Google AI Studio or Google Antigravity) to verify and sync with the latest commit on GitHub (issacarbarbosa/issa-academy), and when pushing updates back to GitHub from either environment.
---

# GitHub Hybrid Sync Skill (`Google AI Studio ⇄ GitHub ⇄ Antigravity`)

## Objetivo
Garantir que o **Google AI Studio** e o **Google Antigravity** trabalhem em perfeita sinergia sobre a mesma base de código oficial (`https://github.com/issacarbarbosa/issa-academy.git`, branch `main`), evitando conflitos ou sobrescritas acidentais quando o desenvolvedor alterna entre os dois ambientes.

## Quando usar esta skill
1. **Obrigatoriamente no início de cada nova conversa/sessão** (tanto no AI Studio quanto no Antigravity) antes de modificar qualquer arquivo.
2. Quando o usuário pedir para **atualizar / publicar no GitHub** ou **puxar atualizações do GitHub**.

## Procedimento Passo a Passo

### 1. Check-in de Entrada no Início do Chat (`--check` / padrão)
Execute no terminal:
```bash
bash .agents/skills/github-hybrid-sync/scripts/sync-check.sh
```
O script realiza automaticamente:
- Se o container (ex.: Google AI Studio recém-aberto) não possuir `.git`, inicializa `git init -b main`, conecta `origin` a `https://github.com/issacarbarbosa/issa-academy.git`, executa `git fetch origin main` e sincroniza o histórico (`git reset --mixed origin/main`).
- Se `.git` já existir, executa `git fetch origin main` e compara o `HEAD` local com `origin/main`.
- Se `origin/main` possuir commits novos e a árvore de trabalho estiver limpa, aplica `git pull --rebase origin main` automaticamente.

### 2. Publicação no GitHub (`--push "mensagem"`)
Antes de fazer push, o portão de qualidade e o mapa de arquivos são validados:
```bash
bash .agents/skills/github-hybrid-sync/scripts/sync-check.sh --push "feat: descrição concisa"
```
- **No Google AI Studio:** Usa a variável `$GITHUB_TOKEN` (configurada na aba **Secrets** do AI Studio) para autenticar via HTTPS (`https://x-access-token:${GITHUB_TOKEN}@github.com/issacarbarbosa/issa-academy.git`).
- **Regra importante sobre `.github/workflows/deploy.yml`:** Tokens clássicos com escopo `repo` (sem escopo `workflow`) não podem modificar arquivos em `.github/workflows/`. O script preserva `.github/workflows/deploy.yml` idêntico ao `origin/main` e sincroniza `package-lock.json` (`npm install --package-lock-only`) para que o `npm ci` do GitHub Actions funcione sem erros.
- **No Antigravity:** Caso `$GITHUB_TOKEN` não esteja definido no ambiente, utiliza as credenciais nativas do Git local (`git push origin main`).

## Passos de Validação
1. Execute `bash .agents/skills/github-hybrid-sync/scripts/sync-check.sh` e confirme que `HEAD` coincide com `origin/main`.
2. Execute `node .agents/skills/deploy-helper/scripts/pre-deploy-check.js` antes de enviar qualquer novo commit.
