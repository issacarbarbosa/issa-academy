# GEMINI.md — Contexto Imediato do Agente (Antigravity Alias)

Este arquivo atua como índice de contexto rápido para o agente principal no ecossistema **Google Antigravity**.

## Fontes da Verdade do Projeto
1. **Regras Globais e Subagentes:** Consulte [`/AGENTS.md`](./AGENTS.md) e [`/.agents/rules/AGENTS.md`](./.agents/rules/AGENTS.md).
2. **Arquitetura e Fluxos (Mermaid):** Consulte [`/ARCHITECTURE.md`](./ARCHITECTURE.md).
3. **Status Atual, Sprint e Backlog:** Consulte [`/ROADMAP.md`](./ROADMAP.md).
4. **Decisões de Arquitetura (ADRs):** Consulte [`/docs/decisions/`](./docs/decisions/).

## Habilidades Modulares Locais (`.agents/skills/`)
- `osmd-score-synchronization`: Renderização MusicXML via OSMD, cálculo de `BoundingBox`, destaque SVG de cabeças de nota, alças arrastáveis de loop por tempo e isolamento de compassos no Modo Foco.
- `webaudio-precision-scheduler`: Agendador Web Audio API com lookahead, síntese acústica de **Piano de Cauda Didático Universal** (multi-samples Salamander C5 + modelagem física + ataque claro de martelo e sustentação fiel), Metrônomo + Count-in integrados e Treino de Velocidade progressivo.
- `soundslice-minimalist-ux`: Diretrizes de interface minimalista estilo Soundslice em `pt-BR`, pílula flutuante enxuta (`Foco | ✕`), sem salvamento de trechos, sem indicadores `C1/C2` e sem referências a outros instrumentos na interface.

## Resumo de Restrições Críticas ("Menos é Mais")
- **Som Universal de Piano de Cauda Didático:** O piano (`'acoustic-grand'`) é o som exclusivo de todas as lições do MSA e Hinos, sem seletor de instrumento de áudio.
- **Ferramentas Visuais do Violino no Hinário de Cordas:** No **Hinário de Cordas (`edition === 'cordas'`)**, ficam disponíveis o **Braço do Violino (`ViolinFingerboard`)** na barra inferior e o **Dedilhado e arcadas** na personalização de notação.
- **Nomes das Notas Apenas na Personalização:** O controle `"Nomes das notas (Dó, Ré...)"` fica exclusivamente dentro do menu `"Personalizar notação"` (sem botão `[Dó]` na barra inferior).
- **Design Autoexplicativo ("Menos é mais"):** Nunca adicionar resumos de texto, subtítulos explicativos, rótulos verbosos (`"Substituir MusicXML:"`, `"Reimportar"`, `"Abrir Lição"`) ou controles duplicados entre `TopBar` e `TransportBar`. Use linha única de `48px` no topo, glifos musicais concisos (`𝄞 Sol`, `𝄡 Dó`, `𝄢 Fá`) e cartões em grade diretamente clicáveis.
- **Nunca** tocar acordes ou notas não escritas na partitura.
- **Sempre** usar solfejo acentuado em português (`Dó, Ré, Mi, Fá, Fá♯, Sol, Lá, Si`).
- **Nunca** reintroduzir o botão "Salvar trecho" ou indicadores de compasso (`C1`, `C1/11`) na barra de transporte ou na pílula do loop.
- **Nunca** colar todo o conteúdo dos arquivos de código alterados no chat; aplique as edições diretamente nos arquivos e finalize com o *Painel de Sincronização do Projeto*.
- **Sempre** validar alterações executando `npx --yes tsx --test src/utils/musicMath.test.ts` e `compile_applet`.
