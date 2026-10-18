---
trigger: glob
globs: *.tsx, *.css
---

# Regra de Design e Interface: Blueprint Visual do Issa Academy

---

## 🎨 Sistema de Design e Cores (Tema Claro Juicy/Gamificado)
O design é limpo, infantilizado/educativo e com cantos bem arredondados para simular um aplicativo gamificado moderno (Duolingo-like).

### Paleta Cromática
- **Fundo da Aplicação (`body`)**: `#ffffff` (Branco puro)
- **Fundo dos Cards/Superfícies**: `#f7f9fa` (Cinza azulado suave)
- **Texto Principal**: `#334155` (Slate 700) ou `#4b4b4b`
- **Texto Secundário / Labels**: `#94a3b8` (Slate 400) ou `#afafaf`
- **Bordas Físicas**: `2px solid #cbd5e1` (Slate 300) ou `#e2e8f0`

### Cores de Destaque / Identidade de Módulos
- **Azul Principal da Marca**: `#1a3c5a` (Issa Academy Deep Blue)
- **Destaque de Excelência / Ouro**: `#c5a059` (Gold/Amber)
- **Módulo Mestre da Clave**: `#1cb0f6` (Sky Blue) - para botões, cards ativos e barra de XP.
- **Módulo Simulado MSA**: `#58cc02` (Emerald Green) - para botões e feedbacks corretos.

---

## 📐 Tipografia e Bordas
- **Fonte Principal (Sans-serif)**: `'Nunito'`, sans-serif. Deve ser usada em botões, títulos e textos explicativos.
- **Fonte de Códigos e Dados (Monospace)**: `'JetBrains Mono'`, monospace. Usada para frequências, eixos e notas técnicas (ex: `261.63 Hz`).
- **Arredondamento de Cantos (Border Radius)**:
  - Cards, Modais e Botões principais: `rounded-2xl` (16px) ou `rounded-3xl` (24px).
  - Ícones e badges de status: `rounded-xl` (12px).

---

## 📱 Responsividade e Mobile-First
1. **Prioridade de Tela**: Todas as interfaces devem caber em telas com largura mínima de `360px` sem truncar botões ou textos essenciais.
2. **Acessibilidade de Toque**: Botões interativos em celulares devem ter dimensões mínimas de `44px x 44px` de área de toque.
3. **Travas de Orientação (Landscape)**:
   - Interfaces muito largas ou complexas (como a pauta Canvas e o teclado interativo) ficam ilegíveis na vertical em celulares.
   - O agente deve obrigatoriamente forçar o modo horizontal utilizando o `@src/core/components/OrientationGuard.tsx` para:
     - Jogo **Mestre da Clave** (`/mestre-da-clave`)
   - O guarda de orientação exibe uma tela com desfoque `backdrop-blur-md` e animação instruindo a rotação do aparelho.

---

## 🎬 Animações e Transições (`motion`)
- Transições de tela devem usar `<AnimatePresence>` com deslocamentos suaves no eixo Y ou X:
  - Entrada: `opacity: 0, y: 15` para `opacity: 1, y: 0`
  - Saída: `opacity: 0, y: -15`
- Feedback tátil em botões: usar efeitos ativos de encolhimento como `active:scale-[0.98]` e hover com mudança de bordas.

---

## 🎮 Diretrizes de Jogos e Canvas 2D
1. **Renderização HiDPI Obrigatória**:
   - Elementos `<canvas>` devem sincronizar a resolução do buffer com a densidade de pixels do dispositivo para evitar borrão em telas móveis e Retina:
     `canvas.width = Math.round(container.clientWidth * window.devicePixelRatio)`
     `canvas.height = Math.round(container.clientHeight * window.devicePixelRatio)`
   - No loop de desenho, aplicar `ctx.scale(dpr, dpr)` no início do frame para manter todos os cálculos em pixels lógicos CSS.
2. **Invariância de Tempo de Reação (Velocidade Normalizada)**:
   - Nunca utilize velocidades fixas em pixels (`px/s`) sem compensar a largura da tela. A velocidade efetiva deve escalar proporcionalmente à largura útil da viewport:
     `const responsiveSpeedMultiplier = Math.max(1, (logicalWidth + 50 - hitZoneEnd) / 574);`
     Isso garante que o aluno tenha exatamente a mesma janela temporal de reação (~3,8s) em celulares e monitores desktop.
3. **Z-Order de Elementos Musicais**:
   - Linhas suplementares e guias de pauta devem ser renderizadas **antes** das cabeças de notas para que o brilho tridimensional e reflexos especulares não sejam cortados por linhas escuras.
4. **Contraste de Teclados Virtuais**:
   - Teclas inativas atenuadas devem ter fundo opaco legível (ex: `bg-slate-200/90 text-slate-500`), nunca transparência crua sobre fundos escuros que degrade o contraste para cinza ilegível.
