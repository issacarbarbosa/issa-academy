# Simulado MSA: Diretrizes de Engenharia e Pedagógicas

Este arquivo contém as regras e restrições obrigatórias para qualquer agente ou desenvolvedor atuando no módulo `src/modules/simulado`.

---

## 📋 1. Blindagem Zod e Integridade dos Bancos JSON (`questions/`)
- **Validação Estrutural Estrita**: Todos os 16 bancos (`q_f01.json` a `q_f16.json`) são validados pelo schema `SimuladoQuestionSchema` em `questions/schema.ts`. O uso de `any` é terminantemente proibido.
- **Volume Mínimo por Fase**: Cada fase deve conter **no mínimo 15 questões ativas** (`"ativo": true`) com balanceamento estático de 25% para alternativas A, B, C e D.
- **Auditoria Automatizada**: Ao modificar qualquer arquivo `q_f*.json`, execute:
  `node .agents/skills/question-bank-auditor/scripts/audit-banks.cjs --min-per-phase=15`

---

## 🎲 2. Duplo Embaralhamento Fisher-Yates & Segurança
- **Embaralhamento Completo em Runtime**: Toda inicialização de quiz deve passar por `prepareQuizQuestions()`, que embaralha tanto a ordem das questões sorteadas quanto a ordem do array `opcoes` de cada questão, garantindo que o gabarito mude de posição a cada tentativa.
- **Prevenção de XSS**: Proibido o uso de `dangerouslySetInnerHTML`. A formatação de fórmulas de compasso (ex.: 2/2, 4/4, 6/8) deve ser feita via JSX puro em componentes visuais dedicados.

---

## 🚩 3. Sistema de Feedback e Webhook Google Sheets
- **Contrato de Requisição HTTP**: A função `sendFeedbackToWebhook` em `utils/feedbackReporter.ts` conecta-se a um Google Apps Script. Para evitar bloqueio de preflight CORS pelo Google:
  - Utilize `mode: 'no-cors'`.
  - Utilize `Content-Type: text/plain;charset=utf-8` no body (JSON serializado em string pura).
- **Resiliência Offline-First (PWA)**: Se o envio falhar ou o dispositivo estiver offline, a função deve persistir o reporte na fila do `localStorage` (`simulado_pending_feedback_queue`). O evento `window.addEventListener('online', flushPendingFeedbacks)` é responsável pelo esvaziamento automático da fila.
