# AGENTS.md — Regras Globais do Workspace (SliceScore Studio)

## 1. Escopo e Identidade do Projeto
- **Produto:** SliceScore Studio — Aplicação web de estudo musical interativo estilo Soundslice voltada ao aprendizado com partituras digitais MusicXML (MSA e Hinário 5 CCB) com som universal de **Piano de Cauda Didático**.
- **Idioma Oficial da Interface:** Português do Brasil (`pt-BR`). Mesmo quando referências visuais estiverem em inglês, toda a interface, rótulos, acessibilidade (`aria-label`) e solfejo devem estar em `pt-BR`.
- **Filosofia de Design:** Minimalismo estrito (**"Menos é mais"**). A interface deve ser autoexplicativa e comunicar por si só, sem textos explicativos, sem subtítulos redundantes e sem controles duplicados. Palco da partitura 100% branco (`#FFFFFF`), barra superior única e compacta (`48px`) e barra de transporte inferior fixa em carvão escuro (`#2B2C30`, `56px`).

---

## 2. Invariantes de Domínio Musical e Regras Inegociáveis
1. **Fidelidade Estrita à Partitura Escrita & Som Universal de Piano:**
   - O motor de áudio (`AudioScheduler.ts`) e o extrator (`ScoreController.ts`) **JAMAIS** devem sintetizar acordes, baixos ou notas de acompanhamento que não estejam explicitamente escritos no MusicXML.
   - O **Piano de Cauda Didático (`'acoustic-grand'`)** é o som exclusivo e universal de todas as lições do MSA e de todos os Hinos (independentemente da edição ou clave), com ataque percussivo claro de martelo e sustentação fiel à duração escrita.
   - No **Hinário de Cordas (`edition === 'cordas'`)**, permanecem disponíveis as ferramentas visuais pedagógicas de cordas: o **Braço do Violino (`ViolinFingerboard`)** e o **Dedilhado e arcadas (`0, 1, 2, 3` e `⊓`)**.
2. **Solfejo em Português com Acentuação Correta:**
   - As notas pedagógicas exibidas acima da pauta devem utilizar obrigatoriamente acentuação gráfica correta em português: **`Dó`, `Ré`, `Mi`, `Fá`, `Fá♯`, `Sol`, `Lá`, `Si`**.
   - A opção de exibir/ocultar o **Nome das Notas (`Dó, Ré...`)** fica exclusivamente dentro de `"Personalizar notação"` (sem botão `[Dó]` avulso na barra de transporte inferior).
3. **Leis do Minimalismo "Menos é Mais" (UX Autoexplicativa):**
   - **Zero Textos Explicativos:** Nunca adicionar parágrafos descritivos, resumos de lições, subtítulos de ajuda ou badges explicativos (como "Sem clave e sem pentagrama") quando a própria partitura ou ícone comunica a função.
   - **Zero Duplicação entre Barras:** Nunca repetir na barra superior (`TopBar`) ferramentas que já pertencem à barra de transporte inferior (`TransportBar`) ou ao menu de personalização. A `TopBar` deve ter linha única (`48px`) dedicada apenas à navegação de repertório, seleção de clave/edição e alternância `Aluno/Admin`.
   - **Símbolos Musicais em vez de Rótulos Verbos:** Priorizar glifos universais concisos (**`𝄞 Sol`**, **`𝄡 Dó`**, **`𝄢 Fá`**) e cartões diretamente clicáveis em vez de botões redundantes (`"Abrir Lição"`, `"Substituir MusicXML:"`, `"Reimportar"`).
   - **Sem Indicadores Poluentes de Compasso ou "Salvar Trecho":** Não exibir contadores de compasso (`C1`, `C2`, `C1/11`) na barra de transporte ou na pílula do loop (`[ Foco ] [ ✕ ]` no modo padrão; `Compassos ... ✕` no modo foco).
4. **Performance de Sincronia Visual a 60fps:**
   - A movimentação do cursor (`playheadRef`) e do sombreamento de compasso (`measureShadeRef`) deve ocorrer por mutação direta de estilo DOM (`transform: translate3d(...)`) dentro do loop `requestAnimationFrame`, evitando re-renderizações completas do React a cada frame.
