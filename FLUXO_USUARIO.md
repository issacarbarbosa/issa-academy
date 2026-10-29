# Mapa de Experiência e Fluxo do Usuário: Issa Academy

Este documento mapeia a arquitetura de navegação, transições de estado e guardas de UX (User Experience) da plataforma **Issa Academy**, com foco no jogo **Mestre da Clave** (Multi-Clave: Sol, Fá e Dó) e no **Simulado MSA** (Dual-mode: Por Período vs. Por Fase, com 16 fases e sistema de feedback).

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
    B -- "Card: Aulas do MSA" --> C[/"📚 Aulas & Lições MSA ( /aulas )"/]
    B -- "Card: Mestre da Clave" --> D[/"🎮 Jogo Mestre da Clave ( /mestre-da-clave )"/]
    B -- "Card: Simulado" --> E[/"📝 Simulado Oficial ( /simulado )"/]
    B -- "Atalho Ctrl+Shift+A / Rodapé" --> F[/"🛡️ Painel Admin ( /admin )"/]
    class C,D,E,F route;

    %% SUB-FLUXO: NOVO MÓDULO AULAS MSA
    subgraph S0 ["Aulas & Lições do MSA (Fases 1 a 16)"]
        C --> C1["📖 Seletor de Períodos e Fases (1 a 16)"]
        C1 --> C2["📺 Player YouTube (@issacarbarbosa) + Blocos Didáticos"]
        C2 --> C3["✅ Marcar Concluída & 'Treinar no Simulado'"]
        C3 -.-> E
    end
    class C1,C2,C3 state;

    %% SUB-FLUXO: JOGO MESTRE DA CLAVE (Com Guarda de Orientação e Multi-Clave)
    subgraph S1 ["Mestre da Clave (Multi-Clave & Orientação)"]
        D --> G{Celular na Vertical?}
        G -- "Sim (Portrait)" --> G1["⚠️ Tela de Bloqueio:<br>'Gire seu celular para jogar'"]
        class G1 guard;
        G -- "Não / Desktop / Paisagem" --> G2["🎼 Seletor de Claves:<br>Sol 𝄞 (2ª L) | Fá 𝄢 (4ª L) | Dó 𝄡 (3ª L)<br>Recordes Independentes por Clave"]
        G2 -- "Começar" --> G3["✨ Gameplay Ativo<br>(Pauta Canvas 60fps, Síntese Acústica & Partículas)"]
        G3 -- "Pausa" --> G4["⏸️ Menu de Pausa / Trocar Clave"]
        G3 -- "Game Over" --> G5["💀 Fim de Jogo & Novo Recorde"]
        class G2,G3,G4,G5 modal;
    end

    %% SUB-FLUXO: SIMULADO MSA (Dual Mode & Feedback)
    subgraph S2 ["Simulado MSA (16 Fases & Dual Mode)"]
        E --> H1["📋 Menu de Seleção Dual Mode:<br>• Por Período (20 questões)<br>• Por Fase (10 questões, Fases 1 a 16)"]
        H1 -- "Iniciar Simulado" --> H2["⏳ Loading & Validação Zod<br>(q_f01 a q_f16 blindados offline)"]
        H2 --> H3["❓ Quiz Ativo (10 ou 20 Questões)<br>Cronômetro, Reações de Áudio & Reportar Questão"]
        H3 -- "Reportar Questão" --> H_MODAL["🚩 Modal de Reporte / Feedback<br>Webhook Google Sheets, Fila Offline PWA & GA4/Clarity"]
        H_MODAL --> H3
        H3 -- "Concluir" --> H4["🏆 Tela de Resultados<br>Troféu Fufu, % Precisão, Revisão de Erros & Reporte"]
        H4 -- "Reportar Erro" --> H_MODAL
    end
    class H1,H2,H3,H4,H_MODAL state;

    %% Botões de Retorno
    C -- "Sair das Aulas" --> B
    D -- "Sair do Jogo" --> B
    E -- "Sair do Simulado" --> B
    F -- "Voltar ao Site" --> B
```

---

## 🧭 Legenda da Arquitetura de UX

| Elemento / Cor | Significado Arquitetural | Exemplo no Projeto |
| :--- | :--- | :--- |
| **🟦 Rotas da SPA (Azul)** | Telas de nível superior configuradas em `App.tsx` com `React.lazy` e Code Splitting. | `/`, `/simulado`, `/mestre-da-clave` |
| **🟩 Ambientes Interativos (Verde)** | Telas de alta interatividade com síntese acústica em tempo real via Web Audio API e seleção multi-clave. | Mestre da Clave (Claves de Sol, Fá e Dó) |
| **🟥 Guardas de UX (Vermelho Tracejado)** | Bloqueios condicionais de interface que previnem experiências ruins no celular. | Componente `<OrientationGuard />` bloqueando orientação retrato no jogo |
| **⬛ Estados e Telas Internas (Cinza)** | Sub-telas controladas por máquina de estados interna sem transição de URL. | Menu Dual-Mode, Quiz, Modal de Feedback e Resultados do Simulado |

---

*Mapa de fluxo atualizado em: 26/10/2026.*
