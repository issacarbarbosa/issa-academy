# Mapa de Experiência e Fluxo do Usuário: Issa Academy

Este documento mapeia a arquitetura de navegação, transições de estado, abas interativas e guardas de UX (User Experience) da plataforma **Issa Academy**. Diferente do mapa de diretórios, este fluxo representa a **jornada dinâmica do estudante** navegando pela SPA (Single Page Application) e PWA Offline-First.

---

## 🗺️ Diagrama de Fluxo (Mermaid.js)

O gráfico abaixo modela a navegação declarativa via React Router (`<HashRouter>`), as máquinas de estado gerenciadas por Zustand (`useQuizStore`), e os bloqueios de UX (como o sensor de orientação para dispositivos móveis):

```mermaid
graph TD
    %% Estilos e Cores (Tailwind Palette)
    classDef route fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#ffffff,font-weight:bold,rx:8px;
    classDef modal fill:#047857,stroke:#10b981,stroke-width:2px,color:#ffffff,rx:8px;
    classDef guard fill:#b91c1c,stroke:#ef4444,stroke-width:2px,color:#ffffff,stroke-dasharray: 5 5,rx:8px;
    classDef state fill:#475569,stroke:#94a3b8,stroke-width:1px,color:#ffffff,rx:4px;

    %% Acesso Inicial
    A([🌐 Acesso / PWA App]) --> B[/"🏠 Home Principal ( / )"/]
    class B route;

    %% Banner de CTA Rápido
    B -- "CTA Topo: Continuar Estudo" --> C[/"📚 Grade do Curso ( /curso )"/]
    
    %% Navegação por Cards na Home
    B -- "Card: Curso MSA" --> C
    B -- "Card: Mestre da Clave" --> D[/"🎮 Jogo Mestre da Clave ( /mestre-da-clave )"/]
    B -- "Card: Simulado" --> E[/"📝 Simulado Oficial ( /simulado )"/]
    class C,D,E route;

    %% SUB-FLUXO: CURSO E AULAS (Layout Unificado)
    C -- "Seleciona Fase/Item (ex: Fase 3.1)" --> F[/"🎓 Sala de Aula ( /curso/aula )"/]
    class F route;
    
    subgraph S1 ["Sala de Aula (Layout Unificado Linear)"]
        F --> F1["🎥 Player de Vídeo YouTube"]
        F --> F2["📁 Materiais de Apoio<br>(PDF/Áudio Google Drive)"]
        F1 -- "Se for Fase 3.1" --> F3["🎹 Slideshow Interativo<br>(Endecagrama 11 Linhas + Teclado)"]
        F3 -- "Slide Final de Encerramento" --> F4["⭐ YouTube CTA Slide<br>(Auto-Inscrição & Likes/Comentários Dinâmicos)"]
    end
    class F1,F2,F3,F4 state;

    %% SUB-FLUXO: JOGO MESTRE DA CLAVE (Com Guarda de Orientação)
    subgraph S2 ["Proteção Mobile-First (Orientação)"]
        D --> G{Celular na Vertical?}
        G -- "Sim (Portrait)" --> G1["⚠️ Tela de Bloqueio:<br>'Gire seu celular para jogar'"]
        class G1 guard;
        G -- "Não / Desktop / Paisagem" --> G2["✨ Gameplay Ativo<br>(Gerador de Notas na Pauta Canvas)"]
        class G2 modal;
    end

    %% SUB-FLUXO: SIMULADO MSA (Máquina de Estados)
    subgraph S3 ["Simulado (Zustand State Machine)"]
        E --> H1["📋 Menu de Seleção<br>(Períodos 1 e 2 de 5 Bancos JSON Zod)"]
        H1 -- "Iniciar Simulado" --> H2["⏳ Loading & Validação<br>(Zod blindando q_f01 a q_f05 offline)"]
        H2 --> H3["❓ Quiz Ativo (20 Questões)<br>(Cronômetro & Reações de Áudio)"]
        H3 -- "Concluir" --> H4["🏆 Tela de Resultados<br>(Troféu Fufu, % Precisão & Revisão de Erros)"]
    end
    class H1,H2,H3,H4 state;

    %% Botões de Retorno
    F -- "Botão Voltar (useNavigate)" --> C
    D -- "Sair do Jogo" --> B
    E -- "Sair do Simulado" --> B
```

