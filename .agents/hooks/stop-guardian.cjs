const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    setTimeout(() => resolve(data), 500);
  });
}

async function main() {
  const rootDir = path.resolve(__dirname, '../../');
  let stopPayload = null;

  try {
    const input = await readStdin();
    if (input) {
      stopPayload = JSON.parse(input);
    }
  } catch {
    // Continua com valores padrão se parsing falhar
  }

  // Só atua se o encerramento for normal (NO_TOOL_CALL)
  if (stopPayload && stopPayload.terminationReason && stopPayload.terminationReason !== 'NO_TOOL_CALL') {
    console.log(JSON.stringify({}));
    return;
  }

  try {
    const gitStatus = execSync('git status --porcelain', {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    const lines = gitStatus.split('\n').map(l => l.trim()).filter(Boolean);

    // 1. Sincronização automática do MAPA_RAIZ.md se houver arquivos novos/removidos
    const hasTreeChanges = lines.some(line => {
      return (
        line.startsWith('?? ') ||
        line.startsWith('A ') ||
        line.startsWith('D ') ||
        line.startsWith('R ')
      );
    });

    if (hasTreeChanges) {
      try {
        execSync('node .agents/skills/map-builder/scripts/generate-map.js', {
          cwd: rootDir,
          stdio: 'ignore'
        });
      } catch {
        // Falha silenciosa
      }
    }

    // 2. Verificação de atualização do ROADMAP.md / CHANGELOG.md se src/ foi alterado
    const hasSrcChanges = lines.some(line => {
      const parts = line.replace(/^[MADRCU?!]{1,2}\s+/, '').trim();
      return parts.startsWith('src/');
    });

    const hasDocChanges = lines.some(line => {
      return line.includes('ROADMAP.md') || line.includes('CHANGELOG.md');
    });

    // Se houve mudança de código mas documentação não foi tocada, avisa uma vez
    if (hasSrcChanges && !hasDocChanges) {
      const convId = stopPayload?.conversationId || 'default';
      const cacheDir = path.resolve(rootDir, 'node_modules/.cache');
      const reminderFile = path.resolve(cacheDir, `doc_reminded_${convId}.lock`);

      let alreadyReminded = false;
      try {
        if (fs.existsSync(reminderFile)) {
          alreadyReminded = true;
        }
      } catch {
        // Ignora
      }

      if (!alreadyReminded) {
        try {
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
          }
          fs.writeFileSync(reminderFile, Date.now().toString(), 'utf8');
        } catch {
          // Ignora
        }

        console.log(JSON.stringify({
          decision: 'continue',
          reason: 'Guardião de Documentação: Arquivos em src/ foram modificados nesta sessão, mas o ROADMAP.md (e/ou CHANGELOG.md) ainda não foi atualizado. Atualize o histórico/status da documentação antes de concluir a entrega.'
        }));
        return;
      }
    }
  } catch {
    // Falha em comandos auxiliares não bloqueia encerramento
  }

  // Permite encerramento normal
  console.log(JSON.stringify({}));
}

main();
