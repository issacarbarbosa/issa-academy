# Issa Academy • Ensino Musical CCB

Plataforma educacional gamificada de ensino musical voltada para o método **MSA (Método Simplificado de Aprendizagem Musical)** da Congregação Cristã no Brasil (CCB), com foco na preparação de candidatos a músicos e organistas.

Disponível ao vivo em: **[https://issacarbarbosa.github.io/issa-academy/](https://issacarbarbosa.github.io/issa-academy/)**

---

## 🎯 Módulos Ativos

1. **🏠 Home (`/#/`):**
   - Recepção do mascote Fufu.
   - Navegação direta para os modos de estudo e jogo.

2. **🎮 Mestre da Clave (`/#/mestre-da-clave`):**
   - Jogo interativo de leitura rápida de notas na pauta musical.
   - Renderização a 60fps em HTML5 Canvas com motor de física e partículas desacopladas (`src/modules/mestre-da-clave/engine/gameEntities.ts`).
   - Progressão de notas (Dó a Si), sistema de vidas, níveis dinâmicos e persistência de recorde via `localStorage`.
   - Proteção de orientação de tela em dispositivos móveis (`OrientationGuard`).

3. **📝 Simulado MSA (`/#/simulado`):**
   - Questões reais do método com gabarito oficial e cronômetro.
   - Sorteio estocástico uniforme de 20 questões via algoritmo Fisher-Yates.
   - Bancos de dados de questões tipados e blindados com validação estrita via **Zod** (`src/modules/simulado/questions/schema.ts`).
   - Síntese de áudio acústico em tempo de execução via Web Audio API para acertos e erros.
   - Fórmulas de compasso renderizadas em frações verticais puras em JSX (seguras contra XSS).
   - Reações dinâmicas e justificativas pedagógicas com stickers do mascote Fufu.

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
