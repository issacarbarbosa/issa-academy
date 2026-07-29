# Roadmap de Desenvolvimento: Issa Academy

Este documento detalha o progresso atual da plataforma e serve como controle de pendências para o desenvolvedor humano e agentes de IA.

---

## 🛠️ Progresso Geral do Projeto

### 1. Infraestrutura, Configurações e Hooks
- [x] Alinhamento com o Template Padrão de Projetos (`.agents/`)
- [x] Limpeza de arquivos de legado e duplicações (removido `issa-academy-main/`)
- [x] Migração de assets de imagem para `public/assets/` (correção de build do Vite)
- [x] Conversão dos bancos de questões de JavaScript para JSON (`q_f01.json` a `q_f05.json`)
- [x] Configuração do ESLint no projeto
- [x] Implementação de Hooks e Linter Otimizado por arquivo (`run-linter.js` em `PostToolUse`)
- [x] Adaptação Mobile-First e sensor de orientação (`OrientationGuard.tsx`) nas telas musicais
- [x] **Prioridade Arquitetural #1 - Limpeza e TypeScript Strict Mode**: Remoção de pacotes fantasmas (`@google/genai`, `express`, `dotenv`), ativação das flags `"strict": true` e `"noImplicitAny": true` em `tsconfig.json` e unificação da tipagem de quiz (`LessonQuizQuestion`).
- [x] **Prioridade Arquitetural #2 - Zustand e Desmembramento de CourseHome**: Eliminação do prop drilling de 14 props no quiz via store global (`useQuizStore`), modularização de `CourseHome.tsx` e extração do manifesto de 16 fases.
- [x] **Prioridade Arquitetural #3 - Centralização de Áudio e SVG**: Refatoração do `MestreDaClave.tsx` para consumir unicamente `audio.ts` (filtro lowpass 1000Hz + ADSR) e extração do motor de pauta compartilhado `<StaffSvgEngine />`.
- [x] **Prioridade Arquitetural #4 - Roteamento Declarativo e PWA**: Substituição de roteamento ad-hoc por React Router (`HashRouter`), Code Splitting com `React.lazy` nas 5 views principais e ativação de PWA offline-first via Workbox (`vite-plugin-pwa`).
- [x] **Prioridade Arquitetural #5 - Blindagem de Dados e Testes**: Adoção de Valibot/Zod para checagem dos JSONs de simulados e criação da suíte inicial de testes unitários com Vitest.
- [] Estudar a viabilidade de criar um Módulo para Podcast
- [] Criar um Módulo para Jogos Educativos e colocar o Mestre da Clave lá dentro.

### 2. Módulo: Mestre da Clave (Jogo)
- [x] Mecânica central em React + Canvas (geração de notas, nível, vidas, recorde)
- [x] Leitura de notas na Clave de Sol (Fase 1 e Fase 2)
- [ ] Implementação de seleção de Claves (Clave de Fá e Clave de Dó)
- [ ] Rever a estrutura de dificuldade dos níveis
- [ ] Rever o som do 'acerto' e do 'passar de nível' para ficar mais musical e divertido.
- [ ] Rever o card que aparece quando passa de nível. Ele está atrapalhando a experiência no mobile. Precisa ser discreto e menor.

### 3. Módulo: Simulado MSA (Questões)
- [x] Mecânica central (20 questões aleatórias, cronômetro, revisão e feedbacks em áudio/sticker)
- [x] Banco de Questões do Período 1 (Fases 1, 2 e 3)
- [x] Banco de Questões do Período 2 (Fases 4 e 5)
- [ ] Bancos de Questões dos Períodos 3 e 4 (Fases 6 a 16)
- [ ] Reformular a home do Simulado para o aluno ter a opção de escolher fazer o Simulado por Período ou por Fase, se for por Período, mantém as 20 questões, se for por Fase vão ser apenas 10 questões.

