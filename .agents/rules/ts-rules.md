---
trigger: glob
globs: *.ts, *.tsx
---

# Regras de TypeScript & React

## Stack Padrão do Projeto
- **TypeScript**: Strict Mode e `"noImplicitAny": true` obrigatórios.
- **React 19 (SPA)**: Vite 6 + React Router v7 (`<HashRouter>` e `React.lazy`).
- **PWA**: Offline-First (`vite-plugin-pwa` + Workbox).
- **Estilos**: Tailwind CSS v4 (Cores vibrantes, tema claro).
- **Blindagem de Dados**: Zod (validação estrita de schemas em tempo de execução via `schema.ts`).
- **Testes**: Vitest + Testing Library (testes unitários co-localizados no ambiente JSDOM).

## Padrões Arquiteturais
- **Organização Modular por Feature:** A pasta `src/modules/` abriga os domínios isolados (`home/`, `mestre-da-clave/`, `simulado/`). Cada módulo encapsula seus componentes, lógica de jogo ou simulado, dados locais e testes.
- **Roteamento Declarativo e Code Splitting:** A navegação reside em `App.tsx` via `<HashRouter>` e `<Routes>`. Telas principais utilizam `React.lazy` com `<Suspense>`. Telas de rota priorizam `useNavigate()` e `useLocation()`.
- **Blindagem Sem `any`:** O uso do tipo `any` é proibido. Dados dinâmicos/externos (como arquivos JSON em `questions/*.json`) devem ser validados com schemas Zod (`validateQuestionBank`).
- **Testes Co-localizados:** Todos os testes unitários (`*.test.ts` ou `*.test.tsx`) devem residir na mesma pasta que o código testado (ex.: `notesData.test.ts` ao lado de `notesData.ts`, `schema.test.ts` ao lado de `schema.ts`).

## Convenções de Nomenclatura
- Componentes: `PascalCase.tsx` (ex.: `MestreDaClave.tsx`, `SimuladoMsa.tsx`)
- Utilitários e Helpers: `camelCase.ts` (ex.: `audio.ts`, `paths.ts`)
- Hooks Customizados: `use[Nome].ts` (ex.: `useMobileOrientation.ts`, `useLocalStorage.ts`)
- Tipos Locais: `[modulo].types.ts` ou interfaces co-localizadas
- Barrel Exports: Use `index.ts` apenas dentro de pastas compartilhadas em `src/core/` (como `src/core/components/index.ts`).
- Path Aliases: O alias `@/*` aponta para `./src/*` em `tsconfig.json`; mantenha imports limpos e consistentes.
