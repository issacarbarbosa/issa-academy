# AGENTS.md — Regras Globais do Workspace (Issa Academy & Estúdio de Partituras CCB)

## 1. Escopo, Identidade e Fluxo Híbrido (`AI Studio ⇄ GitHub ⇄ Antigravity`)
- **Produto:** **Issa Academy** — Ecossistema educacional gamificado e interativo para o ensino do **MSA (Método Simplificado de Aprendizagem Musical)** e do **Hinário 5 da CCB**, integrando 6 módulos em `src/modules/`:
  1. **Home (`src/modules/home/`):** Portal principal com o mascote Fufu e atalhos para as 4 frentes de estudo.
  2. **Aulas & Lições do MSA (`src/modules/aulas/`):** Trilha didática das 16 Fases e 4 Períodos com videoaulas do canal `@issacarbarbosa`.
  3. **Estúdio de Partituras & Hinário 5 (`src/modules/partituras/`):** Leitor e reprodutor interativo MusicXML estilo Soundslice com som universal de **Piano de Cauda Didático**.
  4. **Mestre da Clave (`src/modules/mestre-da-clave/`):** Jogo de leitura fluente a 60fps em HTML5 Canvas nas 3 claves oficiais (`𝄞 Sol`, `𝄢 Fá`, `𝄡 Dó`) com vetores SMuFL Bravura.
  5. **Simulado MSA (`src/modules/simulado/`):** Quiz Dual-Mode (Por Período 20q / Por Fase 10q) com 552+ questões blindadas via Zod.
  6. **Painel Admin Híbrido (`src/modules/admin/`):** CMS integrado ao Supabase Cloud (`pcwmafuykwqxoivedpbn`) com fallback offline em `localStorage`.
- **Idioma Oficial da Interface:** Português do Brasil (`pt-BR`). Toda a interface, rótulos, acessibilidade (`aria-label`) e solfejo devem estar em `pt-BR`.
- **Sinergia de Ambientes (`Google AI Studio ⇄ GitHub ⇄ Antigravity`):**
  - Trabalhamos de forma combinada entre o **Google AI Studio** e o **Google Antigravity** para aproveitar o melhor de cada plataforma.
  - **Regra de Início de Sessão:** No início de **toda nova conversa** (seja no AI Studio ou no Antigravity), o agente deve obrigatoriamente conferir no GitHub (`https://github.com/issacarbarbosa/issa-academy.git`, branch `main`) se a cópia local está atualizada na versão mais recente executando `bash .agents/skills/github-hybrid-sync/scripts/sync-check.sh` antes de realizar alterações.

---

## 2. Invariantes de Domínio Musical e Regras Inegociáveis (`src/modules/partituras/`)
1. **Fidelidade Estrita à Partitura Escrita & Som Universal de Piano:**
   - O motor de áudio (`src/modules/partituras/services/AudioScheduler.ts`) e o extrator (`src/modules/partituras/services/ScoreController.ts`) **JAMAIS** devem sintetizar acordes, baixos ou notas de acompanhamento que não estejam explicitamente escritos no MusicXML.
   - O **Piano de Cauda Didático (`'acoustic-grand'`)** é o som exclusivo e universal de todas as lições do MSA e de todos os Hinos (independentemente da edição ou clave), com ataque percussivo claro de martelo (`18ms`) e sustentação fiel à duração escrita.
   - No **Hinário de Cordas (`edition === 'cordas'`)**, permanecem disponíveis as ferramentas visuais pedagógicas de cordas: o **Braço do Violino (`ViolinFingerboard`)** e o **Dedilhado e arcadas (`0, 1, 2, 3, 4` e `⊓`)**.
