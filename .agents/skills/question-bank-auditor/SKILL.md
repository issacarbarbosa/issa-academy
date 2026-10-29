---
name: question-bank-auditor
description: >-
  Use esta skill ao criar, expandir ou auditar os bancos de questões JSON do Simulado MSA
  (src/modules/simulado/questions/q_f01.json a q_f16.json) para validar integridade estrutural,
  mínimo de 15 questões por fase, unicidade de IDs, balanceamento de alternativas A/B/C/D e
  conformidade com o MSA da CCB.
---

# Auditoria e Expansão de Bancos de Questões (Simulado MSA)

Esta skill fornece o procedimento determinístico e o script executável para validar os 16 bancos de questões (`q_f01.json` a `q_f16.json`) do Simulado MSA antes de qualquer commit ou deploy.

---

## 🛠️ Passo a Passo de Uso

### 1. Consultar a Base Teórica Oficial (`music-theory-core`)
Antes de redigir novas questões para qualquer fase, leia o arquivo de referência correspondente em `.agents/skills/music-theory-core/references/`:
- **Período 1 (Fases 1 a 3)**: `01-periodo-1-fases-1-a-3.md`
- **Período 2 (Fases 4 e 5)**: `02-periodo-2-fases-4-e-5.md`
- **Período 3 (Fases 6 a 9)**: `03-periodo-3-fases-6-a-9.md`
- **Período 4 (Fases 10 a 16)**: `04-periodo-4-fases-10-a-16.md`

### 2. Regras de Ouro por Arquivo JSON (`q_fXX.json`)
1. **Volume Mínimo por Fase**: Cada arquivo `q_f01.json` a `q_f16.json` deve possuir **no mínimo 15 questões ativas** (`"ativo": true`) para garantir sorteios variados no modo **Por Fase (10 questões)**.
2. **Padronização de ID**: O `id` deve seguir o formato `fXX_qYYY` (ex.: `f09_q011`, `f14_q007`) sem duplicatas.
3. **Referência Oficial Exata**:
   - `livro`: `"MSA"`
   - `periodo`: `1` (Fases 1–3), `2` (Fases 4–5), `3` (Fases 6–9) ou `4` (Fases 10–16)
   - `fase`: número inteiro da fase (`1` a `16`)
   - `item`: tópico real do sumário do MSA (ex.: `"9.1 Barras de repetição (ritornello)"`)
   - `pagina`: número real da página no livro oficial do MSA
4. **Alternativas e Feedback**:
   - Exatamente **4 objetos** em `opcoes`.
   - Exatamente **1 opção com `"correta": true`** e **3 opções com `"correta": false"`.
   - Todas as 4 opções devem ter `"feedback"` pedagógico explicando o motivo do acerto ou erro.
   - Distribua a posição de `"correta": true` de maneira equilibrada entre os índices `0`, `1`, `2` e `3` (A, B, C, D) ao longo do arquivo.

### 3. Executar o Script de Auditoria Automatizada
Sempre que adicionar ou editar questões, execute o script validador:

```bash
node .agents/skills/question-bank-auditor/scripts/audit-banks.cjs
```

Para auditar exigindo o mínimo de 15 questões por fase (modo estrito pós-expansão):

```bash
node .agents/skills/question-bank-auditor/scripts/audit-banks.cjs --min-per-phase=15
```

### 4. Critério de Aprovação
O script deve retornar **código de saída 0** com zero erros estruturais, zero IDs ou enunciados duplicados e todas as 16 fases acima do limite mínimo configurado.
