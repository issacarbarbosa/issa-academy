---
trigger: always_on
---

# Regra de Contexto do Projeto: Issa Academy (GEM CCB)

Esta regra define o escopo, as restrições arquiteturais, a stack de software, o motor de áudio e a política de testes do projeto.

---

## 🎯 Objetivo do Projeto & Sinergia de Ambientes (`AI Studio ⇄ GitHub ⇄ Antigravity`)
O **Issa Academy** é uma plataforma educacional gamificada e interativa de ensino musical voltada para o método **MSA (Método Simplificado de Aprendizagem Musical)** e para o **Hinário 5 da Congregação Cristã no Brasil (CCB)**, com foco na formação de candidatos a músicos e organistas.

- **Desenvolvimento Híbrido em Dois Ambientes:** O projeto é construído de forma contínua alternando entre o **Google AI Studio** (prototipagem em nuvem, testes multimodais e ajustes rápidos de interface/áudio) e o **Google Antigravity** (engenharia local profunda, hooks automatizados e CLI local).
- **Conferência Obrigatória no GitHub a Cada Novo Chat:** Ao iniciar qualquer nova conversa em qualquer um dos dois ambientes, o agente deve obrigatoriamente verificar se o código local está sincronizado com a versão mais recente da branch `main` no GitHub (`https://github.com/issacarbarbosa/issa-academy.git`) rodando `bash .agents/skills/github-hybrid-sync/scripts/sync-check.sh`.

---

## 🛠️ Stack Tecnológica
- **Framework**: React 19 (SPA puramente frontend) + Vite 8 + `opensheetmusicdisplay` (OSMD)
- **Estilos**: Tailwind CSS v4 (Tema claro Juicy/Gamificado nos módulos gerais + Minimalismo Soundslice `"Menos é mais"` no Estúdio de Partituras)
- **Animações**: Motion / Framer Motion + Mutação direta `requestAnimationFrame` a 60fps no cursor de partitura e no Canvas 2D
- **Sons**: Web Audio API nativa (`src/core/utils/audio.ts` para Simulado/Jogo e `src/modules/partituras/services/AudioScheduler.ts` com **Piano de Cauda Didático Universal** multi-samples Salamander C5 + modelagem física estéreo)
- **Tipagem & Banco Cloud**: TypeScript (Strict Mode e `"noImplicitAny": true`) + Zod + Supabase Cloud (`pcwmafuykwqxoivedpbn`) com fallback offline em `localStorage`
- **Infraestrutura & Hospedagem**:
  - **Hospedagem & CI/CD**: GitHub Pages (`https://issacarbarbosa.github.io/issa-academy/`) com pipeline automatizado via GitHub Actions (`.github/workflows/deploy.yml`)
  - **Analytics**: Google Analytics 4 (`G-LF25LGNKEJ`) + Microsoft Clarity (`ujlb9c5vzi`)
- **Arquitetura**: Desmembramento modular em 6 domínios isolados (`src/modules/home`, `aulas`, `partituras`, `mestre-da-clave`, `simulado`, `admin`), roteamento declarativo (`react-router-dom` com `<HashRouter>` e `React.lazy` para Code Splitting), PWA offline-first com Workbox (`vite-plugin-pwa`), blindagem de schemas JSON via Zod (`schema.ts`), resolução dinâmica de assets via `getAssetUrl` e 108 testes unitários co-localizados (`Vitest` + `node:test`).

---

## 📁 Leis de Arquitetura e Organização de Código
O projeto segue o padrão monorepo dividido em `core` e `modules`. O agente deve respeitar estritamente estas fronteiras ao criar ou editar arquivos:

### 1. Fronteira `src/core/`
- **Regra:** Aqui residem APENAS lógicas globais, conectores de serviço e infraestrutura fundamental. O agente NUNCA deve criar telas completas de domínio neste diretório.
- **Conteúdo permitido:** Provedores e hooks utilitários (`hooks/`), lógicas de áudio e caminhos (`utils/`), e componentes globais de controle (como `OrientationGuard`).

