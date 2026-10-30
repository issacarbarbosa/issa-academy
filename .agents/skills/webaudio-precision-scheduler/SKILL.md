---
name: webaudio-precision-scheduler
description: Use this skill when working on Web Audio API synthesis, the universal Didactic Concert Grand Piano timbre, lookahead beat scheduling, metronome subdivisions, conditional count-in, or speed training auto-increment.
---

# WebAudio Precision Scheduler Skill

## Objetivo
Garantir reprodução sonora realista de **Piano de Cauda Didático (`'acoustic-grand'`)**, livre de latência ou artefatos, sincronizada pelo relógio de hardware `AudioContext.currentTime`, respeitando estritamente as notas escritas na partitura para todas as lições do MSA e Hinos.

## Procedimento Passo a Passo
1. **Agendamento Baseado em Hardware (`audioContext.currentTime`):**
   - Nunca incremente o tempo musical somando deltas de `requestAnimationFrame`. Calcule sempre `elapsedSeconds = audioContext.currentTime - startWallTime` e converta para `currentBeat = startBeatOffset + elapsedSeconds * (bpm / 60)`.
2. **Piano de Cauda Didático Universal (`synthesizeNote`):**
   - Utilize exclusivamente o motor híbrido de **Piano de Cauda de Concerto Didático**:
     - **Amostras Reais Salamander Grand Piano V3 (`A1` MIDI 33 a `C7` MIDI 96)** + **Modelagem Física Estéreo** de cordas triplas/duplas com inarmonicidade real (`B = 0.00009 * (f / 261.63)^1.55`) e tampo harmônico de abeto (`240 Hz` + `2150 Hz`).
     - **Ataque Percussivo Didático de Martelo de Feltro:** Transiente preciso nos primeiros `18ms` para que o aluno perceba com exatidão o início de cada figura rítmica.
     - **Corpo Harmônico Sustentado Calibrado:** Mantém a nota audível durante toda a sua duração escrita (semínimas, mínimas e semibreves) e aplica abafador suave de feltro (`0.19s`) exatamente ao final da nota escrita.
3. **Execução Estrita do MusicXML:**
   - Em `triggerSliceAudio(slice)`, filtre apenas notas reais (`!note.isRest`) presentes em `slice.notes`. Jamais adicione notas de baixo ou acordes sintéticos no início dos compassos.
4. **Metrônomo e Contagem Regressiva (Count-in):**
   - Suporte 3 modos de batida do metrônomo: `every-beat` (Em cada tempo), `first-beat` (Apenas no 1º tempo) e `eighth` (Subdivisão em colcheias).
   - Suporte Count-in condicional (`always`, `start-only`, `loop-only`) com duração de `1` ou `2` compassos antes de liberar o avanço do cursor.
5. **Treino de Velocidade (Speed Training):**
   - Quando `speedTraining.enabled && loop.enabled`, ao completar cada repetição do loop (`currentBeat >= loopEndBeat`), incremente o BPM em `incrementBpm` até atingir `finalBpm`.

## Divulgação Progressiva
- Detalhes dos timbres acústicos e Count-in: [`references/acoustic-synthesis-and-countin.md`](./references/acoustic-synthesis-and-countin.md)
- Exemplo de payload emitido a cada frame: [`examples/scheduler-frame-payload.json`](./examples/scheduler-frame-payload.json)

## Passos de Validação
1. Execute `npx --yes tsx --test src/utils/musicMath.test.ts` para validar conversões BPM/segundos e MIDI/frequência.
2. Execute `compile_applet` para confirmar ausência de erros TypeScript em `src/services/AudioScheduler.ts`.
