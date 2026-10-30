# Referência Técnica: BoundingBoxes, Alças de Loop e Isolamento XML no OSMD

## 1. Conversão de Unidades do OSMD para Pixels SVG
O `OpenSheetMusicDisplay` armazena posições internas em unidades gráficas onde `1 unidade = 10 pixels` em `zoom = 1.0`.
Portanto:
```ts
const unitToPx = 10 * this.currentZoom;
const x = bbox.AbsolutePosition.x * unitToPx;
const y = bbox.AbsolutePosition.y * unitToPx;
const width = bbox.Size.width * unitToPx;
const height = Math.max(bbox.Size.height * unitToPx, 76 * this.currentZoom);
```
Para a posição horizontal exata de cada nota (`ScoreSliceEvent`), priorize a medição real do DOM SVG (`staveNoteEl.getBoundingClientRect()`) relativa ao container do OSMD, pois ela reflete com precisão o espaçamento óptico do VexFlow após clave e armadura de clave.

## 2. Isolamento de Compassos no Modo Foco (`buildIsolatedXml`)
Quando o usuário ativa o botão **Foco** na pílula flutuante:
1. O XML original é parseado via `DOMParser`.
2. O primeiro `<attributes>` completo (`<divisions>`, `<key>`, `<time>`, `<clef>`) encontrado desde o compasso 1 até `startMeasure` é clonado.
3. Todos os `<measure>` fora de `[startMeasure, endMeasure]` são removidos do `<part>`.
4. Caso o compasso inicial do trecho isolado não possua `<attributes>` próprio, o `<attributes>` clonado é inserido no início desse compasso para que o OSMD renderize corretamente a clave de Sol e a armadura de clave no trecho isolado.
