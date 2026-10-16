# Mapa de Experiência e Fluxo do Usuário: Issa Academy

Este documento mapeia a arquitetura de navegação, transições de estado e guardas de UX (User Experience) da plataforma **Issa Academy**, com foco no jogo **Mestre da Clave** e no **Simulado MSA**.

---

## 🗺️ Diagrama de Fluxo (Mermaid.js)

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

    %% Navegação por Cards na Home
    B -- "Card: Mestre da Clave" --> D[/"🎮 Jogo Mestre da Clave ( /mestre-da-clave )"/]
    B -- "Card: Simulado" --> E[/"📝 Simulado Oficial ( /simulado )"/]
    class D,E route;

    %% SUB-FLUXO: JOGO MESTRE DA CLAVE (Com Guarda de Orientação)
    subgraph S1 ["Proteção Mobile-First (Orientação)"]
        D --> G{Celular na Vertical?}
        G -- "Sim (Portrait)" --> G1["⚠️ Tela de Bloqueio:<br>'Gire seu celular para jogar'"]
        class G1 guard;
        G -- "Não / Desktop / Paisagem" --> G2["✨ Gameplay Ativo<br>(Leitura rápida na Pauta Canvas)"]
        class G2 modal;
    end

    %% SUB-FLUXO: SIMULADO MSA (Máquina de Estados)
    subgraph S2 ["Simulado MSA"]
        E --> H1["📋 Menu de Seleção<br>(Períodos 1 e 2 de 5 Bancos JSON Zod)"]
        H1 -- "Iniciar Simulado" --> H2["⏳ Loading & Validação<br>(Zod blindando q_f01 a q_f05 offline)"]
        H2 --> H3["❓ Quiz Ativo (20 Questões)<br>(Cronômetro & Reações de Áudio)"]
        H3 -- "Concluir" --> H4["🏆 Tela de Resultados<br>(Troféu Fufu, % Precisão & Revisão de Erros)"]
    end
    class H1,H2,H3,H4 state;

    %% Botões de Retorno
    D -- "Sair do Jogo" --> B
    E -- "Sair do Simulado" --> B
```

---

## 🧭 Legenda da Arquitetura de UX

| Elemento / Cor | Significado Arquitetural | Exemplo no Projeto |
| :--- | :--- | :--- |
| **🟦 Rotas da SPA (Azul)** | Telas de nível superior configuradas em `App.tsx` com `React.lazy` e Code Splitting. | `/`, `/simulado`, `/mestre-da-clave` |
| **🟩 Ambientes Interativos (Verde)** | Telas de alta interatividade com síntese acústica em tempo real via Web Audio API. | Gameplay do Mestre da Clave |
| **🟥 Guardas de UX (Vermelho Tracejado)** | Bloqueios condicionais de interface que previnem experiências ruins no celular. | Componente `<OrientationGuard />` bloqueando orientação retrato no jogo |
| **⬛ Estados e Telas Internas (Cinza)** | Sub-telas controladas por máquina de estados interna sem transição de URL. | Menu, Loading, Quiz e Resultados do Simulado |

---

*Mapa de fluxo atualizado em: 16/10/2026.*
