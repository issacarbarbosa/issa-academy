# Referência Técnica: Síntese Acústica Multi-Harmônica e Count-in

## 1. Modelo Físico de Piano de Cauda Steinway (`acoustic-grand`)
- Combina 4 parciais harmônicos por nota com leve inarmonicidade (`detune` em cents) + transiente percussivo de martelo filtrado por `BiquadFilterNode` (`bandpass` proporcional à frequência fundamental).
- Passa por barramento de ressonância de tampo harmônico (`peaking` em `240Hz` e `2200Hz`) e compressor dinâmico suave (`DynamicsCompressorNode`) para evitar clipping polifônico.

## 2. Modelo Expressivo de Violino Real (`violin`)
- Ataque suave de arco (`attack = 0.045s`) com vibrato LFO (`5.5Hz`, desvio de `±4.5 cents`) acoplado ao `detune` dos osciladores dente-de-serra/triangulares e filtro passa-baixa de formante de corpo de madeira (`2400Hz`).

## 3. Contagem Regressiva (Count-in) Integrada ao Metrônomo
- Configurada dentro do popover do Metrônomo (`TransportBar.tsx`):
  - `always`: Executa contagem antes de qualquer `start()`.
  - `start-only`: Executa contagem apenas quando o cursor parte do início da música (`currentBeat < 0.25`).
  - `loop-only`: Executa contagem apenas quando um Loop está ativo (`loop.enabled === true`).
