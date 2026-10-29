# Mestre da Clave: Diretrizes de Engenharia e Design

Este arquivo contém as regras e restrições obrigatórias para qualquer agente ou desenvolvedor atuando no módulo `src/modules/mestre-da-clave`.

---

## 🎮 1. Motor Gráfico e Loop Canvas a 60fps
- **Desacoplamento do Game Loop**: O `useEffect` do `requestAnimationFrame` em `MestreDaClave.tsx` NÃO deve ser recriado em mudanças de nível, pontuação ou estado volátil. Utilize `useRef` para parâmetros dinâmicos de renderização.
- **Isolamento de Entidades (`engine/gameEntities.ts`)**: Partículas, geração estocástica de notas, atualização de física e checagem de colisão devem viver encapsulados em `gameEntities.ts` e cobertos por testes unitários (`gameEntities.test.ts`).

---

## 🎼 2. Padrão Oficial SMuFL Bravura para Claves (`clefVectors.ts`)
- **Calibração Métrica Estrita**: A distância entre duas linhas consecutivas do pentagrama (`lineGap`) na fonte Bravura equivale a **362 unidades SMuFL** (`BRAVURA_STAFF_SPACE = 362`).
  - Fator de escala obrigatório: `const scale = lineGap / BRAVURA_STAFF_SPACE;`
- **Ancoragem Geométrica das Claves**:
  - **Clave de Sol**: Origem cravada na 2ª Linha (`y = staffCenterY + lineGap`).
  - **Clave de Fá**: Origem cravada na 4ª Linha (`y = staffCenterY - lineGap`), com bulbo central em `y = 0`, cauda até o 1º espaço (`-914`) e 2 pontos simétricos nos espaços 4 (`+181`) e 3 (`-181`).
  - **Clave de Dó**: Origem cravada na 3ª Linha (`y = staffCenterY`), com altura total de 4 espaços entre a 1ª e a 5ª linha.
- **Proibição**: Nunca utilize `ctx.fillText` com fontes do sistema (`Segoe UI Symbol` ou similares) para desenhar claves, pois elas distorcem baselines entre sistemas operacionais. Use sempre `drawTrebleClefVector`, `drawBassClefVector` e `drawAltoClefVector`.

---

## 📱 3. Responsividade, HiDPI e Velocidade Normalizada
- **HiDPI Obrigatório**: Ajuste o buffer do canvas multiplicando pelo `devicePixelRatio` e aplique `ctx.scale(dpr, dpr)` no início do desenho.
- **Invariância de Reação**: A velocidade das notas deve usar o multiplicador responsivo:
  `const responsiveSpeedMultiplier = Math.max(1, (logicalWidth + 50 - hitZoneEnd) / 574);`
  garantindo exatamente ~3,8 segundos de reação tanto no celular quanto no desktop.
- **Guarda de Orientação**: O jogo exige orientação horizontal e deve sempre ser protegido por `<OrientationGuard>` com saída de emergência ("Voltar ao Início").
