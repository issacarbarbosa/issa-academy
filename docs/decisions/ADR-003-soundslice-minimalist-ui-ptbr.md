# ADR-003: Design Minimalista Soundslice em Português-BR ("Menos é Mais")

- **Status:** Aceito
- **Data:** 2026-10-28

## Contexto
A interface inicial continha informações redundantes no painel de configurações (Loop, BPM e Metrônomo duplicados), notas sem acento em português (`Do, Re, Fa, La`), botão de "Salvar trecho" desnecessário e indicadores de compasso (`C1`, `C2`, `C1/11`) poluindo a barra de transporte e a pílula flutuante.

## Decisão
1. **Idioma e Solfejo:** Padronizar toda a UI em `pt-BR` e acentuar corretamente as notas pedagógicas: **`Dó, Ré, Mi, Fá, Fá♯, Sol, Lá, Si`**.
2. **Desduplicação de Popovers:**
   - Contagem regressiva (`Count-in`) movida para dentro do popover do ícone do Metrônomo.
   - Treino de velocidade (`Speed training`) movido para dentro do popover do botão `BPM`.
   - Painel de Configurações restrito a Layout, Notação, Estilo do Reprodutor e Instrumento/Áudio.
3. **Remoção de "Salvar Trecho" e Indicadores `C1/C2`:**
   - Removida a funcionalidade de salvar trechos e todas as marcações de compasso (`C1`, `C1/11`) da barra inferior e da pílula flutuante do Loop (`Foco | ✕`).

## Consequências
- **Positivas:** Interface limpa, intuitiva no celular e desktop, foco total na partitura e zero poluição visual.