### 4. Módulo: Curso MSA Digital (Trilha Didática)
- [x] Dashboard do Curso (grade interativa contendo as 16 Fases de ensino)
- [x] **Fase 1 - Música e Som**: Música, som, elementos da música, propriedades do som, notas musicais, pentagrama e claves.
- [x] **Fase 2 - Figuras e Ritmo**: Figuras musicais, compasso simples, pulsação, barras e exercícios rítmicos.
- [x] **Fase 3 - O Endecagrama**: Endecagrama, leitura rítmica/métrica/solfejo, movimentos de condução em 4 tempos e metrônomo.
- [ ] **Fase 4 - Ligadura, Ponto e Compassos de 2 e 3**: Ligadura, ponto de aumento, intervalos, compassos em 3 e 2 tempos, movimentos de solfejo e lições.
- [ ] **Fase 5 - Tercinas, Fermata e Compasso em 6**: Tercinas, fermata, compasso de 6 tempos, movimentos de solfejo e lições.
- [ ] **Fase 6 a 16**: (Tons e semitons, acidentes, escalas maiores com sustenidos e bemóis, armadura de clave, compassos em 9 e 12, tonalidades, barras de repetição, dinâmica, acento métrico, síncopa e contratempo, ritmos iniciais, notas pontuadas, andamentos e fraseologia/interpretação).
- [ ] **Correção do Player de Vídeo no Retrato (Mobile)**: Investigar por que os botões de pause, play e tela cheia do iframe do YouTube não respondem a cliques/toques no dispositivo real na orientação retrato, e implementar a correção.
- [x] **Atualizar Manifesto Curricular:** Atualizar conforme Sumário do MSA e grade das aulas já gravadas no YouTube.

---

