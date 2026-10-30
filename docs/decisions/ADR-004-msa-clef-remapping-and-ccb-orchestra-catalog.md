# ADR-004: Remapeamento de Clave em Posição Fixa no Pentagrama (MSA) e Catálogo Multi-Edição da Orquestra CCB

- **Status:** Aceito e Implementado
- **Data:** Outubro de 2026

## 1. Contexto
O projeto **SliceScore Studio** atende ao ensino musical segundo o **MSA (Método Simplificado de Aprendizagem Musical — 113 Lições)** e o **Hinário 5 da CCB (480 Hinos em múltiplas edições e tonalidades: Cordas, Órgão, Dó, Si♭, Mi♭, Fá e Tubas)**.

Dois desafios técnicos e pedagógicos centrais precisavam ser resolvidos:
1. **Lições de Leitura Rítmica (ex.: Lições 1 a 5 do MSA):** No livro impresso do MSA, essas lições exibem apenas a fórmula de compasso, barras de compasso e figuras rítmicas alinhadas horizontalmente, **sem pentagrama de 5 linhas e sem clave**.
2. **Lições de Solfejo em Pentagrama Sem Clave (ex.: Lições 19 a 22 do MSA):** No método impresso, as notas estão desenhadas no pentagrama de 5 linhas **sem nenhuma clave no início**, para que cada candidato desenhe a clave do seu próprio instrumento (`Sol 2ª linha`, `Fá 4ª linha`, `Dó 3ª linha` ou `Dó 4ª linha`) e realize o solfejo. Ao mudar a clave, **a posição visual das notas nas linhas e espaços do pentagrama não pode mudar** (não há transposição gráfica); o que muda é o nome e a altura sonora da nota correspondente àquela linha ou espaço.

## 2. Decisão
1. **Matemática Pura de Remapeamento de Clave em Posição Fixa (`src/utils/musicMath.ts`):**
   - Criamos as funções puras `computeStaffLineIndexFromTreblePitch` e `mapStaffLineIndexToClefPitch`.
   - Cada nota base do arquivo único da lição possui um índice diatônico de posição no pentagrama (`staffLineIndex = 0` para a 1ª linha inferior, `1` para o 1º espaço, `2` para a 2ª linha, etc.).
   - Quando o aluno seleciona `Sol`, `Fá`, `Dó 3ª` ou `Dó 4ª` na barra `Clave do Aluno`, o `ScoreController.ts` converte a tag `<clef>` e recalcula `<step>` e `<octave>` de cada nota a partir da nota da 1ª linha daquela clave (`E4` em Sol, `G2` em Fá 4ª linha, `F3` em Dó 3ª linha, `D3` em Dó 4ª linha).
   - Assim, o OpenSheetMusicDisplay desenha a cabeça da nota **exatamente na mesma linha ou espaço visual**, enquanto o motor de áudio (`AudioScheduler.ts`) e a camada de solfejo (`App.tsx`) passam a tocar e exibir os nomes corretos (`Dó, Ré, Mi, Fá, Sol, Lá, Si`) para a clave escolhida.
2. **Pós-processamento SVG para Modo Rítmico e Modo Sem Clave (`ScoreController.ts`):**
   - No modo `sem-clave`, o glifo SVG `.vf-clef` é ocultado preservando intactas as 5 linhas do pentagrama.
   - No modo `ritmica` (Lições 1 a 5), o glifo `.vf-clef` e as 5 linhas horizontais de `.vf-stave` são ocultados, mantendo visíveis a fórmula de compasso, as barras divisórias verticais e as figuras rítmicas/pausas exatamente como no MSA impresso.
3. **Síntese Web Audio para os 22 Instrumentos Oficiais da Orquestra CCB + Mixer Multi-Vozes (`AudioScheduler.ts`):**
   - Implementamos perfis acústicos dedicados para as 4 famílias da Orquestra CCB (**Cordas, Madeiras, Metais e Órgão Eletrônico Litúrgico**) e filtragem por `staffIndex` (`setActiveStaffIndices`) permitindo **Solo / Mute** individual das vozes do hinário (`Violino`, `Viola`, `Violoncelo` ou `Mão Direita`, `Mão Esquerda`, `Pedaleira`).

## 3. Consequências
- **Positivas:** Evita quadruplicar arquivos MusicXML para cada lição sem clave do MSA; garante fidelidade visual idêntica às páginas do MSA e do Hinário 5; mantém o projeto 100% testável em `musicMath.test.ts` e pronto para futura migração do catálogo local para banco de dados em nuvem.
