---
name: music-theory-core
description: Use esta skill ao criar, validar ou auditar conteúdo pedagógico do MSA (Método Simplificado de Aprendizagem Musical da CCB - Fases 1 a 16, Períodos 1 a 4), planos de aulas do GEM, avaliações oficiais, vídeos do canal @issacarbarbosa, questões do Simulado MSA, leitura de notas no Mestre da Clave, solfejo, figuras rítmicas, acidentes, armaduras de clave ou interpretação sacra.
---

# Habilidade de Teoria Musical — MSA (CCB), GEM & Canal Issacar Barbosa

Esta skill implementa o padrão de **Divulgação Progressiva (Progressive Disclosure)**: este arquivo principal (`SKILL.md`) contém a visão geral arquitetural, o índice de referência rápida e os contratos de dados, enquanto todo o conhecimento denso extraído dos materiais oficiais da CCB (Livro Oficial do MSA, Caderno de Exercícios v2.4, Planos de Aulas dos 4 Períodos, Slides Oficiais de Aulas e Avaliações Finais Modelos 1 a 6) está organizado modularmente na pasta `references/`.

---

## 📚 Índice de Divulgação Progressiva (`references/`)

> **Instrução ao Agente**: Sempre que precisar consultar definições literais do MSA, páginas exatas, exemplos de hinos do Hinário 5, gabaritos de exercícios oficiais ou links de videoaulas do canal `@issacarbarbosa`, leia apenas o arquivo de referência correspondente ao período/fase desejado usando `view_file`:

