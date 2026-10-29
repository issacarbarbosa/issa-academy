export type FeedbackReason =
  | 'gabarito_duvidoso'
  | 'referencia_msa'
  | 'erro_digitacao'
  | 'outro';

export const FEEDBACK_REASONS_MAP: Record<FeedbackReason, string> = {
  gabarito_duvidoso: 'Gabarito ou resposta correta duvidosa',
  referencia_msa: 'Página ou tópico do MSA divergente',
  erro_digitacao: 'Erro de digitação ou formatação no texto',
  outro: 'Outra sugestão ou observação',
};

export interface QuestionFeedbackPayload {
  questionId: string;
  pergunta: string;
  fase?: number;
  periodo?: number;
  pagina?: number;
  item?: string | number;
  reason: FeedbackReason;
  comment?: string;
  timestamp?: number;
}

export interface FeedbackSubmissionResult {
  synced: boolean;
  queued: boolean;
}

const STORAGE_KEY_REPORTED_IDS = 'simulado_reported_questions';
const STORAGE_KEY_FEEDBACKS = 'simulado_question_feedbacks';
const STORAGE_KEY_PENDING_QUEUE = 'simulado_pending_feedback_queue';

/**
 * Endpoint padrão do Webhook (Google Apps Script).
 * Pode ser sobrescrito via variável de ambiente VITE_FEEDBACK_WEBHOOK_URL.
 */
export const DEFAULT_FEEDBACK_WEBHOOK_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_FEEDBACK_WEBHOOK_URL) ||
  'https://script.google.com/macros/s/AKfycbxKkNOnpNPdD4bW3XplitK6bu3xAVJg95-sLfDoKncY98GwO4ThdSCUCU7G60mFu76u/exec';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export function isQuestionReported(questionId: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTED_IDS);
    if (!raw) return false;
    const ids = JSON.parse(raw);
    return Array.isArray(ids) && ids.includes(questionId);
  } catch {
    return false;
  }
}

/**
 * Lê a fila de feedbacks pendentes de envio (offline-first).
 */
export function getPendingFeedbackQueue(): QuestionFeedbackPayload[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING_QUEUE);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Enfileira um feedback na fila local para envio posterior quando a internet retornar.
 */
export function enqueuePendingFeedback(payload: QuestionFeedbackPayload): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const queue = getPendingFeedbackQueue();
    // Evita duplicatas idênticas pendentes
    const exists = queue.some(
      (item) => item.questionId === payload.questionId && item.timestamp === payload.timestamp,
    );
    if (!exists) {
      queue.push(payload);
      localStorage.setItem(STORAGE_KEY_PENDING_QUEUE, JSON.stringify(queue.slice(-50)));
    }
  } catch (e) {
    console.warn('Erro ao salvar feedback na fila offline:', e);
  }
}

/**
 * Limpa a fila de feedbacks pendentes.
 */
export function clearPendingFeedbackQueue(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(STORAGE_KEY_PENDING_QUEUE);
  } catch {
    // Silencia erros de acesso ao storage
  }
}

/**
 * Envia o payload do feedback diretamente para o Webhook (Google Sheets).
 * Utiliza Content-Type 'text/plain;charset=utf-8' e mode 'no-cors' para evitar
 * o bloqueio de preflight CORS típico do Google Apps Script em navegadores.
 */
export async function sendFeedbackToWebhook(
  payload: QuestionFeedbackPayload,
  webhookUrl: string = DEFAULT_FEEDBACK_WEBHOOK_URL,
): Promise<boolean> {
  if (!webhookUrl || typeof fetch === 'undefined') {
    return false;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.warn('Falha na comunicação com o Webhook de Feedback:', error);
    return false;
  }
}

/**
 * Tenta descarregar todos os feedbacks acumulados na fila offline para a planilha remota.
 * Retorna o número de itens enviados com sucesso.
 */
export async function flushPendingFeedbacks(
  webhookUrl: string = DEFAULT_FEEDBACK_WEBHOOK_URL,
): Promise<number> {
  if (!webhookUrl) return 0;
  const queue = getPendingFeedbackQueue();
  if (queue.length === 0) return 0;

  const remaining: QuestionFeedbackPayload[] = [];
  let flushedCount = 0;

  for (const item of queue) {
    const ok = await sendFeedbackToWebhook(item, webhookUrl);
    if (ok) {
      flushedCount++;
    } else {
      remaining.push(item);
    }
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (remaining.length === 0) {
        clearPendingFeedbackQueue();
      } else {
        localStorage.setItem(STORAGE_KEY_PENDING_QUEUE, JSON.stringify(remaining));
      }
    } catch {
      // Silencia erros de storage
    }
  }

  return flushedCount;
}

// Ouvinte automático: descarrega a fila quando o navegador recuperar a conexão de rede
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void flushPendingFeedbacks();
  });
}

/**
 * Processa o envio completo do feedback do aluno:
 * 1. Dispara telemetria para GA4 e Microsoft Clarity.
 * 2. Persiste histórico local no dispositivo do aluno.
 * 3. Envia para o Webhook do Google Sheets (ou enfileira na fila offline caso sem conexão).
 */