---

## ☁️ Arquitetura de Nuvem, Autenticação & Telemetria (Escala Futura)

```mermaid
graph TD
    classDef cloud fill:#0284c7,stroke:#38bdf8,stroke-width:2px,color:#ffffff,rx:8px;
    classDef db fill:#6366f1,stroke:#818cf8,stroke-width:2px,color:#ffffff,rx:8px;
    classDef analytics fill:#d97706,stroke:#fbbf24,stroke-width:2px,color:#ffffff,rx:8px;

    %% CI/CD & Hospedagem
    PC["💻 Seu PC / Antigravity IDE"] -- "1. git push" --> GH["🐙 GitHub Main Branch"]
    GH -- "2. Webhook & Auto Build" --> CF["☁️ Cloudflare Pages (Hosting & CDN)"]
    CF -- "3. Deploy em 30s" --> WEB["🌐 Site na Web (issa-academy.pages.dev)"]
    class CF,WEB cloud;

    %% Camada de Usuário & Sessão
    WEB --> SESS{Modo de Acesso}
    SESS -- "Visitante (Offline/Guest)" --> LS["💾 LocalStorage Browser Cache<br>(Degradação Graciosa)"]
    SESS -- "Aluno Autenticado" --> SUPA_AUTH["🔐 Supabase Auth<br>(Email/Senha + Google OAuth)"]
    SUPA_AUTH --> SUPA_DB[("🗄️ Supabase PostgreSQL<br>(profiles, user_progress, quiz_attempts, game_scores)")]
    class SUPA_AUTH,SUPA_DB db;

    %% Telemetria & Analytics
    WEB -- "Telemetria Leve" --> CF_ANA["📊 Cloudflare Web Analytics"]
    WEB -- "Eventos Pedagógicos & Retenção" --> PH["🦔 PostHog Product Analytics"]
    class CF_ANA,PH analytics;
```

---

## 🧭 Legenda da Arquitetura de UX e Infraestrutura

| Elemento / Cor | Significado Arquitetural | Exemplo no Projeto |
| :--- | :--- | :--- |
| **🟦 Rotas da SPA (Azul)** | Telas de nível superior configuradas em `App.tsx` com `React.lazy` e Code Splitting. | `/curso`, `/simulado`, `/mestre-da-clave` |
| **🟩 Ambientes Interativos (Verde)** | Telas ou modais de alta interatividade que utilizam motores visuais, síntese de áudio ou o motor vetorial `<StaffSvgEngine />`. | Gameplay do Mestre da Clave, Slideshow do Endecagrama |
| **🟥 Guardas de UX (Vermelho Tracejado)** | Bloqueios condicionais de interface que previnem experiências ruins no celular. | Componente `<OrientationGuard />` bloqueando orientação retrato na pauta |
| **⬛ Estados e Abas (Cinza)** | Sub-telas controladas por estado interno sem transição de URL na rota ativa. | Abas da Sala de Aula, Fases de carregamento do Simulado |
| **🌐 Infraestrutura Cloud (Azul Claro)** | Hospedagem de borda com deploy contínuo acionado via `git push`. | **Cloudflare Pages** integrando com repositório GitHub |
| **🟪 Autenticação & Banco (Roxo)** | Gestão de contas de estudantes e sincronização de dados de progresso e score. | **Supabase Auth** + **Supabase PostgreSQL** |
| **🟧 Analytics & Métricas (Âmbar)** | Telemetria de uso sem privacidade violada e mapas de retenção de alunos. | **Cloudflare Web Analytics** + **PostHog** |

---

*Mapa de fluxo e infraestrutura atualizado em: 29/07/2026.*
