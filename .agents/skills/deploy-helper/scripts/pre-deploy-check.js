import { execSync } from 'child_process';

console.log('🚀 Iniciando Portão de Qualidade Pré-Deploy do Issa Academy...');

const steps = [
  { name: 'TypeScript Typecheck', command: 'npm run typecheck' },
  { name: 'ESLint Code Quality', command: 'npm run lint' },
  { name: 'Vitest Unit Tests', command: 'npm run test' },
  { name: 'Vite Production Build', command: 'npm run build' }
];

try {
  for (const step of steps) {
    console.log(`\n⏳ Executando: ${step.name} (${step.command})...`);
    execSync(step.command, { stdio: 'inherit' });
    console.log(`✔ ${step.name} aprovado!`);
  }
  console.log('\n✨ Todos os testes e validações passaram com sucesso! A build está 100% pronta para deploy.');
} catch (error) {
  console.error('\n❌ Falha no portão de qualidade. Corrija os erros acima antes de fazer deploy.');
  process.exit(1);
}
