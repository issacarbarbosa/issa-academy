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
    setTimeout(() => resolve(data), 1000);
  });
}

async function main() {
  const input = await readStdin();
  let targetFile = '';
  
  if (input) {
    try {
      const payload = JSON.parse(input);
      if (payload.arguments && payload.arguments.TargetFile) {
        targetFile = payload.arguments.TargetFile;
      }
    } catch (e) {
      // Not a valid JSON payload
    }
  }

  if (targetFile && fs.existsSync(targetFile) && (targetFile.endsWith('.ts') || targetFile.endsWith('.tsx'))) {
    try {
      const rootDir = path.resolve(__dirname, '../../');
      const env = { ...process.env, PATH: `D:\\nodejs;${process.env.PATH || ''}` };
      execSync(`npx eslint "${targetFile}" --fix`, { cwd: rootDir, env, stdio: 'ignore' });
    } catch (err) {
      // Falha do ESLint é capturada para não interromper
    }
  }

  console.log(JSON.stringify({}));
}

main();
