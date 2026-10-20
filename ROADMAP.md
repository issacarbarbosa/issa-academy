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
- [x] **CI/CD e GitHub Pages**: Pipeline de deploy automatizado via GitHub Actions (`.github/workflows/deploy.yml`) publicando bundles de produção e PWA na branch `main` do repositório oficial `issacarbarbosa/issa-academy`.
- [x] **Resolução Dinâmica de Assets**: Criação do utilitário `getAssetUrl` para compatibilidade com subdiretórios (`BASE_URL`), eliminando erros 404 em produção na web pública.
- [x] **Higienização e Modernização da Governança de IA (.agents/)**: Achatamento de regras em `.agents/rules/*.md` com frontmatter nativo, correção do contrato `stdin` do hook `run-linter.cjs` (`PostToolUse`), remoção de MCP fantasma, calibragem das skills (`deploy-helper`, `map-builder`, `music-theory-core`, `rhythm-audio-engine`) e adição do comando `npm run map`.

### 2. Módulo: Mestre da Clave (Jogo)
- [x] Mecânica central em React + Canvas (geração de notas, nível, vidas, recorde persistido no `localStorage`)
- [x] Leitura de notas na Clave de Sol (Fase 1 e Fase 2)
- [x] Extração da engine de partículas, notas e entidades para `src/modules/mestre-da-clave/engine/gameEntities.ts` com testes unitários
- [x] Estabilização do game loop: `useEffect` desacoplado dos parâmetros de velocidade/nível, eliminando reinício de `requestAnimationFrame`
- [x] Barra de XP sincronizada com estado React, cor temática Sky Blue (`h-3`) e badge de contagem de XP (`0/10`) no HUD
- [x] Destaque visual das teclas ativas do nível atual com atenuação pedagógica das inativas (`opacity-60`) e correção de contraste (rótulo da nota Mi em tom âmbar escuro `#b45309`)
- [x] Notificação de Level Up compacta (`top-3`) e lúdica com miniatura do Fufu dando joinha
- [ ] Implementação de seleção de Claves (Clave de Fá e Clave de Dó)
- [x] Correção do bug de progressão de níveis (off-by-one) e anúncios didáticos de notas com `getNewlyUnlockedNote` e normalização responsiva de velocidade da pauta
- [x] Reformulação do motor de áudio (síntese diatônica harmônica com oitava sutil, filtro passa-baixa adaptativo por key-tracking e fanfarra de 4 notas desacoplada)
- [x] Refinamento visual e de usabilidade: renderização HiDPI via `devicePixelRatio`, z-index das linhas suplementares corrigido, atalhos de teclado físico no Desktop (`1-7`, `C-B`, `Espaço`/`Esc`) e botões inativos com contraste sólido

### 3. Módulo: Simulado MSA (Questões)
- [x] Mecânica central (20 questões aleatórias sorteadas via Fisher-Yates, cronômetro, revisão e feedbacks em áudio/sticker)
- [x] Correção de caminhos das imagens de resultado do Fufu sem acento (`trofeu`, `nao-desista`) eliminando erro 404
- [x] Eliminação de `dangerouslySetInnerHTML` na formatação de compassos (`formatText` agora gera JSX puro)
- [x] Resposta com feedback sonoro integrado (`playSuccessSound` e `playErrorSound`)
- [x] Modal e mensagens inline substituindo `alert()` e `confirm()` nativos
- [x] Otimização ergonômica de toque (touch targets `>= 44px` no botão de fechar X, voltar e seleção de períodos)
- [x] Cronômetro em tempo real no header do quiz com ícone de relógio e formatação `mm:ss`
- [x] Painel de feedback visual desacoplado com mascote Fufu em 100% de opacidade e layout flex
- [x] Rodapé de ação sticky com botões `rounded-2xl` de alta acessibilidade ("Verificar" e "Continuar")
- [x] Lista de revisão de erros no fluxo natural da página (remoção de container claustrofóbico `max-h-40` com scroll duplo)
- [x] Banco de Questões do Período 1 (Fases 1, 2 e 3)
- [x] Banco de Questões do Período 2 (Fases 4 e 5)
- [x] Bancos de Questões dos Períodos 3 e 4 (Fases 6 a 16)
- [ ] Reformular a home do Simulado para o aluno ter a opção de escolher fazer o Simulado por Período ou por Fase (20 vs 10 questões).
- [/] Revisar as questões para garantir que as referências ao MSA, materiais complementares e hinos estejam corretas. (Auditadas 100% das menções a hinos e corrigidas as inconsistências nas Fases 4, 13 e 14)
- [ ] Criar uma forma para que o aluno possa dar feedback sobre cada questão, podendo assim reportar erros.

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
  6. Resolução de Assets em Subdiretório: implementação do helper `getAssetUrl` (`src/core/utils/paths.ts`) e injeção dinâmica de `BASE_URL`, eliminando 404 de imagens no GitHub Pages (`/issa-academy/`).
  7. Deploy Automático e Repositório Oficial: pipeline GitHub Actions (`deploy.yml`) configurado na branch `main` do repositório oficial definitivo `https://github.com/issacarbarbosa/issa-academy.git`, homologado no ar em `https://issacarbarbosa.github.io/issa-academy/` com 21 testes unitários aprovados e 0 erros no console.
