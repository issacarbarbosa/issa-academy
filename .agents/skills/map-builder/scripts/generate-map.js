import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../../../');
const OUTPUT_FILE = path.join(ROOT_DIR, 'MAPA_RAIZ.md');

const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.gemini'];

const DESCRIPTIONS = {
  '.agents': 'Configurações de agentes IA, skills especializadas e regras de projeto',
  '.agents/hooks': 'Hooks de ciclo de vida do agente (ESLint e guardiões de documentação)',
  '.agents/rules': 'Regras de comportamento, sincronização GitHub, qualidade e diretrizes de projeto',
  '.agents/skills': 'Habilidades especializadas do agente (sincronização GitHub, OSMD, WebAudio, teoria, deploy, mapas)',
  '.agents/skills/github-hybrid-sync': 'Skill e script de conferência obrigatória no GitHub (AI Studio ⇄ GitHub ⇄ Antigravity)',
  '.agents/skills/osmd-score-synchronization': 'Skill de sincronização SVG do OpenSheetMusicDisplay, Loop e Modo Foco',
  '.agents/skills/webaudio-precision-scheduler': 'Skill do motor de áudio lookahead e Piano de Cauda Didático Universal',
  '.agents/skills/soundslice-minimalist-ux': 'Skill de diretrizes visuais minimalistas estilo Soundslice em pt-BR',
  'docs': 'Documentação técnica complementar e registros de decisão',
  'docs/decisions': 'Registros de Decisão de Arquitetura (ADRs 001 a 004)',
  'public': 'Assets estáticos musicais, mascote Fufu e ícones do PWA',
  'scripts': 'Scripts de integração e automação (Google Apps Script Webhook e Seed Supabase)',
  'src': 'Código-fonte da aplicação React 19 / TypeScript',
  'src/core': 'Componentes centrais, contexto Admin, ContentStore híbrido, hooks e utilitários',
  'src/core/components': 'Componentes UI globais reutilizáveis (OrientationGuard, AdminFloatingBar, QuickEditModal)',
  'src/core/contexts': 'Contexto global de autenticação e modo de edição do Administrador (AdminContext)',
  'src/core/hooks': 'Hooks utilitários reutilizáveis (useMobileOrientation, useLocalStorage)',
  'src/core/services': 'Camada de dados unificada Supabase Cloud + Offline (contentStore, supabaseClient)',
  'src/core/utils': 'Motores lógicos e utilitários globais (audio.ts, notesData.ts, paths.ts)',
  'src/modules': 'Módulos de domínio isolados do ecossistema Issa Academy',
  'src/modules/admin': 'Painel Administrativo e CMS Híbrido (AdminDashboard)',
  'src/modules/aulas': 'Trilha teórica interativa das 16 Fases e 4 Períodos do MSA (AulasMsa)',
  'src/modules/home': 'Tela inicial de boas-vindas com 4 cards de estudo e mascote Fufu (WelcomeHome)',
  'src/modules/mestre-da-clave': 'Jogo interativo de leitura musical em pauta Canvas 60fps (Sol, Fá e Dó)',
  'src/modules/mestre-da-clave/components': 'Componentes modulares de interface do jogo (MestreOverlays)',
  'src/modules/mestre-da-clave/engine': 'Motor de física, partículas e vetores SMuFL Bravura (gameEntities, clefVectors)',
  'src/modules/partituras': 'Estúdio de Partituras MusicXML & Hinário 5 CCB estilo Soundslice (PartiturasStudio)',
  'src/modules/partituras/components': 'Componentes minimalistas do estúdio (TopBar, TransportBar, ViolinFingerboard, RepertoirePanelModal)',
  'src/modules/partituras/data': 'Catálogo de partituras MSA e Hinário 5 CCB com sincronização Supabase/localStorage',
  'src/modules/partituras/services': 'Motores imperativos OSMD SVG (ScoreController) e Web Audio Piano de Cauda (AudioScheduler)',
  'src/modules/partituras/types': 'Contratos TypeScript de domínio musical, fatias temporais e configuração de loop',
  'src/modules/partituras/utils': 'Funções matemáticas puras de tempo, BPM, MIDI, solfejo pt-BR e testes (musicMath)',
  'src/modules/simulado': 'Simulado oficial Dual-Mode do método MSA com 552+ questões validadas via Zod',
  'src/modules/simulado/components': 'Componentes de interface do simulado (SimuladoMenu e QuestionFeedbackModal)',
  'src/modules/simulado/questions': 'Bancos de questões Zod em JSON (q_f01 a q_f16)',
  'src/modules/simulado/utils': 'Utilitários de telemetria, webhook e fila offline de feedbacks',
  'supabase': 'Schema SQL e políticas Row Level Security (RLS) do banco PostgreSQL no Supabase',
  'AGENTS.md': 'Regras globais do workspace, invariantes musicais e definição de subagentes',
  'ARCHITECTURE.md': 'Visão arquitetural viva e diagramas Mermaid do ecossistema unificado',
  'CHANGELOG.md': 'Histórico detalhado de alterações e entregas do projeto',
  'FLUXO_USUARIO.md': 'Mapa de fluxo UX e navegação dos 6 módulos',
  'GEMINI.md': 'Contexto imediato do agente e protocolo obrigatório de check-in no GitHub',
  'MAPA_RAIZ.md': 'Mapa arquitetural físico do projeto gerado automaticamente',
  'ROADMAP.md': 'Controle de entregas homologadas e backlog ativo'
};

