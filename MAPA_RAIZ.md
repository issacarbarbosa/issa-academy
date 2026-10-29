# Mapa da Raiz do Projeto: Issa Academy

Este arquivo apresenta a estrutura de diretórios e a finalidade de cada bloco arquitetural do projeto.
Sincronizado automaticamente via script de varredura (.agents/skills/map-builder/scripts/generate-map.js).

```text
issa-academy/
├── 📁 .agents/ # Configurações de agentes IA, skills especializadas e regras de projeto
│   ├── 📁 hooks/ # Hooks de ciclo de vida do agente (ESLint e guardiões de documentação)
│   │   ├── 📄 run-linter.cjs
│   │   └── 📄 stop-guardian.cjs
│   ├── 📁 rules/ # Regras de comportamento, qualidade e diretrizes de projeto
│   │   ├── 📄 atualizacao-roadmap.md
│   │   ├── 📄 code-quality.md
│   │   ├── 📄 design-blueprint.md
│   │   ├── 📄 git-workflow.md
│   │   ├── 📄 project-context.md
│   │   ├── 📄 search-first.md
│   │   ├── 📄 security.md
│   │   └── 📄 ts-rules.md
│   ├── 📁 skills/ # Habilidades especializadas do agente (áudio, teoria, deploy, mapas)
│   │   ├── 📁 canvas-playtest/
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 deploy-helper/
│   │   │   ├── 📁 scripts/
│   │   │   │   └── 📄 pre-deploy-check.js
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
│   │   ├── 📁 question-bank-auditor/
│   │   │   ├── 📁 scripts/
│   │   │   │   └── 📄 audit-banks.cjs
│   │   │   └── 📄 SKILL.md
│   │   └── 📁 rhythm-audio-engine/
│   │       └── 📄 SKILL.md
│   └── 📄 hooks.json
├── 📁 .github/
│   └── 📁 workflows/
│       ├── 📄 deploy.yml
│       └── 📄 supabase-keepalive.yml
├── 📁 public/ # Assets estáticos musicais, imagens e ícones do PWA
│   └── 📁 assets/
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
├── 📁 scripts/ # Scripts de integração e automação (ex: Google Apps Script Webhook)
│   └── 📄 google-sheets-feedback-webhook.gs
├── 📁 src/ # Código-fonte da aplicação React/TypeScript
│   ├── 📁 core/ # Componentes centrais, hooks, utilitários e motor de áudio
│   │   ├── 📁 components/ # Componentes UI globais reutilizáveis (OrientationGuard)
│   │   │   ├── 📄 AdminFloatingBar.tsx
│   │   │   ├── 📄 OrientationGuard.tsx
│   │   │   ├── 📄 QuickEditModal.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📁 contexts/
│   │   │   └── 📄 AdminContext.tsx
│   │   ├── 📁 hooks/ # Hooks utilitários reutilizáveis (useMobileOrientation, useLocalStorage)
│   │   │   ├── 📄 useLocalStorage.ts
│   │   │   └── 📄 useMobileOrientation.ts
│   │   ├── 📁 services/
│   │   │   ├── 📄 contentStore.test.ts
│   │   │   ├── 📄 contentStore.ts
│   │   │   └── 📄 supabaseClient.ts
│   │   ├── 📁 utils/ # Motores lógicos e utilitários (ex: audio.ts, notesData.ts, paths.ts)
│   │   │   ├── 📄 audio.test.ts
│   │   │   ├── 📄 audio.ts
│   │   │   ├── 📄 notesData.test.ts
│   │   │   ├── 📄 notesData.ts
│   │   │   ├── 📄 paths.test.ts
│   │   │   └── 📄 paths.ts
│   │   └── 📄 types.ts
│   ├── 📁 modules/ # Módulos de funcionalidades do projeto
│   │   ├── 📁 admin/
│   │   │   ├── 📄 AdminDashboard.test.tsx
│   │   │   └── 📄 AdminDashboard.tsx
│   │   ├── 📁 aulas/
│   │   │   ├── 📁 data/
│   │   │   │   └── 📄 initialLessons.ts
│   │   │   ├── 📄 AulasMsa.test.tsx
│   │   │   ├── 📄 AulasMsa.tsx
│   │   │   └── 📄 types.ts
│   │   ├── 📁 home/ # Tela inicial de boas-vindas e seleção de modos (WelcomeHome)
│   │   │   └── 📄 WelcomeHome.tsx
│   │   ├── 📁 mestre-da-clave/ # Jogo interativo de leitura musical em pauta Canvas 60fps
│   │   │   ├── 📁 components/ # Componentes modulares de interface (MestreOverlays)
│   │   │   │   ├── 📄 MestreOverlays.test.tsx
│   │   │   │   └── 📄 MestreOverlays.tsx
│   │   │   ├── 📁 engine/ # Motor de física, partículas e geração de notas (gameEntities, clefVectors)
│   │   │   │   ├── 📄 clefVectors.test.ts
│   │   │   │   ├── 📄 clefVectors.ts
│   │   │   │   ├── 📄 gameEntities.test.ts
│   │   │   │   └── 📄 gameEntities.ts
│   │   │   ├── 📄 AGENTS.md
│   │   │   └── 📄 MestreDaClave.tsx
│   │   └── 📁 simulado/ # Simulado oficial do método MSA com validação Zod e feedbacks sonoros
│   │       ├── 📁 components/ # Componentes de interface do simulado (menu dual-mode e modais)
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
├── 📁 supabase/
│   └── 📄 schema.sql
├── 📄 .env
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 CHANGELOG.md # Histórico detalhado de alterações e entregas do projeto
├── 📄 FLUXO_USUARIO.md # Mapa de fluxo UX e navegação
├── 📄 MAPA_RAIZ.md # Mapa arquitetural físico do projeto
├── 📄 README.md
├── 📄 ROADMAP.md # Controle de pendências ativas e próximos passos
├── 📄 eslint.config.js
├── 📄 index.html
├── 📄 metadata.json
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
└── 📄 vitest.config.ts
```