1. **[00-curriculo-gem-e-youtube.md](references/00-curriculo-gem-e-youtube.md)**
   - Estrutura completa dos **4 Períodos (60 aulas / Fases 1 a 16)** com mapeamento exato de tópicos (`1.1` a `16.3`) e **páginas oficiais do PDF do MSA**.
   - Diretrizes de aplicação das aulas (Manual v2.7) e sistema **SAM**.
   - Catálogo completo das videoaulas do canal **[@issacarbarbosa](https://www.youtube.com/@issacarbarbosa)** com `videoId` do YouTube para embed direto.
2. **[01-periodo-1-fases-1-a-3.md](references/01-periodo-1-fases-1-a-3.md)** — **1º Período (Fases 1, 2 e 3 | Págs. 9 a 34 | Aulas 1 a 15)**
   - **Fase 1**: Música e Som, Elementos da Música (Melodia, Harmonia, Ritmo), Propriedades do Som (Altura, Duração, Intensidade, Timbre), Pentagrama, Claves (Sol, Fá na 4ª linha, Dó na 3ª linha) e Notas Musicais.
   - **Fase 2**: Figuras Musicais (Semibreve a Semifusa, partes da figura, feixes), Compasso, Barras de Compasso (Simples, Dupla, Final), Fórmula de Compasso em 4 ($\frac{4}{4}$, $\mathbf{C}$), Ritmo/Pulsação e Leitura Rítmica.
   - **Fase 3**: Endecagrama (Dó Central), Linhas e Espaços Suplementares, Leitura Métrica, Solfejo (movimento em 4), Respiração e Fermata ($\curvearrowright$).
3. **[02-periodo-2-fases-4-e-5.md](references/02-periodo-2-fases-4-e-5.md)** — **2º Período (Fases 4 e 5 | Págs. 35 a 51 | Aulas 16 a 30)**
   - **Fase 4**: Ligaduras (Valor, Portamento, Fraseado), Ponto de Aumento (simples e duplo), Intervalos (melódico/harmônico, simples/composto, uníssono a oitava), Fórmula de Compasso em 3 ($\frac{3}{4}$, $\frac{3}{2}$, $\frac{3}{8}$), Fórmula de Compasso em 2 ($\frac{2}{4}$, $\frac{2}{2}$, $\mathbb{C}$), Silêncio na Música e Tercina.
   - **Fase 5**: Fórmula de Compasso em 6 ($\frac{6}{8}$, $\frac{6}{4}$), Movimento de Condução em 6 e Movimento Alternativo em 2 (binário composto).
4. **[03-periodo-3-fases-6-a-9.md](references/03-periodo-3-fases-6-a-9.md)** — **3º Período (Fases 6, 7, 8 e 9 | Págs. 52 a 92 | Aulas 31 a 45)**
   - **Fase 6**: Semitom (natural, cromático, diatônico) e Tom, Acidentes ($\sharp$, $\flat$, $\natural$), Uníssono e Notas Enarmônicas, Escala Cromática, Escala Diatônica e os 7 Graus (Tônica a Sensível), Escala Maior ($\text{T}-\text{T}-\text{st}-\text{T}-\text{T}-\text{T}-\text{st}$), Escalas com Sustenidos (Fá–Dó–Sol–Ré–Lá–Mi–Si) e com Bemóis (Si–Mi–Lá–Ré–Sol–Dó–Fá).
   - **Fase 7**: Armadura de Clave (identificação rápida de tonalidades), Compasso em 9 ($\frac{9}{8}$, $\frac{9}{4}$ e movimento alternativo em 3) e Compasso em 12 ($\frac{12}{8}$ e movimento alternativo em 4).
   - **Fase 8**: Tonalidade (Hinário 5 exclusivamente em tonalidades Maiores; identificação pela armadura e pelo baixo, nunca pelo soprano — exceções Hinos 15 e 367), Acidentes Fixos, Ocorrentes ($\sharp$, $\flat$, $\natural$, dobrado sustenido $\times$, dobrado bemol $\flat\flat$) e de Precaução.
   - **Fase 9**: Barras de Repetição (Ritornello) e Casas de Ritornello (1ª, 2ª e 3ª vez).
5. **[04-periodo-4-fases-10-a-16.md](references/04-periodo-4-fases-10-a-16.md)** — **4º Período (Fases 10 a 16 | Págs. 93 a 156 | Aulas 46 a 60)**
   - **Fase 10**: Dinâmica Natural vs. Artificial (no Hinário 5 aplica-se a dinâmica natural), tabela de abreviaturas (`ppp` a `fff`), *crescendo* e *decrescendo*.
   - **Fase 11**: Acento Métrico (2, 3 e 4 tempos; prosódia musical), Compassos Simples (2, 3, 4 — subdivisão binária), Compassos Compostos (6, 9, 12 — subdivisão ternária) e Compassos Alternados (escritos alternadamente em cada compasso nos hinos 342, 346 e 415 para facilitar a leitura e a regência; mudanças estrofe/coro e exceção de velocidade no Hino 422).
   - **Fase 12**: Síncopa (regular e irregular; sem acentuação forte nos hinos) e Contratempo (regular e irregular).
   - **Fase 13**: Ritmos Iniciais (Tético, Anacrúsico e Acéfalo — apenas 2 hinos acéfalos no Hinário 5: Hinos 208 e 377, ambos sem pausa inicial escrita).
   - **Fase 14**: Notas Pontuadas — Diferenças na subdivisão entre compassos simples ($\frac{3}{4}+\frac{1}{4}=1\text{ tempo}$ em $\frac{4}{4}$) e compostos ($\frac{3}{6}+\frac{1}{6}=\frac{4}{6}\text{ de tempo}$ ou 2 movimentos em $\frac{6}{8}$).
   - **Fase 15**: Andamento (limites mínimo e máximo, meia-hora) e Modificações de Andamento (*poco rallentando* nos hinos 15, 157 e 378 — início exato na inscrição *poco rall.*; prevenção de modificação indevida pós-fermata no Hino 447).
   - **Fase 16**: Frases (4 compassos), Semifrases (vírgulas maiores e menores informam respiração normal ou curta e não definem semifrases), Interpretação Musical e as **6 Indicações Interpretativas do Hinário 5** (*Solene* = grandiosidade, *Majestoso* = modo imponente, *Com júbilo* = contentamento, *Com veneração* = mais suave do que o som solene, *Com submissão* = suavidade e cuidado, *Com humildade* = leveza).

---

## 🎵 Resumo Técnico Rápido para Jogos e Áudio

### 1. Alturas e Notas do Endecagrama
- **Dó3 (Dó Central)**: Ponto de articulação entre as Claves de Sol (2ª linha), Fá (4ª linha) e Dó (3ª linha). Frequência no motor de áudio: `261.63 Hz`.
- **Lá4 (Diapasão Padrão)**: `440.00 Hz` (Fase 1.3).

### 2. Proporção das Figuras Rítmicas (Fase 2.1 e 4.2)
- Semibreve ($1$) $\rightarrow$ Mínima ($1/2$) $\rightarrow$ Semínima ($1/4$) $\rightarrow$ Colcheia ($1/8$) $\rightarrow$ Semicolcheia ($1/16$) $\rightarrow$ Fusa ($1/32$) $\rightarrow$ Semifusa ($1/64$).
- **Ponto de Aumento**: 1º ponto soma $+1/2$ do valor da figura; 2º ponto soma $+1/4$ da figura original ($+1/2$ do 1º ponto).

### 3. Contrato Zod para Bancos de Questões do Simulado (`SimuladoQuestionSchema`)
Ao criar ou editar arquivos `q_f01.json` a `q_f16.json` em `src/modules/simulado/questions/`, respeite estritamente o schema validado por `validateQuestionBank` (`src/modules/simulado/questions/schema.ts`):

```json
{
  "id": "f06_q001",
  "ativo": true,
  "dificuldade": "facil",
  "pontos": 15,
  "tipo": "texto",
  "pergunta": "Qual é a sequência de intervalos que forma a Escala Diatônica Maior no sentido ascendente?",
  "imagemUrl": null,
  "audioUrl": null,
  "referencia": {
    "livro": "MSA",
    "periodo": 3,
    "fase": 6,
    "item": "6.6 Escalas maiores",
    "pagina": 59
  },
  "opcoes": [
    {
      "texto": "Tom - Tom - Semitom - Tom - Tom - Tom - Semitom.",
      "correta": true,
      "feedback": "Correto! Na escala diatônica maior, os semitons localizam-se entre os graus III-IV e VII-VIII."
    },
    {
      "texto": "Tom - Semitom - Tom - Tom - Semitom - Tom - Tom.",
      "correta": false,
      "feedback": "Incorreto. Na escala maior, os semitons ocorrem entre o III-IV e VII-VIII graus."
    },
    {
      "texto": "Tom - Tom - Tom - Semitom - Tom - Tom - Semitom.",
      "correta": false,
      "feedback": "Incorreto. Entre o III e o IV grau da escala maior há um semitom, e não um tom."
    },
    {
      "texto": "Semitom - Tom - Tom - Tom - Semitom - Tom - Tom.",
      "correta": false,
      "feedback": "Incorreto. A distância entre o I e o II grau da escala diatônica maior é de 1 tom."
    }
  ]
}
```
- **Regras Obrigatórias**:
  1. Exatamente **4 opções** por questão, sendo **1 `correta: true`** e **3 `correta: false`**.
  2. Todas as 4 opções devem ter `feedback` pedagógico claro explicando o porquê do acerto ou do erro segundo o MSA.
  3. O campo `referencia` deve conter `livro: "MSA"`, `periodo` (`1` a `4`), `fase` (`1` a `16`), `item` (tópico oficial do MSA) e `pagina` (número real da página no livro oficial do MSA).
