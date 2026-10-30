# Mapa de Experiência e Fluxo do Usuário: Issa Academy (v1.4.1)

Este documento mapeia a arquitetura de navegação, transições de estado e guardas de UX da plataforma **Issa Academy**, cobrindo os **4 módulos de estudo do aluno** (`Aulas do MSA`, `Estúdio de Partituras & Hinário 5`, `Mestre da Clave` e `Simulado MSA`) e o **Painel Administrativo Híbrido (`/#/admin`)**.

---

## 🗺️ Diagrama de Fluxo Completo (Mermaid.js)

```mermaid
graph TD
    classDef route fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#ffffff,font-weight:bold,rx:8px;
    classDef modal fill:#047857,stroke:#10b981,stroke-width:2px,color:#ffffff,rx:8px;
    classDef guard fill:#b91c1c,stroke:#ef4444,stroke-width:2px,color:#ffffff,stroke-dasharray: 5 5,rx:8px;
    classDef state fill:#475569,stroke:#94a3b8,stroke-width:1px,color:#ffffff,rx:4px;

    A([🌐 Acesso / PWA App]) --> B[/"🏠 Home Principal ( /#/ )"/]
    class B route;

    B -- "Card 1: Aulas do MSA" --> C[/"📚 Aulas & Lições MSA ( /#/aulas )"/]
    B -- "Card 2: Estúdio de Partituras" --> P[/"🎼 Estúdio de Partituras & Hinário 5 ( /#/partituras )"/]
    B -- "Card 3: Mestre da Clave" --> D[/"🎮 Jogo Mestre da Clave ( /#/mestre-da-clave )"/]
    B -- "Card 4: Simulado" --> E[/"📝 Simulado Oficial ( /#/simulado )"/]
    B -- "Atalho Ctrl+Shift+A / Rodapé" --> F[/"🛡️ Painel Admin ( /#/admin )"/]
    class C,P,D,E,F route;

    subgraph S0 ["1. Aulas & Lições do MSA (Fases 1 a 16)"]
        C --> C1["📖 Seletor de Períodos e Fases (1 a 16)"]
        C1 --> C2["📺 Player YouTube (@issacarbarbosa) + Blocos Didáticos"]
        C2 --> C3["✅ Marcar Concluída & 'Treinar no Simulado'"]
        C3 -.-> E
    end
    class C1,C2,C3 state;

    subgraph SP ["2. Estúdio de Partituras & Hinário 5 (Soundslice Minimalist UX)"]
        P --> P1["🎼 Barra Superior Única (48px): Repertório MSA (22 Lições) & Hinário 5 CCB"]
        P1 --> P2["🎹 Palco MusicXML OSMD + Som Universal de Piano de Cauda Didático"]
        P2 --> P3["🔁 Loop Lollipop Handles + Modo Foco de Compassos + Treino de Velocidade"]
        P2 --> P4["🎻 Hinário de Cordas: Braço do Violino (ViolinFingerboard) & Dedilhado/Arcadas"]
    end
    class P1,P2,P3,P4 modal;

    subgraph S1 ["3. Mestre da Clave (Multi-Clave & Orientação)"]
        D --> G{Celular na Vertical?}
        G -- "Sim (Portrait)" --> G1["⚠️ Tela de Bloqueio:<br>'Gire seu celular para jogar'"]
        class G1 guard;
        G -- "Não / Desktop / Paisagem" --> G2["🎼 Seletor de Claves:<br>Sol 𝄞 (2ª L) | Fá 𝄢 (4ª L) | Dó 𝄡 (3ª L)"]
        G2 -- "Começar" --> G3["✨ Gameplay Ativo (Canvas 60fps, Vetores SMuFL & Partículas)"]
        G3 -- "Pausa / Game Over" --> G5["🏆 Recorde Independente por Clave"]
        class G2,G3,G5 modal;
    end

    subgraph S2 ["4. Simulado MSA (16 Fases & Dual Mode)"]
        E --> H1["📋 Menu Dual Mode: Por Período (20q) | Por Fase (10q)"]
        H1 --> H2["❓ Quiz Ativo (552+ Questões Blindadas via Zod)"]
        H2 --> H_MODAL["🚩 Modal de Feedback (Supabase + Google Sheets + Fila Offline)"]
        H2 --> H4["🏆 Resultados, Troféu Fufu & Revisão de Gabarito"]
    end
    class H1,H2,H4,H_MODAL state;

    C -- "← Início" --> B
    P -- "← Início" --> B
    D -- "Sair" --> B
    E -- "Sair" --> B
    F -- "Voltar ao Site" --> B
```

---

*Mapa de fluxo atualizado em: 30/10/2026 (v1.4.1).*
