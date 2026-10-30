# Regras Contextuais de Diretórios (`.agents/rules/AGENTS.md`)

## 1. Regras para `src/services/` (`ScoreController.ts` & `AudioScheduler.ts`)
- **Proibido acoplamento com estado React:** Nenhum arquivo em `src/services/` pode importar `react`. A comunicação com a UI deve ocorrer exclusivamente via callbacks tipados (`SchedulerFramePayload`) e métodos imperativos.
- **Unidades do OSMD:** Lembre-se sempre de que o sistema interno de coordenadas do OSMD (`PositionAndShape`) utiliza unidades equivalentes a `10px * zoom`. Sempre valide o alinhamento com `getBoundingClientRect()` dos elementos SVG `.vf-stavenote` quando disponível.
- **Limpeza de Recursos:** Sempre interromper timers, `requestAnimationFrame` e nós de áudio ativos em `pause()` e `stopAllActiveVoices()` para evitar vazamento de memória ou sobreposição de vozes.

## 2. Regras para `src/components/` (`TransportBar.tsx`, `TopBar.tsx`, `RepertoirePanelModal.tsx`, `ViolinFingerboard.tsx`)
- **Filosofia "Menos é Mais" (UI Autoexplicativa):** Proibido inserir parágrafos de descrição, textos de ajuda ou rótulos redundantes (`"Substituir MusicXML:"`, `"Reimportar"`, `"Abrir Lição"`). O design deve comunicar por si só através de tipografia limpa, ícones claros e glifos musicais (`𝄞 Sol`, `𝄡 Dó`, `𝄢 Fá`).
- **Zero Duplicação entre `TopBar` e `TransportBar`:** A `TopBar` deve possuir apenas uma única barra horizontal de `48px` (`h-12`) contendo navegação de repertório, seletor contextual de clave/edição, botão rápido `MusicXML` (no modo Admin) e alternador `Aluno/Admin`. Todos os controles de execução e estudo (`Dó` Notas, `Violino`, `Vozes`, `Loop`, `BPM`, `Metrônomo`, `Zoom`, `Horizontal`) pertencem exclusivamente à `TransportBar`.
- **Repertório em Grade Compacta & Drag-and-Drop:** Lições do MSA devem ser exibidas em grade multi-colunas de linha única, onde o próprio cartão (ou pílula de clave) abre a lição e aceita *Drag-and-Drop* direto de arquivos `.musicxml` no modo Admin.
- **Acessibilidade e Testes Automatizados:** Todos os botões interativos e popovers devem manter atributos `aria-label` em `pt-BR` e identificadores `data-testid` estáveis para verificação via Playwright CLI.
- **Minimalismo no Loop e Foco:** Não exibir indicadores de número de compasso (`C1`, `C2`, `C1/11`) nem botões de salvar trecho na barra inferior ou na pílula flutuante (`Compassos ... ✕`).

## 3. Regras para `src/utils/` (`musicMath.ts` & `musicMath.test.ts`)
- **Funções 100% Puras:** `musicMath.ts` não pode acessar `window`, `document` ou `AudioContext`.
- **Obrigatoriedade de Testes Unitários:** Qualquer nova função matemática adicionada em `musicMath.ts` deve ser acompanhada imediatamente por testes unitários usando `node:test` e `node:assert/strict` em `musicMath.test.ts`.
