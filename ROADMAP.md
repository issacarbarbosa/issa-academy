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
- [x] Implementação de Hooks e Linter Otimizado por arquivo (`run-linter.cjs` em `PostToolUse`)
- [x] Adaptação Mobile-First e sensor de orientação (`OrientationGuard.tsx`) nas telas musicais
- [x] **Prioridade Arquitetural #1 - Limpeza e TypeScript Strict Mode**: Remoção de pacotes fantasmas (`@google/genai`, `express`, `dotenv`), ativação das flags `"strict": true` e `"noImplicitAny": true` em `tsconfig.json`.
- [x] **Prioridade Arquitetural #2 - Roteamento Declarativo e PWA**: Substituição de roteamento ad-hoc por React Router (`HashRouter`), Code Splitting com `React.lazy` e ativação de PWA offline-first via Workbox (`vite-plugin-pwa`).
- [x] **Prioridade Arquitetural #3 - Blindagem de Dados e Testes**: Adoção de Zod para checagem dos JSONs de simulados e criação de suíte de testes unitários com Vitest (100% de aprovação).
- [x] **Prioridade Arquitetural #4 - Desacoplamento e Foco no Core**: Remoção integral dos resíduos do Curso MSA Digital (`CourseHome`, `LessonSlideshow`, `PhaseCard`, `LessonItemRow`, `TheoryQuiz`, `EndecagramaStaff`, `PianoKeyboard`, `lessonsData`, `msaPhasesManifest`, `useQuizStore`), modularização em domínios limpos (`home`, `mestre-da-clave`, `simulado`) e correção de caminhos de assets sem acento.
- [ ] **Escalabilidade Cloud & CI/CD**: Conectar repositório ao Cloudflare Pages para deploy automático contínuo a cada commit na branch `main`.
- [ ] **Telemetria de Tráfego**: Ativar Cloudflare Web Analytics para medição leve e sem cookies de acessos e performance global.
- [ ] **Autenticação de Alunos**: Integrar Supabase Auth (`@supabase/supabase-js`) para contas de alunos (Email/Senha e OAuth Google).
- [ ] **Banco de Dados Relacional**: Criar esquemas no Supabase PostgreSQL (`profiles`, `user_progress`, `quiz_attempts`, `game_scores`) para sincronizar progresso local.
- [ ] **Product Analytics & Retenção**: Configurar PostHog (`posthog-js`) para métricas de engajamento e retenção dos estudantes.

### 2. Módulo: Mestre da Clave (Jogo)
- [x] Mecânica central em React + Canvas (geração de notas, nível, vidas, recorde persistido no `localStorage`)
- [x] Leitura de notas na Clave de Sol (Fase 1 e Fase 2)
- [x] Extração da engine de partículas, notas e entidades para `src/modules/mestre-da-clave/engine/gameEntities.ts` com testes unitários
- [x] Estabilização do game loop: `useEffect` desacoplado dos parâmetros de velocidade/nível, eliminando reinício de `requestAnimationFrame`
- [x] Barra de XP sincronizada com estado React e teclado gerado dinamicamente com paleta cromática
- [ ] Implementação de seleção de Claves (Clave de Fá e Clave de Dó)
- [ ] Rever a estrutura de dificuldade dos níveis
- [ ] Rever o som do 'acerto' e do 'passar de nível' para ficar mais musical e divertido.
- [ ] Rever o card que aparece quando passa de nível (mais discreto no mobile).

### 3. Módulo: Simulado MSA (Questões)
- [x] Mecânica central (20 questões aleatórias sorteadas via Fisher-Yates, cronômetro, revisão e feedbacks em áudio/sticker)
- [x] Correção de caminhos das imagens de resultado do Fufu sem acento (`trofeu`, `nao-desista`) eliminando erro 404
- [x] Eliminação de `dangerouslySetInnerHTML` na formatação de compassos (`formatText` agora gera JSX puro)
- [x] Resposta com feedback sonoro integrado (`playSuccessSound` e `playErrorSound`)
- [x] Modal e mensagens inline substituindo `alert()` e `confirm()` nativos
- [x] Banco de Questões do Período 1 (Fases 1, 2 e 3)
- [x] Banco de Questões do Período 2 (Fases 4 e 5)
- [ ] Bancos de Questões dos Períodos 3 e 4 (Fases 6 a 16)
- [ ] Reformular a home do Simulado para o aluno ter a opção de escolher fazer o Simulado por Período ou por Fase (20 vs 10 questões).

---

## 📈 Histórico de Alterações Recentes
- **2026-06-30**: Auditoria estrutural. Limpeza do subprojeto `issa-academy-main`. Correção de rotas de assets de `/issa-academy-main/assets/` para `/assets/`. Instalação local de pacotes de desenvolvimento. Conversão do banco de simulados para JSON de carregamento assíncrono.
- **2026-06-30 (II)**: Modularização do `App.tsx` extraindo `WelcomeHome.tsx`. Configuração do ESLint e do hook `run-linter.cjs` (PostToolUse). Criação das regras Always On e das skills especializadas.
- **2026-06-30 (III)**: Adaptação de layout responsivo Mobile-First na vertical e criação do hook `useMobileOrientation.ts` / componente `OrientationGuard.tsx` para forçar rotação horizontal em telas de pauta complexa.
- **2026-07-03**: Realização de Auditoria Técnica de Arquitetura. Desinstalação de dependências fantasmas, ativação de TypeScript Strict Mode com 0 erros de compilação.
- **2026-07-03 (II)**: Migração para roteamento declarativo utilizando `react-router-dom` (`<HashRouter>`, `<Routes>`, `<Route>`) e Code Splitting via `React.lazy`. Implementação de PWA offline-first via Workbox (`vite-plugin-pwa`).
- **2026-07-03 (III)**: Blindagem de dados com Zod (`schema.ts`) para validação estrita das questões do Simulado MSA e eliminação do tipo `any`. Criação de suíte de testes com Vitest.
- **2026-10-16**: Conclusão da Reestruturação Arquitetural Enxuta:
  1. Remoção total do módulo didático Curso MSA Digital e seus 12 arquivos acoplados (`CourseHome`, `LessonSlideshow`, `PhaseCard`, `LessonItemRow`, `TheoryQuiz`, `EndecagramaStaff`, `PianoKeyboard`, `lessonsData`, `msaPhasesManifest`, `useQuizStore`).
  2. Reorganização dos módulos em domínios isolados: `src/modules/home/`, `src/modules/mestre-da-clave/` e `src/modules/simulado/`.
  3. Mestre da Clave: extração da engine (`gameEntities.ts` com testes unitários), loop de Canvas a 60fps livre de recriação de efeito, barra de XP sincronizada e persistência com `useLocalStorage`.
  4. Simulado MSA: correção de 404 de assets com acento, substituição de `dangerouslySetInnerHTML` por JSX seguro, shuffle Fisher-Yates, reações acústicas de acerto/erro e remoção de `alert`/`confirm`.
  5. Infraestrutura: hook `run-linter.cjs` corrigido para ESM/CommonJS e configurado sem falhas de resolução; fontes otimizadas com preconnect e CDN FontAwesome removido em favor de ícones SVG offline nativos; suíte de testes com 18 testes aprovados e build homologado sem erros.
