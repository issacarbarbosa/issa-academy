# Mapa da Raiz do Projeto: Issa Academy

Este arquivo apresenta a estrutura de diretórios e a finalidade de cada bloco arquitetural do projeto.
Sincronizado automaticamente via script de varredura (.agents/skills/map-builder/scripts/generate-map.js).

```text
issa-academy/
├── 📁 .agents/ # Configurações de agentes IA, skills especializadas e regras de projeto
│   ├── 📁 hooks/ # Hooks de ciclo de vida do agente (ESLint e guardiões de documentação)
│   │   ├── 📄 run-linter.cjs
│   │   └── 📄 stop-guardian.cjs
│   ├── 📁 rules/ # Regras de comportamento, sincronização GitHub, qualidade e diretrizes de projeto
│   │   ├── 📄 AGENTS.md
│   │   ├── 📄 atualizacao-roadmap.md
│   │   ├── 📄 code-quality.md
│   │   ├── 📄 design-blueprint.md
│   │   ├── 📄 git-workflow.md
│   │   ├── 📄 project-context.md
│   │   ├── 📄 search-first.md
│   │   ├── 📄 security.md
│   │   └── 📄 ts-rules.md
│   ├── 📁 skills/ # Habilidades especializadas do agente (sincronização GitHub, OSMD, WebAudio, teoria, deploy, mapas)
│   │   ├── 📁 canvas-playtest/
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 deploy-helper/
│   │   │   ├── 📁 scripts/
│   │   │   │   └── 📄 pre-deploy-check.js
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 github-hybrid-sync/ # Skill e script de conferência obrigatória no GitHub (AI Studio ⇄ GitHub ⇄ Antigravity)
│   │   │   ├── 📁 scripts/
│   │   │   │   └── 📄 sync-check.sh
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 map-builder/
│   │   │   ├── 📁 scripts/
│   │   │   │   └── 📄 generate-map.js
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 music-theory-core/
│   │   │   ├── 📁 references/
│   │   │   │   ├── 📄 00-curriculo-gem-e-youtube.md
│   │   │   │   ├── 📄 01-periodo-1-fases-1-a-3.md
│   │   │   │   ├── 📄 02-periodo-2-fases-4-e-5.md
│   │   │   │   ├── 📄 03-periodo-3-fases-6-a-9.md
│   │   │   │   └── 📄 04-periodo-4-fases-10-a-16.md
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 osmd-score-synchronization/ # Skill de sincronização SVG do OpenSheetMusicDisplay, Loop e Modo Foco
│   │   │   ├── 📁 examples/
│   │   │   │   └── 📄 loop-focus-payload.json
│   │   │   ├── 📁 references/
│   │   │   │   └── 📄 bounding-box-and-isolation.md
│   │   │   ├── 📁 scripts/
│   │   │   │   └── 📄 verify-score-math.sh
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 question-bank-auditor/
│   │   │   ├── 📁 scripts/
│   │   │   │   └── 📄 audit-banks.cjs
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 rhythm-audio-engine/
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 soundslice-minimalist-ux/ # Skill de diretrizes visuais minimalistas estilo Soundslice em pt-BR
│   │   │   ├── 📁 references/
│   │   │   │   └── 📄 ptbr-musical-terminology.md
│   │   │   └── 📄 SKILL.md
│   │   └── 📁 webaudio-precision-scheduler/ # Skill do motor de áudio lookahead e Piano de Cauda Didático Universal
│   │       ├── 📁 examples/
│   │       │   └── 📄 scheduler-frame-payload.json
│   │       ├── 📁 references/
│   │       │   └── 📄 acoustic-synthesis-and-countin.md
│   │       └── 📄 SKILL.md
│   └── 📄 hooks.json
├── 📁 .github/
│   └── 📁 workflows/
│       ├── 📄 deploy.yml
│       └── 📄 supabase-keepalive.yml
├── 📁 docs/ # Documentação técnica complementar e registros de decisão
│   └── 📁 decisions/ # Registros de Decisão de Arquitetura (ADRs 001 a 004)
│       ├── 📄 004-radical-minimalism-less-is-more.md
│       ├── 📄 ADR-001-webaudio-lookahead-and-strict-xml-playback.md
│       ├── 📄 ADR-002-osmd-svg-synchronization-and-focus-isolation.md
│       ├── 📄 ADR-003-soundslice-minimalist-ui-ptbr.md
│       └── 📄 ADR-004-msa-clef-remapping-and-ccb-orchestra-catalog.md
├── 📁 public/ # Assets estáticos musicais, mascote Fufu e ícones do PWA
│   └── 📁 assets/
│       ├── 📁 aistudio/
│       │   └── 📄 image_d932f560.png
│       ├── 📄 Issa_Academy-Fufu.png
│       ├── 📄 fufu-acerto-aplausos.png
│       ├── 📄 fufu-acerto-esperto.png
│       ├── 📄 fufu-acerto-festa.png
│       ├── 📄 fufu-acerto-joinha.png
│       ├── 📄 fufu-acerto-palmas.png
│       ├── 📄 fufu-acerto-piscando.png
│       ├── 📄 fufu-acerto-toca-aqui.png
│       ├── 📄 fufu-batuta-expontaneo.png
│       ├── 📄 fufu-batuta.png
│       ├── 📄 fufu-caneta.png
│       ├── 📄 fufu-capa-home-pagge.png
│       ├── 📄 fufu-capa-mestre-da-clave.png
│       ├── 📄 fufu-capa-simulado.png
│       ├── 📄 fufu-casaco.png
│       ├── 📄 fufu-chapeu.png
│       ├── 📄 fufu-comemorando-trofeu-G-clave.png
│       ├── 📄 fufu-comemorando-trofeu-gabarito.png
│       ├── 📄 fufu-erro-acontece.png
│       ├── 📄 fufu-erro-carinho.png
│       ├── 📄 fufu-erro-encorajador.png
│       ├── 📄 fufu-erro-nao-desista.png
│       ├── 📄 fufu-erro-presente.png
│       ├── 📄 fufu-erro-tapinha.png
│       ├── 📄 fufu-neutro.png
│       ├── 📄 fufu-oculos.png
│       ├── 📄 fufu-pensativo.png
│       ├── 📄 fufu-prancheta.png
│       ├── 📄 fufu-violino.png
│       ├── 📄 social-home.png
│       └── 📄 social-whatsapp.png
├── 📁 scripts/ # Scripts de integração e automação (Google Apps Script Webhook e Seed Supabase)
│   ├── 📄 google-sheets-feedback-webhook.gs
│   └── 📄 seed-supabase.mjs
├── 📁 src/ # Código-fonte da aplicação React 19 / TypeScript
│   ├── 📁 core/ # Componentes centrais, contexto Admin, ContentStore híbrido, hooks e utilitários
│   │   ├── 📁 components/ # Componentes UI globais reutilizáveis (OrientationGuard, AdminFloatingBar, QuickEditModal)
│   │   │   ├── 📄 AdminFloatingBar.tsx
│   │   │   ├── 📄 OrientationGuard.tsx
│   │   │   ├── 📄 QuickEditModal.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📁 contexts/ # Contexto global de autenticação e modo de edição do Administrador (AdminContext)
│   │   │   └── 📄 AdminContext.tsx
│   │   ├── 📁 data/
│   │   │   └── 📄 initialLessons.ts
│   │   ├── 📁 hooks/ # Hooks utilitários reutilizáveis (useMobileOrientation, useLocalStorage)
│   │   │   ├── 📄 useFullscreen.ts
│   │   │   ├── 📄 useLocalStorage.ts
│   │   │   ├── 📄 useMobileOrientation.ts
│   │   │   ├── 📄 useScreenWakeLock.test.tsx
│   │   │   └── 📄 useScreenWakeLock.ts
│   │   ├── 📁 services/ # Camada de dados unificada Supabase Cloud + Offline (contentStore, supabaseClient)
│   │   │   ├── 📄 contentStore.test.ts
│   │   │   ├── 📄 contentStore.ts
│   │   │   └── 📄 supabaseClient.ts
│   │   ├── 📁 types/
│   │   │   └── 📄 lessons.ts
│   │   ├── 📁 utils/ # Motores lógicos e utilitários globais (audio.ts, notesData.ts, paths.ts)
│   │   │   ├── 📄 audio.test.ts
│   │   │   ├── 📄 audio.ts
│   │   │   ├── 📄 notesData.test.ts
│   │   │   ├── 📄 notesData.ts
│   │   │   ├── 📄 paths.test.ts
│   │   │   └── 📄 paths.ts
│   │   └── 📄 types.ts
│   ├── 📁 modules/ # Módulos de domínio isolados do ecossistema Issa Academy
│   │   ├── 📁 admin/ # Painel Administrativo e CMS Híbrido (AdminDashboard)
│   │   │   ├── 📄 AdminDashboard.test.tsx
│   │   │   └── 📄 AdminDashboard.tsx
│   │   ├── 📁 home/ # Tela inicial de boas-vindas com 4 cards de estudo e mascote Fufu (WelcomeHome)
│   │   │   └── 📄 WelcomeHome.tsx
│   │   ├── 📁 mestre-da-clave/ # Jogo interativo de leitura musical em pauta Canvas 60fps (Sol, Fá e Dó)
│   │   │   ├── 📁 components/ # Componentes modulares de interface do jogo (MestreOverlays)
│   │   │   │   ├── 📄 MestreOverlays.test.tsx
│   │   │   │   └── 📄 MestreOverlays.tsx
│   │   │   ├── 📁 engine/ # Motor de física, partículas e vetores SMuFL Bravura (gameEntities, clefVectors)
│   │   │   │   ├── 📄 clefVectors.test.ts
│   │   │   │   ├── 📄 clefVectors.ts
│   │   │   │   ├── 📄 gameEntities.test.ts
│   │   │   │   └── 📄 gameEntities.ts
│   │   │   ├── 📄 AGENTS.md
│   │   │   └── 📄 MestreDaClave.tsx
│   │   ├── 📁 partituras/ # Estúdio de Partituras MusicXML & Hinário 5 CCB estilo Soundslice (PartiturasStudio)
│   │   │   ├── 📁 components/ # Componentes minimalistas do estúdio (TopBar, TransportBar, ViolinFingerboard, RepertoirePanelModal)
│   │   │   │   ├── 📄 CountInBanner.tsx
│   │   │   │   ├── 📄 RepertoirePanelModal.tsx
│   │   │   │   ├── 📄 ScoreToolbar.tsx
│   │   │   │   ├── 📄 TopBar.tsx
│   │   │   │   ├── 📄 TransportBar.tsx
│   │   │   │   └── 📄 ViolinFingerboard.tsx
│   │   │   ├── 📁 data/ # Catálogo de partituras MSA e Hinário 5 CCB com sincronização Supabase/localStorage
│   │   │   │   └── 📄 sampleScores.ts
│   │   │   ├── 📁 services/ # Motores imperativos OSMD SVG (ScoreController) e Web Audio Piano de Cauda (AudioScheduler)
│   │   │   │   ├── 📄 AudioScheduler.ts
│   │   │   │   └── 📄 ScoreController.ts
│   │   │   ├── 📁 types/ # Contratos TypeScript de domínio musical, fatias temporais e configuração de loop
│   │   │   │   └── 📄 music.ts
│   │   │   ├── 📁 utils/ # Funções matemáticas puras de tempo, BPM, MIDI, solfejo pt-BR e testes (musicMath)
│   │   │   │   ├── 📄 musicMath.test.ts
│   │   │   │   └── 📄 musicMath.ts
│   │   │   ├── 📄 AGENTS.md
│   │   │   └── 📄 PartiturasStudio.tsx
│   │   └── 📁 simulado/ # Simulado oficial Dual-Mode do método MSA com 552+ questões validadas via Zod
│   │       ├── 📁 components/ # Componentes de interface do simulado (SimuladoMenu e QuestionFeedbackModal)
│   │       │   ├── 📄 QuestionFeedbackModal.test.tsx
│   │       │   ├── 📄 QuestionFeedbackModal.tsx
│   │       │   ├── 📄 SimuladoMenu.test.tsx
│   │       │   └── 📄 SimuladoMenu.tsx
│   │       ├── 📁 questions/ # Bancos de questões Zod em JSON (q_f01 a q_f16)
│   │       │   ├── 📄 q_f01.json
│   │       │   ├── 📄 q_f02.json
│   │       │   ├── 📄 q_f03.json
│   │       │   ├── 📄 q_f04.json
│   │       │   ├── 📄 q_f05.json
│   │       │   ├── 📄 q_f06.json
│   │       │   ├── 📄 q_f07.json
│   │       │   ├── 📄 q_f08.json
│   │       │   ├── 📄 q_f09.json
│   │       │   ├── 📄 q_f10.json
│   │       │   ├── 📄 q_f11.json
│   │       │   ├── 📄 q_f12.json
│   │       │   ├── 📄 q_f13.json
│   │       │   ├── 📄 q_f14.json
│   │       │   ├── 📄 q_f15.json
│   │       │   ├── 📄 q_f16.json
│   │       │   ├── 📄 schema.test.ts
│   │       │   └── 📄 schema.ts
│   │       ├── 📁 utils/ # Utilitários de telemetria, webhook e fila offline de feedbacks
│   │       │   ├── 📄 feedbackReporter.test.ts
│   │       │   └── 📄 feedbackReporter.ts
│   │       ├── 📄 AGENTS.md
│   │       ├── 📄 SimuladoMsa.test.ts
│   │       └── 📄 SimuladoMsa.tsx
│   ├── 📁 test/
│   │   └── 📄 setup.ts
│   ├── 📄 App.tsx
│   ├── 📄 index.css
│   └── 📄 main.tsx
├── 📁 supabase/ # Schema SQL e políticas Row Level Security (RLS) do banco PostgreSQL no Supabase
│   └── 📄 schema.sql
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 AGENTS.md # Regras globais do workspace, invariantes musicais e definição de subagentes
├── 📄 ARCHITECTURE.md # Visão arquitetural viva e diagramas Mermaid do ecossistema unificado
├── 📄 CHANGELOG.md # Histórico detalhado de alterações e entregas do projeto
├── 📄 FLUXO_USUARIO.md # Mapa de fluxo UX e navegação dos 6 módulos
├── 📄 GEMINI.md # Contexto imediato do agente e protocolo obrigatório de check-in no GitHub
├── 📄 MAPA_RAIZ.md # Mapa arquitetural físico do projeto gerado automaticamente
├── 📄 README.md
├── 📄 ROADMAP.md # Controle de entregas homologadas e backlog ativo
├── 📄 bun.lock
├── 📄 eslint.config.js
├── 📄 index.html
├── 📄 metadata.json
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
└── 📄 vitest.config.ts
```