function getFolderTree(dirPath, relativePath = '', prefix = '') {
  let markdown = '';
  const items = fs.readdirSync(dirPath);

  const dirs = [];
  const files = [];

  for (const item of items) {
    if (EXCLUDE_DIRS.includes(item)) continue;
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      dirs.push(item);
    } else {
      files.push(item);
    }
  }

  dirs.sort();
  files.sort();

  const allItems = [
    ...dirs.map(d => ({ name: d, isDir: true })),
    ...files.map(f => ({ name: f, isDir: false }))
  ];

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const isLast = i === allItems.length - 1;
    const currentRelPath = relativePath ? `${relativePath}/${item.name}` : item.name;
    const itemPrefix = isLast ? '└── ' : '├── ';
    const description = DESCRIPTIONS[currentRelPath] ? ` # ${DESCRIPTIONS[currentRelPath]}` : '';

    if (item.isDir) {
      markdown += `${prefix}${itemPrefix}📁 ${item.name}/${description}\n`;
      const nextPrefix = isLast ? '    ' : '│   ';
      markdown += getFolderTree(path.join(dirPath, item.name), currentRelPath, prefix + nextPrefix);
    } else {
      markdown += `${prefix}${itemPrefix}📄 ${item.name}${description}\n`;
    }
  }

  return markdown;
}

function main() {
  const tree = getFolderTree(ROOT_DIR);

  const content = `# Mapa da Raiz do Projeto: Issa Academy

Este arquivo apresenta a estrutura de diretórios e a finalidade de cada bloco arquitetural do projeto.
Sincronizado automaticamente via script de varredura (.agents/skills/map-builder/scripts/generate-map.js).

\`\`\`text
issa-academy/
${tree}\`\`\`
`;

  const existingContent = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, 'utf8') : '';
  if (existingContent.trim() !== content.trim()) {
    fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
    console.log('✔ MAPA_RAIZ.md atualizado com sucesso via script de varredura.');
  } else {
    console.log('✔ MAPA_RAIZ.md já está perfeitamente sincronizado com a árvore física.');
  }

  const UX_FILE = path.join(ROOT_DIR, 'FLUXO_USUARIO.md');
  if (!fs.existsSync(UX_FILE)) {
    console.log('✔ Arquivo FLUXO_USUARIO.md não encontrado. Criando template base...');
    fs.writeFileSync(UX_FILE, '# Mapa de Experiência e Fluxo do Usuário: Issa Academy\n\n*Aguardando atualização semântica pelo agente...*\n', 'utf8');
  }
}

main();

