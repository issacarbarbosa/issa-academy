# Regra de Contexto do Projeto: Issa Academy (GEM CCB)

Esta regra é "Always On" e define o escopo, as restrições arquiteturais, a stack de software, o motor de áudio e a política de testes do projeto.

---

## 🎯 Objetivo do Projeto
O **Issa Academy** é uma plataforma educacional gamificada de ensino musical voltada para o método **MSA (Método Simplificado de Aprendizagem Musical)** da Congregação Cristã no Brasil (CCB), com foco na preparação de candidatos a músicos e organistas.

---

## 🛠️ Stack Tecnológica
- **Framework**: React 19 (SPA puramente frontend) + Vite 6
- **Estilos**: Tailwind CSS v4 (Light theme, cores "juicy" vibrantes)
- **Animações**: Motion / Framer Motion
- **Sons**: Web Audio API (Síntese acústica dinâmica em tempo de execução)
- **Tipagem**: TypeScript (Strict Mode e checagem sem `implicitAny`) + Zod para validação em tempo de execução
- **Infraestrutura Cloud & Serviços (Escala)**:
  - **Hospedagem & CI/CD**: Cloudflare Pages (Deploy automático via `git push` no GitHub)
  - **Web Analytics**: Cloudflare Web Analytics (Telemetria leve e privativa)
  - **Autenticação & Banco de Dados**: Supabase Auth + Supabase PostgreSQL (`@supabase/supabase-js`)
  - **Product Analytics**: PostHog (`posthog-js` para engajamento e métricas de retenção dos estudantes)
- **Arquitetura**: Estado global de quiz via Zustand (`useQuizStore`), desmembramento modular de telas curriculares (`PhaseCard`, `LessonItemRow` com layout unificado linear de lição sem abas integrado com materiais de apoio do Google Drive, manifesto de 16 fases em `msaPhasesManifest.ts`), roteamento declarativo (`react-router-dom` com `<HashRouter>` e `React.lazy` para Code Splitting), PWA offline-first com Workbox (`vite-plugin-pwa`), blindagem de schemas JSON via Zod (`schema.ts`), conectores SDK encapsulados em `src/core/services/` com suporte obrigatório a modo visitante (*graceful degradation* via `localStorage`), e testes unitários co-localizados via Vitest e Testing Library (`*.test.ts`, `*.test.tsx`).

---

## 📁 Leis de Arquitetura e Organização de Código
O projeto segue o padrão monorepo dividido em `core` e `modules`. O agente deve respeitar estritamente estas fronteiras ao criar ou editar arquivos:

### 1. Fronteira `src/core/`
- **Regra:** Aqui residem APENAS lógicas globais, conectores de serviço e infraestrutura fundamental. O agente NUNCA deve criar componentes de interface (UI) neste diretório.
- **Conteúdo permitido:** Provedores de estado global (`stores/` e `contexts/`), hooks utilitários (`hooks/`), conectores de serviços cloud e analytics (`services/`), lógicas de áudio/frequência (`utils/`), motores visuais reutilizáveis (`engine/` / `components/`), tipagens globais e componentes de controle (como guards de orientação).
- **Graceful Degradation em Services:** Todos os conectores em `src/core/services/` (ex: Supabase e PostHog) devem possuir tratamentos de fallback gracioso para operar com `localStorage` caso as chaves de API não estejam presentes ou a aplicação esteja offline.

### 2. Fronteira `src/modules/`
- **Regra:** Domínios de negócio isolados e interfaces do usuário vivem aqui.
- **Diretiva para o Curso MSA:** Todo o ecossistema didático do método MSA fica isolado em `src/modules/curso-msa/`.
- **Diretiva de Banco de Dados Local:** O agente deve ler e criar bancos de dados do simulado exclusivamente como arquivos JSON dentro do subdiretório `src/modules/curso-msa/questions/`, devidamente tipados e validados por schema via Zod.