- **2026-10-16 (II)**: Higienização Completa de Governança e Regras de Agentes (.agents/):
  1. Correção técnica do hook `run-linter.cjs` em `PostToolUse` (detecção de arquivos alterados via `git status` e conformidade com `stdin`/`stdout`) e limpeza de hooks mortos em `hooks.json`.
  2. Achatamento das regras diretamente em `.agents/rules/*.md` com frontmatter YAML nativo (`always_on`, `glob`, `model_decision`), eliminando subpastas com espaços que prejudicavam a descoberta automática.
  3. Remoção de todos os resíduos arquiteturais obsoletos (Curso MSA, `CourseHome`, `LessonSlideshow`, Zustand `useQuizStore`) de todas as regras e scripts.
  4. Remoção do arquivo fantasma `.agents/mcp_config.json`.
  5. Calibragem das skills (`deploy-helper`, `map-builder`, `music-theory-core`, `rhythm-audio-engine`) com descrições em 3ª pessoa (`Use esta skill quando...`), contrato real `SimuladoQuestionSchema` (`schema.ts`), assinaturas reais de `audio.ts` e scripts cross-platform.
  6. Otimização de latência em `run-linter.cjs` (filtro `mtimeMs <= 15000` e tratamento de renomeações Git), adição do Quality Gate (`typecheck`, `lint`, `test`) no CI/CD (`deploy.yml`), script `clean` via Node `fs.rmSync` e comando `npm run map` no `package.json`.
- **2026-10-16 (III)**: Auditoria Profunda de UX/UI, Gamificação e Acessibilidade (Mobile Portrait, Mobile Landscape e Desktop):
  1. **Acessibilidade e Touch Targets**: Elevação de todas as áreas de toque interativas para o padrão mínimo de `44px` (botão de fechar `X` do quiz, links sociais, botões de voltar no header e no guarda de orientação, seleção de períodos).
  2. **OrientationGuard com Saída de Emergência**: Adição do botão "Voltar ao Início" (`rounded-2xl` e `min-h-[44px]`) permitindo ao usuário cancelar o jogo sem ficar preso na tela de aviso vertical.
  3. **Mestre da Clave**: Destaque visual das notas ativas do nível (`opacity-100`, bordas e sombras) com atenuação sutil das inativas (`opacity-60`), correção do contraste da nota Mi com rótulo `#b45309`, barra de XP temática em Sky Blue (`h-3`), contador `XP {hitsInLevel}/10` no header e notificação de Level Up compacta com Fufu joinha.
  4. **Simulado MSA**: Cronômetro ao vivo no header com ícone de relógio `mm:ss`, redução de padding excessivo no menu para eliminar rolagem desnecessária no mobile, painel de feedback desacoplado com Fufu em 100% de opacidade, rodapé de ação sticky com botões `rounded-2xl` e expansão da revisão de erros no fluxo natural da página (removendo a caixa claustrofóbica com rolagem dupla).
  5. **Responsividade Desktop e Mobile-Landscape**: Grid de 2 colunas na Home (`md:grid-cols-2`) e nas alternativas do Simulado, ocultação limpa de rodapé/header em landscape estreito via `.mobile-landscape-hidden` e correção dos fallbacks de borda do Tailwind v4 (`*-200`).
  6. **Validação Visual no Navegador**: Testes automatizados executados nos 3 viewports (`390x844`, `844x390`, `1280x800`) com 100% de aprovação e conformidade com o Blueprint Issa Academy.
