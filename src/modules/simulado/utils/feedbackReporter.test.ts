import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isQuestionReported,
  submitQuestionFeedback,
  formatFeedbackReportText,
  buildGitHubIssueUrl,
  sendFeedbackToWebhook,
  getPendingFeedbackQueue,
  enqueuePendingFeedback,
  clearPendingFeedbackQueue,
  flushPendingFeedbacks,
  FEEDBACK_REASONS_MAP,
  type QuestionFeedbackPayload,
} from './feedbackReporter';

describe('Question Feedback Reporter (feedbackReporter.ts)', () => {
  beforeEach(() => {
    localStorage.clear();
    delete window.gtag;
    delete window.clarity;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('FEEDBACK_REASONS_MAP', () => {
    it('should map all reasons to descriptive Portuguese labels', () => {
      expect(FEEDBACK_REASONS_MAP.gabarito_duvidoso).toContain('Gabarito');
      expect(FEEDBACK_REASONS_MAP.referencia_msa).toContain('MSA');
      expect(FEEDBACK_REASONS_MAP.erro_digitacao).toContain('digitação');
      expect(FEEDBACK_REASONS_MAP.outro).toContain('Outra');
    });
  });

  describe('isQuestionReported & submitQuestionFeedback with localStorage', () => {
    const samplePayload: QuestionFeedbackPayload = {
      questionId: 'f05_q001',
      pergunta: 'Qual a fórmula de compasso?',
      fase: 5,
      periodo: 2,
      pagina: 42,
      item: '5.1',
      reason: 'gabarito_duvidoso',
      comment: 'A alternativa C parece ser a correta segundo a pág. 42.',
    };

    it('should report false when no feedback was submitted for a question', () => {
      expect(isQuestionReported('f05_q001')).toBe(false);
    });

    it('should save questionId to localStorage and return true on isQuestionReported', () => {
      submitQuestionFeedback(samplePayload);
      expect(isQuestionReported('f05_q001')).toBe(true);
      expect(isQuestionReported('f05_q002')).toBe(false);

      const savedFeedbacks = JSON.parse(
        localStorage.getItem('simulado_question_feedbacks') || '[]',
      );
      expect(savedFeedbacks.length).toBe(1);
      expect(savedFeedbacks[0].questionId).toBe('f05_q001');
      expect(savedFeedbacks[0].reason).toBe('gabarito_duvidoso');
      expect(savedFeedbacks[0].timestamp).toBeDefined();
    });

    it('should not duplicate questionId in reported ids list when submitted multiple times', () => {
      submitQuestionFeedback(samplePayload);
      submitQuestionFeedback(samplePayload);

      const reportedIds = JSON.parse(
        localStorage.getItem('simulado_reported_questions') || '[]',
      );
      expect(reportedIds.filter((id: string) => id === 'f05_q001').length).toBe(1);
    });

    it('should cap stored feedbacks to 50 items', () => {
      for (let i = 1; i <= 60; i++) {
        submitQuestionFeedback({
          questionId: `q_${i}`,
          pergunta: `Pergunta ${i}`,
          reason: 'outro',
        });
      }

      const savedFeedbacks = JSON.parse(
        localStorage.getItem('simulado_question_feedbacks') || '[]',
      );
      expect(savedFeedbacks.length).toBe(50);
      expect(savedFeedbacks[savedFeedbacks.length - 1].questionId).toBe('q_60');
    });

    it('should handle corrupted localStorage gracefully without throwing', () => {
      localStorage.setItem('simulado_reported_questions', 'invalid_json{');
      expect(isQuestionReported('q_1')).toBe(false);
    });
  });

  describe('Analytics Dispatch (GA4 & Microsoft Clarity)', () => {
    it('should dispatch custom GA4 event if window.gtag is available', () => {
      const gtagSpy = vi.fn();
      window.gtag = gtagSpy;

      submitQuestionFeedback({
        questionId: 'f10_q005',
        pergunta: 'Pergunta teste',
        fase: 10,
        periodo: 4,
        reason: 'referencia_msa',
        comment: 'Página divergente',
      });

      expect(gtagSpy).toHaveBeenCalledTimes(1);
      expect(gtagSpy).toHaveBeenCalledWith('event', 'question_feedback', {
        question_id: 'f10_q005',
        fase: 10,
        periodo: 4,
        reason: 'referencia_msa',
        reason_label: FEEDBACK_REASONS_MAP.referencia_msa,
        has_comment: true,
      });
    });

    it('should dispatch custom Clarity tag & event if window.clarity is available', () => {
      const claritySpy = vi.fn();
      window.clarity = claritySpy;

      submitQuestionFeedback({
        questionId: 'f14_q002',
        pergunta: 'Pergunta teste',
        reason: 'erro_digitacao',
      });

      expect(claritySpy).toHaveBeenCalledWith('set', 'question_feedback_id', 'f14_q002');
      expect(claritySpy).toHaveBeenCalledWith('set', 'question_feedback_reason', 'erro_digitacao');
      expect(claritySpy).toHaveBeenCalledWith('event', 'question_feedback');
    });
  });

  describe('formatFeedbackReportText', () => {
    it('should format a clean plain text report with references and comment', () => {
      const text = formatFeedbackReportText({
        questionId: 'f04_q010',
        pergunta: 'O que é pulsação?',
        fase: 4,
        periodo: 2,
        pagina: 30,
        item: '4.2',
        reason: 'gabarito_duvidoso',
        comment: 'Dúvida na alternativa B',
        timestamp: 1700000000000,
      });

      expect(text).toContain('📌 [Reporte de Questão - Issa Academy]');
      expect(text).toContain('• ID da Questão: f04_q010');
      expect(text).toContain('• Referência MSA: Fase 4 • Pág. 30 • Item 4.2');
      expect(text).toContain('• Motivo: Gabarito ou resposta correta duvidosa');
      expect(text).toContain('• Observação do Aluno: "Dúvida na alternativa B"');
      expect(text).toContain('• Enunciado: "O que é pulsação?"');
    });

    it('should omit reference and comment lines if not provided', () => {
      const text = formatFeedbackReportText({
        questionId: 'f01_q001',
        pergunta: 'O que é música?',
        reason: 'outro',
        timestamp: 1700000000000,
      });

      expect(text).toContain('• ID da Questão: f01_q001');
      expect(text).not.toContain('• Referência MSA:');
      expect(text).not.toContain('• Observação do Aluno:');
    });
  });

  describe('buildGitHubIssueUrl', () => {
    it('should construct a pre-filled GitHub Issue URL with encoded title, body, and labels', () => {
      const url = buildGitHubIssueUrl({
        questionId: 'f12_q003',
        pergunta: 'Definição de quiáltera',
        fase: 12,
        periodo: 4,
        pagina: 88,
        item: '12.1',
        reason: 'gabarito_duvidoso',
        comment: 'Acho que a alternativa A está errada',
      });

      expect(url).toContain('https://github.com/issacarbarbosa/issa-academy/issues/new');
      expect(url).toContain('labels=question-feedback');
      expect(url).toContain(encodeURIComponent('[Questão f12_q003]'));
      expect(url).toContain(encodeURIComponent('Definição de quiáltera'));
      expect(url).toContain(encodeURIComponent('Acho que a alternativa A está errada'));
    });
  });

  describe('Google Sheets Webhook & Offline Queueing', () => {
    const testPayload: QuestionFeedbackPayload = {
      questionId: 'f03_q007',
      pergunta: 'Pergunta teste webhook',
      fase: 3,
      reason: 'gabarito_duvidoso',
      comment: 'Possível erro de gabarito',
      timestamp: 1700000000000,
    };
    const mockWebhookUrl = 'https://script.google.com/macros/s/AKfycbz_test/exec';

    it('sendFeedbackToWebhook should return false when webhookUrl is empty', async () => {
      const result = await sendFeedbackToWebhook(testPayload, '');
      expect(result).toBe(false);
    });

    it('sendFeedbackToWebhook should perform fetch with mode no-cors and return true on success', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(new Response('OK'));
      vi.stubGlobal('fetch', fetchSpy);

      const result = await sendFeedbackToWebhook(testPayload, mockWebhookUrl);
      expect(result).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith(
        mockWebhookUrl,
        expect.objectContaining({
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(testPayload),
        }),
      );
    });

    it('sendFeedbackToWebhook should catch fetch failure and return false', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
      const result = await sendFeedbackToWebhook(testPayload, mockWebhookUrl);
      expect(result).toBe(false);
    });

    it('getPendingFeedbackQueue and enqueuePendingFeedback should manage offline queue properly', () => {
      expect(getPendingFeedbackQueue()).toEqual([]);

      enqueuePendingFeedback(testPayload);
      expect(getPendingFeedbackQueue().length).toBe(1);
      expect(getPendingFeedbackQueue()[0].questionId).toBe('f03_q007');

      // Duplicate with same questionId and timestamp should be ignored
      enqueuePendingFeedback(testPayload);
      expect(getPendingFeedbackQueue().length).toBe(1);

      clearPendingFeedbackQueue();
      expect(getPendingFeedbackQueue()).toEqual([]);
    });

    it('flushPendingFeedbacks should send items and clear queue on success', async () => {
      enqueuePendingFeedback(testPayload);
      enqueuePendingFeedback({ ...testPayload, questionId: 'f03_q008', timestamp: 1700000001000 });
      expect(getPendingFeedbackQueue().length).toBe(2);

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('OK')));

      const flushed = await flushPendingFeedbacks(mockWebhookUrl);
      expect(flushed).toBe(2);
      expect(getPendingFeedbackQueue().length).toBe(0);
    });

    it('submitQuestionFeedback should sync directly when online and webhook is set', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('OK')));

      const res = await submitQuestionFeedback(testPayload, mockWebhookUrl);
      expect(res.synced).toBe(true);
      expect(res.queued).toBe(false);
      expect(getPendingFeedbackQueue().length).toBe(0);
    });

    it('submitQuestionFeedback should enqueue in offline queue when fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')));

      const res = await submitQuestionFeedback(testPayload, mockWebhookUrl);
      expect(res.synced).toBe(false);
      expect(res.queued).toBe(true);
      expect(getPendingFeedbackQueue().length).toBe(1);
    });
  });
});
