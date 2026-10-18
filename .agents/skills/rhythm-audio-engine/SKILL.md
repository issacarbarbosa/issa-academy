---
name: rhythm-audio-engine
description: Use esta skill ao implementar, calibrar ou modificar o motor de áudio Web Audio API (síntese de notas de órgão, efeitos sonoros de acerto/erro/nível) em src/core/utils/audio.ts ou ao trabalhar com frequências musicais e solfejo.
---

# Engenharia de Áudio e Ritmo - MSA Digital

Esta skill orienta o agente na geração dinâmica de som, nos efeitos acústicos dos jogos e simulados e no desenho das trajetórias dos movimentos de solfejo.

---

## 1. Síntese Acústica e Psicoacústica (Web Audio API)
Para garantir um timbre orgânico, quente e musicalmente puro sem sufocar as notas agudas nem gerar notas fora do tom, siga estas diretrizes:

- **waveform**: Oscilador tipo `triangle`.
- **Filtro Passa-Baixa com Key-Tracking**:
  - Em vez de um filtro fixo em 1000Hz (que abafa notas agudas entre Mi4 e Lá4 = 659Hz a 880Hz), use filtro passa-baixa adaptativo proporcional à frequência da nota:
    `const cutoff = Math.min(4500, Math.max(1200, freq * 3.5));`
    `filter.frequency.setValueAtTime(cutoff, now);`
- **Envelope ADSR**:
  - **Attack (Ataque)**: Transição linear de ganho de `0` a `0.25 * multiplier` em `0.02` segundos (suave, sem estalos).
  - **Decay (Decaimento)**: Rampa exponencial para `0.18 * multiplier` em `Math.min(0.1, duration * 0.4)` segundos.
  - **Release (Repouso)**: Rampa exponencial para `0.001` no término programado (`now + duration`).
- **Harmonia Diatônica em Reforços Positivos**:
  - Proibido gerar tríades cromáticas fixas com intervalos de 3ª maior e 5ª justa que introduzam acidentes fora da escala pedagógica (ex.: no tom de Dó Maior, tocar Ré com Fá# ou Mi com Sol# induz o estudante ao erro).
  - Use a nota fundamental com ganho total (`1.0`) e uma oitava harmônica sutil superior (`freq * 2`, ganho `0.35` e ligeiro atraso de `+0.04s`).

---

## 2. API Central de Áudio (`src/core/utils/audio.ts`)
Toda a aplicação consome um único `AudioContext` compartilhado (`getAudioContext()` / `initAudio()`) criado sob demanda após a primeira interação do usuário:

- `startNote(frequency: number, noteId?: string): void` e `stopNote(noteId?: string): void`: Inicia e interrompe notas sustentadas com envelope ADSR e filtro passa-baixa com key-tracking.
- `playTone(freq: number, startTime?: number, duration?: number, gainMultiplier?: number): void`: Reproduz uma nota musical com duração programada, key-tracking adaptativo e desconexão automática (`ended`) para evitar vazamento de nós de áudio.
- `playSuccessSound(): void`: Arpejo ascendente em Dó Maior (`C4-E4-G4-C5`) para respostas corretas no Simulado.
- `playErrorSound()` (ou alias `playError`): Timbre grave dissonante (`130Hz`/`135Hz` com filtro em `300Hz`) para erros.
- `playLevelUpFanfare(): void`: Fanfarra festiva de 4 notas (`C5-E5-G5-C6`) ao avançar de nível no Mestre da Clave (disparada com atraso de `220ms` em relação ao 10º acerto para evitar choque de osciladores).
- `playRewardChord(rootFreq: number): void`: Toca a fundamental da nota com brilho diatônico através de uma oitava sutil superior (`rootFreq * 2`).
- `stopAllNotes(): void`: Interrompe todos os osciladores ativos (chamado automaticamente na troca de rotas em `App.tsx`).

---

## 3. Geometria de Condução Rítmica (SVG / Solfejo)
Os movimentos de condução no MSA utilizam trajetórias curvas arredondadas (French curves) que simulam o ricochete da mão sobre uma "mesa invisível" no ponto inferior.

### Especificação de Vetores SVG por Fórmula de Compasso (Destros)
*Nota: Para canhotos, inverta a escala no eixo X (`scale(-1, 1)`).*

#### 📐 Movimento em 2 Tempos (Fase 4.7)
1. **Tempo 1 (Embaixo)**: A mão desce até a base (Ponto 1), faz um ricochete e sobe curvando suavemente para a direita até atingir o topo (Ponto 2).
2. **Tempo 2 (Em cima)**: Faz um pequeno laço (loop) no topo e desce verticalmente de volta ao Ponto 1.

#### 📐 Movimento em 3 Tempos (Fase 4.5)
1. **Tempo 1 (Embaixo)**: Desce até o Ponto 1 (base).
2. **Tempo 2 (Para fora)**: Ricocheteia no Ponto 1 e faz um arco lateral para a direita, parando no Ponto 2 (altura média).
3. **Tempo 3 (Em cima)**: Faz um arco grande subindo até o topo (Ponto 3), faz um laço e desce em linha quase reta para o Ponto 1.

#### 📐 Movimento em 4 Tempos (Fase 3.4)
1. **Tempo 1 (Embaixo)**: Desce verticalmente até o Ponto 1 (base).
2. **Tempo 2 (Para dentro)**: Ricocheteia no Ponto 1 e curva para a esquerda (centro do peito), parando no Ponto 2.
3. **Tempo 3 (Para fora)**: Curva em arco largo atravessando para a direita, parando no Ponto 3.
4. **Tempo 4 (Em cima)**: Sobe em arco acentuado para o topo (Ponto 4), faz um laço vertical e desce de volta ao Ponto 1.
