# GEMINI.md — Contexto Imediato do Agente (Antigravity & Google AI Studio)

Este arquivo atua como índice de contexto imediato e protocolo de inicialização obrigatória para o agente principal tanto no **Google AI Studio** quanto no **Google Antigravity (IDE Local)**.

---

## 🔄 PROTOCOLO OBRIGATÓRIO DE INÍCIO DE CONVERSA (Check-in GitHub)

Este projeto é desenvolvido em **fluxo híbrido colaborativo (`Google AI Studio ⇄ GitHub ⇄ Antigravity`)**, desenhado para extrair o máximo que cada ferramenta oferece:
- **Google AI Studio:** Prototipagem rápida em nuvem, inspeção multimodal de UI/áudio em tempo real, geração de componentes e validação instantânea em container isolado.
- **Google Antigravity (IDE Local):** Engenharia profunda no sistema de arquivos local, execução de hooks de ciclo de vida (`hooks.json`), automações locais e commits diretos com credenciais do sistema.
- **GitHub (`https://github.com/issacarbarbosa/issa-academy` — branch `main`):** Fonte Única da Verdade (*Single Source of Truth*) que sincroniza os dois ambientes e dispara o deploy automático no GitHub Pages.

### Regra Inegociável ao Iniciar Qualquer Novo Chat:
**Na primeira interação de cada nova conversa (seja no AI Studio ou no Antigravity), antes de editar qualquer arquivo de código, o agente DEVE:**
1. Executar o script de conferência de sincronização:
   ```bash
   bash .agents/skills/github-hybrid-sync/scripts/sync-check.sh
   ```
   *(Ou verificar manualmente se `.git` existe, conectar ao remoto `https://github.com/issacarbarbosa/issa-academy.git`, executar `git fetch origin main` e comparar `HEAD` com `origin/main`).*
2. Se o repositório local estiver atrás de `origin/main`, atualizar imediatamente (`git pull --rebase origin main` ou `git reset --hard origin/main` se a árvore estiver limpa) e informar ao usuário qual é o último commit sincronizado.
3. Para enviar alterações de volta ao GitHub a partir do **Google AI Studio**, utilizar o segredo `GITHUB_TOKEN` (configurado na aba *Secrets* do AI Studio) via `bash .agents/skills/github-hybrid-sync/scripts/sync-check.sh --push "mensagem conventional commit"`, preservando `.github/workflows/deploy.yml` intacto quando o token possuir escopo padrão `repo`.

---

## 📚 Fontes da Verdade do Projeto
1. **Regras Globais e Subagentes:** Consulte [`/AGENTS.md`](./AGENTS.md), [`/.agents/rules/AGENTS.md`](./.agents/rules/AGENTS.md) e [`/.agents/rules/project-context.md`](./.agents/rules/project-context.md).
2. **Fluxo Git e Sincronização Híbrida:** Consulte [`/.agents/rules/git-workflow.md`](./.agents/rules/git-workflow.md) e [`/.agents/skills/github-hybrid-sync/SKILL.md`](./.agents/skills/github-hybrid-sync/SKILL.md).
3. **Arquitetura e Fluxos (Mermaid):** Consulte [`/ARCHITECTURE.md`](./ARCHITECTURE.md) e [`/FLUXO_USUARIO.md`](./FLUXO_USUARIO.md).
4. **Status Atual, Sprint e Backlog:** Consulte [`/ROADMAP.md`](./ROADMAP.md) e [`/CHANGELOG.md`](./CHANGELOG.md).
5. **Decisões de Arquitetura (ADRs):** Consulte [`/docs/decisions/`](./docs/decisions/).

---

