---
name: soundslice-minimalist-ux
description: Use this skill when designing or modifying UI components, transport controls, popovers, floating loop/focus bars, or violin fingerboard views to match the minimalist Soundslice pt-BR design system.
---

# Soundslice Minimalist UX Skill

## Objetivo
Manter a interface do SliceScore Studio rigorosamente alinhada ao design minimalista do Soundslice em Português do Brasil (`pt-BR`), onde **"menos é mais"**.

## Regras Visuais Obrigatórias ("Menos é Mais")
1. **Palco de Partitura Limpo (`#FFFFFF`) e Wake Lock Invisível:**
   - Fundo branco contínuo sem cartões cinzas ao redor da partitura, sem cabeçalhos redundantes e sem barra de "Trechos salvos".
   - Prevenção automática de bloqueio de tela (`navigator.wakeLock`) sem adicionar botões extras na interface.
2. **Barra Superior Única (`48px` / `h-12`) Sem Sub-barra:**
   - Deve conter exclusivamente: Navegação `< >`, botão `Repertório`, título clicável da obra, pílulas contextuais de Clave (`𝄞 Sol`, `𝄡 Dó`, `𝄢 Fá`) ou Edição (`Cordas`, `Órgão`, `Dó`...), botão `MusicXML` (apenas Admin) e alternador `Aluno / Admin`.
   - Proibido duplicar na `TopBar` botões que já existem na `TransportBar` (`Violino`, `Dó Notas`, `Horizontal`, `Zoom`, `Vozes`).
   - Proibido exibir badges explicativos como `"MSA · Leitura Rítmica (Sem Clave e Sem Pentagrama)"`.
3. **Painel de Repertório em Grade Compacta + Drag & Drop Admin:**
   - Cartões do MSA listados em sequência numérica em grade multi-colunas (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), em linha única (sem rodapé separado para o botão Admin).
   - Cartões de Leitura Rítmica são diretamente clicáveis (sem botão redundante `"Abrir Lição"`). Lições de Solfejo exibem diretamente as pílulas `𝄞 Sol`, `𝄡 Dó`, `𝄢 Fá`.
   - No modo Admin, tanto os botões `MusicXML` quanto o *Drag-and-Drop* direto de arquivos `.musicxml` sobre o cartão ou pílula de clave/edição atualizam a partitura instantaneamente.
4. **Pílula Flutuante do Loop (`[data-testid="floating-loop-pill"]`):**
   - Modo Loop Padrão: Exibe exclusivamente os botões **`Foco`** e **`✕`**.
   - Modo Foco Isolado: Exibe **`Compassos [ X | − | + ] até [ Y | − | + ] ✕`**.
5. **Barra de Transporte Inferior (`#2B2C30`):**
   - Esquerda: Botão circular branco de Play/Pause, botão Reiniciar, cronômetro `00:00 / 00:40` e pulsos de tempo `1 2 3 4`.
   - Direita: `[ Vozes ]` (quando polifônico), `[ 65 BPM ▾ ]`, `[ ↻ Loop ]`, `[ Violino ]` (exclusivo no Hinário de Cordas `edition === 'cordas'`), `[ Metrônomo ]`, `[ Tela cheia ]` e `[ Opções ]` (onde ficam `"Nomes das notas (Dó, Ré...)"` e `"Dedilhado e arcadas"`).

## Divulgação Progressiva
- Glossário e mapeamento de terminologia musical EN -> PT-BR: [`references/ptbr-musical-terminology.md`](./references/ptbr-musical-terminology.md)

## Passos de Validação
1. Execute os testes unitários com `npx --yes tsx --test src/modules/partituras/utils/musicMath.test.ts`.
2. Compile o projeto com `compile_applet`.
3. Inspecione a aplicação em `http://localhost:3000/#/partituras` via `playwright-cli` confirmando a barra superior única de `48px`, ausência de controles duplicados e grade compacta no repertório.

