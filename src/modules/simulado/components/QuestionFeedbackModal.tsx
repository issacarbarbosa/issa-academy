import React, { useState } from 'react';
import { X, CheckCircle2, Copy, ExternalLink, Flag, Loader2 } from 'lucide-react';
import { getAssetUrl } from '../../../core/utils/paths';
import {
  FeedbackReason,
  FEEDBACK_REASONS_MAP,
  QuestionFeedbackPayload,
  submitQuestionFeedback,
  formatFeedbackReportText,
  buildGitHubIssueUrl,
} from '../utils/feedbackReporter';
import { SimuladoQuestionReference } from '../questions/schema';

interface QuestionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    id: string;
    pergunta: string;
    referencia?: SimuladoQuestionReference;
  } | null;
  onFeedbackSubmitted?: (questionId: string) => void;
}

export const QuestionFeedbackModal: React.FC<QuestionFeedbackModalProps> = ({
  isOpen,
  onClose,
  question,
  onFeedbackSubmitted,
}) => {
  const [reason, setReason] = useState<FeedbackReason>('gabarito_duvidoso');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !question) return null;

  const currentPayload: QuestionFeedbackPayload = {
    questionId: question.id,
    pergunta: question.pergunta,
    fase: question.referencia?.fase,
    periodo: question.referencia?.periodo,
    pagina: question.referencia?.pagina,
    item: question.referencia?.item,
    reason,
    comment,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitQuestionFeedback(currentPayload);
      setIsSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(question.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReport = async () => {
    try {
      const text = formatFeedbackReportText(currentPayload);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Falha ao copiar para a área de transferência:', err);
    }
  };

  const handleClose = () => {
    setIsSubmitting(false);
    setIsSubmitted(false);
    setComment('');
    setReason('gabarito_duvidoso');
    setCopied(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      id="question-feedback-modal-root"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border-2 border-slate-200 animate-pop my-auto relative text-left">
        {/* Botão de Fechar X */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
          title="Fechar"
        >
          <X size={18} />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2 text-indigo-600">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                <Flag size={16} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Reportar Questão
              </h3>
            </div>

            {/* Metadados da questão */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-xs">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-slate-400 font-extrabold mb-1">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-600 font-bold">
                  ID: {question.id}
                </span>
                {question.referencia?.fase && (
                  <span>Fase {question.referencia.fase}</span>
                )}
                {question.referencia?.pagina && (
                  <span>• Pág. {question.referencia.pagina}</span>
                )}
              </div>
              <p className="text-slate-700 font-bold line-clamp-2 leading-relaxed">
                "{question.pergunta}"
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                  Qual é o motivo do reporte?
                </label>
                <div className="space-y-1.5">
                  {(Object.keys(FEEDBACK_REASONS_MAP) as FeedbackReason[]).map((r) => (
                    <label
                      key={`reason-${r}`}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all cursor-pointer text-xs font-extrabold select-none ${
                        reason === r
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="feedback-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="accent-indigo-600 w-4 h-4 shrink-0"
                      />
                      <span>{FEEDBACK_REASONS_MAP[r]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">
                  Observação / Sugestão <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explique o que você observou de incorreto nesta questão..."
                  rows={3}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 text-xs text-slate-700 font-semibold focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer min-h-[44px] disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs uppercase tracking-wider border-b-4 border-indigo-800 active:border-b-0 active:translate-y-0.5 transition-all shadow-md cursor-pointer min-h-[44px] disabled:opacity-75 disabled:cursor-wait flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar Feedback</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-2 animate-fade">
            <img
              src={getAssetUrl('assets/fufu-acerto-joinha.png')}
              alt="Fufu Joinha"
              className="w-20 h-auto mx-auto mb-3 drop-shadow-md"
            />
            <h3 className="text-lg font-black text-slate-800 flex items-center justify-center gap-1.5 mb-1">
              <CheckCircle2 className="text-emerald-500" size={20} />
              Feedback Registrado!
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-5">
              Seu reporte foi transmitido diretamente para a equipe pedagógica e registrado na planilha do método. Muito obrigado por colaborar!
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-4 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Ações Opcionais:
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleCopyReport}
                  className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[40px]"
                >
                  <Copy size={14} />
                  <span>{copied ? 'Copiado! ✓' : 'Copiar Relatório'}</span>
                </button>

                <a
                  href={buildGitHubIssueUrl(currentPayload)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[40px]"
                >
                  <ExternalLink size={14} />
                  <span>Abrir Issue no GitHub</span>
                </a>
              </div>
            </div>

            <button
              id="btn-close-feedback-modal"
              onClick={handleClose}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl border-b-4 border-emerald-700 active:border-b-0 transition-all text-xs uppercase tracking-wider cursor-pointer shadow-md min-h-[44px]"
            >
              Concluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
