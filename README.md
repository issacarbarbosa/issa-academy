# Issa Academy • Ensino Musical CCB (MSA & Hinário 5)

Plataforma educacional gamificada e interativa de ensino musical voltada para o **MSA (Método Simplificado de Aprendizagem Musical)** e para o **Hinário 5 da Congregação Cristã no Brasil (CCB)**, com foco na preparação de candidatos a músicos e organistas.

Disponível ao vivo em: **[https://issacarbarbosa.github.io/issa-academy/](https://issacarbarbosa.github.io/issa-academy/)**

---

## 🎯 Módulos Ativos (`src/modules/`)

1. **🏠 Home (`/#/` — `WelcomeHome.tsx`):**
   - Recepção interativa com o mascote Fufu.
   - Navegação direta para os **4 modos principais de estudo e prática**.
   - Link direto para o Canal Oficial no YouTube (`@issacarbarbosa`).

2. **📚 Aulas & Lições do MSA (`/#/aulas` — `AulasMsa.tsx`):**
   - Trilha teórica estruturada pelas **16 Fases e 4 Períodos do MSA**.
   - Videoaulas integradas do canal oficial `@issacarbarbosa` com player responsivo.
   - Blocos didáticos modulares (Explicação Didática, Dicas do Fufu, Regras Oficiais do MSA e figuras) com persistência de progresso e atalho direto para treino no Simulado.

3. **🎼 Estúdio de Partituras & Hinário 5 CCB (`/#/partituras` — `PartiturasStudio.tsx`):**
   - Estúdio interativo de partituras digitais MusicXML estilo Soundslice com filosofia minimalista (**"Menos é mais"**).
   - **Som Universal de Piano de Cauda Didático (`'acoustic-grand'`):** Amostras reais Salamander Grand Piano V3 (`A1`–`C7`) combinadas com modelagem física de 3 cordas uníssonas em estéreo, ataque percussivo claro de martelo (`18ms`) e sustentação fiel à duração escrita.
   - **Catálogo MSA & Hinário 5 CCB:** Lições de Leitura Rítmica (normalizadas no 1º espaço `F4`) e Solfejo nas 3 claves oficiais (`𝄞 Sol`, `𝄡 Dó`, `𝄢 Fá`) + Hinos do Hinário 5 CCB (`Cordas`, `Dó`, `Si♭`, `Mi♭`).
   - **Ferramentas Pedagógicas Visuais:** Solfejo acentuado em português (`Dó, Ré, Mi, Fá, Fá♯, Sol, Lá, Si`), **Braço do Violino (`ViolinFingerboard`)** e **Dedilhado e arcadas (`0, 1, 2, 3, 4` e `⊓`)** exclusivos no Hinário de Cordas (`edition === 'cordas'`).
   - **Estudo Focado:** Loop por arraste de alças na partitura (Lollipop Handles), Modo Foco de isolamento de compassos, Metrônomo subdividido, Count-in condicional e Treino de Velocidade progressivo.

4. **🎮 Mestre da Clave (`/#/mestre-da-clave` — `MestreDaClave.tsx`):**
   - Jogo interativo de leitura rápida de notas na pauta musical a 60fps em HTML5 Canvas (`gameEntities.ts`).
   - **Multi-Clave Oficial SMuFL (Bravura / W3C):** Suporte completo para **Clave de Sol na 2ª linha** (`𝄞`), **Clave de Fá na 4ª linha** (`𝄢`) e **Clave de Dó na 3ª linha** (`𝄡`).
   - Velocidade responsiva normalizada (~3.8s de reação), recordes independentes por clave em `localStorage`, atalhos de teclado físico e `OrientationGuard` em telas móveis.

5. **📝 Simulado MSA (`/#/simulado` — `SimuladoMsa.tsx`):**
   - **Dual-Mode:** Escolha entre **"Por Período (20 questões)"** ou **"Por Fase (10 questões)"** com multi-seleção das 16 fases.
   - **552+ Questões Blindadas via Zod (`schema.ts`):** Duplo sorteio uniforme Fisher-Yates (questões e alternativas A/B/C/D).
   - **Feedback & Reporte Híbrido:** Persistência no Supabase Cloud + Webhook Google Apps Script + fila offline-first PWA e exportação CSV.

6. **🛡️ Painel de Administrador & CMS Híbrido (`/#/admin` — `AdminDashboard.tsx`):**
   - Acesso via `/#/admin` ou atalho `Ctrl+Shift+A` (autenticação Google OAuth 2.0 PKCE + `admin_whitelist` no Supabase).
   - Barra flutuante `AdminFloatingBar` (`Visão Aluno` ⇄ `Modo Edição`) e gestão em nuvem de lições, questões, feedbacks, configurações do jogo e partituras MusicXML (`public.musicxml_scores`).

---

## 🔄 Fluxo de Desenvolvimento Híbrido (`Google AI Studio ⇄ GitHub ⇄ Antigravity`)

Este projeto é desenvolvido em sinergia entre o **Google AI Studio** e o **Google Antigravity (IDE Local)** sobre o repositório oficial `https://github.com/issacarbarbosa/issa-academy`.

```bash
# Conferir se o projeto local está sincronizado com a versão mais recente do GitHub (início de sessão)
bash .agents/skills/github-hybrid-sync/scripts/sync-check.sh

# Rodar portão de qualidade completo (Typecheck + 108 Testes Unitários + Build Produção)
node .agents/skills/deploy-helper/scripts/pre-deploy-check.js

# Atualizar mapa arquitetural da raiz
npm run map
```

---

## 🛠️ Stack Tecnológica

- **Frontend:** React 19 + TypeScript (Strict Mode) + Vite 8
- **Partituras Digitais:** `opensheetmusicdisplay` (OSMD SVG)
- **Estilização & Animações:** Tailwind CSS v4 + Motion (`framer-motion`)
- **Áudio:** Web Audio API nativa (Piano de Cauda Didático multi-samples Salamander C5 + modelagem física e sintetizador polifônico)
- **Banco de Dados & Auth:** Supabase Cloud (PostgreSQL + RLS + Google OAuth PKCE) + Offline-first `localStorage`
- **Validação & Testes:** Zod + Vitest (90 testes) + `node:test` (`musicMath.test.ts`, 18 testes)
- **CI/CD & Hospedagem:** GitHub Actions + GitHub Pages
