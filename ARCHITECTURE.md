# ARCHITECTURE.md — Arquitetura Viva do Ecossistema Issa Academy (v1.4.1)

## 1. Visão Geral do Sistema
O **Issa Academy** é uma Single Page Application (SPA) modular e offline-first (PWA) em **React 19 + TypeScript + Tailwind CSS v4** voltada ao ensino gamificado e interativo do **MSA (Método Simplificado de Aprendizagem Musical)** e do **Hinário 5 da CCB**.

O projeto opera em **arquitetura de desenvolvimento híbrida (`Google AI Studio ⇄ GitHub ⇄ Antigravity`)**, compartilhando uma única fonte da verdade na branch `main` de `https://github.com/issacarbarbosa/issa-academy` e banco em nuvem **Supabase Cloud (`pcwmafuykwqxoivedpbn`)** com fallback transparente para `localStorage`.

---

## 2. Diagrama Geral dos 6 Módulos e Camada de Dados (`flowchart TD`)

```mermaid
flowchart TD
    subgraph Router["Roteador Declarativo (src/App.tsx — HashRouter + React.lazy)"]
        Home["🏠 Home (WelcomeHome.tsx — /#/)"]
        Aulas["📚 Aulas do MSA (AulasMsa.tsx — /#/aulas)"]
        Partituras["🎼 Estúdio de Partituras & Hinário 5 (PartiturasStudio.tsx — /#/partituras)"]
        Mestre["🎮 Mestre da Clave (MestreDaClave.tsx — /#/mestre-da-clave)"]
        Simulado["📝 Simulado MSA 552q (SimuladoMsa.tsx — /#/simulado)"]
        Admin["🛡️ Painel Admin CMS (AdminDashboard.tsx — /#/admin)"]
    end

    subgraph Core["Camada Central (src/core/)"]
        AdminCtx["AdminContext.tsx (Google OAuth PKCE + Whitelist + Modo Edição)"]
        ContentStore["contentStore.ts (Sincronização Híbrida Supabase ⇄ localStorage)"]
        CoreAudio["audio.ts & notesData.ts (Síntese Web Audio Jogo/Simulado)"]
    end

    subgraph PartiturasEngine["Motores do Estúdio de Partituras (src/modules/partituras/)"]
        ScoreCtrl["ScoreController.ts (OSMD SVG, Leitura Rítmica 1º Espaço F4, Isolamento Modo Foco)"]
        AudioSched["AudioScheduler.ts (Lookahead Web Audio, Piano de Cauda Didático Universal)"]
        MusicMath["musicMath.ts (Funções Puras: BPM, MIDI, Solfejo pt-BR, 3 Claves Oficiais)"]
        SampleScores["sampleScores.ts (Catálogo MSA 22 Lições + Hinário 5 + Sync Supabase)"]
    end

    subgraph Cloud["Infraestrutura Cloud & CI/CD"]
        Supabase[("Supabase PostgreSQL + RLS\n(site_config, lessons, questions,\nfeedbacks, musicxml_scores)")]
        GitHub["GitHub (issacarbarbosa/issa-academy)\nGitHub Actions ➔ GitHub Pages"]
    end

    Home --> Aulas
    Home --> Partituras
    Home --> Mestre
    Home --> Simulado
    Home --> Admin

    Aulas --> ContentStore
    Simulado --> ContentStore
    Admin --> ContentStore
    Admin --> AdminCtx
    ContentStore --> Supabase

    Partituras --> ScoreCtrl
    Partituras --> AudioSched
    Partituras --> MusicMath
    Partituras --> SampleScores
    SampleScores --> Supabase
```

---

## 3. Fluxo de Sincronização Híbrida (`Google AI Studio ⇄ GitHub ⇄ Antigravity`)

```mermaid
sequenceDiagram
    participant Dev as Desenvolvedor
    participant AIStudio as Google AI Studio (Cloud Container)
    participant GitHub as GitHub (issacarbarbosa/issa-academy : main)
    participant Antigravity as Google Antigravity (IDE Local)
    participant Pages as GitHub Pages (CI/CD)

    Note over AIStudio,Antigravity: Início de Qualquer Nova Conversa (Check-in Obrigatório)
    AIStudio->>GitHub: bash sync-check.sh (git fetch origin main)
    GitHub-->>AIStudio: Verifica se HEAD == origin/main (atualiza se necessário)
    Antigravity->>GitHub: bash sync-check.sh (git fetch & git pull --rebase origin main)
    GitHub-->>Antigravity: Sincroniza commits mais recentes

    Note over Dev,AIStudio: Ciclo de Evolução & Publicação
    Dev->>AIStudio: Solicita feature/ajuste visual ou de áudio
    AIStudio->>AIStudio: Executa Quality Gate (typecheck + 108 testes + build + map)
    AIStudio->>GitHub: git push via GITHUB_TOKEN (sync-check.sh --push)
    GitHub->>Pages: Dispara .github/workflows/deploy.yml automaticamente
```

---

## 4. Máquina de Estados do Estúdio de Partituras (`stateDiagram-v2`)

```mermaid
stateDiagram-v2
    [*] --> Parado

    state Parado {
        [*] --> PartituraCompleta
        PartituraCompleta --> LoopAtivo : Clica em Loop ou Arrasta Alças (Lollipop Handles)
        LoopAtivo --> ModoFocoIsolado : Clica em "Foco" na Pílula Flutuante (Foco | ✕)
        ModoFocoIsolado --> LoopAtivo : Clica em "✕" no seletor de compassos
        LoopAtivo --> PartituraCompleta : Desativa Loop
    }

    Parado --> ContagemRegressiva : Play (se Count-in habilitado para a condição atual)
    Parado --> Tocando : Play (sem Count-in)
    ContagemRegressiva --> Tocando : Último tempo da contagem concluído
    Tocando --> Parado : Pause / Fim da Partitura (sem Loop)
    Tocando --> Tocando : Reinício automático do trecho em Loop (+ incremento BPM se Treino de Velocidade ativo)
```
