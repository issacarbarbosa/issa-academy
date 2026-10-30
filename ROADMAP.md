# Roadmap de Desenvolvimento: Issa Academy

Este documento detalha o estado atual da plataforma, o backlog ativo de próximas evoluções e as últimas entregas homologadas. Para o histórico completo de versões anteriores, consulte o [CHANGELOG.md](file:///d:/Projetos/issa-academy/CHANGELOG.md).

---

## 🧭 Estado Atual dos Módulos Principais (v1.5.1)

### 1. 🏠 Home (`WelcomeHome.tsx`)
- [x] Apresentação do mascote Fufu com animações e saudações contextuais.
- [x] Grid enxuto de 3 cards principais: **Estúdio de Partituras & Hinário 5**, **Mestre da Clave** e **Simulado MSA**.
- [x] Link direto para o canal oficial [@issacarbarbosa](https://www.youtube.com/@issacarbarbosa).
- [x] Edição in-place de textos e fala do Fufu via modo Admin (`AdminContext`).

### 2. 🎼 Estúdio de Partituras & Hinário 5 CCB (`PartiturasStudio.tsx`)
- [x] Leitor e reprodutor interativo MusicXML estilo Soundslice minimalista ("Menos é mais").
- [x] Motor universal de **Piano de Cauda Didático (`'acoustic-grand'`)** com multi-samples Salamander Grand Piano V3 (`A1`–`C7`), modelagem física de 3 cordas uníssonas em estéreo, ataque percussivo claro de martelo (`18ms`) e sustentação fiel à duração escrita.
- [x] Catálogo com 22 lições de solfejo e leitura rítmica do MSA nas 3 claves oficiais (`𝄞 Sol`, `𝄡 Dó`, `𝄢 Fá`) + Hinos do Hinário 5 CCB.
- [x] Ferramentas pedagógicas visuais do **Hinário de Cordas (`edition === 'cordas'`)**: Braço do Violino interativo (`ViolinFingerboard`) e Dedilhado colorido com arcadas (`⊓`).
- [x] Loop com alças arrastáveis na partitura (Lollipop Handles), Modo Foco de compassos, Metrônomo + Count-in condicional, Treino de Velocidade progressivo e sincronização híbrida `Supabase (public.musicxml_scores) + localStorage`.

### 3. 🎮 Mestre da Clave (`MestreDaClave.tsx`)
- [x] Renderização vetorial profissional SMuFL (Bravura / W3C) para Claves de Sol (2ª linha), Fá (4ª linha) e Dó (3ª linha).
- [x] Motor em HTML5 Canvas a 60fps com partículas desacopladas e HiDPI (`devicePixelRatio`).
- [x] Velocidade de pauta responsiva normalizada (~3.8s de reação em qualquer viewport).
- [x] Sistema de recordes independentes por clave persistidos em `localStorage`.
- [x] Atalhos de teclado físico no desktop (`1-7`, `C-B`, `Espaço`/`Esc`).
- [x] Guarda de orientação móvel (`OrientationGuard`) com saída de emergência.
- [x] Botão **Tela Cheia (`[ ⛶ ]`)** integrado ao HUD superior (`useFullscreen.ts` com `navigationUI: 'hide'` e trava automática de paisagem `lockLandscape`) + prevenção de bloqueio de tela (`useScreenWakeLock`) durante a partida.

### 4. 📝 Simulado MSA (`SimuladoMsa.tsx`)
- [x] Dual-Mode: "Por Período (20 questões)" vs. "Por Fase (10 questões)".
- [x] Catálogo completo de 16 fases do MSA com 552 questões blindadas via Zod.
- [x] Duplo sorteio estocástico uniforme Fisher-Yates (questões e alternativas A/B/C/D).
- [x] Síntese de áudio Web Audio API para acertos (arpejo) e erros (dissonância grave).
- [x] Central de feedbacks integrada ao Supabase com persistência local e exportação CSV.
- [x] Modo Prova em **Tela Cheia (`[ ⛶ ]`)** no Menu, Cabeçalho do Quiz e Resultados (ocultando cabeçalhos globais e a barra inferior do Google AI Studio no mobile) + prevenção de bloqueio de tela (`useScreenWakeLock`) durante a resolução das questões.

### 5. 🛡️ Painel de Administrador & CMS Híbrido (`AdminDashboard.tsx`)
- [x] Acesso exclusivo do admin via `/#/admin` ou atalho `Ctrl+Shift+A` autenticado via Google OAuth 2.0 + Supabase (`admin_whitelist`).
- [x] Barra flutuante `AdminFloatingBar`: alternância em 1 clique entre `Visão Aluno` e `Modo Edição`.
- [x] Gestor de Questões do Simulado, Gestor de Partituras MusicXML, Central de Feedbacks e Configurações Globais do Site.
- [x] Infraestrutura Supabase Cloud (`pcwmafuykwqxoivedpbn`) com RLS blindado, constraints anti-flood e fallback offline.

> **Nota de Arquitetura (v1.5.0):** O módulo de Aulas Teóricas em vídeo foi temporariamente descontinuado da base ativa e arquivado para reimplementação futura, após a gravação das videoaulas das Fases 4 a 16 do canal.

---

## 🎯 Backlog Ativo & Próximos Sprints Estruturados

### 🚀 Sprint 1: Infraestrutura & Segurança Máxima (Cloudflare Pages + Repo Privado)
- [ ] **Tornar Repositório Privado no GitHub:**
  - [ ] Alterar visibilidade do repositório `issacarbarbosa/issa-academy` para **Privado** para blindar a propriedade intelectual, partituras e bancos de questões.
- [ ] **Migração para Cloudflare Pages (Cenário 1 — Conexão Direta):**
  - [ ] Conectar repositório privado na Cloudflare Pages com build automático nativo (`npm run build`, pasta `dist`).
  - [ ] Desativar antigo workflow `.github/workflows/deploy.yml` (economizando 100% da cota mensal de 2.000 minutos do GitHub Actions).
  - [ ] Configurar arquivo `public/_redirects` com `/* /index.html 200` para garantir roteamento SPA sem erro 404 em recarregamento.
  - [ ] Manter Quality Gate rigoroso no Antigravity local (`node .agents/skills/deploy-helper/scripts/pre-deploy-check.js`) antes de todo `git push`.

---

### 🎻 Sprint 2: Estúdio de Partituras — Quality Gate & UX Mobile First
- [x] **Otimização Mobile First, Pinça de Zoom Contínua & Aproveitamento Lateral:**
  - [x] Redução drástica das margens laterais do OSMD no mobile (`PageLeftMargin = 0.45`, `PageRightMargin = 0.45`), aumentando em +67% a largura útil dos pentagramas em telas pequenas.
  - [x] Gesto de pinça contínuo com 2 dedos (*Continuous Single-Gesture Pinch-to-Zoom*, `55%` a `220%`) estilo Soundslice: o aluno posiciona os dois dedos uma única vez e controla todo o intervalo de aumento e redução em um movimento único e fluido (`pinchStateRef` imune a re-renderizações do React), mantendo `TopBar` e `TransportBar` fixas.
  - [x] Escalonamento proporcional de todas as anotações pedagógicas junto com o zoom (`annScale`): nomes das notas (`Dó, Ré, Mi...`), dedilhados (`0, 1, 2, 3`, `②`), arcadas (`⊓`), contagens rítmicas e vírgulas de respiração aumentam e diminuem proporcionalmente à partitura.
  - [x] Distinção entre toque/rolagem mobile e criação de Loop: tocar ou rolar a partitura com o dedo no celular apenas move o cursor ou rola a folha, sem ativar o Loop acidentalmente.
  - [x] Botão **Tela cheia (`[ ⛶ ]`)** visível e acessível na barra de transporte inferior tanto no Mobile quanto no Desktop.
  - [x] **Prevenção de Bloqueio de Tela (*Screen Wake Lock*):** Manutenção automática da tela acesa enquanto o reprodutor ou contagem regressiva estiverem ativos (`useScreenWakeLock.ts` combinando W3C `navigator.wakeLock.request('screen')` + fallback de micro-vídeo HTML5 para iOS/iframes), liberando o descanso normal da tela assim que o player é pausado.
- [x] **Padronização Geométrica de Anotações e Vírgulas de Respiração Acima do Pentagrama (OSMD):**
  - [x] Ancoragem vertical padronizada (`staffTopY - clearance` + `-translate-y-full`) garantindo que nomes das notas (`Dó, Ré, Mi...`), arcadas (`⊓`), dedilhado (`0, 1, 2, 3`) e vírgulas de respiração SVG (`[data-testid="breath-comma-*"]`) fiquem sempre 100% fora e acima da 5ª linha do pentagrama em todos os compassos, na ordem visual Soundslice (`Solfejo → Arcada ⊓ → Dedilhado`).
  - [x] Sombreamento de compasso (`measureShadeRef`) cobrindo integralmente as 5 linhas do pentagrama e as anotações superiores.
- [ ] **Próximos Refinamentos do Estúdio (Em Andamento):**
  - [ ] Tratamento fino de visualização em modo paisagem (*landscape*) e calibração contínua de espaçamento em passagens com semicolcheias.

---

### 🎼 Sprint 3: Pipeline de Conversão de PDFs do Hinário e MSA para MusicXML
- [ ] **Plano A (Acervo Digital MuseScore / MIDI da Comunidade CCB):**
  - [ ] Mapear arquivos `.mscz` e `.mid` já digitados por músicos e organistas da CCB.
  - [ ] Criar script de exportação em lote (`mscore -f -o output.musicxml input.mscz`) para gerar os 480 hinos e lições do MSA com metadados corretos.
- [ ] **Plano B (Pipeline OMR / IA com Audiveris + Gemini Vision):**
  - [ ] Desenvolver pipeline de reconhecimento ótico de partituras (OMR) para escanear os PDFs oficiais da CCB caso edições específicas não tenham arquivos digitais prontos.
  - [ ] Validar fidelidade estrita: armaduras de clave oficiais, compassos, ligaduras e respirações `,`.
- [ ] **Importador em Lote para o Estúdio:**
  - [ ] Ferramenta no Painel Admin para subir múltiplos arquivos `.musicxml` de uma vez com categorização automática (Hino, Lição, Clave e Instrumento).

---

### 🎙️ Sprint 4: Escuta & Afinação em Tempo Real (Estilo Tonestro / Yousician)
- [ ] **Benchmark Comparativo Detalhado:**
  - [ ] Elaborar documento de análise das melhores práticas dos aplicativos líderes de mercado:
    - **Tonestro:** Precisão de afinação em cents, cursor guiado por áudio e partitura interativa em tempo real.
    - **Yousician:** Gamificação por precisão ("Perfeito", "Bom", "Atrasado").
    - **Tomplay & Soundslice:** Layout de partituras e usabilidade profissional.
- [ ] **Motor de Detecção de Pitch e Ritmo (Web Audio API / AudioWorklet):**
  - [ ] Implementar algoritmo de detecção de frequência fundamental (YIN / McLeod Pitch Method) de baixa latência direto no microfone do navegador.
  - [ ] Comparação em tempo real entre a frequência tocada pelo aluno e a nota esperada da partitura.
- [ ] **Retorno Visual Instantâneo:**
  - [ ] Nota iluminada em **verde** quando afinada (dentro da tolerância de $\pm 25$ cents) e no tempo correto.
  - [ ] Nota destacada em **vermelho/âmbar** quando sustenizada/bemolizada ou fora da pulsação.

---

### 👥 Sprint 5: Contas de Alunos & Modelos de Monetização (Plano Pago)
- [ ] **Autenticação de Alunos:**
  - [ ] Login social do aluno (Google OAuth e Magic Link) via Supabase Auth integrado ao frontend.
  - [ ] Perfil do aluno (`student_profiles`) com sincronização de progresso, lições concluídas e pontuação.
- [ ] **Avaliação e Escolha do Modelo de Negócio (Decisão Estratégica):**
  - [ ] *Opção A: Freemium* — Acesso básico gratuito; recursos avançados (hinário completo de cordas, afinador em tempo real e avaliações por vídeo com IA) no Plano Pro.
  - [ ] *Opção B: Planos Segmentados* — Plano Aluno (acessível, ex: R$ 14,90/mês) e Plano Instrutor/Regional (gestão de turmas e acompanhamento de alunos do polo).
  - [ ] *Opção C: Período de Testes (Trial de 7 dias)* — 7 dias livres seguidos por assinatura.
- [ ] **Gateway de Pagamento Brasileiro:**
  - [ ] Integração com Asaas ou Mercado Pago para cobrança recorrente via **Pix Instantâneo** e Cartão de Crédito.
  - [ ] Webhook de ativação/cancelamento automático de assinatura vinculado ao ID do usuário no Supabase.

---

### 🤖 Sprint 6: IA Educacional com Google AI Studio (Avaliação de Vídeos e Tutoria)
- [ ] **Integração com Gemini 2.0 Flash no Google AI Studio:**
  - [ ] Configuração de chave segura via Cloudflare Workers / Supabase Edge Functions (zero exposição no frontend).
  - [ ] Ativação de **Context Caching** para regras do MSA, rubricas da CCB e gabaritos de partitura, reduzindo custos em até 80%.
  - [ ] Uso de **Structured Outputs (JSON Schema)** com coordenadas normalizadas 2D (`[ymin, xmin, ymax, xmax]`).
- [ ] **Filtro de Atividade (Audio-Visual Gating):**
  - [ ] Descartar tempo morto de afinação ou preparação inicial do aluno; avaliar postura e técnica exclusivamente durante a emissão das notas.
- [ ] **Cards Anotados de Feedback (`<AnnotatedFeedbackCard />`):**
  - [ ] Renderizar o frame exato do desvio técnico com camadas vetoriais SVG (linha verde de referência do arco paralelo ao cavalete, seta vermelha de correção de inclinação, destaque do pulso).
  - [ ] Opção de exportação do card em imagem leve para envio direto aos pais ou alunos pelo WhatsApp.
- [ ] **Loop de Aprendizado Contínuo com o Professor (`teacher_corrections`):**
  - [ ] O professor revisa o feedback no Painel Admin; ajustes feitos pelo professor alimentam a memória da IA para que ela nunca repita o erro nas próximas avaliações.

---

### 🎻 Sprint 7: Expansão de Instrumentos e Braços Visuais
- [ ] **Aprimoramento do Braço do Violino (`ViolinFingerboard.tsx`):**
  - [ ] Melhorar nitidez das cordas (`Sol, Ré, Lá, Mi`), indicação de posições ($1ª$ a $3ª$ posição) e arpejos.
- [ ] **Mapeamento por Facilidade de Implementação:**
  - [ ] **Prioridade 1 (Mais fácil — 90% reuso de código):**
    - **Viola** (Clave de Dó na 3ª linha — cordas `Dó, Sol, Ré, Lá`).
    - **Violoncelo** (Clave de Fá na 4ª linha — cordas `Dó, Sol, Ré, Lá`).
  - [ ] **Prioridade 2 (Intermediário):**
    - **Órgão Eletrônico / Teclado Virtual (Piano Roll)** com visualização de teclado superior, inferior e pedaleira para as organistas da CCB.
  - [ ] **Prioridade 3 (Especializado):**
    - **Sopros da CCB (Flauta, Clarinete, Trompete, Saxofone)** com diagramas interativos de digitação de chaves e pistões.

---

## 📈 Histórico Recente de Entregas

- **2026-10-30 (v1.5.0)**: Planejamento estratégico geral (`ROADMAP.md` expandido em 7 Sprints), remoção completa do módulo temporário de Aulas do MSA (Home com 3 cards limpos), tipagens promovidas para `src/core/types/lessons.ts` e `src/core/data/initialLessons.ts`, 104 testes unitários aprovados e build Vite de produção validado.
- **2026-10-30 (v1.4.1)**: Auditoria global de documentação (`GEMINI.md`, `AGENTS.md`, `ARCHITECTURE.md`, `README.md`, `FLUXO_USUARIO.md`, `CHANGELOG.md`, `MAPA_RAIZ.md`), criação da skill `.agents/skills/github-hybrid-sync/` com protocolo obrigatório de check-in no início de cada conversa, e blindagem multiplataforma (`optionalDependencies` para Windows/Linux).
- **2026-10-29 (v1.4.0)**: Fusão arquitetural do módulo **Estúdio de Partituras & Hinário 5 (`src/modules/partituras/`)** ao ecossistema **Issa Academy**, com Piano de Cauda Didático Universal, Braço do Violino e Dedilhado no Hinário de Cordas, tabela `public.musicxml_scores` no Supabase e fluxo Git bidirecional.
