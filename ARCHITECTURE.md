# ARCHITECTURE.md — Arquitetura Viva do SliceScore Studio

## 1. Visão Geral do Sistema
O **SliceScore Studio** é uma Single Page Application (SPA) modular em React + TypeScript projetada para estudo musical interativo de alta precisão do **Hinário 5 da CCB** (múltiplas edições: Cordas, Órgão, Dó, Si♭, Mi♭, Fá e Tubas) e das **113 Lições do MSA** (Método Simplificado de Aprendizagem Musical). A arquitetura separa estritamente três camadas:
1. **Camada de Apresentação Minimalista e Navegação Amigável (React UI):** Componentes enxutos (`TopBar`, `RepertoirePanelModal`, `TransportBar`, `ViolinFingerboard`), alternador de perfil (`Visão do Aluno` vs `Painel do Administrador`) e palco de partitura 100% branco (`App.tsx`).
2. **Camada de Controle Gráfico, Resolução MusicXML por Clave e Partitura (`ScoreController.ts` + `musicMath.ts`):** Wrapper especializado sobre o `opensheetmusicdisplay` (OSMD) responsável por parsing de MusicXML, busca direta do MusicXML correspondente a cada uma das **3 Claves Oficiais (`Clave de Sol` na 2ª linha, `Clave de Dó` na 3ª linha e `Clave de Fá` na 4ª linha)** via `xmlByClef`, pós-processamento SVG para **Leitura Rítmica** em linha única (sem clave e sem pentagrama), filtragem de compassos para o Modo Foco, extração de coordenadas (`MeasureBoundingBox` e `ScoreSliceEvent`) e coloração direta de cabeças de nota (`.vf-notehead path`).
3. **Camada de Áudio da Orquestra CCB e Tempo Real (`AudioScheduler.ts` + `musicMath.ts`):** Motor de agendamento lookahead baseado em `AudioContext.currentTime` com síntese realista para as **4 famílias da Orquestra CCB (22 instrumentos)**, mixer de vozes por pentagrama (Solo/Mute), metrônomo subdividido, contagem regressiva (Count-in) e treino de velocidade automático.

---

## 2. Diagrama de Componentes (`flowchart TD`)

```mermaid
flowchart TD
    subgraph UI["Camada de Interface (React 19 + Tailwind CSS)"]
        App["App.tsx (Orquestrador, Estado Aluno/Admin & Palco da Partitura)"]
        TopBar["TopBar.tsx (Repertório, 3 Claves Oficiais MSA, Edições Hinário, Alternador Aluno/Admin)"]
        RepModal["RepertoirePanelModal.tsx (Navegação Amigável MSA/Hinário & Reimportação MusicXML Admin)"]
        TransportBar["TransportBar.tsx (Play, Vozes Mixer, BPM/Speed Training, Loop, Violino, Metrônomo, 22 Instrumentos CCB)"]
        ViolinNeck["ViolinFingerboard.tsx (Espelho Interativo Cordas Sol, Ré, Lá, Mi)"]
        LoopPill["Pílula Flutuante (Foco | ✕ / Focado nos compassos)"]
    end

    subgraph Engines["Motores de Domínio (Services, Data & Utils)"]
        Catalog["sampleScores.ts (Catálogo MSA Rítmica + Solfejo 3 Claves, Hinário 5 & Overrides localStorage)"]
        ScoreCtrl["ScoreController.ts (OSMD SVG, Modo Leitura Rítmica, Isolamento XML no Modo Foco)"]
        AudioSched["AudioScheduler.ts (Lookahead Web Audio, 22 Instrumentos Orquestra CCB, Mixer Multi-Vozes)"]
        MusicMath["musicMath.ts (Funções Puras: BPM, MIDI, Solfejo pt-BR, 3 Claves Oficiais, Reimportação XML)"]
    end

    subgraph BrowserAPIs["APIs Nativas do Navegador"]
        OSMD["DOM / SVG (OpenSheetMusicDisplay / VexFlow)"]
        WebAudio["Web Audio API (AudioContext, OscillatorNode, GainNode, BiquadFilterNode)"]
        RAF["requestAnimationFrame (60fps Direct DOM Sync)"]
    end

    TopBar --> App
    RepModal --> App
    TransportBar --> App
    ViolinNeck --> App
    LoopPill --> App

    App --> Catalog
    App --> ScoreCtrl
    App --> AudioSched
    App --> MusicMath
    ScoreCtrl --> MusicMath
    AudioSched --> MusicMath

    ScoreCtrl --> OSMD
    AudioSched --> WebAudio
    AudioSched --> RAF
    RAF -->|"translate3d(x,y,0) sem re-render"| OSMD
```

---

## 3. Fluxo de Seleção das 3 Claves Oficiais e Reimportação MusicXML pelo Administrador

```mermaid
sequenceDiagram
    participant User as Aluno / Administrador
    participant TopBar as TopBar / RepertoirePanelModal
    participant App as App.tsx
    participant Math as musicMath.ts / sampleScores.ts
    participant Ctrl as ScoreController.ts
    participant OSMD as OSMD SVG

    alt Seleção de Clave em Lição de Solfejo do MSA ('sol' | 'do' | 'fa')
        User->>TopBar: Clica em "Clave de Sol (2ª linha)", "Clave de Dó (3ª linha)" ou "Clave de Fá (4ª linha)"
        TopBar->>App: onMsaClefChange(claveSelecionada)
        App->>Math: resolveScoreXmlForClef(score, claveSelecionada)
        Math-->>App: Retorna score.xmlByClef[claveSelecionada] (MusicXML nativo da clave)
        App->>Ctrl: loadScore(xmlDaClave, zoom, { msaPhase: 'solfejo', msaClef: claveSelecionada })
        Ctrl->>OSMD: Renderiza o MusicXML correspondente à clave selecionada
    else Reimportação de MusicXML no Painel do Administrador
        User->>TopBar: (Modo Admin) Clica em "Reimportar MusicXML" na Lição/Clave ou Hino
        TopBar->>App: onReimportScoreXml(scoreId, novoXml, targetClef)
        App->>Math: reimportScoreMusicXmlInStorage(catalog, scoreId, novoXml, targetClef)
        Math-->>App: Catálogo atualizado e persistido em localStorage
        App->>Ctrl: Recarrega imediatamente a partitura atualizada no palco
    end
```

---

## 4. Máquina de Estados de Reprodução, Loop e Modo Foco (`stateDiagram-v2`)

```mermaid
stateDiagram-v2
    [*] --> Parado

    state Parado {
        [*] --> PartituraCompleta
        PartituraCompleta --> LoopAtivo : Clica em Loop ou Arrasta na Partitura
        LoopAtivo --> ModoFocoIsolado : Clica em "Foco" na Pílula Flutuante (Transição Suave Horizontal)
        ModoFocoIsolado --> LoopAtivo : Clica em "Fechar" no Foco
        LoopAtivo --> PartituraCompleta : Clica em "✕" ou desativa Loop
    }

    Parado --> ContagemRegressiva : Play (se Count-in habilitado para a condição atual)
    Parado --> Tocando : Play (sem Count-in)
    ContagemRegressiva --> Tocando : Último tempo da contagem concluído
    Tocando --> Parado : Pause / Fim da Partitura (sem Loop)
    Tocando --> Tocando : Reinício automático do trecho em Loop (+ incremento BPM se Treino de Velocidade ativo)
```