- **2026-10-17**: Auditoria de Lógica, Psicoacústica e UX/UI no Mestre da Clave:
  1. **Correção de Lógica de Level Up (Off-by-One)**: Criação do helper `getNewlyUnlockedNote` e rótulos didáticos detalhados (`label` com posição, linha e espaço no pentagrama). O Nível 2 agora anuncia com precisão `Nova Nota: Mi (1ª Linha) 🎶` e o Nível 3 `Nova Nota: Fá (1º Espaço) 🎶`, eliminando a defasagem histórica.
  2. **Psicoacústica e Motor de Áudio**: Reformulação de `playRewardChord` (substituição de tríades cromáticas estranhas ao tom por fundamental pura com oitava sutil de brilho harmônico), filtro passa-baixa adaptativo por key-tracking (`Math.min(4500, Math.max(1200, freq * 3.5))`) garantindo corpo acústico equilibrado para notas agudas, e desacoplamento de 220ms entre o 10º acerto e a nova fanfarra de 4 notas.
  3. **Correção Gráfica e HiDPI**: Suporte integral a `devicePixelRatio` para nitidez absoluta em telas Retina/mobile e reordenação das linhas suplementares no Canvas (desenhadas sob a cabeça da nota, sem rasgar o brilho specular 3D).
  4. **Equalização de Dificuldade e Usabilidade**: Velocidade das notas normalizada proporcionalmente à largura da tela (tempo de travessia idêntico de 3.8s em mobile e desktop), feedback pedagógico em cliques errados (`"Era Mi!"`) e antecipados (`"Espere na área verde!"`).
  5. **Acessibilidade Desktop**: Suporte completo a atalhos de teclado físico (`1 a 7`, `C a B`, `Espaço`/`Esc` para pausa) com badges visuais nos botões musicais e contraste sólido nas teclas atenuadas.
  6. **Validação Automatizada com Navegador**: Playtest real no navegador via subagente em Mobile Landscape e Desktop com 100% de taxa de acerto e 22 testes unitários aprovados no Vitest.
- **2026-10-17 (II)**: Persistência de Diretrizes Permanentes (/learn):
  1. Criação da skill `canvas-playtest` (`.agents/skills/canvas-playtest/SKILL.md`) com padrão de automação determinística via interceptação de protótipos de Canvas 2D e roteiro de auto-play.
  2. Calibração da skill `rhythm-audio-engine` com fórmula de filtro passa-baixa adaptativo por key-tracking e acordes de reforço estritamente diatônicos.
  3. Atualização das regras em `design-blueprint.md` (HiDPI, velocidade normalizada e z-order em Canvas) e `project-context.md` (harmonia pedagógica diatônica).
- **2026-10-17 (III)**: Homologação e Deploy em Produção (GitHub Pages):
  1. Encapsulamento de `handlePauseToggle` com `useCallback` em `MestreDaClave.tsx`, atingindo 0 erros e 0 warnings no ESLint.
  2. Execução e aprovação completa do Quality Gate: `npm run typecheck` (0 erros), `npm run lint` (0 erros/avisos), `npm test` (22/22 testes unitários aprovados) e `npm run build` (geração de bundles e service worker PWA).
  3. Sincronização do mapa arquitetural `MAPA_RAIZ.md` via `npm run map`.
  4. Publicação da versão homologada na branch `main` com disparo do pipeline CI/CD no GitHub Actions para `https://issacarbarbosa.github.io/issa-academy/`.
