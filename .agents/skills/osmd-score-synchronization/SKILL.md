---
name: osmd-score-synchronization
description: Use this skill when modifying OpenSheetMusicDisplay (OSMD) SVG rendering, measure bounding boxes, dynamic notehead coloring, draggable beat-level loop handles, or Focus mode measure isolation.
---

# OSMD Score Synchronization Skill

## Objetivo
Padronizar a extração geométrica de compassos e notas do `opensheetmusicdisplay` (OSMD), a coloração dinâmica das cabeças de nota no SVG, o cálculo de coordenadas para as alças arrastáveis de loop (por tempo/nota) e o isolamento real de compassos no Modo Foco.

## Procedimento Passo a Passo
1. **Extração de `MeasureBoundingBox` e `ScoreSliceEvent`:**
   - Percorra `osmd.GraphicSheet.MeasureList` para calcular `{ x, y, width, height, systemIndex, startBeatInScore, durationBeats }` multiplicando `PositionAndShape` por `10 * zoom`.
   - Vincule os elementos `.vf-stavenote` reais do DOM SVG às fatias temporais (`ScoreSliceEvent`) ordenadas por coordenada X dentro de cada compasso.
2. **Coloração Dinâmica da Cabeça da Nota (`.vf-notehead path`):**
   - Ao ativar um `sliceId`, localize `.vf-notehead path, .vf-notehead use` dentro do `.vf-stavenote` correspondente, salve o atributo original em `data-orig-fill` e aplique a cor de destaque (`#3B82F6`, `#EAB308` ou `#10B981`).
   - Quando o tempo da nota terminar, restaure `data-orig-fill` imediatamente.
3. **Alças Arrastáveis de Loop (Beat-Level Lollipop Handles):**
   - Use `getBeatAtPoint(relX, relY, mode)` para converter a posição do ponteiro (mouse/toque) no tempo exato (`startBeat` ou `endBeat`) e `getLoopBoundaryGeometry(beat, role)` para posicionar a barra vertical.
4. **Isolamento de Compassos no Modo Foco:**
   - Filtre o documento MusicXML mantendo apenas os elementos `<measure>` dentro do intervalo `[startMeasure, endMeasure]`, injetando `<attributes>` (clave, armadura e fórmula de compasso) no primeiro compasso isolado.
5. **Posicionamento no 1º Espaço nas Lições Rítmicas Sem Clave (`normalizeRhythmicMusicXmlToFirstSpace`):**
   - Sempre que uma lição de Leitura Rítmica (`msaPhase === 'ritmica'`) for importada, reimportada ou renderizada no OSMD, normalize todas as notas (`<pitch>` ou `<unpitched>`) para a altura do **primeiro espaço** (`<pitch><step>F</step><octave>4</octave></pitch>` na referência de 2ª linha, com `<stem>up</stem>`), evitando que as figuras fiquem flutuando na altura da 3ª linha (`B4`).

## Divulgação Progressiva
- Detalhes profundos de coordenadas e isolamento XML: [`references/bounding-box-and-isolation.md`](./references/bounding-box-and-isolation.md)
- Exemplo de payload de geometria e loop: [`examples/loop-focus-payload.json`](./examples/loop-focus-payload.json)
- Script de validação matemática e compilação: [`scripts/verify-score-math.sh`](./scripts/verify-score-math.sh)

## Passos de Validação
1. Execute os testes unitários de matemática musical e limites de loop:
   `npx --yes tsx --test src/modules/partituras/utils/musicMath.test.ts`
2. Compile o projeto TypeScript para garantir tipagem estrita:
   `npm run typecheck` e `compile_applet`
3. Verifique no navegador (`/#/partituras`) que clicar em `Loop` renderiza `[data-testid="loop-handle-start"]` e `[data-testid="loop-handle-end"]`, e clicar em `Foco` renderiza apenas os compassos selecionados.