export async function submitQuestionFeedback(
  payload: QuestionFeedbackPayload,
  webhookUrl: string = DEFAULT_FEEDBACK_WEBHOOK_URL,
): Promise<FeedbackSubmissionResult> {
  const ts = payload.timestamp || Date.now();
  const fullPayload: QuestionFeedbackPayload = { ...payload, timestamp: ts };

  // 1. Google Analytics 4 Custom Event
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', 'question_feedback', {
        question_id: fullPayload.questionId,
        fase: fullPayload.fase || 0,
        periodo: fullPayload.periodo || 0,
        reason: fullPayload.reason,
        reason_label: FEEDBACK_REASONS_MAP[fullPayload.reason],
        has_comment: Boolean(fullPayload.comment && fullPayload.comment.trim()),
      });
    } catch (e) {
      console.warn('Erro ao disparar evento de feedback no GA4:', e);
    }
  }

  // 2. Microsoft Clarity Custom Tag & Event
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    try {
      window.clarity('set', 'question_feedback_id', fullPayload.questionId);
      window.clarity('set', 'question_feedback_reason', fullPayload.reason);
      window.clarity('event', 'question_feedback');
    } catch (e) {
      console.warn('Erro ao disparar evento de feedback no Clarity:', e);
    }
  }

  // 3. Persistência Local (localStorage)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      // Atualiza lista de IDs reportados
      const rawIds = localStorage.getItem(STORAGE_KEY_REPORTED_IDS);
      const reportedIds: string[] = rawIds ? JSON.parse(rawIds) : [];
      if (!reportedIds.includes(fullPayload.questionId)) {
        reportedIds.push(fullPayload.questionId);
        localStorage.setItem(STORAGE_KEY_REPORTED_IDS, JSON.stringify(reportedIds));
      }

      // Adiciona o payload completo no histórico local
      const rawFeedbacks = localStorage.getItem(STORAGE_KEY_FEEDBACKS);
      const feedbacks: QuestionFeedbackPayload[] = rawFeedbacks ? JSON.parse(rawFeedbacks) : [];
      feedbacks.push(fullPayload);
      localStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(feedbacks.slice(-50)));
    } catch (e) {
      console.warn('Erro ao salvar feedback de questão no localStorage:', e);
    }
  }

  // 3.1 Espelhamento na Camada Supabase / ContentStore
  try {
    const { contentStore } = await import('../../../core/services/contentStore');
    void contentStore.submitFeedback({
      questionId: fullPayload.questionId,
      fase: fullPayload.fase || 0,
      periodo: fullPayload.periodo || 0,
      reason: FEEDBACK_REASONS_MAP[fullPayload.reason] || fullPayload.reason,
      comment: fullPayload.comment,
      questionSnapshot: fullPayload.pergunta,
    });
  } catch {
    // Falha silenciosa para não interromper fluxo do aluno
  }

  // 4. Envio ao Webhook Remoto / Fila Offline
  const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

  if (webhookUrl && isOnline) {
    const success = await sendFeedbackToWebhook(fullPayload, webhookUrl);
    if (success) {
      // Tenta também descarregar outros pendentes acumulados caso existam
      void flushPendingFeedbacks(webhookUrl);
      return { synced: true, queued: false };
    }
  }

  // Se não foi possível enviar imediatamente (offline ou webhook não configurado ou erro de rede),
  // guarda na fila offline se houver webhookUrl configurado
  if (webhookUrl) {
    enqueuePendingFeedback(fullPayload);
    return { synced: false, queued: true };
  }

  return { synced: false, queued: false };
}

export function formatFeedbackReportText(payload: QuestionFeedbackPayload): string {
  const reasonText = FEEDBACK_REASONS_MAP[payload.reason] || payload.reason;
  const refParts = [
    payload.fase ? `Fase ${payload.fase}` : '',
    payload.pagina ? `Pág. ${payload.pagina}` : '',
    payload.item ? `Item ${payload.item}` : '',
  ]
    .filter(Boolean)
    .join(' • ');

  let report = `📌 [Reporte de Questão - Issa Academy]\n`;
  report += `• ID da Questão: ${payload.questionId}\n`;
  if (refParts) report += `• Referência MSA: ${refParts}\n`;
  report += `• Motivo: ${reasonText}\n`;
  if (payload.comment && payload.comment.trim()) {
    report += `• Observação do Aluno: "${payload.comment.trim()}"\n`;
  }
  report += `• Enunciado: "${payload.pergunta}"\n`;
  report += `• Data: ${new Date(payload.timestamp || Date.now()).toLocaleString('pt-BR')}`;
  return report;
}

export function buildGitHubIssueUrl(payload: QuestionFeedbackPayload): string {
  const repoUrl = 'https://github.com/issacarbarbosa/issa-academy/issues/new';
  const reasonText = FEEDBACK_REASONS_MAP[payload.reason] || payload.reason;
  const title = encodeURIComponent(`[Questão ${payload.questionId}] ${reasonText}`);

  const bodyContent = `### 📋 Dados da Questão
- **ID:** \`${payload.questionId}\`
- **Fase:** ${payload.fase || 'N/A'} (Período ${payload.periodo || 'N/A'})
- **Página MSA:** ${payload.pagina || 'N/A'} (${payload.item || 'N/A'})
- **Motivo do Reporte:** ${reasonText}

### ❓ Enunciado
> ${payload.pergunta}

### 💬 Observações do Aluno
${payload.comment && payload.comment.trim() ? payload.comment.trim() : '_Nenhuma observação adicional digitada._'}

---
_Enviado via Simulado MSA • Issa Academy_`;

  const body = encodeURIComponent(bodyContent);
  return `${repoUrl}?title=${title}&body=${body}&labels=question-feedback`;
}