### 2. Fronteira `src/modules/`
- **Regra:** Domínios de negócio isolados e interfaces do usuário vivem aqui:
  - `src/modules/home/`: Tela de entrada (`WelcomeHome.tsx`) com seleção dos 4 módulos principais e apresentação do mascote Fufu.
  - `src/modules/aulas/`: Trilha teórica das 16 Fases e 4 Períodos do MSA (`AulasMsa.tsx`) com videoaulas integradas.
  - `src/modules/partituras/`: Estúdio interativo de partituras MusicXML estilo Soundslice (`PartiturasStudio.tsx`) para lições de Leitura Rítmica e Solfejo do MSA (3 claves) e Hinário 5 CCB, com som exclusivo de **Piano de Cauda Didático (`'acoustic-grand'`)**, filosofia minimalista estrita (**"Menos é mais"**) e ferramentas visuais de cordas (`ViolinFingerboard` e `Dedilhado e arcadas`) exclusivas no Hinário de Cordas (`edition === 'cordas'`).
  - `src/modules/mestre-da-clave/`: Jogo interativo de leitura musical em pauta Canvas a 60fps, com física e partículas desacopladas em `engine/gameEntities.ts`.
  - `src/modules/simulado/`: Simulado oficial do método MSA com bancos de dados JSON em `questions/`, validação Zod e reações sonoras.
  - `src/modules/admin/`: Painel Administrativo Híbrido (`AdminDashboard.tsx`) autenticado via Google OAuth + Supabase (`admin_whitelist`).

### 3. Roteamento Declarativo e PWA Offline-First
- **Regra de Roteamento:** O roteamento da SPA deve ser gerido de forma declarativa por `react-router-dom` com `<HashRouter>` (devido ao suporte à hospedagem estática no GitHub Pages).
- **Code Splitting:** Todas as telas de topo (`WelcomeHome`, `AulasMsa`, `PartiturasStudio`, `MestreDaClave`, `SimuladoMsa`, `AdminDashboard`) devem ser importadas assincronamente via `React.lazy` e encapsuladas com `<Suspense>` em `App.tsx` para garantir carregamento leve (chunks dedicados).
- **Componentes Autônomos:** Os módulos e views devem consumir hooks do roteador (`useNavigate`, `useLocation`) com propriedades opcionais de callback.
- **PWA e Cache:** O manifesto da aplicação (`manifest.webmanifest`) e as estratégias de cache Workbox são configurados em `vite.config.ts`.

### 4. Blindagem de Dados (Zod) e Testes Co-localizados
- **Validação Estrita de Schemas:** Todo carregamento dinâmico ou externo de dados (ex.: arquivos JSON em `questions/`) DEVE ser validado com schemas Zod antes de ser consumido pelo estado da aplicação. É proibido o uso de `any` para tipar dados externos.
- **Testes Unitários Co-localizados:** Todos os testes unitários (`*.test.ts` ou `*.test.tsx`) devem residir na mesma pasta que o código fonte que estão testando (`src/modules/partituras/utils/musicMath.test.ts` e suíte Vitest).

---

## 🔊 Restrições do Motor de Áudio (Web Audio API)
Os sons de notas e instrumentos virtuais são sintetizados em tempo real, baseados nas lógicas presentes em `@src/core/utils/audio.ts`, `@src/core/utils/notesData.ts` e `@src/modules/partituras/services/AudioScheduler.ts`.
- Para especificações completas de síntese acústica do jogo e simulado, consulte `.agents/skills/rhythm-audio-engine/SKILL.md`.
- Para o **Estúdio de Partituras (`src/modules/partituras/`)**, consulte `.agents/skills/webaudio-precision-scheduler/SKILL.md`, `.agents/skills/osmd-score-synchronization/SKILL.md` e `.agents/skills/soundslice-minimalist-ux/SKILL.md`. O **Piano de Cauda Didático (`'acoustic-grand'`)** é o timbre exclusivo e universal de todas as lições do MSA e Hinos, tocando estritamente as notas escritas no MusicXML.
- **Harmonia Pedagógica**: O motor de áudio deve sempre preservar a pureza diatônica do exercício em curso, sendo proibido disparar acordes cromáticos fixos ou notas não escritas na partitura.

---

## 📱 Política de Testes e Validação Mobile-First
Para garantir a melhor experiência responsiva, toda validação visual do agente no navegador deve respeitar a ordem Mobile-First:
1. **Mobile Portrait (390x844px)**: Testar o encaixe vertical da Home, Simulado e a ativação bloqueante do guarda de orientação em views horizontais.
2. **Mobile Landscape (844x390px)**: Testar as telas musicais e jogos na orientação horizontal (após simulação de rotação do aparelho).
3. **Desktop (1280x800px)**: Testar a adaptação final para monitores grandes.
