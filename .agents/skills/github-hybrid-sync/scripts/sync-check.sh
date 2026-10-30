#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/issacarbarbosa/issa-academy.git"
BRANCH="main"

echo "🔄 [GitHub Hybrid Sync] Verificando sincronia com ${REPO_URL} (${BRANCH})..."

# 1. Inicializa o repositório Git se o container (ex.: Google AI Studio) não tiver .git
if [ ! -d ".git" ]; then
  echo "📦 Repositório .git não encontrado no container. Conectando ao histórico de ${REPO_URL}..."
  git init -b "${BRANCH}"
  git remote add origin "${REPO_URL}"
  git fetch origin "${BRANCH}"
  git reset --mixed "origin/${BRANCH}"
fi

# Garante que o remoto origin aponta para o repositório oficial
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "${REPO_URL}"
fi

git fetch origin "${BRANCH}"

LOCAL_HASH=$(git rev-parse HEAD 2>/dev/null || echo "none")
REMOTE_HASH=$(git rev-parse "origin/${BRANCH}")

echo "   • Commit Local (HEAD):   ${LOCAL_HASH:0:7}"
echo "   • Commit Remoto (main):  ${REMOTE_HASH:0:7}"

if [ "${1:-}" = "--push" ]; then
  COMMIT_MSG="${2:-chore: sync project updates from hybrid workspace}"
  echo "🚀 Preparando publicação para o GitHub (${COMMIT_MSG})..."

  git config user.name "${GIT_AUTHOR_NAME:-Issacar Barbosa}"
  git config user.email "${GIT_AUTHOR_EMAIL:-issacarnewton@gmail.com}"

  # Preserva .github/workflows/deploy.yml se o token não tiver escopo workflow
  git checkout "origin/${BRANCH}" -- .github/workflows/deploy.yml 2>/dev/null || true

  # Atualiza MAPA_RAIZ.md e package-lock.json
  node .agents/skills/map-builder/scripts/generate-map.js
  rm -f package-lock.json
  npm install --package-lock-only --no-audit --no-fund

  git add -A
  if git diff --cached --quiet; then
    echo "✔ Nenhuma alteração pendente para commit."
  else
    git commit -m "${COMMIT_MSG}"
  fi

  if [ -n "${GITHUB_TOKEN:-}" ]; then
    git push "https://x-access-token:${GITHUB_TOKEN}@github.com/issacarbarbosa/issa-academy.git" "${BRANCH}"
  else
    git push origin "${BRANCH}"
  fi

  echo "✅ Push concluído com sucesso para ${REPO_URL} (${BRANCH})!"
  exit 0
fi

# Modo padrão: Conferência de Início de Conversa
if [ "${LOCAL_HASH}" != "${REMOTE_HASH}" ]; then
  if [ -z "$(git status --porcelain)" ]; then
    echo "⬇️ Atualizando workspace local para o commit mais recente do GitHub..."
    git pull --rebase origin "${BRANCH}"
    echo "✅ Workspace atualizado para $(git rev-parse --short HEAD)."
  else
    echo "⚠️ Há alterações locais não comitadas no workspace e o remoto está em ${REMOTE_HASH:0:7}."
    git status -s
  fi
else
  echo "✅ Workspace já está sincronizado com a versão mais recente do GitHub (${REMOTE_HASH:0:7})."
  git log -n 1 --oneline
fi
