# Changelog: Issa Academy

Todas as alterações notáveis, refatorações, marcos arquiteturais e correções da plataforma **Issa Academy** estão documentadas neste arquivo, seguindo o padrão cronológico.

---

## [1.5.0] - 2026-10-30 (Planejamento Estrat�gico, Oculta��o de M�dulos N�o Lan�ados & Quality Gate)
### Modificado
- **Oculta��o do Est�dio de Partituras em Produ��o**:
  - O card e rota do m�dulo (/#/partituras) agora s�o ativados exclusivamente em desenvolvimento local (import.meta.env.DEV) ou para o administrador (isAdmin), preservando uma visualiza��o limpa e focada em produ��o para os alunos at� a importa��o completa do acervo MusicXML.
- **Remo��o do M�dulo Tempor�rio de Aulas do MSA**:
  - C�digo do m�dulo descontinuado da base ativa (src/modules/aulas/) at� que as aulas p�s-fase 3 sejam gravadas; tipagens promovidas para src/core/types/lessons.ts e dados para src/core/data/initialLessons.ts.
  - Home simplificada para os dois m�dulos oficiais est�veis: **Mestre da Clave** e **Simulado MSA** (mais o Est�dio em modo dev/admin).
- **Planejamento Estrat�gico Expandido (ROADMAP.md)**:
  - Detalhamento de 7 Sprints: Migra��o para Cloudflare Pages com reposit�rio privado, Pipeline MusicXML via MuseScore/OMR, Escuta e Afina��o em Tempo Real (estilo Tonestro), Login de Alunos & Monetiza��o, IA Educacional Google AI Studio com cards anotados SVG, e Expans�o para Viola/Celo e �rg�o.

---

## [1.4.1] - 2026-10-30 (Sincronização Híbrida AI Studio ⇄ GitHub ⇄ Antigravity & Auditoria Global)
### Adicionado
- **Skill e Automação de Sincronização Híbrida (`.agents/skills/github-hybrid-sync/`)**:
  - Script executável `sync-check.sh` para conferência obrigatória no início de cada conversa (no Google AI Studio e no Google Antigravity) contra `https://github.com/issacarbarbosa/issa-academy.git` (`main`) e publicação direta via `GITHUB_TOKEN`.
  - Protocolo obrigatório de início de conversa documentado em `GEMINI.md`, `AGENTS.md`, `.agents/rules/git-workflow.md` (`trigger: always_on`) e `.agents/rules/project-context.md`.
- **Portão de Qualidade Unificado (108 Testes Unitários)**:
  - Integração das 14 suítes Vitest (90 testes) + suíte `node:test` do Estúdio de Partituras (`musicMath.test.ts`, 18 testes) no comando `npm run test`.
  - Sincronização de `package-lock.json` e tipagem estrita (`NotePayload`, `VoicePartInfo`, `ScoreRenderOptions` e preview sonoro no `ViolinFingerboard`) para aprovação 100% no GitHub Actions.

---

## [1.4.0] - 2026-10-29 (Fusão Arquitetural do Estúdio de Partituras & Hinário 5 CCB)
### Adicionado
- **Módulo Estúdio de Partituras & Hinário 5 (`src/modules/partituras/` — `/#/partituras`)**:
  - 4º Card na Home (`WelcomeHome.tsx`) integrando o leitor interativo MusicXML (`opensheetmusicdisplay`) ao ecossistema Issa Academy.
  - **Motor Universal de Piano de Cauda Didático (`'acoustic-grand'`)** com amostras Salamander Grand Piano V3 (`A1`–`C7`), modelagem física de 3 cordas uníssonas em estéreo, ataque claro de martelo (`18ms`) e sustentação fiel à nota escrita.
  - **Catálogo MSA & Hinário 5 CCB**: 22 lições do MSA em sequência contínua (Leitura Rítmica no 1º espaço `F4` e Solfejo nas 3 claves `𝄞 Sol`, `𝄡 Dó`, `𝄢 Fá`) + Hinos do Hinário 5 CCB.
  - **Ferramentas Visuais do Hinário de Cordas (`edition === 'cordas'`)**: Braço do Violino (`ViolinFingerboard.tsx`) e Dedilhado colorido + arcadas (`⊓`).
  - **Persistência Híbrida Cloud**: Tabela `public.musicxml_scores` adicionada em `supabase/schema.sql` com políticas RLS para overrides de partituras pelo Administrador.

---

## [1.3.0] - 2026-10-29 (Painel Admin Híbrido, Módulo de Aulas MSA & Supabase)
### Adicionado
- **Painel de Administrador Central (`src/modules/admin/AdminDashboard.tsx`)**:
  - Acesso exclusivo via rota `/#/admin` e atalho global de teclado `Ctrl+Shift+A` (site 100% sem login para alunos).
  - Autenticação flexível: E-mail/Senha, Google OAuth via Supabase e modo de teste preview local imediato.
  - 6 Abas de Gestão:
    1. **Visão Geral & Cloud**: Contadores de banco, status Supabase, botão de 1 clique para popular banco inicial e exportação de backup JSON.
    2. **Gestor de Lições**: Criação, edição, exclusão e reordenação de lições e blocos modulares por fase.
    3. **Gestor de Questões do Simulado**: Busca textual, filtros avançados e editor completo com validação Zod para as 552+ questões.
    4. **Central de Feedbacks**: Visualização dos reportes dos alunos, mudança de status (Pendente/Em Análise/Resolvido), botão "Corrigir Questão no Editor" e exportação de planilha CSV.
    5. **Configurações do Mestre da Clave**: Ajuste de velocidade base, vidas iniciais, XP por nível e textos didáticos.
    6. **Personalização Global do Site**: Edição de títulos, mensagens do Fufu, links e banner de aviso global no topo de todas as páginas.
- **Barra Flutuante de Alternância (`src/core/components/AdminFloatingBar.tsx`)**:
  - Seletor em 1 clique entre `Visão Aluno` (oculta ferramentas de edição) e `Modo Edição` (adiciona botões "✏️ Editar" na própria tela em tempo real).
  - Modal de edição rápida in-place (`QuickEditModal.tsx`).
- **Novo Módulo: Trilha de Aulas & Lições do MSA (`src/modules/aulas/AulasMsa.tsx`)**:
  - Navegação por Período e Fase (1 a 16).
  - Videoaulas oficiais do canal `@issacarbarbosa` com player do YouTube responsivo integrado.
  - Blocos modulares: Explicação Didática, Dicas do Fufu, Regras Oficiais do MSA e figuras.
  - Botão de conclusão com persistência e atalho direto "🎯 Treinar Fase X no Simulado".
- **Infraestrutura Supabase & Camada de Dados Unificada (`contentStore.ts`)**:
  - Script SQL de migração `supabase/schema.sql` com 5 tabelas e Row Level Security (RLS).
  - Workflow de keep-alive `.github/workflows/supabase-keepalive.yml` para evitar pausa por inatividade no plano gratuito.
  - 90 testes unitários no Vitest cobrindo a nova camada de dados, módulo de aulas e painel admin.

---

## [1.2.0] - 2026-10-29 (Governança & Automação Máxima Antigravity 2.0)
### Adicionado
- **Hooks de Ciclo de Vida do Antigravity (`hooks.json`)**:
  - Correção do matcher de `PostToolUse` para `"write_file|edit_file|write_to_file|replace_file_content|multi_replace_file_content"`, habilitando linter automático no Antigravity 2.0.
  - Implementação do Hook `Stop` (`stop-guardian.cjs`): sincronização autônoma de `MAPA_RAIZ.md` e guarda para garantir atualização de documentação antes do encerramento de tarefas.
  - Validador em background de bancos de questões JSON em `run-linter.cjs` ao detectar alterações em `src/modules/simulado/questions/`.
- **`CHANGELOG.md` Separado**: Migração do histórico detalhado para desonerar o `ROADMAP.md`, reduzindo o consumo de tokens em ~65% a cada sessão de desenvolvimento.
- **Regras Hierárquicas por Módulo (`AGENTS.md`)**:
  - `src/modules/mestre-da-clave/AGENTS.md`: Diretrizes específicas do motor Canvas 60fps, calibração SMuFL (`BRAVURA_STAFF_SPACE = 362`), HiDPI e normalização de velocidade.
  - `src/modules/simulado/AGENTS.md`: Diretrizes específicas do Simulado Dual-Mode, Zod schemas, duplo Fisher-Yates e integração do Webhook Google Sheets.
- **Testes Unitários de Infraestrutura Musical**:
  - `src/core/utils/audio.test.ts`: Cobertura completa do motor de áudio Web Audio API (filtro passa-baixa key tracking adaptativo, `startNote`, `stopNote`, `stopAllNotes`, `playRewardChord`).
  - `src/modules/mestre-da-clave/engine/clefVectors.test.ts`: Cobertura dos traçados vetoriais SMuFL Bravura para Claves de Sol, Fá e Dó.

### Modificado
- `generate-map.js`: Remoção de timestamp volátil para garantir idempotência sem diffs falsos no Git e atualização dos metadados das pastas modulares.
- `README.md` e `FLUXO_USUARIO.md`: Sincronizados com os recursos recentes (Multi-Clave Sol/Fá/Dó vetores SMuFL, Dual-Mode 10q/20q com 552 questões em 16 fases, e Webhook Google Sheets).

---

## [1.1.0] - 2026-10-29 (Redesenho Vetorial Profissional das Claves SMuFL & Webhook Google Sheets)
### Adicionado
- **Redesenho Vetorial Profissional das Claves (Padrão SMuFL Bravura / W3C)**:
  - Criação do módulo `clefVectors.ts` contendo curvas de Bézier cúbicas originais da fonte Bravura.
  - Calibração métrica exata: 1 staff space = 362 unidades SMuFL (`lineGap / 362`).
  - **Clave de Fá na 4ª linha (`drawBassClefVector`)**: Bulbo inicial perfeitamente centrado na 4ª linha (`y = 0`), arco tangenciando a 5ª linha (`y = +362`), cauda fina terminando no 1º espaço (`y = -914`) e 2 pontos simétricos nos espaços 4 e 3.
  - **Clave de Dó na 3ª linha (`drawAltoClefVector`)**: Coluna dupla limitada cravada entre a 5ª e a 1ª linha (altura $= 4 \times \text{lineGap}$), lóbulos simétricos e vértice convergindo exatamente no Dó Central.
  - **Clave de Sol na 2ª linha (`drawTrebleClefVector`)**: Vetor Bravura SMuFL na 2ª linha.
- **Webhook Google Sheets + Fila Offline-First (PWA)**:
  - Script `scripts/google-sheets-feedback-webhook.gs` com função `doPost(e)`, auto-cabeçalho, fuso horário de São Paulo e gravação direta em planilha do Google Drive.
  - Implementação de `sendFeedbackToWebhook` em `feedbackReporter.ts` via `POST`, `mode: 'no-cors'` e `Content-Type: text/plain;charset=utf-8` (evitando bloqueios de CORS preflight).
  - Fila offline no `localStorage` (`simulado_pending_feedback_queue`), `flushPendingFeedbacks()` e ouvinte automático no evento `online`.
  - Componente `QuestionFeedbackModal.tsx` com estado assíncrono `isSubmitting` e feedback amigável ao aluno.

---

## [1.0.0] - 2026-10-26 (Multi-Clave, Dual-Mode no Simulado, 552 Questões e Sistema de Feedback)
### Adicionado
- **Multi-Clave no Mestre da Clave (Sol, Fá e Dó)**:
  - Suporte a 3 claves: Sol na 2ª linha (`𝄞`), Fá na 4ª linha (`𝄢`) e Dó na 3ª linha (`𝄡`), com progressões diatônicas de 13 notas (`pos -2` a `10`) e frequências físicas dedicadas por clave.
  - Recordes individuais persistidos no `localStorage` (`mestreClave_record`, `mestreClave_record_fa`, `mestreClave_record_do`).
  - Extração desacoplada de `MestreOverlays.tsx`.
- **Simulado MSA Dual-Mode ("Por Período 20q" vs. "Por Fase 10q")**:
  - Seletor de abas com transição tátil em `SimuladoMenu.tsx`.
  - Modo "Por Fase": catálogo completo das 16 fases do MSA com badges, seleção unitária ou em lote, sorteio aleatório de 10 questões e carregador assíncrono `loadQuestionBankForPhases`.
- **Expansão e Blindagem dos Bancos de Questões (Fases 1 a 16)**:
  - Adicionadas 38 novas questões baseadas no método MSA nas fases 9 a 16 ($\ge 15$ questões ativas por fase, totalizando 552 questões ativas).
  - Balanceamento estático rigoroso de 25% para alternativas A, B, C e D em todos os novos bancos (`[4, 4, 4, 4]`).
- **Sistema de Reporte e Feedback de Questões**:
  - Utilitário `feedbackReporter.ts` com telemetria GA4 (`question_feedback`), Microsoft Clarity, persistência local e link para abertura de GitHub Issues pré-preenchidas.
  - Modal `QuestionFeedbackModal.tsx` integrado durante o quiz e na tela de resultados.

---

## [0.9.0] - 2026-10-20 (Auditoria Fina de Hinos e Gabaritos)
### Modificado
- Varredura de 495 questões: correção em `f13_q002` (Hinos 1, 3 e 282 como téticos), correção em `f14_q001`/`f14_q005` (Hino 118 em fórmula 6/8) e correção terminológica em `f04_q052` (2/2 como Binário Simples).

---

## [0.8.0] - 2026-10-18 (Embaralhamento Dinâmico de Alternativas e Auditoria Pedagógica)
### Adicionado
- Implementação do embaralhamento Fisher-Yates sobre as `opcoes` de cada questão sorteada em `SimuladoMsa.tsx` com teste unitário.
- Balanceamento estático de 25% (A/B/C/D) diretamente nos JSONs das fases 6 a 16.
- Revisão detalhada contra os slides de aulas e PDF oficial do MSA.

---

## [0.7.0] - 2026-10-17 (Base de Conhecimento MSA em Divulgação Progressiva & Conclusão dos Bancos 6 a 16)
### Adicionado
- Estruturação da skill `music-theory-core` com Progressive Disclosure (`SKILL.md` + 5 arquivos modulares em `references/`).
- Elaboração dos 11 bancos de questões restantes (`q_f06.json` a `q_f16.json`) com validação Zod.
- Desbloqueio dos 4 períodos no Simulado MSA.

---

## [0.6.0] - 2026-10-17 (Auditoria de Lógica, Psicoacústica e UX no Mestre da Clave)
### Modificado
- Correção do cálculo de Level Up (off-by-one) com helper `getNewlyUnlockedNote`.
- Reformulação de `playRewardChord` (fundamental pura com oitava harmônica sutil).
- Filtro passa-baixa adaptativo por key-tracking (`Math.min(4500, Math.max(1200, freq * 3.5))`).
- Suporte a `devicePixelRatio` (HiDPI) e reordenação de linhas suplementares sob a nota.
- Velocidade normalizada invariante por largura de tela (~3.8s de reação).
- Atalhos de teclado físico no desktop (`1-7`, `C-B`, `Espaço`/`Esc`).

---

## [0.5.0] - 2026-10-16 (Reestruturação Arquitetural Enxuta e Governança de Agentes)
### Modificado
- Remoção completa do antigo módulo Curso MSA Digital (12 arquivos obsoletos descontinuados).
- Reorganização modular em domínios limpos: `src/modules/home`, `mestre-da-clave` e `simulado`.
- Resolução dinâmica de assets via `getAssetUrl` para compatibilidade com subdiretórios no GitHub Pages (`BASE_URL`).
- Pipeline GitHub Actions (`deploy.yml`) publicando no GitHub Pages (`issacarbarbosa.github.io/issa-academy`).
- Higienização de `.agents/`: achatamento de regras com frontmatter YAML, remoção de arquivos fantasmas e criação do comando `npm run map`.

---

## [0.1.0 - 0.4.0] - 2026-06-30 a 2026-07-03 (Fase Inicial & Portão de Qualidade)
- Estruturação inicial do projeto React 19 + Vite 6 + Tailwind CSS v4.
- Conversão dos bancos de questões de JS para JSON.
- Ativação do TypeScript Strict Mode (`strict: true`, `noImplicitAny: true`, 0 erros).
- Roteamento declarativo com `HashRouter` e Code Splitting via `React.lazy`.
- PWA offline-first com Workbox (`vite-plugin-pwa`).
- Blindagem de schemas com Zod e testes unitários com Vitest.
- Criação do componente `OrientationGuard.tsx` para forçar orientação horizontal no celular.