### 3. Motor Visual Compartilhado (`<StaffSvgEngine />`)
- **Regra:** A representação visual de pautas musicais (5 linhas, endecagrama, claves e linhas suplementares) é centralizada no componente `<StaffSvgEngine />` exportado por `src/core/components/`.
- **Uso:** Quizzes, aulas e minijogos devem consumir o `<StaffSvgEngine />` ao invés de desenhar elementos `<svg>`, `<line>` ou claves manualmente na UI.

### 4. Roteamento Declarativo e PWA Offline-First
- **Regra de Roteamento:** O roteamento da SPA deve ser gerido de forma declarativa por `react-router-dom` com `<HashRouter>` (devido ao suporte à hospedagem estática no GitHub Pages).
- **Code Splitting:** Todas as telas de topo (ex.: `WelcomeHome`, `CourseHome`, `MestreDaClave`, `SimuladoMsa`, `LessonSlideshow`) devem ser importadas assincronamente via `React.lazy` e encapsuladas com `<Suspense>` em `App.tsx` para garantir carregamento leve (chunks dedicados).
- **Componentes Autônomos:** Os módulos e views devem consumir hooks do roteador (`useNavigate`, `useLocation`) com propriedades opcionais de callback, sendo 100% autônomos para renderização em rotas sem dependência de callbacks manuais do componente pai.
- **PWA e Cache:** O manifesto da aplicação (`manifest.webmanifest`) e as estratégias de cache Workbox (precaching de assets estáticos e `NetworkOnly` para iframes do YouTube) são configurados em `vite.config.ts`.

### 5. Blindagem de Dados (Zod) e Testes Co-localizados (Vitest)
- **Validação Estrita de Schemas:** Todo carregamento dinâmico ou externo de dados (ex.: arquivos JSON em `questions/`) DEVE ser validado com schemas Zod antes de ser consumido pelo estado da aplicação. É proibido o uso de `any` para tipar dados externos.
- **Testes Unitários Co-localizados:** Todos os testes unitários (`*.test.ts` ou `*.test.tsx`) devem residir na mesma pasta que o código fonte que estão testando, rodando sob o framework Vitest no ambiente JSDOM.

---

## 🔊 Restrições do Motor de Áudio (Web Audio API)
Os sons de notas e instrumentos virtuais são sintetizados em tempo real, baseados nas lógicas presentes em `@src/core/utils/audio.ts` e `@src/core/utils/notesData.ts`.
**Sempre que o agente criar ou modificar a síntese de áudio, deve respeitar:**
1.  **Timbre:** Utilizar obrigatoriamente osciladores com onda **triangle** combinada com filtros passa-baixa (lowpass filter em `1000Hz`) para criar um som de órgão eletrônico quente e suave. **Evite ondas senoidais agressivas ou dentes de serra puros sem filtro.**
2.  **Envelope:** Implementar sempre um envelope **ADSR** (Attack, Decay, Sustain, Release) para evitar estalos (clicks) de som ao ligar/desligar notas, garantindo fade-in e fade-out suaves.
3.  **Consumir Motor Único:** Telas interativas e minijogos (ex.: Mestre da Clave) DEVEM importar funções de áudio de `audio.ts`, sendo proibido recriar contextos de Web Audio ou osciladores ad-hoc dentro dos componentes React.


---

## 📱 Política de Testes e Validação Mobile-First
Para garantir a melhor experiência responsiva, toda validação visual do agente no navegador deve respeitar a ordem Mobile-First:
1. **Mobile Portrait (390x844px)**: Testar o encaixe vertical da Home, Simulado e a ativação bloqueante do guarda de orientação em views horizontais.
2. **Mobile Landscape (844x390px)**: Testar as telas musicais e jogos na orientação horizontal (após simulação de rotação do aparelho).
3. **Desktop (1280x800px)**: Testar a adaptação final para monitores grandes.
