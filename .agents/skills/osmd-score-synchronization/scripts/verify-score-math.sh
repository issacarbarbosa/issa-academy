#!/usr/bin/env bash
set -euo pipefail

echo "Executando suite de testes de matematica musical e intervalos de loop..."
npx --yes tsx --test src/modules/partituras/utils/musicMath.test.ts
echo "Validacao concluida com sucesso."
