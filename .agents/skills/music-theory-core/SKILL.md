---
name: music-theory-core
description: Use esta skill ao criar, validar ou auditar questões do Simulado MSA (Fases 1 a 16), lógica de leitura de notas no Mestre da Clave, figuras rítmicas de Bona, acidentes ou armaduras de clave.
---

# Habilidade de Teoria Musical - MSA & Bona

Esta skill orienta o agente na lógica musical e nas regras teóricas utilizadas na criação de questões do Simulado e lógica de notas musicais no jogo Mestre da Clave.

---

## 1. Alturas e Notas do Endecagrama
A pauta abrange notas desde os registros graves da Tuba (linhas suplementares inferiores da Clave de Fá) até os registros agudos do Soprano/Violino (Clave de Sol).

- **Oitava de Referência**: O sistema utiliza a notação científica brasileira:
  - **Dó3 (Dó Central)**: Ponto de articulação entre as Claves de Sol e Fá. Frequência de `261.63 Hz`.
  - **Lá3**: `220.00 Hz` (Fase 1.3).
  - **Lá4**: `440.00 Hz` (Padrão de afinação internacional).

---

## 2. Figuras Rítmicas e Proporções (Fase 2)
Na divisão musical (Bona), cada figura tem um valor relativo com base na Semibreve como unidade padrão de divisão:

| Figura | Nome | Valor Proporcional | Descrição do MSA |
|---|---|---|---|
| 𝅝 | Semibreve | 1 | Valor máximo de duração em compassos simples |
| 𝅗𝅥 | Mínima | 1/2 | Metade da Semibreve |
| 𝅘𝅥 | Semínima | 1/4 | Metade da Mínima |
| 𝅘𝅥𝅮 | Colcheia | 1/8 | Metade da Semínima |
| 𝅘𝅥𝅯 | Semicolcheia | 1/16 | Metade da Colcheia |
| 𝅘𝅥𝅰 | Fusa | 1/32 | Metade da Semicolcheia (pouco usada no GEM) |

### Ponto de Aumento (Fase 4.2)
- Um ponto de aumento adiciona metade do valor da figura original: \(V_{final} = V + \frac{V}{2}\).
- Dois pontos (duplamente pontuada) adicionam mais um quarto do valor original: \(V_{final} = V + \frac{V}{2} + \frac{V}{4}\).

---

## 3. Compassos, Divisão e Subdivisão (Fase 2, 7 e 11)
- **Compasso Simples**: A unidade de tempo é uma figura simples (ex: compasso 2/4, 3/4, 4/4). O denominador define a figura da pulsação (4 = Semínima).
- **Compasso Composto**: A unidade de tempo é uma figura pontuada (divisível por 3 - ex: compasso 6/8, 9/8, 12/8). O denominador define a figura da subdivisão (8 = Colcheia, sendo 3 colcheias por pulsação).
- **Subdivisão (Bona)**: No solfejo de Bona, os exercícios rítmicos são subdivididos mentalmente em partes iguais (TÁ-TE para compasso simples e TÁ-TE-TI para compasso composto).

---

## 4. Escalas, Tonalidades e Acidentes (Fase 6 e 8)
- **Escala Diatônica Maior**: Segue o padrão de intervalos: **Tom - Tom - Semitom - Tom - Tom - Tom - Semitom**.
- **Acidentes (Alterações)**:
  - **Sustenido (#)**: Eleva a nota em um semitom.
  - **Bemol (b)**: Abaixa a nota em um semitom.
  - **Bequadro**: Anula o efeito do sustenido ou bemol, retornando a nota ao estado natural.
- **Ordem de aparição das alterações (Ciclo de Quintas)**:
  - **Sustenidos**: Fá - Dó - Sol - Ré - Lá - Mi - Si (sequência de quintas ascendentes).
  - **Bemóis**: Si - Mi - Lá - Ré - Sol - Dó - Fá (sequência de quintas descendentes).

---

## 5. Diretrizes para Geração de Questões do Simulado (Fases 6 a 16)
Ao gerar novos bancos de questões (ex.: `q_f06.json` a `q_f16.json`), siga estritamente o contrato Zod (`SimuladoQuestionSchema`) definido em `src/modules/simulado/questions/schema.ts`:
```json
{
  "id": "f06_q001",
  "ativo": true,
  "dificuldade": "facil",
  "pontos": 15,
  "tipo": "texto",
  "pergunta": "Qual é a sequência de intervalos que forma a Escala Diatônica Maior?",
  "imagemUrl": null,
  "audioUrl": null,
  "referencia": {
    "livro": "MSA",
    "periodo": 3,
    "fase": 6,
    "item": "6.1",
    "pagina": 55
  },
  "opcoes": [
    {
      "texto": "Tom - Tom - Semitom - Tom - Tom - Tom - Semitom.",
      "correta": true,
      "feedback": "A escala diatônica maior possui semitons entre o III-IV e VII-VIII graus (T-T-ST-T-T-T-ST)."
    },
    {
      "texto": "Tom - Semitom - Tom - Tom - Semitom - Tom - Tom.",
      "correta": false,
      "feedback": "Esta configuração corresponde à escala menor natural, não à escala diatônica maior."
    },
    {
      "texto": "Tom - Tom - Tom - Semitom - Tom - Tom - Semitom.",
      "correta": false,
      "feedback": "Na escala maior natural, o primeiro semitom ocorre entre o III e o IV grau."
    },
    {
      "texto": "Semitom - Tom - Tom - Tom - Semitom - Tom - Tom.",
      "correta": false,
      "feedback": "A distância entre o I e o II grau de uma escala diatônica maior é de um Tom inteiro."
    }
  ]
}
```
Regras obrigatórias:
- Todo arquivo `q_fXX.json` deve ser um array validado por `validateQuestionBank` (`SimuladoBankSchema`).
- Cada questão deve conter `id`, `pergunta` e `opcoes` (4 objetos `{ texto, correta, feedback }`, com exatamente 1 opção `correta: true`).
- Preencher `referencia` (`livro: "MSA"`, `periodo`, `fase`, `item`, `pagina`) para exibição no relatório final de revisão de erros.
