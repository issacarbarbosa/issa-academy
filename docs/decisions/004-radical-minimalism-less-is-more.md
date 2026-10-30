# ADR 004: Doutrina de Design "Menos é Mais" (UI Autoexplicativa e Zero Redundância)

- **Status:** Aceito e Ativo
- **Data:** Outubro de 2026
- **Contexto:** Durante a evolução do catálogo do MSA e Hinário 5 CCB, a presença de textos descritivos, sub-barras contextuais, rótulos verbosos (`"Substituir MusicXML:"`, `"Reimportar"`, `"Abrir Lição"`, `"Clave de Sol"`) e ferramentas duplicadas entre o topo e o rodapé gerava poluição visual e desperdício de área útil da partitura.

## Decisão
Adotamos como invariante arquitetural de UI/UX o princípio **"Menos é mais" (A interface deve comunicar por si só)**:

1. **Proibição de Textos Explicativos na UI:** Nenhum cartão, cabeçalho ou modal deve exibir parágrafos explicando o que é uma lição ou modalidade. A própria notação musical e os símbolos universais comunicam o estado.
2. **Barra Superior Única (`48px`):** A sub-barra secundária foi eliminada. O seletor de Clave (`𝄞 Sol`, `𝄡 Dó`, `𝄢 Fá`) ou Edição (`Cordas`, `Órgão`, `Dó`...) vive diretamente na barra principal de `48px`.
3. **Separação Estrita de Responsabilidades (`TopBar` vs `TransportBar`):**
   - `TopBar`: Exclusivamente contexto do repertório (Anterior/Próxima, Repertório, Título, Clave/Edição, upload rápido Admin e chave Aluno/Admin).
   - `TransportBar`: Exclusivamente controles de reprodução, estudo e visualização (`Play`, `BPM`, `Loop`, `Dó`, `Violino`, `Vozes`, `Metrônomo`, `Tela Cheia`, `Opções`).
4. **Interação Direta (Cartões Clicáveis, Glifos e Drag-and-Drop):**
   - Cartões do MSA dispostos em grade compacta multi-colunas de linha única.
   - Lições rítmicas abrem ao clicar no próprio cartão (sem botão `"Abrir Lição"`).
   - Claves usam glifos universais (`𝄞 Sol`, `𝄡 Dó`, `𝄢 Fá`).
   - No modo Admin, arquivos `.musicxml` podem ser arrastados (*Drag-and-Drop*) diretamente sobre qualquer cartão ou pílula de clave/edição.
5. **Ergonomia Invisível (`Screen Wake Lock`):**
   - Recursos que melhoram a experiência do músico na estante (como manter a tela acesa via `navigator.wakeLock`) operam automaticamente em segundo plano sem adicionar botões à interface.
