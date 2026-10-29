#!/usr/bin/env node
/**
 * Script de auditoria determinística dos 16 bancos de questões do Simulado MSA.
 * Uso:
 *   node .agents/skills/question-bank-auditor/scripts/audit-banks.cjs [--min-per-phase=15]
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const minArg = args.find((a) => a.startsWith('--min-per-phase='));
const minPerPhase = minArg ? parseInt(minArg.split('=')[1], 10) : 10;

const EXPECTED_PERIOD_BY_PHASE = {
  1: 1, 2: 1, 3: 1,
  4: 2, 5: 2,
  6: 3, 7: 3, 8: 3, 9: 3,
  10: 4, 11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4,
};

const questionsDir = path.resolve(__dirname, '../../../../src/modules/simulado/questions');
let totalQuestions = 0;
let totalErrors = 0;
let totalWarnings = 0;
const globalIds = new Set();

console.log('===================================================================');
console.log(`🔍 AUDITORIA DOS BANCOS DE QUESTÕES MSA (Mínimo/Fase: ${minPerPhase})`);
console.log('===================================================================');

for (let phase = 1; phase <= 16; phase++) {
  const padded = String(phase).padStart(2, '0');
  const fileName = `q_f${padded}.json`;
  const filePath = path.join(questionsDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ [ERRO] Arquivo ausente: ${fileName}`);
    totalErrors++;
    continue;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`❌ [ERRO] JSON inválido em ${fileName}: ${err.message}`);
    totalErrors++;
    continue;
  }

  if (!Array.isArray(data)) {
    console.error(`❌ [ERRO] ${fileName} não exporta um array JSON.`);
    totalErrors++;
    continue;
  }

  const activeQuestions = data.filter((q) => q && q.ativo !== false);
  totalQuestions += activeQuestions.length;

  const correctDistribution = [0, 0, 0, 0];
  const phasePrompts = new Set();
  let phaseErrors = 0;

  if (activeQuestions.length < minPerPhase) {
    console.error(
      `❌ [FASE ${padded}] Possui apenas ${activeQuestions.length} questões ativas (mínimo exigido: ${minPerPhase}).`
    );
    phaseErrors++;
  }

  data.forEach((q, idx) => {
    const label = `${fileName}#${idx + 1} (${q.id || 'sem-id'})`;

    if (!q.id || typeof q.id !== 'string') {
      console.error(`❌ [ERRO] ${label}: Campo 'id' ausente ou inválido.`);
      phaseErrors++;
    } else if (globalIds.has(q.id)) {
      console.error(`❌ [ERRO] ${label}: ID duplicado '${q.id}'.`);
      phaseErrors++;
    } else {
      globalIds.add(q.id);
    }

    if (!q.pergunta || typeof q.pergunta !== 'string' || q.pergunta.trim().length < 10) {
      console.error(`❌ [ERRO] ${label}: Enunciado ('pergunta') inválido ou muito curto.`);
      phaseErrors++;
    } else {
      const normPrompt = q.pergunta.trim().toLowerCase();
      if (phasePrompts.has(normPrompt)) {
        console.error(`❌ [ERRO] ${label}: Enunciado duplicado na mesma fase.`);
        phaseErrors++;
      }
      phasePrompts.add(normPrompt);
    }

    if (!q.referencia || typeof q.referencia !== 'object') {
      console.error(`❌ [ERRO] ${label}: Objeto 'referencia' ausente.`);
      phaseErrors++;
    } else {
      const expectedPeriod = EXPECTED_PERIOD_BY_PHASE[phase];
      if (Number(q.referencia.fase) !== phase) {
        console.error(
          `❌ [ERRO] ${label}: referencia.fase (${q.referencia.fase}) diverge da Fase ${phase}.`
        );
        phaseErrors++;
      }
      if (Number(q.referencia.periodo) !== expectedPeriod) {
        console.error(
          `❌ [ERRO] ${label}: referencia.periodo (${q.referencia.periodo}) diverge do Período ${expectedPeriod}.`
        );
        phaseErrors++;
      }
      if (!q.referencia.pagina) {
        console.error(`❌ [ERRO] ${label}: referencia.pagina ausente.`);
        phaseErrors++;
      }
    }

    if (!Array.isArray(q.opcoes) || q.opcoes.length !== 4) {
      console.error(
        `❌ [ERRO] ${label}: Deve possuir exatamente 4 opções (encontrado: ${
          Array.isArray(q.opcoes) ? q.opcoes.length : 'não-array'
        }).`
      );
      phaseErrors++;
    } else {
      const correctIndices = [];
      q.opcoes.forEach((opt, optIdx) => {
        if (!opt.texto || typeof opt.texto !== 'string' || !opt.texto.trim()) {
          console.error(`❌ [ERRO] ${label} [Opção ${optIdx}]: texto vazio.`);
          phaseErrors++;
        }
        if (!opt.feedback || typeof opt.feedback !== 'string' || !opt.feedback.trim()) {
          console.error(`❌ [ERRO] ${label} [Opção ${optIdx}]: feedback pedagógico vazio.`);
          phaseErrors++;
        }
        if (opt.correta === true) {
          correctIndices.push(optIdx);
        }
      });

      if (correctIndices.length !== 1) {
        console.error(
          `❌ [ERRO] ${label}: Deve ter exatamente 1 opção correta (encontrado: ${correctIndices.length}).`
        );
        phaseErrors++;
      } else {
        correctDistribution[correctIndices[0]]++;
      }
    }
  });

  totalErrors += phaseErrors;
  const statusIcon = phaseErrors === 0 ? '✅' : '❌';
  console.log(
    `${statusIcon} Fase ${padded} (${fileName}): ${String(activeQuestions.length).padStart(
      2,
      ' '
    )} ativas | Dist A/B/C/D: [${correctDistribution.join(', ')}]`
  );
}

console.log('===================================================================');
console.log(`📊 Total de Questões Ativas: ${totalQuestions} | Erros: ${totalErrors} | Avisos: ${totalWarnings}`);
console.log('===================================================================');

if (totalErrors > 0) {
  process.exit(1);
}
