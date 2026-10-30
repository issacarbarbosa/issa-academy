# Roadmap de Desenvolvimento: Issa Academy

Este documento detalha o estado atual da plataforma, o backlog ativo de próximas evoluções e as últimas entregas homologadas. Para o histórico completo de versões anteriores, consulte o [CHANGELOG.md](file:///d:/Projetos/issa-academy/CHANGELOG.md).

---

## 🧭 Estado Atual dos Módulos Principais

### 1. 🏠 Home (`WelcomeHome.tsx`)
- [x] Apresentação do mascote Fufu com animações e saudações contextuais.
- [x] Seleção de modos: Aulas do MSA (Teoria), Mestre da Clave (Jogo) e Simulado MSA (Quiz).
- [x] Link direto para o canal oficial [@issacarbarbosa](https://www.youtube.com/@issacarbarbosa).
- [x] Edição in-place de textos e fala do Fufu via modo Admin.

### 2. 📚 Aulas & Lições do MSA (`AulasMsa.tsx`)
- [x] Novo módulo de trilha teórica das 16 Fases e 4 Períodos do MSA.
- [x] Videoaulas do canal oficial @issacarbarbosa integradas com player responsivo.
- [x] Blocos modulares: Explicação Didática, Dicas do Fufu, Regras Oficiais do MSA e figuras.
- [x] Botão de conclusão com persistência e atalho direto "Treinar no Simulado".

### 3. 🎮 Mestre da Clave (`MestreDaClave.tsx`)
- [x] Renderização vetorial profissional SMuFL (Bravura / W3C) para Claves de Sol (2ª linha), Fá (4ª linha) e Dó (3ª linha).
- [x] Motor em HTML5 Canvas a 60fps com partículas desacopladas e HiDPI (`devicePixelRatio`).
- [x] Velocidade de pauta responsiva normalizada (~3.8s de reação em qualquer viewport).
- [x] Sistema de recordes independentes por clave persistidos em `localStorage`.
- [x] Atalhos de teclado físico no desktop (`1-7`, `C-B`, `Espaço`/`Esc`).
- [x] Guarda de orientação móvel (`OrientationGuard`) com saída de emergência.

### 4. 📝 Simulado MSA (`SimuladoMsa.tsx`)
- [x] Dual-Mode: "Por Período (20 questões)" vs. "Por Fase (10 questões)".
- [x] Catálogo completo de 16 fases do MSA com 552 questões blindadas via Zod.
- [x] Duplo sorteio estocástico uniforme Fisher-Yates (questões e alternativas A/B/C/D).
- [x] Síntese de áudio Web Audio API para acertos (arpejo) e erros (dissonância grave).
- [x] Central de feedbacks integrada ao Supabase com persistência local e exportação CSV.

### 5. 🛡️ Painel de Administrador & CMS Híbrido (`AdminDashboard.tsx`)
- [x] Acesso exclusivo do admin via `/admin` ou atalho `Ctrl+Shift+A` (site 100% sem login para alunos).
- [x] Barra flutuante `AdminFloatingBar`: alternância em 1 clique entre `Visão Aluno` e `Modo Edição`.
- [x] 6 Abas completas: Visão Geral, Gestor de Lições, Gestor de 552+ Questões, Central de Feedbacks, Configurações do Jogo e Textos/Banners Globais.
- [x] Sincronizador 1-clique para popular o banco Supabase na nuvem e exportador de backup JSON.
- [x] Script de migração PostgreSQL com RLS (`supabase/schema.sql`) e keepalive (`supabase-keepalive.yml`).
- [x] Infraestrutura Supabase Cloud (`pcwmafuykwqxoivedpbn`), migração SQL executada, seed completo de 553 questões e secrets integrados no GitHub Actions.
- [x] Otimização de fluxo e redirecionamento de autenticação OAuth Google e Magic Link no `AdminContext.tsx` apontando diretamente para `#/admin`.
- [x] Autenticação Social Google OAuth 2.0 configurada no Google Cloud Platform (`Issa Academy Web`) e ativada no Supabase Auth (`ENABLED`).
- [x] Blindagem Completa de Segurança e Hardening: PKCE ativo com limpeza de tokens na URL, verificação estrita de whitelist no frontend, bloqueio de preview local em produção, constraints anti-flood no RLS (`schema.sql`), sanitização contra CSV Injection / URL injection e 0 CVEs em pacotes de produção.

### 6. 🎼 Estúdio de Partituras & Hinário 5 CCB (`PartiturasStudio.tsx`)
- [x] Integração modular completa em `src/modules/partituras/` (`/#/partituras`) e 4º Card na Home (`WelcomeHome.tsx`).
- [x] Motor universal de **Piano de Cauda Didático (`'acoustic-grand'`)** com multi-samples Salamander Grand Piano V3 (`A1`–`C7`), modelagem física de 3 cordas uníssonas em estéreo, ataque percussivo claro de martelo (`18ms`) e sustentação fiel à duração escrita.
- [x] Catálogo completo com 22 lições do MSA em sequência contínua (Leitura Rítmica no 1º espaço `F4` e Solfejo nas 3 claves `𝄞 Sol`, `𝄡 Dó`, `𝄢 Fá`) + Hinos do Hinário 5 CCB (Cordas, Dó, Si♭ e Mi♭).
- [x] Ferramentas pedagógicas visuais do **Hinário de Cordas (`edition === 'cordas'`)**: Braço do Violino interativo (`ViolinFingerboard`) e Dedilhado colorido + arcadas (`⊓`).
- [x] Loop por arraste na partitura (Lollipop Handles), Modo Foco de compassos, Metrônomo + Count-in condicional, Treino de Velocidade progressivo e sincronização híbrida `Supabase (public.musicxml_scores) + localStorage`.

---

## 🎯 Backlog Ativo & Próximos Passos Sugeridos

- [ ] **Mestre da Clave**:
  - [ ] Adicionar suporte a armaduras de clave selecionáveis (treino de notas com acidentes fixos $\sharp$ e $\flat$).
  - [ ] Modo "Treino Livre" sem perda de vidas para iniciantes.
- [ ] **Simulado MSA**:
  - [ ] Modo "Exame Simulado Oficial CCB" com tempo limite global de 40 minutos e nota mínima de 70% para aprovação.
  - [ ] Filtro de questões por tags (ex: #Hinos, #Solfejo, #CompassosCompostos).
- [ ] **Assinatura SaaS & Contas de Alunos**:
  - [ ] Login Google OAuth para alunos (`student_profiles`) com progresso sincronizado na nuvem e controle de assinatura.

---

## 📈 Histórico Recente de Entregas (Últimas 3 Versões)

- **2026-10-29 (v1.4.1)**: Blindagem do Portão de Qualidade Pré-Deploy (`package.json`, `tsconfig.json`, `deploy.yml`) e alinhamento de tipagem estrita em `src/modules/partituras/` (`NotePayload`, `VoicePartInfo`, `ScoreRenderOptions` e preview sonoro no `ViolinFingerboard`), garantindo 100% de aprovação no `typecheck`, `lint`, `vitest` e `build` para publicação no GitHub.
- **2026-10-29 (v1.4.0)**: Fusão arquitetural do módulo **Estúdio de Partituras & Hinário 5 (`src/modules/partituras/`)** ao ecossistema **Issa Academy**, com 4º Card na Home (`WelcomeHome.tsx`), Piano de Cauda Didático Universal, Braço do Violino e Dedilhado no Hinário de Cordas, tabela `public.musicxml_scores` no `supabase/schema.sql`, unificação das 9 skills Antigravity em `.agents/skills/` e fluxo Git bidirecional (`AI Studio ⇄ GitHub ⇄ Antigravity`).
- **2026-10-29 (v1.3.0)**: Painel de Administrador Híbrido (`AdminDashboard.tsx`), Barra Flutuante de Alternância (`AdminFloatingBar`), Novo Módulo de Aulas do MSA (`AulasMsa.tsx`), Camada de Dados Unificada Supabase/Offline (`contentStore.ts`), Central de Feedbacks com exportação CSV e 90 testes unitários aprovados.
