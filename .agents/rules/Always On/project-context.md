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
- **Infraestrutura & Hospedagem**:
  - **Hospedagem & CI/CD**: GitHub Pages com pipeline automatizado via GitHub Actions (`.github/workflows/deploy.yml`)
  - **Analytics**: Google Analytics 4 (`G-LF25LGNKEJ`) + Microsoft Clarity (`ujlb9c5vzi`)
- **Arquitetura**: Desmembramento modular em domínios isolados (`src/modules/home`, `mestre-da-clave`, `simulado`), roteamento declarativo (`react-router-dom` com `<HashRouter>` e `React.lazy` para Code Splitting), PWA offline-first com Workbox (`vite-plugin-pwa`), blindagem de schemas JSON via Zod (`schema.ts`), resolução dinâmica de assets via `getAssetUrl` (respeitando `BASE_URL` em subdiretórios), e testes unitários co-localizados via Vitest (`*.test.ts`).

---

## 📁 Leis de Arquitetura e Organização de Código
O projeto segue o padrão monorepo dividido em `core` e `modules`. O agente deve respeitar estritamente estas fronteiras ao criar ou editar arquivos:

### 1. Fronteira `src/core/`
- **Regra:** Aqui residem APENAS lógicas globais, conectores de serviço e infraestrutura fundamental. O agente NUNCA deve criar componentes de tela (views) neste diretório.
- **Conteúdo permitido:** Provedores e hooks utilitários (`hooks/`), lógicas de áudio e caminhos (`utils/`), e componentes globais de controle (como `OrientationGuard`).

### 2. Fronteira `src/modules/`
- **Regra:** Domínios de negócio isolados e interfaces do usuário vivem aqui:
  - `src/modules/home/`: Tela de entrada (`WelcomeHome.tsx`) com seleção de modo e apresentação do mascote Fufu.
  - `src/modules/mestre-da-clave/`: Jogo interativo de leitura musical em pauta Canvas a 60fps, com física e partículas desacopladas em `engine/gameEntities.ts`.
  - `src/modules/simulado/`: Simulado oficial do método MSA com bancos de dados JSON em `questions/`, validação Zod e reações dinâmicas.

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
