# Issa Academy • Ensino Musical CCB

Plataforma educacional gamificada de ensino musical voltada para o método **MSA (Método Simplificado de Aprendizagem Musical)** da Congregação Cristã no Brasil (CCB), com foco na preparação de candidatos a músicos e organistas.

Disponível ao vivo em: **[https://issacarbarbosa.github.io/issa-academy/](https://issacarbarbosa.github.io/issa-academy/)**

---

## 🎯 Módulos Ativos

1. **🏠 Home (`/#/`):**
   - Recepção do mascote Fufu.
   - Navegação direta para os modos de estudo e jogo.
   - Link direto para o Canal Oficial no YouTube.

2. **🎮 Mestre da Clave (`/#/mestre-da-clave`):**
   - Jogo interativo de leitura rápida de notas na pauta musical.
   - Renderização a 60fps em HTML5 Canvas com motor de física e partículas desacopladas (`src/modules/mestre-da-clave/engine/gameEntities.ts`).
   - **Multi-Clave Oficial SMuFL (Bravura / W3C)**: Suporte completo para **Clave de Sol na 2ª linha** (`𝄞`), **Clave de Fá na 4ª linha** (`𝄢`) e **Clave de Dó na 3ª linha** (`𝄡`).
   - Progressão diatônica de 13 notas por clave (`pos -2` a `10`), sistema de vidas, níveis dinâmicos e persistência de recorde independente por clave no `localStorage`.
   - Normalização responsiva de velocidade da pauta (~3.8s de reação em qualquer tela) e atalhos de teclado físico no desktop (`1-7`, `C-B`, `Espaço`/`Esc`).
   - Proteção de orientação de tela em dispositivos móveis (`OrientationGuard`) com saída de emergência.

3. **📝 Simulado MSA (`/#/simulado`):**
   - **Dual-Mode**: Escolha entre o modo **"Por Período (20 questões)"** ou **"Por Fase (10 questões)"** com multi-seleção de fases.
   - **Catálogo Completo das 16 Fases**: 552 questões autênticas baseadas no método MSA, com referências oficiais de página e item, blindadas via **Zod** (`src/modules/simulado/questions/schema.ts`).
   - Sorteio estocástico uniforme de questões e alternativas via algoritmo Fisher-Yates (25% A/B/C/D).
   - Síntese de áudio acústico em tempo de execução via Web Audio API para acertos (arpejo maior) e erros (dissonância harmônica).
   - Fórmulas de compasso renderizadas em frações verticais puras em JSX (seguras contra XSS).
   - Reações dinâmicas e justificativas pedagógicas com stickers do mascote Fufu.
   - **Sistema de Feedback & Reporte**: Envio automático de sugestões e correções via Webhook do Google Apps Script com fila offline-first PWA no `localStorage`.

---

## 🛠️ Stack Tecnológica

- **Frontend:** [React 19](https://react.dev/) (SPA com Code Splitting via `React.lazy` e `<Suspense>`)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animações:** [Motion / Framer Motion](https://motion.dev/)
- **Áudio:** Web Audio API (síntese acústica de órgão com ondas triangle e envelopes ADSR)
- **Validação de Dados:** [Zod](https://zod.dev/)
- **PWA & Offline:** [Vite Plugin PWA](https://vite-pwa-org.netlify.app/) com Workbox
- **Tipagem:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode com 0 erros e sem `any`)
- **Testes Unitários:** [Vitest](https://vitest.dev/) com Testing Library
- **CI/CD & Hospedagem:** GitHub Actions + GitHub Pages

---

## 📁 Arquitetura do Projeto

```text
src/
├── core/                        # Núcleo compartilhado da aplicação
│   ├── components/              # Guardas de UX (OrientationGuard)
│   ├── hooks/                   # useLocalStorage, useMobileOrientation
│   ├── utils/                   # Síntese de áudio (audio.ts), notas (notesData.ts), getAssetUrl (paths.ts)
│   └── types.ts                 # Tipagens centrais
└── modules/                     # Domínios de negócio isolados
    ├── home/                    # WelcomeHome.tsx
    ├── mestre-da-clave/         # MestreDaClave.tsx e engine/ (gameEntities.ts)
    └── simulado/                # SimuladoMsa.tsx e questions/ (JSONs e schema.ts)
```

---

## 🚀 Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar servidor local de desenvolvimento (localhost:3000)
npm run dev

# Checagem estrita de tipos TypeScript
npm run typecheck

# Executar linter ESLint
npm run lint

# Executar suíte de testes unitários
npm run test

# Gerar compilação de produção e PWA
npm run build
```

---

## 🌐 Deploy Contínuo (CI/CD)

O projeto possui um workflow automatizado em `.github/workflows/deploy.yml`. Todo `git push` realizado na branch `main` dispara o pipeline de compilação e publica a nova versão automaticamente no GitHub Pages:
**`https://issacarbarbosa.github.io/issa-academy/`**
