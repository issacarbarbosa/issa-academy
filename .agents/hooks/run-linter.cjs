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
  const filesToLint = new Set();

  try {
    const input = await readStdin();
    let touchedFile = null;
    if (input) {
      try {
        const payload = JSON.parse(input);
        const candidate =
          payload.toolCall?.args?.Path ||
          payload.toolCall?.args?.TargetFile ||
          payload.arguments?.Path ||
          payload.arguments?.TargetFile;
        if (candidate) {
          touchedFile = path.resolve(rootDir, candidate);
          if (fs.existsSync(touchedFile) && (touchedFile.endsWith('.ts') || touchedFile.endsWith('.tsx'))) {
            filesToLint.add(touchedFile);
          }
        }
      } catch {
        // Ignora erro de parse de JSON
      }
    }

    // Em PostToolUse, filtra arquivos .ts/.tsx modificados recentemente (últimos 15s) via git status
    if (filesToLint.size === 0) {
      const now = Date.now();
      const gitStatus = execSync('git status --porcelain', {
        cwd: rootDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const lines = gitStatus.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        // Trata renomeações ("R  old.ts -> new.ts") e remove aspas eventuais
        const rawPath = trimmed.replace(/^[MADRCU?!]{1,2}\s+/, '').trim();
        const filePath = (rawPath.includes(' -> ') ? rawPath.split(' -> ').pop() : rawPath).replace(/^"|"$/g, '');
        if ((filePath.endsWith('.ts') || filePath.endsWith('.tsx')) && filePath.startsWith('src/')) {
          const absolutePath = path.resolve(rootDir, filePath);
          if (fs.existsSync(absolutePath)) {
            const stat = fs.statSync(absolutePath);
            if (now - stat.mtimeMs <= 15000) {
              filesToLint.add(absolutePath);
            }
          }
        }
      }
    }
  } catch {
    // Falha em comandos auxiliares é suprimida para não bloquear o agente
  }

  if (filesToLint.size > 0) {
    try {
      const quotedFiles = Array.from(filesToLint).map(f => `"${f}"`).join(' ');
      execSync(`npx eslint ${quotedFiles} --fix`, { cwd: rootDir, stdio: 'ignore' });
    } catch {
      // Erros do ESLint são capturados para não quebrar o ciclo
    }
  }

  // Se o arquivo editado for um banco de questões JSON, dispara auditoria em background
  if (touchedFile && touchedFile.endsWith('.json') && touchedFile.includes('questions')) {
    try {
      execSync('node .agents/skills/question-bank-auditor/scripts/audit-banks.cjs', { cwd: rootDir, stdio: 'ignore' });
    } catch {
      // Falha na auditoria não bloqueia o fluxo da ferramenta
    }
  }

  // Contrato do PostToolUse do Antigravity exige JSON válido no stdout
  console.log(JSON.stringify({}));
}

main();