5. **Desacoplamento de Lógica Pura:**
   - Cálculos matemáticos de tempo, BPM, conversão MIDI para frequência/solfejo e normalização de intervalos de loop devem residir em `src/utils/musicMath.ts` (zero dependências de DOM ou Web Audio) e possuir cobertura de testes unitários em `src/utils/musicMath.test.ts`.

---

## 3. Convenções de Código e Stack Tecnológica
- **Stack:** React 19 + TypeScript + Tailwind CSS v4 (`@import "tailwindcss";`) + `opensheetmusicdisplay` (OSMD) + Web Audio API nativa + `lucide-react`.
- **Bibliotecas Proibidas:** Não adicionar bibliotecas pesadas de síntese externa (ex.: Tone.js) quando o sintetizador polifônico nativo Web Audio API (`AudioScheduler.ts`) suprir a necessidade com menor latência. Não usar `window.alert` ou `window.open`.
- **Tratamento de Erros:** Falhas de parsing de arquivos `.musicxml` / `.xml` devem ser capturadas graciosamente no estado `loadError`, oferecendo botão imediato de restauração da partitura padrão.
- **Respostas no Chat:** Não exibir no chat o conteúdo completo dos códigos alterados; edite os arquivos diretamente via ferramentas e apresente apenas o resumo objetivo e o *Painel de Sincronização do Projeto*.

---

## 4. Definição de Subagentes Especializados

### Subagente 1: `WebAudio Synthesis & Timing Specialist`
- **Role:** `WebAudio Synthesis & Timing Specialist`
- **System Prompt:** "Você é responsável pela precisão sub-milissegundo do `AudioScheduler.ts`. Garanta agendamento lookahead via `audioContext.currentTime`, síntese realista de Piano de Cauda Didático (multi-samples Salamander C5 A1–C7 + modelagem física de cordas uníssonas em estéreo, ataque claro de martelo de feltro e sustentação exata da nota escrita) sem cliques de fase, metrônomo subdividido, contagem regressiva (Count-in) condicional e Treino de Velocidade (Speed Training) incremental ao final de cada ciclo de loop."
- **Triggers:** Tarefas envolvendo latência de áudio, timbre do piano, cliques de metrônomo, contagem regressiva, treino de velocidade ou dessincronia entre som e cursor.
- **Tool Requirements:** Leitura/edição de arquivos (`src/services/AudioScheduler.ts`, `src/utils/musicMath.ts`) e execução de testes unitários via terminal (`npx tsx --test`).

### Subagente 2: `OSMD SVG & Geometry Engineer`
- **Role:** `OSMD SVG & Geometry Engineer`
- **System Prompt:** "Você gerencia o ciclo de vida do OpenSheetMusicDisplay em `ScoreController.ts`. Sua missão é converter unidades internas do OSMD (1 unidade = 10px) para coordenadas reais de tela, colorir cabeças de nota ativas (`.vf-notehead path`), interpolar a posição X por tempo/fração de compasso para arraste de alças de Loop (Lollipop Handles) e isolar compassos via manipulação de DOM XML no Modo Foco."
- **Triggers:** Ajustes em renderização MusicXML, cálculo de `BoundingBox`, destaque de cabeças de nota, isolamento de compassos (Modo Foco), notação horizontal ou alinhamento de anotações pedagógicas.
- **Tool Requirements:** Leitura/edição de `src/services/ScoreController.ts` e inspeção de DOM/SVG via Playwright CLI.

### Subagente 3: `Minimalist Soundslice UX Auditor`
- **Role:** `Minimalist Soundslice UX Auditor`
- **System Prompt:** "Você audita a interface React/Tailwind garantindo fidelidade visual ao padrão minimalista Soundslice em `pt-BR`. Verifique ausência de redundâncias entre popovers, responsividade mobile/desktop, áreas de toque de no mínimo 36-44px para alças arrastáveis e conformidade visual com os prints de referência."
- **Triggers:** Alterações em `src/App.tsx`, `src/components/TransportBar.tsx`, `src/components/TopBar.tsx` ou `src/components/ViolinFingerboard.tsx`.
- **Tool Requirements:** Compilação (`compile_applet`) e verificação visual automatizada em navegador real (`playwright-cli`).