## 📈 Histórico de Alterações Recentes
- **2026-06-30**: Auditoria estrutural. Limpeza do subprojeto `issa-academy-main`. Correção de rotas de assets de `/issa-academy-main/assets/` para `/assets/`. Instalação local de pacotes de desenvolvimento. Conversão do banco de simulados para JSON de carregamento assíncrono.
- **2026-06-30 (II)**: Modularização do `App.tsx` extraindo `WelcomeHome.tsx`, `LessonSlideshow.tsx` e `SandboxExplorer.tsx` (código reduzido para ~200 linhas). Configuração do ESLint e do hook `run-linter.js` (PostToolUse) baseado em comunicação JSON. Criação das regras Always On (`project-context.md`, `design-blueprint.md`, `atualizacao-roadmap.md`) e das skills especializadas (`music-theory-core`, `rhythm-audio-engine` com mapeamento vetorial SVG de solfejo). Remoção da pasta residual `assets/` da raiz.
- **2026-06-30 (III)**: Adaptação de layout responsivo Mobile-First na vertical e criação do hook `useMobileOrientation.ts` / componente `OrientationGuard.tsx` para forçar rotação horizontal em telas de pauta complexa (Mestre da Clave, Slideshow de aula e Sandbox).
- **2026-06-30 (IV)**: Otimização de layout mobile landscape no jogo Mestre da Clave: implementamos a combinação da **Opção 1** (ocultar teclado fora do gameplay) com a **Opção 3** (layout responsivo Split-Screen em duas colunas `flex-row` para telas horizontais). Os cards de menu agora ocupam apenas 160px de altura vertical, garantindo encaixe 100% livre de scroll.
- **2026-06-30 (V)**: Remoção total do módulo de visualização Explorar Sandbox (SandboxExplorer) e do InteractiveTheory do projeto. Componentes compartilhados como TheoryQuiz, EndecagramaStaff e PianoKeyboard foram mantidos intactos e continuam operando ativamente na LessonSlideshow.
- **2026-06-30 (VI)**: Implementação de correções de UX/UI baseadas em auditoria móvel. Ocultamos o cabeçalho global em mobile landscape (ganho de 70px de altura de tela útil), corrigimos o Fufu cortado no simulado vertical com recuo seguro, ampliamos a área de toque dos botões do curso para 44px (padrão WCAG) e adicionamos indicador de scroll "Role para ver mais" na Home horizontal.
- **2026-06-30 (VII)**: Implementação do Sistema Híbrido de Aulas do Curso MSA. Criamos a base de dados de aulas (`lessonsData.ts`) integrando videoaulas do YouTube do professor. Desenvolvemos a interface de 3 abas por lição (Assistir, Resumo, Praticar) na grade do curso, com quizzes interativos de fixação e o slideshow da Fase 3.1. O banner superior "Ativo Atualmente" agora busca dinamicamente o primeiro item pendente do aluno. Ocultamos também o cabeçalho global em modo paisagem baseado em altura de tela (`max-height: 500px`).
- **2026-07-03**: Realização de Auditoria Técnica de Arquitetura e Avaliação Estratégica de Stack (benchmark de mercado). Definição do roteiro de 5 Prioridades Arquiteturais. Conclusão da **Prioridade #1**: Desinstalação de dependências fantasmas (`@google/genai`, `express`, `dotenv`), ativação de TypeScript Strict Mode (`"strict": true`, `"noImplicitAny": true`) com 0 erros de compilação, resolução de conflito de tipagem em `lessonsData.ts` e otimização das regras de exclusão no `eslint.config.js`.
- **2026-07-03 (II)**: Conclusão da **Prioridade #2**: Implementação de Zustand (`useQuizStore`) eliminando prop drilling de 14 propriedades em `TheoryQuiz.tsx`, desmembramento arquitetural de `CourseHome.tsx` em 4 submódulos focados e criação do manifesto curricular centralizado `msaPhasesManifest.ts`.
- **2026-07-03 (III)**: Conclusão da **Prioridade #3**: Expansão de `src/core/utils/audio.ts` com geradores de ondas triângulo filtradas por lowpass (1000Hz) e envelope ADSR livre de cliques, refatoração de `MestreDaClave.tsx` removendo lógica Web Audio dispersa e criação do componente `<StaffSvgEngine />` em `src/core/components/` integrado ao quiz de arrasto.
- **2026-07-03 (IV)**: Conclusão da **Prioridade #4**: Migração para roteamento declarativo utilizando `react-router-dom` (`<HashRouter>`, `<Routes>`, `<Route>`) e Code Splitting via `React.lazy` com separação de chunks. Implementação de Progressive Web App (PWA) utilizando `vite-plugin-pwa` e Workbox, garantindo operação offline-first e cache inteligente para fontes e iframes. Refatoração dos componentes (`WelcomeHome`, `CourseHome`, `MestreDaClave`, `SimuladoMsa`, `LessonSlideshow`) para tornarem-se autônomos e consumirem `useNavigate` e `useLocation`. Compilação validada em TypeScript Strict e ESLint com zero erros.
- **2026-07-03 (V)**: Conclusão da **Prioridade #5**: Implementação de blindagem de dados com Zod (`src/modules/curso-msa/questions/schema.ts`) para validação estrita das questões do Simulado MSA e eliminação do tipo `any` em `SimuladoMsa.tsx`. Instalação e configuração do framework de testes Vitest (`vitest.config.ts`, `jsdom`, `@testing-library/react`). Criação de 3 suítes de testes unitários co-localizados com 12 testes aprovados (100% de sucesso): motor de frequências de notas (`notesData.test.ts`), store global do quiz em Zustand (`useQuizStore.test.ts`) e validação de schema JSON (`schema.test.ts`). Compilação TypeScript Strict, ESLint e build de produção validados sem erros.
- **2026-07-04 (II)**: Reformulação das lições do Curso MSA Digital para o formato linear unificado, removendo a estrutura de 3 abas, resumos de texto e quizzes locais para dar lugar a player direto e materiais de apoio hospedados no Google Drive com ícones dinâmicos de tipo. Remodelagem do slide de encerramento da aula para um visual escuro premium (Dark Mode) em duas colunas (Split-Screen) no desktop, contendo o mascote Fufu ampliado segurando troféu e CTAs de engajamento do YouTube convertidas de cards estáticos em links reais clicáveis (para se inscrever, curtir e comentar dúvidas no vídeo exato da lição). Implementação de testes de renderização de UI no JSDOM para o componente LessonItemRow (suíte de testes gerais subiu para 21 testes ativos aprovados com typecheck/linter 100% verdes).
- **2026-07-04 (III)**: Atualização completa do manifesto curricular (`msaPhasesManifest.ts`) e banco de lições (`lessonsData.ts`) em conformidade com o novo sumário unificado do MSA (Fases 1 a 16). Sincronização e injeção de links reais de vídeos do YouTube das Fases 1 e 2, organizando e dividindo exercícios de forma exata, além de remover links de prática e de vídeos não gravados na Fase 3 (itens 3.1, 3.2 e 3.3). Testes unitários, linter e build de produção homologados com 100% de sucesso.



