# AGENTS.md — Módulo Estúdio de Partituras & Hinário 5 (`src/modules/partituras/`)

Este documento define as invariantes de domínio musical, UX minimalista e arquitetura do módulo de estudo interativo de partituras MusicXML integrado ao **Issa Academy**.

## 1. Invariantes de Domínio Musical
1. **Som Universal de Piano de Cauda Didático (`'acoustic-grand'`):**
   - O motor `services/AudioScheduler.ts` utiliza exclusivamente multi-samples reais Salamander Grand Piano V3 (`A1`–`C7`) combinados com modelagem física de 3 cordas uníssonas em estéreo, ataque percussivo claro de martelo de feltro (`18ms`) e sustentação fiel à duração escrita.
   - **Jamais** sintetizar acordes, baixos ou acompanhamentos não escritos no MusicXML.
2. **Ferramentas Visuais de Cordas Exclusivas no Hinário de Cordas (`edition === 'cordas'`):**
   - O botão `[ Violino ]` (`components/ViolinFingerboard.tsx`), a opção `"Dedilhado e arcadas"` e as anotações de arcada (`⊓`) e dedilhado colorido (`0, 1, 2, 3, 4`) aparecem exclusivamente quando o usuário está estudando um hino na edição **Hinário de Cordas (`collection === 'hinario5' && edition === 'cordas'`)**.
3. **Leitura Rítmica sem Clave no 1º Espaço (`F4`):**
   - Partituras de leitura rítmica do MSA sem clave (`<sign>none</sign>`) têm suas cabeças de nota normalizadas na altura do **1º espaço inferior (`<step>F</step><octave>4</octave>`)** e ocultam nomes de altura (`Dó, Ré...`), exibindo apenas a contagem métrica.
4. **Solfejo em Português (`pt-BR`):**
   - Sempre utilizar acentuação correta: `Dó, Ré, Mi, Fá, Fá♯, Sol, Lá, Si`.
   - O controle `"Nomes das notas (Dó, Ré...)"` reside exclusivamente dentro do menu `"Personalizar notação"` da barra de transporte inferior (sem botão `[Dó]` avulso na barra).

## 2. Leis do Minimalismo "Menos é Mais"
- **Barra Superior Única (`48px`, `components/TopBar.tsx`):** Contém apenas o botão `← Início` (retorno ao portal Issa Academy), navegação `< | >`, botão `Repertório`, título da lição/hino, pílulas concisas de clave (`𝄞 Sol`, `𝄡 Dó`, `𝄢 Fá`) ou edição (`Cordas`, `Dó`, `Si♭`, `Mi♭`), botão `MusicXML` (no modo Admin) e alternador `Aluno | Admin` sincronizado com o `AdminContext`.
- **Palco da Partitura 100% Branco (`#FFFFFF`):** Sem nomes de instrumentos à esquerda do pentagrama (`drawPartNames: false` e `RenderPartNames = false` em `services/ScoreController.ts`).
- **Barra de Transporte Inferior (`56px`, `#2B2C30`, `components/TransportBar.tsx`):** Sem contadores `C1/C2` e sem botão de salvar trecho; pílula flutuante enxuta (`Foco | ✕` no modo normal e `Compassos -/+ até -/+ ✕` no modo foco).
