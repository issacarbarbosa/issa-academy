# Mapa da Raiz do Projeto: Issa Academy

Este arquivo foi gerado automaticamente e apresenta a estrutura de diretórios e a finalidade de cada bloco arquitetural do projeto.

```text
issa-academy/
├── 📁 .agents/ # Configurações de agentes IA, skills especializadas e regras de projeto
│   ├── 📁 hooks/ # Hooks de ciclo de vida do agente (ESLint automático)
│   │   └── 📄 run-linter.cjs
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
│   │   │   └── 📄 SKILL.md
│   │   └── 📁 rhythm-audio-engine/
│   │       └── 📄 SKILL.md
│   └── 📄 hooks.json
├── 📁 .github/
│   └── 📁 workflows/
│       └── 📄 deploy.yml
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
├── 📁 src/ # Código-fonte da aplicação React/TypeScript
│   ├── 📁 core/ # Componentes centrais, hooks, utilitários e motor de áudio
│   │   ├── 📁 components/ # Componentes UI globais reutilizáveis (OrientationGuard)
│   │   │   ├── 📄 OrientationGuard.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📁 hooks/ # Hooks utilitários reutilizáveis (useMobileOrientation, useLocalStorage)
│   │   │   ├── 📄 useLocalStorage.ts
│   │   │   └── 📄 useMobileOrientation.ts
│   │   ├── 📁 utils/ # Motores lógicos e utilitários (ex: audio.ts, notesData.ts, paths.ts)
│   │   │   ├── 📄 audio.ts
│   │   │   ├── 📄 notesData.test.ts
│   │   │   ├── 📄 notesData.ts
│   │   │   ├── 📄 paths.test.ts
│   │   │   └── 📄 paths.ts
│   │   └── 📄 types.ts
│   ├── 📁 modules/ # Módulos de funcionalidades do projeto
│   │   ├── 📁 home/ # Tela inicial de boas-vindas e seleção de modos (WelcomeHome)
│   │   │   └── 📄 WelcomeHome.tsx
│   │   ├── 📁 mestre-da-clave/ # Jogo interativo de leitura musical em pauta Canvas 60fps
│   │   │   ├── 📁 engine/ # Motor de física, partículas e geração de notas (gameEntities)
│   │   │   │   ├── 📄 gameEntities.test.ts
│   │   │   │   └── 📄 gameEntities.ts
│   │   │   └── 📄 MestreDaClave.tsx
│   │   └── 📁 simulado/ # Simulado oficial do método MSA com validação Zod e feedbacks sonoros
│   │       ├── 📁 questions/ # Bancos de questões Zod em JSON (q_f01 a q_f05)
│   │       │   ├── 📄 q_f01.json
│   │       │   ├── 📄 q_f02.json
│   │       │   ├── 📄 q_f03.json
│   │       │   ├── 📄 q_f04.json
│   │       │   ├── 📄 q_f05.json
│   │       │   ├── 📄 schema.test.ts
│   │       │   └── 📄 schema.ts
│   │       ├── 📄 SimuladoMsa.test.ts
│   │       └── 📄 SimuladoMsa.tsx
│   ├── 📁 test/
│   │   └── 📄 setup.ts
│   ├── 📄 App.tsx
│   ├── 📄 index.css
│   └── 📄 main.tsx
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 FLUXO_USUARIO.md # Mapa de fluxo UX e navegação
├── 📄 MAPA_RAIZ.md # Mapa arquitetural físico do projeto
├── 📄 README.md
├── 📄 ROADMAP.md # Controle de pendências e histórico do projeto
├── 📄 eslint.config.js
├── 📄 index.html
├── 📄 metadata.json
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
└── 📄 vitest.config.ts
```

---
*Gerado automaticamente em: 17/10/2026, 21:50:05*