- **2026-10-17 (IV)**: Base de Conhecimento MSA em Divulgação Progressiva (Workspace + Global Config) e Conclusão dos Bancos de Questões (Fases 6 a 16):
  1. **Absorção Integral da Documentação Oficial CCB & Canal YouTube**: Extração e consolidação do PDF Oficial do MSA, Caderno de Exercícios v2.4, Planos de Aulas, Slides de Aulas (Períodos 1 a 4), Avaliações Finais Oficiais (Modelos 1 a 6) e catálogo de videoaulas do canal `@issacarbarbosa`.
  2. **Arquitetura de Divulgação Progressiva (Progressive Disclosure)**: Estruturação da skill `music-theory-core` (`SKILL.md` + 5 arquivos modulares em `references/00-curriculo-gem-e-youtube.md` a `04-periodo-4-fases-10-a-16.md`) tanto no workspace (`.agents/skills/music-theory-core/`) quanto no Global Config da máquina (`~/.gemini/config/skills/music-theory-core/`), disponibilizando todo o conhecimento para qualquer projeto futuro.
  3. **Criação dos 11 Bancos de Questões Restantes (`q_f06.json` a `q_f16.json`)**: Elaboração dos bancos de questões do 3º Período (Fases 6 a 9) e 4º Período (Fases 10 a 16) com validação estrita pelo schema Zod (`SimuladoQuestionSchema`), referências exatas de página/item do MSA e feedbacks pedagógicos detalhados.
  4. **Desbloqueio dos Períodos 3 e 4 no Simulado MSA**: Atualização de `SimuladoMsa.tsx` com carregamento assíncrono em paralelo (`loadQuestionBankForPeriods`) e habilitação completa dos 4 períodos na interface.
- **2026-10-18**: Embaralhamento Dinâmico de Alternativas e Auditoria Pedagógica Fina (Fases 6 a 16):
  1. **Embaralhamento em Tempo de Execução (`prepareQuizQuestions`)**: Implementação do embaralhamento Fisher-Yates também sobre o array `opcoes` de cada questão sorteada em `SimuladoMsa.tsx` (com cobertura de teste unitário em `SimuladoMsa.test.ts`), garantindo que a posição da alternativa correta mude a cada tentativa do simulado.
  2. **Balanceamento Estático nos JSONs (`q_f06.json` a `q_f16.json`)**: Redistribuição uniforme do índice `correta: true` (25% em cada posição A, B, C e D) diretamente nos arquivos JSON.
  3. **Auditoria Fina contra o MSA Oficial e Slides do GEM (Períodos 3 e 4)**: Revisão visual slide a slide (`GEM_MSA_3PER_AULA_001..014.pdf` e `GEM_MSA_4PER_AULA_001..014.pdf`) e correção rigorosa de gabaritos, exemplos de hinos e numerações de tópicos/páginas do sumário oficial do MSA (incluindo composição dos compassos compostos e escrita dos compassos alternados na Fase 11, proporções e os 2 hinos acéfalos 208 e 377 na Fase 13, *poco rall.* e modificações indevidas na Fase 15, e definições literais das 6 indicações interpretativas e vírgulas/semifrases na Fase 16), sincronizando as referências no Workspace e no Global Config.
- **2026-10-20**: Auditoria Integral de Hinos no Banco de Questões e Correção de Inconsistências Fatuais (Fases 4, 13 e 14):
  1. **Varredura Completa do Banco (495 questões)**: Identificação e catalogação de 122 questões com menções a hinos/hinário (38 com hinos específicos e 84 conceituais).
  2. **Correção em `f13_q002` (`q_f13.json`)**: Substituição dos Hinos 311 e 431 (que são anacrúsicos) por hinos genuinamente téticos (`ex.: Hinos 1, 3 e 282`) na alternativa correta sobre Ritmo Tético.
  3. **Correção em `f14_q001` e `f14_q005` (`q_f14.json`)**: Retificação da referência ao Hino 339 (que é 6/4 no Hinário 5) para o Hino 118 (fórmula 6/8 real com colcheia pontuada e semicolcheia).
  4. **Correção Terminológica em `f04_q052` (`q_f04.json`)**: Correção do texto da alternativa de `2/2 (Composto Binário)` para `2/2 (Binário Simples)`.
  5. **Validação Estrutural e Zod**: Execução de `npm test` com 23/23 testes aprovados em 5 arquivos de teste.