## 🧩 Módulos Unificados do Ecossistema Issa Academy (`src/modules/`)
1. `home/` (`WelcomeHome.tsx`): Portal principal com o mascote Fufu e os 4 cards de estudo.
2. `aulas/` (`AulasMsa.tsx`): Trilha teórica interativa das 16 Fases e 4 Períodos do MSA com videoaulas `@issacarbarbosa`.
3. `partituras/` (`PartiturasStudio.tsx`): Estúdio de Partituras MusicXML estilo Soundslice (Lições Rítmicas e de Solfejo do MSA nas 3 claves + Hinário 5 CCB) com som universal de **Piano de Cauda Didático (`'acoustic-grand'`)**.
4. `mestre-da-clave/` (`MestreDaClave.tsx`): Jogo arcade a 60fps em HTML5 Canvas com vetores oficiais SMuFL Bravura (`𝄞 Sol`, `𝄢 Fá`, `𝄡 Dó`).
5. `simulado/` (`SimuladoMsa.tsx`): Simulado Dual-Mode (Por Período 20q / Por Fase 10q) com 552+ questões validadas por Zod e reporte de feedback híbrido.
6. `admin/` (`AdminDashboard.tsx`): CMS Híbrido Supabase Cloud + Offline (`localStorage`) com acesso via `/#/admin` ou `Ctrl+Shift+A`.

---

## 🛠️ Habilidades Modulares Locais (`.agents/skills/`)
- `github-hybrid-sync`: Conferência obrigatória de atualização no início do chat e sincronização bidirecional `Google AI Studio ⇄ GitHub ⇄ Antigravity`.
- `osmd-score-synchronization`: Renderização MusicXML via OSMD em `src/modules/partituras/`, cálculo de `BoundingBox`, destaque SVG de cabeças de nota, alças arrastáveis de loop por tempo e isolamento de compassos no Modo Foco.
- `webaudio-precision-scheduler`: Agendador Web Audio API com lookahead em `src/modules/partituras/services/AudioScheduler.ts`, síntese acústica de **Piano de Cauda Didático Universal** (multi-samples Salamander C5 + modelagem física + ataque claro de martelo e sustentação fiel), Metrônomo + Count-in e Treino de Velocidade.
- `soundslice-minimalist-ux`: Diretrizes de interface minimalista estilo Soundslice em `pt-BR` ("Menos é mais"), pílula flutuante enxuta (`Foco | ✕`), sem salvamento de trechos e sem indicadores `C1/C2`.
- `music-theory-core`: Base curricular oficial do MSA (16 fases / 4 períodos) da CCB.
- `rhythm-audio-engine`: Síntese acústica Web Audio API do jogo Mestre da Clave e Simulado (`src/core/utils/audio.ts`).
- `question-bank-auditor`: Auditoria estatística e estrutural Zod dos 16 bancos de questões (`q_f01.json` a `q_f16.json`).
- `canvas-playtest`: Testes de performance 60fps, HiDPI e responsividade do Canvas 2D.
- `map-builder`: Geração automatizada e idempotente de `MAPA_RAIZ.md` (`npm run map`).
- `deploy-helper`: Portão de qualidade pré-deploy (`node .agents/skills/deploy-helper/scripts/pre-deploy-check.js`).

---

## ⚠️ Resumo de Restrições Críticas ("Menos é Mais")
- **Som Universal de Piano de Cauda Didático no Estúdio de Partituras:** O piano (`'acoustic-grand'`) é o som exclusivo de todas as lições do MSA e Hinos em `src/modules/partituras/`, sem seletor de instrumento de áudio e **jamais** tocando acordes ou notas não escritas na partitura.
- **Ferramentas Visuais do Violino no Hinário de Cordas:** No **Hinário de Cordas (`edition === 'cordas'`)**, ficam disponíveis o **Braço do Violino (`ViolinFingerboard`)** na barra inferior e o **Dedilhado e arcadas (`0, 1, 2, 3, 4` e `⊓`)** na personalização de notação.
- **Nomes das Notas Apenas na Personalização:** O controle `"Nomes das notas (Dó, Ré...)"` fica exclusivamente dentro do menu `"Personalizar notação"` (sem botão `[Dó]` na barra inferior), usando sempre acentuação gráfica correta (`Dó, Ré, Mi, Fá, Fá♯, Sol, Lá, Si`).
- **Sempre** validar alterações executando `npm run typecheck`, `npm run test` (que roda os 90 testes Vitest + 18 testes `musicMath.test.ts`) e `npm run build`.
