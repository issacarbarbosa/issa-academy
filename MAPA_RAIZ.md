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
│   │   ├── 📄 AGENTS.md
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
│   │   ├── 📁 osmd-score-synchronization/
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
│   │   ├── 📁 soundslice-minimalist-ux/
│   │   │   ├── 📁 references/
│   │   │   │   └── 📄 ptbr-musical-terminology.md
│   │   │   └── 📄 SKILL.md
│   │   └── 📁 webaudio-precision-scheduler/
│   │       ├── 📁 examples/
│   │       │   └── 📄 scheduler-frame-payload.json
│   │       ├── 📁 references/
│   │       │   └── 📄 acoustic-synthesis-and-countin.md
│   │       └── 📄 SKILL.md
│   └── 📄 hooks.json
├── 📁 .aistudio/
│   └── 📁 artifacts/
│       └── 📁 brain/
│           └── 📁 7a0da7e7-7913-4d5b-a0f8-cb507be9aea5/
│               ├── 📁 .tempmediaStorage/
│               │   ├── 📄 media_1793010761359_feea3137.png
│               │   ├── 📄 media_1793010859557_8d175457.png
│               │   ├── 📄 media_1793010870321_d7195099.png
│               │   ├── 📄 media_1793011054563_260fda9d.png
│               │   ├── 📄 media_1793011056263_bb35364c.png
│               │   ├── 📄 media_1793012639238_ccbff543.png
│               │   ├── 📄 media_1793029644573_aef5aa72.png
│               │   ├── 📄 media_1793030024596_0381034e.png
│               │   ├── 📄 media_1793030025165_1435f5ba.png
│               │   ├── 📄 media_1793030233264_df47aedd.png
│               │   ├── 📄 media_1793030233827_e1bd6898.png
│               │   ├── 📄 media_1793030234723_a37e0aa4.png
│               │   ├── 📄 media_1793039750180_aa585eed.png
│               │   ├── 📄 media_1793039854831_114416c7.png
│               │   ├── 📄 media_1793039929192_ca344439.png
│               │   ├── 📄 media_1793039986937_ac7db342.png
│               │   ├── 📄 media_1793039987668_a651ffc5.png
│               │   ├── 📄 media_1793039988187_1033bb8c.png
│               │   ├── 📄 media_1793098524116_ab1c3de5.png
│               │   ├── 📄 media_1793098524400_80b501ab.png
│               │   ├── 📄 media_1793098525654_e0d90845.png
│               │   ├── 📄 media_1793098525979_a93493b9.png
│               │   ├── 📄 media_1793098632007_fd2faa63.png
│               │   ├── 📄 media_1793099754262_ce154b6e.png
│               │   ├── 📄 media_1793101437722_af0dd0bb.png
│               │   ├── 📄 media_1793101451410_9cd58496.png
│               │   ├── 📄 media_1793101463075_bc8426a6.png
│               │   ├── 📄 media_1793101837980_a0472ab8.png
│               │   ├── 📄 media_1793101867236_988efa33.png
│               │   ├── 📄 media_1793101897530_cae4da0d.png
│               │   ├── 📄 media_1793102314975_42a03112.png
│               │   ├── 📄 media_1793102344129_029f697e.png
│               │   ├── 📄 media_1793102378827_978d0ede.png
│               │   ├── 📄 media_1793179799352_4ed849eb.png
│               │   ├── 📄 media_1793179801417_9f1141e3.png
│               │   ├── 📄 media_1793181373864_26e75dd9.png
│               │   ├── 📄 media_1793181376797_d0b918ba.png
│               │   ├── 📄 media_1793181378590_afb59df1.png
│               │   ├── 📄 media_1793181379340_92121f4a.png
│               │   ├── 📄 media_1793181766142_6ee0d103.png
│               │   ├── 📄 media_1793183425820_5654646a.png
│               │   ├── 📄 media_1793205531629_c6779cc4.png
│               │   ├── 📄 media_1793205532173_07d13a7e.png
│               │   ├── 📄 media_1793205532683_38f4dd52.png
│               │   ├── 📄 media_1793205533591_c35e72b9.png
│               │   ├── 📄 media_1793205736774_a51787fc.png
│               │   ├── 📄 media_1793205737538_5695578e.png
│               │   ├── 📄 media_1793260402436_5fa4c3bf.png
│               │   ├── 📄 media_1793260589544_4c82a147.png
│               │   ├── 📄 media_1793261587865_ed0dc87c.png
│               │   ├── 📄 media_1793263519380_6ccfa3f0.png
│               │   ├── 📄 media_1793266585270_522f8d24.png
│               │   ├── 📄 media_1793268082113_2f2429e9.png
│               │   ├── 📄 media_1793269721491_fac3a5ea.png
│               │   ├── 📄 media_1793269721640_7af59fda.png
│               │   ├── 📄 media_1793269786931_8896e7a9.png
│               │   ├── 📄 media_1793269787283_1e5ce0e8.png
│               │   ├── 📄 media_1793271409322_448d6470.png
│               │   ├── 📄 media_1793271410403_930e6047.png
│               │   ├── 📄 media_1793273202331_0fd07f6d.png
│               │   ├── 📄 media_1793275383374_1d5b6e27.png
│               │   ├── 📄 media_1793275515854_5efa3c02.png
│               │   ├── 📄 media_1793281840637_8edbdc3a.png
│               │   ├── 📄 media_1793286842051_eeef6cc4.png
│               │   ├── 📄 media_1793286842123_616976dc.png
│               │   ├── 📄 media_1793286980447_89628ad2.png
│               │   ├── 📄 media_1793287013654_82b521b7.png
│               │   ├── 📄 media_1793287014361_94349ad7.png
│               │   └── 📄 media_1793287014919_481b07c4.png
│               ├── 📄 implementation_plan.md
│               └── 📄 implementation_plan.md.metadata.json
├── 📁 .github/
│   └── 📁 workflows/
│       ├── 📄 deploy.yml
│       └── 📄 supabase-keepalive.yml
├── 📁 .playwright-cli/
│   ├── 📄 console-2026-10-29T06-49-51-114Z.log
│   ├── 📄 console-2026-10-29T06-53-26-290Z.log
│   ├── 📄 console-2026-10-29T07-52-32-573Z.log
│   ├── 📄 console-2026-10-29T07-55-53-049Z.log
│   ├── 📄 console-2026-10-29T08-11-47-118Z.log
│   ├── 📄 console-2026-10-29T08-43-30-276Z.log
│   ├── 📄 console-2026-10-29T08-44-38-986Z.log
│   ├── 📄 console-2026-10-29T09-35-52-154Z.log
│   ├── 📄 console-2026-10-29T10-00-59-571Z.log
│   ├── 📄 console-2026-10-29T10-27-58-629Z.log
│   ├── 📄 console-2026-10-29T10-29-14-319Z.log
│   ├── 📄 console-2026-10-29T10-56-21-625Z.log
│   ├── 📄 console-2026-10-29T11-26-08-220Z.log
│   ├── 📄 console-2026-10-29T12-01-42-488Z.log
│   ├── 📄 console-2026-10-29T12-02-42-433Z.log
│   ├── 📄 console-2026-10-29T12-05-04-090Z.log
│   ├── 📄 console-2026-10-29T15-13-36-096Z.log
│   ├── 📄 console-2026-10-29T15-14-28-839Z.log
│   ├── 📄 console-2026-10-29T15-16-22-377Z.log
│   ├── 📄 cordas-final.png
│   ├── 📄 cordas-violin-and-settings.png
│   ├── 📄 issa-academy-home.png
│   ├── 📄 page-2026-10-29T06-49-52-970Z.yml
│   ├── 📄 page-2026-10-29T06-53-28-627Z.yml
│   ├── 📄 page-2026-10-29T07-52-34-267Z.yml
│   ├── 📄 page-2026-10-29T07-52-36-781Z.yml
│   ├── 📄 page-2026-10-29T07-52-38-248Z.yml
│   ├── 📄 page-2026-10-29T07-55-55-269Z.yml
│   ├── 📄 page-2026-10-29T07-55-57-381Z.yml
│   ├── 📄 page-2026-10-29T07-55-58-800Z.yml
│   ├── 📄 page-2026-10-29T08-11-48-877Z.yml
│   ├── 📄 page-2026-10-29T08-11-51-322Z.yml
│   ├── 📄 page-2026-10-29T08-11-52-775Z.yml
│   ├── 📄 page-2026-10-29T08-43-32-627Z.yml
│   ├── 📄 page-2026-10-29T08-44-41-210Z.yml
│   ├── 📄 page-2026-10-29T08-44-43-482Z.yml
│   ├── 📄 page-2026-10-29T08-44-44-865Z.yml
│   ├── 📄 page-2026-10-29T09-35-54-629Z.yml
│   ├── 📄 page-2026-10-29T09-35-57-063Z.yml
│   ├── 📄 page-2026-10-29T09-35-58-559Z.yml
│   ├── 📄 page-2026-10-29T10-01-01-599Z.yml
│   ├── 📄 page-2026-10-29T10-01-03-075Z.yml
│   ├── 📄 page-2026-10-29T10-01-04-481Z.yml
│   ├── 📄 page-2026-10-29T10-28-00-864Z.yml
│   ├── 📄 page-2026-10-29T10-28-02-407Z.yml
│   ├── 📄 page-2026-10-29T10-28-07-243Z.yml
│   ├── 📄 page-2026-10-29T10-29-16-189Z.yml
│   ├── 📄 page-2026-10-29T10-29-17-607Z.yml
│   ├── 📄 page-2026-10-29T10-29-19-035Z.yml
│   ├── 📄 page-2026-10-29T10-29-25-676Z.yml
│   ├── 📄 page-2026-10-29T10-56-24-240Z.yml
│   ├── 📄 page-2026-10-29T10-56-25-756Z.yml
│   ├── 📄 page-2026-10-29T10-56-27-200Z.yml
│   ├── 📄 page-2026-10-29T10-56-30-045Z.yml
│   ├── 📄 page-2026-10-29T10-56-31-479Z.yml
│   ├── 📄 page-2026-10-29T11-26-10-115Z.yml
│   ├── 📄 page-2026-10-29T11-26-33-119Z.yml
│   ├── 📄 page-2026-10-29T11-26-43-827Z.yml
│   ├── 📄 page-2026-10-29T11-26-47-747Z.yml
│   ├── 📄 page-2026-10-29T12-01-44-327Z.yml
│   ├── 📄 page-2026-10-29T12-02-44-495Z.yml
│   ├── 📄 page-2026-10-29T12-02-46-712Z.yml
│   ├── 📄 page-2026-10-29T12-02-48-172Z.yml
│   ├── 📄 page-2026-10-29T12-05-05-793Z.yml
│   ├── 📄 page-2026-10-29T12-05-07-948Z.yml
│   ├── 📄 page-2026-10-29T13-50-01-556Z.yml
│   ├── 📄 page-2026-10-29T15-13-37-881Z.yml
│   ├── 📄 page-2026-10-29T15-13-44-073Z.yml
│   ├── 📄 page-2026-10-29T15-13-49-329Z.yml
│   ├── 📄 page-2026-10-29T15-13-51-665Z.yml
│   ├── 📄 page-2026-10-29T15-14-29-979Z.yml
│   ├── 📄 page-2026-10-29T15-14-35-010Z.yml
│   ├── 📄 page-2026-10-29T15-14-36-811Z.yml
│   ├── 📄 page-2026-10-29T15-16-23-849Z.yml
│   ├── 📄 page-2026-10-29T15-16-28-030Z.yml
│   ├── 📄 page-2026-10-29T15-16-31-512Z.yml
│   ├── 📄 page-2026-10-29T15-16-34-426Z.yml
│   ├── 📄 page-2026-10-29T15-16-37-278Z.yml
│   ├── 📄 page-2026-10-29T15-16-40-726Z.yml
│   ├── 📄 r1-repertoire-msa-seq.png
│   ├── 📄 r2-repertoire-msa-seq.png
│   ├── 📄 r3-minimal-repertoire.png
│   ├── 📄 r4-focus-pill.png
│   ├── 📄 r5-tag-only-repertoire.png
│   ├── 📄 r6-musicxml-btn.png
│   ├── 📄 r7-admin-grid-fixed.png
│   ├── 📄 r7-admin-grid.png
│   ├── 📄 r7-single-topbar-solfejo.png
│   ├── 📄 r7-student-grid.png
│   ├── 📄 r8-licao1-first-space.png
│   ├── 📄 r8-licao2-first-space.png
│   ├── 📄 unified-r1-aulas.png
│   ├── 📄 unified-r1-home.png
│   ├── 📄 unified-r1-mobile-home.png
│   ├── 📄 unified-r1-partituras-cordas.png
│   ├── 📄 unified-r1-partituras-msa.png
│   ├── 📄 unified-r1-simulado.png
│   └── 📄 universal-piano-settings.png
├── 📁 docs/
│   └── 📁 decisions/
│       ├── 📄 004-radical-minimalism-less-is-more.md
│       ├── 📄 ADR-001-webaudio-lookahead-and-strict-xml-playback.md
│       ├── 📄 ADR-002-osmd-svg-synchronization-and-focus-isolation.md
│       ├── 📄 ADR-003-soundslice-minimalist-ui-ptbr.md
│       └── 📄 ADR-004-msa-clef-remapping-and-ccb-orchestra-catalog.md
├── 📁 public/ # Assets estáticos musicais, imagens e ícones do PWA
│   └── 📁 assets/
│       ├── 📁 aistudio/
│       │   ├── 📄 Li__o_1_77aa327d.png
│       │   ├── 📄 Li__o_2_e9fe8a66.png
│       │   ├── 📄 Li__o_3_5fd30ac0.png
│       │   ├── 📄 Li__o_4_6f9a5e94.png
│       │   ├── 📄 Li__o_5_5c6c517e.png
│       │   ├── 📄 Screenshot_20261026_151748_Chrome_26d0966a.jpg
│       │   ├── 📄 image_05eb5616.png
│       │   ├── 📄 image_0845e0a0.png
│       │   ├── 📄 image_189e1286.png
│       │   ├── 📄 image_20c8718c.png
│       │   ├── 📄 image_39ac45f0.png
│       │   ├── 📄 image_46f03b25.png
│       │   ├── 📄 image_56d0863b.png
│       │   ├── 📄 image_5df9d099.png
│       │   ├── 📄 image_6dceed1b.png
│       │   ├── 📄 image_7c3b46f3.png
│       │   ├── 📄 image_847d6dff.png
│       │   ├── 📄 image_8e41402c.png
│       │   ├── 📄 image_94e4c638.png
│       │   ├── 📄 image_9c4e9f90.png
│       │   ├── 📄 image_b7090397.png
│       │   ├── 📄 image_c4dcc4fd.png
│       │   ├── 📄 image_e7e2f047.png
│       │   ├── 📄 image_f3a7ef88.png
│       │   ├── 📄 image_f674b8e2.png
│       │   ├── 📄 image_f8b25651.png
│       │   ├── 📄 image_fc4f5393.png
│       │   ├── 📄 image_fcad497e.png
│       │   └── 📄 screenshot_1_dc6656a1.png
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
│   ├── 📄 google-sheets-feedback-webhook.gs
│   └── 📄 seed-supabase.mjs
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
│   │   ├── 📁 partituras/
│   │   │   ├── 📁 components/
│   │   │   │   ├── 📄 CountInBanner.tsx
│   │   │   │   ├── 📄 RepertoirePanelModal.tsx
│   │   │   │   ├── 📄 ScoreToolbar.tsx
│   │   │   │   ├── 📄 TopBar.tsx
│   │   │   │   ├── 📄 TransportBar.tsx
│   │   │   │   └── 📄 ViolinFingerboard.tsx
│   │   │   ├── 📁 data/
│   │   │   │   └── 📄 sampleScores.ts
│   │   │   ├── 📁 services/
│   │   │   │   ├── 📄 AudioScheduler.ts
│   │   │   │   └── 📄 ScoreController.ts
│   │   │   ├── 📁 types/
│   │   │   │   └── 📄 music.ts
│   │   │   ├── 📁 utils/
│   │   │   │   ├── 📄 musicMath.test.ts
│   │   │   │   └── 📄 musicMath.ts
│   │   │   ├── 📄 AGENTS.md
│   │   │   └── 📄 PartiturasStudio.tsx
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
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 AGENTS.md
├── 📄 ARCHITECTURE.md
├── 📄 CHANGELOG.md # Histórico detalhado de alterações e entregas do projeto
├── 📄 FLUXO_USUARIO.md # Mapa de fluxo UX e navegação
├── 📄 GEMINI.md
├── 📄 MAPA_RAIZ.md # Mapa arquitetural físico do projeto
├── 📄 README.md
├── 📄 ROADMAP.md # Controle de pendências ativas e próximos passos
├── 📄 bun.lock
├── 📄 eslint.config.js
├── 📄 index.html
├── 📄 metadata.json
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
└── 📄 vitest.config.ts
```
