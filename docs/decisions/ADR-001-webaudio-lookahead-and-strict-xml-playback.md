# ADR-001: Motor Web Audio API Nativo e Execução Estrita do MusicXML

- **Status:** Aceito
- **Data:** 2026-10-28

## Contexto
A aplicação precisa reproduzir partituras MusicXML com timbre realista de Piano e Violino, cliques de metrônomo precisos, contagem regressiva (Count-in) e treino de velocidade (Speed Training), sem depender de bibliotecas pesadas ou amostras externas que atrasem o carregamento, e sem tocar acordes não escritos.

## Decisão
1. Implementar o `AudioScheduler.ts` diretamente sobre a **Web Audio API nativa** usando `AudioContext.currentTime` como relógio mestre.
2. Construir síntese aditiva/subtrativa multi-harmônica para Piano de Cauda Steinway (`acoustic-grand`) e Violino Expressivo com vibrato LFO (`violin`).
3. Garantir **fidelidade estrita ao MusicXML**: `triggerSliceAudio` executa exclusivamente as notas presentes em `slice.notes` (`!note.isRest`), proibindo qualquer geração automática de notas graves ou acordes no primeiro tempo dos compassos.

## Consequências
- **Positivas:** Zero latência de rede para samples, partida instantânea no navegador mobile/desktop e total fidelidade pedagógica ao que o aluno lê na pauta.
- **Trade-offs:** Requer calibragem cuidadosa de envelopes ADSR e filtros `BiquadFilterNode` no código TypeScript.
