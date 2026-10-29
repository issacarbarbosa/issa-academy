---
name: canvas-playtest
description: Use esta skill ao realizar playtests automatizados, testes visuais ou auditorias de UX/UI via navegador (/browser) em jogos e componentes renderizados em HTML5 Canvas (como o Mestre da Clave nas Claves de Sol, Fá e Dó).
---

# Automação e Playtest Determinístico em HTML5 Canvas (Multi-Clave)

Esta skill define o padrão de automação para jogos educativos em Canvas 2D a 60fps no Issa Academy, permitindo testar de forma determinística o jogo **Mestre da Clave** em qualquer uma das três claves (**Sol na 2ª linha**, **Fá na 4ª linha** e **Dó na 3ª linha**), evitando o erro de tentar adivinhar notas via leitura bruta de pixels (`getImageData`).

---

## 🚫 Por Que NÃO Usar `ctx.getImageData()`
1. **Distorção Cromática**: Zonas de acerto semitransparentes, sombras e efeitos de partículas alteram os valores RGB dos pixels em tempo de execução.
2. **Falsos Positivos**: Elementos com cores semelhantes (ex.: barra translúcida verde da zona de acerto vs. nota Fá verde `#2ecc71`) provocam leituras ambíguas e levam o robô a cometer erros e perder vidas.
3. **Desempenho**: `getImageData()` força sincronização com a GPU e introduz latência severa em loops assíncronos no DevTools.

---

## 🎯 Padrão Obrigatório: Interceptação de Protótipos (Monkey-Patching)

As cores de cada nota (`NOTE_COLORS`) são invariantes em todas as claves (`Dó`, `Ré`, `Mi`, `Fá`, `Sol`, `Lá`, `Si`), variando apenas a posição `y` no pentagrama e a frequência acústica de acordo com a clave selecionada (`sol`, `fa` ou `do`).

Injete o seguinte hook via `evaluate_script` no navegador antes de iniciar o gameplay:

```javascript
(() => {
  const COLOR_TO_NOTE = {
    '#e74c3c': 'Dó', '#e67e22': 'Ré', '#f1c40f': 'Mi',
    '#2ecc71': 'Fá', '#3498db': 'Sol', '#9b59b6': 'Lá', '#e84393': 'Si'
  };
  window.__detectedNotes = [];

  // 1. Captura a cor base no momento da criação do gradiente da nota
  const origAddStop = CanvasGradient.prototype.addColorStop;
  CanvasGradient.prototype.addColorStop = function(offset, color) {
    if (offset === 0.4) window.__lastGradColor = color;
    return origAddStop.call(this, offset, color);
  };

  // 2. Registra coordenadas exatas (x, y), nota e timestamp no desenho da elipse
  const origEllipse = CanvasRenderingContext2D.prototype.ellipse;
  CanvasRenderingContext2D.prototype.ellipse = function(x, y, ...rest) {
    window.__detectedNotes.push({
      x,
      y,
      color: window.__lastGradColor,
      note: COLOR_TO_NOTE[window.__lastGradColor],
      t: performance.now()
    });
    if (window.__detectedNotes.length > 30) window.__detectedNotes.shift();
    return origEllipse.call(this, x, y, ...rest);
  };
})();
```

---

## 🎮 Roteiro de Auto-Play em Loop Único (DevTools)

Execute um loop de pooling assíncrono diretamente no navegador via `evaluate_script` para evitar overhead de rede entre chamadas de ferramentas:

```javascript
(async () => {
  const BUTTONS = Array.from(document.querySelectorAll('#musical-buttons-row button'));
  const NOTE_NAMES = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'];
  let lastHitTime = 0;

  for (let i = 0; i < 300; i++) { // ~30 segundos de gameplay contínuo
    const now = performance.now();
    const candidate = window.__detectedNotes
      ?.slice()
      .reverse()
      .find(n => now - n.t < 70 && n.x > 115 && n.x < 280);

    if (candidate && (now - lastHitTime > 240)) {
      const idx = NOTE_NAMES.indexOf(candidate.note);
      if (idx !== -1 && BUTTONS[idx]) {
        BUTTONS[idx].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        lastHitTime = now;
      }
    }
    await new Promise(r => setTimeout(r, 100));
  }
})();
```

---

## 🎼 Matriz de Validação Multi-Clave (Posições `-2` a `10`)

Ao testar cada clave no navegador, valide na tela inicial (`START`) e nos avisos de **Level Up** se as notas iniciais e desbloqueadas correspondem à clave ativa:

| Clave | Notas Iniciais (Nível 1: `pos -2` e `-1`) | Nota do Nível 2 (`pos 0` - 1ª Linha) | Nota do Nível 12 (`pos 10` - 1ª L. Sup. Superior) | Chave no `localStorage` |
| :--- | :--- | :--- | :--- | :--- |
| **Clave de Sol (2ª linha)** | **Dó** (`Dó3 Central`) e **Ré** (`Ré3`) | `Mi (1ª Linha)` | `Lá Agudo (1ª Linha Suplementar Superior)` | `mestreClave_record` |
| **Clave de Fá (4ª linha)** | **Mi** (`Mi1`) e **Fá** (`Fá1`) | `Sol (1ª Linha)` | `Dó Central (1ª Linha Suplementar Superior)` | `mestreClave_record_fa` |
| **Clave de Dó (3ª linha)** | **Ré** (`Ré2`) e **Mi** (`Mi2`) | `Fá (1ª Linha)` | `Si (1ª Linha Suplementar Superior)` | `mestreClave_record_do` |

---

## 📸 Validação e Captura de Eventos de Transição
- **Seleção de Clave**: Na tela `START`, clique em cada um dos seletores (`#clef-select-sol`, `#clef-select-fa`, `#clef-select-do`) e verifique a mudança imediata das notas iniciais e do recorde exibido.
- **Texto de Level Up**: Inspecione o texto de `#mestre-da-clave-screen` ao atingir 10 acertos para certificar-se de que a `Nova Nota` anunciada confere exatamente com a nota desbloqueada na clave selecionada.
- **Screenshots Sem FilePath**: Ao chamar `take_screenshot` no DevTools, nunca passe o argumento `filePath` (deixe a plataforma salvar o arquivo automaticamente no diretório do subagente).