2. **Solfejo em Português com Acentuação Correta:**
   - As notas pedagógicas exibidas acima da pauta devem utilizar obrigatoriamente acentuação gráfica correta em português: **`Dó`, `Ré`, `Mi`, `Fá`, `Fá♯`, `Sol`, `Lá`, `Si`**.
   - A opção de exibir/ocultar o **Nome das Notas (`Dó, Ré...`)** fica exclusivamente dentro de `"Personalizar notação"` (sem botão `[Dó]` avulso na barra de transporte inferior).
3. **Leis do Minimalismo "Menos é Mais" (UX Autoexplicativa no Estúdio de Partituras):**
   - **Zero Textos Explicativos:** Nunca adicionar parágrafos descritivos, resumos de lições, subtítulos de ajuda ou badges explicativos (como "Sem clave e sem pentagrama") quando a própria partitura ou ícone comunica a função.
   - **Zero Duplicação entre Barras:** Nunca repetir na barra superior (`TopBar.tsx`) ferramentas que já pertencem à barra de transporte inferior (`TransportBar.tsx`) ou ao menu de personalização. A `TopBar` deve ter linha única (`48px`) dedicada apenas ao botão `← Início`, navegação de repertório, seleção de clave/edição e alternância `Aluno/Admin`.
   - **Símbolos Musicais em vez de Rótulos Verbosos:** Priorizar glifos universais concisos (**`𝄞 Sol`**, **`𝄡 Dó`**, **`𝄢 Fá`**) e cartões diretamente clicáveis em vez de botões redundantes (`"Abrir Lição"`, `"Substituir MusicXML:"`, `"Reimportar"`).
   - **Sem Indicadores Poluentes de Compasso ou "Salvar Trecho":** Não exibir contadores de compasso (`C1`, `C2`, `C1/11`) na barra de transporte ou na pílula do loop (`[ Foco ] [ ✕ ]` no modo padrão; `Compassos ... ✕` no modo foco).
4. **Performance de Sincronia Visual a 60fps:**
   - A movimentação do cursor (`playheadRef`) e do sombreamento de compasso (`measureShadeRef`) deve ocorrer por mutação direta de estilo DOM (`transform: translate3d(...)`) dentro do loop `requestAnimationFrame`, evitando re-renderizações completas do React a cada frame.
5. **Desacoplamento de Lógica Pura:**
   - Cálculos matemáticos de tempo, BPM, conversão MIDI para frequência/solfejo e normalização de intervalos de loop devem residir em `src/modules/partituras/utils/musicMath.ts` (zero dependências de DOM ou Web Audio) e possuir cobertura de testes unitários em `src/modules/partituras/utils/musicMath.test.ts`.

---

## 3. Convenções de Código e Stack Tecnológica
- **Stack:** React 19 + TypeScript (Strict Mode) + Vite + Tailwind CSS v4 (`@import "tailwindcss";`) + `opensheetmusicdisplay` (OSMD) + Web Audio API nativa + Supabase JS + Zod + `lucide-react`.
- **Bibliotecas Proibidas:** Não adicionar bibliotecas pesadas de síntese externa (ex.: Tone.js) quando o sintetizador polifônico nativo Web Audio API (`AudioScheduler.ts` e `audio.ts`) suprir a necessidade com menor latência. Não usar `window.alert` ou `window.open`.
- **Tratamento de Erros:** Falhas de parsing de arquivos `.musicxml` / `.xml` devem ser capturadas graciosamente no estado `loadError`, oferecendo botão imediato de restauração da partitura padrão.
- **Respostas no Chat:** Não exibir no chat o conteúdo completo dos códigos alterados; edite os arquivos diretamente via ferramentas e apresente apenas o resumo objetivo e o *Painel de Sincronização do Projeto*.

---

## 4. Definição de Subagentes Especializados

