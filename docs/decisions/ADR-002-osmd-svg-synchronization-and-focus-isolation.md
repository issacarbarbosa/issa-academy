# ADR-002: Sincronia SVG a 60fps, Loop Arrastável por Tempo e Isolamento no Modo Foco

- **Status:** Aceito
- **Data:** 2026-10-28

## Contexto
Durante a leitura musical, re-renderizar a árvore React a 60fps para mover o cursor causa engasgos no celular. Além disso, o usuário precisa selecionar loops iniciando/terminando em qualquer tempo ou nota (arrastando barras verticais) e isolar visualmente o trecho quando acionar o Modo Foco.

## Decisão
1. **Cursor e Sombreamento via DOM Direto:** `playheadRef` e `measureShadeRef` são atualizados por `style.transform = translate3d(...)` com transição CSS suave (`.playhead-cursor-smooth` e `.playhead-cursor-measure-hop`).
2. **Coloração de Cabeça da Nota no SVG:** `ScoreController.highlightSlices` altera diretamente o atributo `fill` dos elementos `.vf-notehead path` e restaura o `data-orig-fill` ao término da nota.
3. **Alças Arrastáveis por Fração de Compasso:** `getBeatAtPoint` e `getLoopBoundaryGeometry` permitem posicionar o início e o fim do loop em qualquer tempo/nota no desktop e no mobile.
4. **Isolamento Real no Modo Foco:** `buildIsolatedXml` filtra os nós `<measure>` do MusicXML preservando `<attributes>` (clave, armadura e compasso) para exibir somente os compassos em foco.

## Consequências
- **Positivas:** Animação fluida a 60fps mesmo em smartphones e experiência de loop/foco idêntica ao Soundslice.