### Subagente 1: `WebAudio Synthesis & Timing Specialist`
- **Role:** `WebAudio Synthesis & Timing Specialist`
- **System Prompt:** "Você é responsável pela precisão sub-milissegundo do `src/modules/partituras/services/AudioScheduler.ts` e `src/core/utils/audio.ts`. Garanta agendamento lookahead via `audioContext.currentTime`, síntese realista de Piano de Cauda Didático (multi-samples Salamander C5 A1–C7 + modelagem física de cordas uníssonas em estéreo, ataque claro de martelo de feltro e sustentação exata da nota escrita) sem cliques de fase, metrônomo subdividido, contagem regressiva (Count-in) condicional e Treino de Velocidade (Speed Training) incremental ao final de cada ciclo de loop."
- **Triggers:** Tarefas envolvendo latência de áudio, timbre do piano, cliques de metrônomo, contagem regressiva, treino de velocidade ou dessincronia entre som e cursor.
- **Tool Requirements:** Leitura/edição de arquivos (`src/modules/partituras/services/AudioScheduler.ts`, `src/modules/partituras/utils/musicMath.ts`, `src/core/utils/audio.ts`) e execução de testes unitários via terminal (`npm run test`).

### Subagente 2: `OSMD SVG & Geometry Engineer`
- **Role:** `OSMD SVG & Geometry Engineer`
- **System Prompt:** "Você gerencia o ciclo de vida do OpenSheetMusicDisplay em `src/modules/partituras/services/ScoreController.ts`. Sua missão é converter unidades internas do OSMD (1 unidade = 10px) para coordenadas reais de tela, colorir cabeças de nota ativas (`.vf-notehead path`), interpolar a posição X por tempo/fração de compasso para arraste de alças de Loop (Lollipop Handles) e isolar compassos via manipulação de DOM XML no Modo Foco."
- **Triggers:** Ajustes em renderização MusicXML, cálculo de `BoundingBox`, destaque de cabeças de nota, isolamento de compassos (Modo Foco), notação horizontal ou alinhamento de anotações pedagógicas.
- **Tool Requirements:** Leitura/edição de `src/modules/partituras/services/ScoreController.ts` e inspeção de DOM/SVG via Playwright CLI.

### Subagente 3: `Minimalist Soundslice UX Auditor`
- **Role:** `Minimalist Soundslice UX Auditor`
- **System Prompt:** "Você audita a interface React/Tailwind garantindo fidelidade visual ao padrão minimalista Soundslice em `pt-BR` no Estúdio de Partituras e ao Design Juicy Gamificado nos demais módulos do Issa Academy. Verifique ausência de redundâncias entre popovers, responsividade mobile/desktop e áreas de toque de no mínimo 36-44px."
- **Triggers:** Alterações em `src/modules/partituras/PartiturasStudio.tsx`, `src/modules/partituras/components/*`, `src/modules/home/WelcomeHome.tsx` ou demais views.
- **Tool Requirements:** Compilação (`compile_applet`) e verificação visual automatizada em navegador real (`playwright-cli`).

### Subagente 4: `GitHub Hybrid Sync & Release Guardian`
- **Role:** `GitHub Hybrid Sync & Release Guardian`
- **System Prompt:** "Você garante a sincronia contínua entre o Google AI Studio, o GitHub (`issacarbarbosa/issa-academy`) e o Google Antigravity. No início de cada nova conversa, confira se o workspace local está atualizado com `origin/main` via `bash .agents/skills/github-hybrid-sync/scripts/sync-check.sh`. Antes de qualquer commit/push, execute o Quality Gate (`npm run typecheck && npm run test && npm run build`), atualize `ROADMAP.md` e `MAPA_RAIZ.md` (`npm run map`) e sincronize `package-lock.json`."
- **Triggers:** Início de qualquer nova conversa, solicitações de push/pull para o GitHub, preparação de releases ou alternância de trabalho entre AI Studio e Antigravity.
- **Tool Requirements:** Execução de terminal (`run_command`), script `.agents/skills/github-hybrid-sync/scripts/sync-check.sh` e script `.agents/skills/deploy-helper/scripts/pre-deploy-check.js`.
