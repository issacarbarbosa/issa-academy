import React, { useState, useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  X,
  XCircle,
  Clock,
  Flag,
  Edit3,
  Save,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../core/contexts/AdminContext';
import { contentStore } from '../../core/services/contentStore';
import {
  SimuladoQuestion,
  SimuladoQuestionOption,
  SimuladoQuestionReference,
  WrongAnswerRecord,
  validateQuestionBank,
} from './questions/schema';
import { playSuccessSound, playErrorSound } from '../../core/utils/audio';
import { getAssetUrl } from '../../core/utils/paths';
import { useScreenWakeLock } from '../../core/hooks/useScreenWakeLock';
import { SimuladoMenu, MSA_PHASES_CATALOG } from './components/SimuladoMenu';
import { QuestionFeedbackModal } from './components/QuestionFeedbackModal';

interface SimuladoMsaProps {
  onBack?: () => void;
}

export function formatTimeSpent(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function computeQuizResult(
  score: number,
  totalQuestions: number,
  randomValue = Math.random(),
): { img: string; msg: string; pct: number } {
  const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  let img = '';
  let msg = '';
  if (pct === 100) {
    img = getAssetUrl('assets/fufu-comemorando-trofeu-gabarito.png');
    msg = 'Perfeito! Você gabaritou o Simulado!';
  } else if (pct >= 80) {
    img = getAssetUrl('assets/fufu-comemorando-trofeu-G-clave.png');
    msg = 'Muito bom! Você está super preparado para a oficialização!';
  } else if (pct >= 50) {
    const midImgs = [
      getAssetUrl('assets/fufu-erro-presente.png'),
      getAssetUrl('assets/fufu-erro-encorajador.png'),
    ];
    img = midImgs[Math.floor(randomValue * midImgs.length)];
    msg = 'Bom esforço! Mais alguns estudos e você chega lá!';
  } else {
    const lowImgs = [
      getAssetUrl('assets/fufu-erro-nao-desista.png'),
      getAssetUrl('assets/fufu-erro-carinho.png'),
      getAssetUrl('assets/fufu-erro-acontece.png'),
    ];
    img = lowImgs[Math.floor(randomValue * lowImgs.length)];
    msg = 'Não desanime! Teoria musical exige prática. Estude e tente novamente!';
  }
  return { img, msg, pct };
}

/**
 * Algoritmo Fisher-Yates para permutação estocástica perfeitamente uniforme
 */
export function shuffleQuestions<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Filtra questões ativas, sorteia até maxCount questões via Fisher-Yates
 * e embaralha também a ordem das alternativas (opcoes) de cada questão.
 */
export function prepareQuizQuestions(
  bank: SimuladoQuestion[],
  maxCount = 20,
): SimuladoQuestion[] {
  const active = bank.filter((q) => q.ativo !== false);
  const selected = shuffleQuestions(active).slice(0, maxCount);
  return selected.map((question) => ({
    ...question,
    opcoes: shuffleQuestions(question.opcoes),
  }));
}

/**
 * Formata fórmulas de compasso (ex: 4/4, 3/4) em frações verticais estilizadas
 * utilizando elementos JSX puros sem dangerouslySetInnerHTML (100% seguro contra XSS).
 */
export function formatText(text: string): React.ReactNode {
  if (!text) return '';
  const signatureRegex = /(\d{1,2})\/(\d{1,2})/g;
  const parts = text.split(signatureRegex);
  if (parts.length > 1) {
    const nodes: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i += 3) {
      if (parts[i]) {
        nodes.push(<React.Fragment key={`text-${i}`}>{parts[i]}</React.Fragment>);
      }
      if (parts[i + 1] !== undefined && parts[i + 2] !== undefined) {
        nodes.push(
          <span
            key={`sig-${i}`}
            className="inline-flex flex-col items-center justify-center bg-slate-100 px-1 py-0.5 rounded border border-slate-200 align-middle leading-none mx-0.5"
          >
            <span className="text-[10px] font-black font-serif">{parts[i + 1]}</span>
            <span className="text-[10px] font-black font-serif border-t border-slate-400 mt-0.5">
              {parts[i + 2]}
            </span>
          </span>,
        );
      }
    }
    return <span>{nodes}</span>;
  }
  return <span>{text}</span>;
}

const PHASE_LOADERS: Record<number, () => Promise<{ default: unknown[] }>> = {
  1: () => import('./questions/q_f01.json'),
  2: () => import('./questions/q_f02.json'),
  3: () => import('./questions/q_f03.json'),
  4: () => import('./questions/q_f04.json'),
  5: () => import('./questions/q_f05.json'),
  6: () => import('./questions/q_f06.json'),
  7: () => import('./questions/q_f07.json'),
  8: () => import('./questions/q_f08.json'),
  9: () => import('./questions/q_f09.json'),
  10: () => import('./questions/q_f10.json'),
  11: () => import('./questions/q_f11.json'),
  12: () => import('./questions/q_f12.json'),
  13: () => import('./questions/q_f13.json'),
  14: () => import('./questions/q_f14.json'),
  15: () => import('./questions/q_f15.json'),
  16: () => import('./questions/q_f16.json'),
};

export async function loadQuestionBankForPhases(selectedPhases: Set<number>): Promise<unknown[]> {
  try {
    const { contentStore } = await import('../../core/services/contentStore');
    const allQuestions = await contentStore.getAllQuestions();
    if (allQuestions && allQuestions.length > 0) {
      return allQuestions.filter(
        (q) => q.referencia?.fase !== undefined && selectedPhases.has(q.referencia.fase),
      );
    }
  } catch {
    // fallback em caso de erro
  }

  const promises: Promise<{ default: unknown[] }>[] = [];
  selectedPhases.forEach((f) => {
    if (PHASE_LOADERS[f]) {
      promises.push(PHASE_LOADERS[f]());
    }
  });
  const modules = await Promise.all(promises);
  let bank: unknown[] = [];
  for (const m of modules) {
    bank = bank.concat(m.default);
  }
  return bank;
}

export async function loadQuestionBankForPeriods(selectedPeriods: Set<number>): Promise<unknown[]> {
  try {
    const { contentStore } = await import('../../core/services/contentStore');
    const allQuestions = await contentStore.getAllQuestions();
    if (allQuestions && allQuestions.length > 0) {
      return allQuestions.filter(
        (q) => q.referencia?.periodo !== undefined && selectedPeriods.has(q.referencia.periodo),
      );
    }
  } catch {
    // fallback em caso de erro
  }

  const phases = new Set<number>();
  if (selectedPeriods.has(1)) [1, 2, 3].forEach((f) => phases.add(f));
  if (selectedPeriods.has(2)) [4, 5].forEach((f) => phases.add(f));
  if (selectedPeriods.has(3)) [6, 7, 8, 9].forEach((f) => phases.add(f));
  if (selectedPeriods.has(4)) [10, 11, 12, 13, 14, 15, 16].forEach((f) => phases.add(f));
  return loadQuestionBankForPhases(phases);
}

export function SimuladoMsa({ onBack }: SimuladoMsaProps) {
  const navigate = useNavigate();
  const { isAdmin, mode } = useAdmin();
  const handleBack = onBack || (() => navigate('/'));

  // Estados de Configuração e Modalidade
  const [quizMode, setQuizMode] = useState<'period' | 'phase'>('period');
  const [selectedPeriods, setSelectedPeriods] = useState<Set<number>>(new Set([1]));
  const [selectedPhases, setSelectedPhases] = useState<Set<number>>(new Set([1]));

  const [quizState, setQuizState] = useState<'MENU' | 'LOADING' | 'QUIZ' | 'RESULTS'>('MENU');
  useScreenWakeLock(quizState === 'QUIZ');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<SimuladoQuestion | null>(null);

  // Modal de Feedback
  const [feedbackQuestion, setFeedbackQuestion] = useState<{
    id: string;
    pergunta: string;
    referencia?: SimuladoQuestionReference;
  } | null>(null);

  const [reportedIds, setReportedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem('simulado_reported_questions');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  // Variáveis do Quiz
  const [questions, setQuestions] = useState<SimuladoQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<SimuladoQuestionOption | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswerRecord[]>([]);

  // Timer & Resultados
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [timeSpentString, setTimeSpentString] = useState<string>('00:00');
  const [resultImg, setResultImg] = useState<string>('');
  const [resultMsg, setResultMsg] = useState<string>('');

  // Cronômetro ao vivo durante o QUIZ
  useEffect(() => {
    if (quizState !== 'QUIZ') return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - quizStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [quizState, quizStartTime]);

  const togglePeriod = (p: number) => {
    setSelectedPeriods((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const toggleSelectAllPeriods = () => {
    const available = [1, 2, 3, 4];
    const allSelected = available.every((p) => selectedPeriods.has(p));
    setSelectedPeriods(allSelected ? new Set() : new Set(available));
  };

  const togglePhase = (f: number) => {
    setSelectedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  const toggleSelectAllPhases = () => {
    const allPhases = MSA_PHASES_CATALOG.map((p) => p.fase);
    const allSelected = allPhases.every((f) => selectedPhases.has(f));
    setSelectedPhases(allSelected ? new Set() : new Set(allPhases));
  };

  const handleStartQuiz = async () => {
    if (quizMode === 'period' && selectedPeriods.size === 0) return;
    if (quizMode === 'phase' && selectedPhases.size === 0) return;

    setErrorMessage(null);
    setQuizState('LOADING');

    let bank: unknown[] = [];
    try {
      if (quizMode === 'period') {
        bank = await loadQuestionBankForPeriods(selectedPeriods);
      } else {
        bank = await loadQuestionBankForPhases(selectedPhases);
      }
    } catch (e) {
      console.error('Falha ao importar bancos de questões:', e);
      setErrorMessage('Não foi possível carregar os arquivos de questões.');
      setQuizState('MENU');
      return;
    }

    const validatedBank = validateQuestionBank(bank);
    if (validatedBank.length === 0) {
      setErrorMessage('Nenhuma questão válida encontrada para os filtros selecionados.');
      setQuizState('MENU');
      return;
    }

    const questionLimit = quizMode === 'period' ? 20 : 10;
    const activeQuestions = prepareQuizQuestions(validatedBank, questionLimit);

    setQuestions(activeQuestions);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setWrongAnswers([]);
    setQuizStartTime(Date.now());
    setElapsedSeconds(0);
    setQuizState('QUIZ');
  };

  const handleSelectOption = (opt: SimuladoQuestionOption) => {
    if (isAnswerChecked) return;
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || isAnswerChecked) return;
    setIsAnswerChecked(true);

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption.correta === true;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      playSuccessSound();
    } else {
      playErrorSound();
      const correctOpt = currentQ.opcoes.find((o) => o.correta);
      if (correctOpt) {
        setWrongAnswers((prev) => [
          ...prev,
          {
            questionId: currentQ.id,
            question: currentQ.pergunta,
            correctAnswer: correctOpt.texto,
            reference: currentQ.referencia,
          },
        ]);
      }
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      const totalTime = Math.floor((Date.now() - quizStartTime) / 1000);
      setTimeSpentString(formatTimeSpent(totalTime));
      const { img, msg } = computeQuizResult(score, questions.length);
      setResultImg(img);
      setResultMsg(msg);
      setQuizState('RESULTS');
    }
  };

  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

  return (
    <div
      className="flex-1 flex flex-col bg-slate-50 font-sans overflow-y-auto h-full"
      id="simulado-msa-root"
    >
      {/* TELA DE MENU INICIAL */}
      {quizState === 'MENU' && (
        <SimuladoMenu
          quizMode={quizMode}
          onSelectMode={(m) => setQuizMode(m)}
          selectedPeriods={selectedPeriods}
          onTogglePeriod={togglePeriod}
          onToggleSelectAllPeriods={toggleSelectAllPeriods}
          selectedPhases={selectedPhases}
          onTogglePhase={togglePhase}
          onToggleSelectAllPhases={toggleSelectAllPhases}
          errorMessage={errorMessage}
          onStartQuiz={handleStartQuiz}
          onBack={handleBack}
        />
      )}

      {/* TELA DE CARREGAMENTO */}
      {quizState === 'LOADING' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white animate-fade">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-lg font-black text-slate-800">Carregando Questões...</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {quizMode === 'period'
              ? 'Sorteando 20 perguntas do método MSA'
              : 'Sorteando 10 perguntas das fases selecionadas'}
          </p>
        </div>
      )}

      {/* WORKSPACE DO QUIZ */}
      {quizState === 'QUIZ' && currentQuestion && (
        <div
          className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 relative animate-fade min-h-full"
          id="simulado-quiz"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer border border-slate-200 shrink-0"
              title="Sair do Simulado"
            >
              <X size={20} />
            </button>

            {/* Barra de Progresso */}
            <div className="flex-1 bg-slate-200 rounded-full h-3 border border-slate-300/40 overflow-hidden relative">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-slate-600 font-extrabold text-xs font-mono bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <Clock size={13} className="text-amber-500 shrink-0" />
                <span>{formatTimeSpent(elapsedSeconds)}</span>
              </div>
              <div className="text-slate-600 font-extrabold text-xs font-mono">
                <span className="text-sm text-indigo-600 font-black">
                  {(currentIndex + 1).toString().padStart(2, '0')}
                </span>{' '}
                / {questions.length}
              </div>
            </div>
          </div>

          {/* Modal de Confirmação de Saída */}
          {showExitConfirm && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl border border-slate-200">
                <h4 className="text-base font-black text-slate-800 mb-2">Deseja realmente sair?</h4>
                <p className="text-xs text-slate-500 font-semibold mb-6">
                  Se você sair agora, o progresso deste simulado será perdido.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Continuar
                  </button>
                  <button
                    onClick={() => {
                      setShowExitConfirm(false);
                      setQuizState('MENU');
                    }}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
                  >
                    Sim, Sair
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Card do Enunciado */}
          <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-5 sm:p-6 relative shadow-sm mb-5 animate-slide text-left">
            <span className="absolute -top-3.5 -left-2.5 w-9 h-9 bg-indigo-600 text-white font-black text-xs flex items-center justify-center rounded-xl border-2 border-white shadow shadow-indigo-600/20 rotate-[-5deg]">
              {currentIndex + 1}
            </span>

            {isAdmin && mode === 'edicao' && (
              <button
                type="button"
                data-testid="simulado-inline-edit-question-btn"
                onClick={() =>
                  setEditingQuestion({
                    ...currentQuestion,
                    opcoes: currentQuestion.opcoes.map((o) => ({ ...o })),
                  })
                }
                className="absolute -top-3 right-3 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 text-[11px] font-black shadow flex items-center gap-1 cursor-pointer"
                title="Editar esta questão diretamente na tela"
              >
                <Edit3 size={12} />
                <span>✏️ Editar Questão ({currentQuestion.id})</span>
              </button>
            )}

            <p className="text-slate-700 font-bold leading-relaxed text-sm sm:text-base">
              {formatText(currentQuestion.pergunta)}
            </p>
          </div>

          {/* Múltipla Escolha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-5">
            {currentQuestion.opcoes.map((opt, index) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt.correta === true;

              let cardStyle =
                'bg-white border-slate-200 hover:border-slate-300 active:border-b-0 hover:bg-slate-50';
              let badgeStyle = 'bg-slate-50 text-slate-400 border-slate-200';

              if (isAnswerChecked) {
                if (isCorrectOpt) {
                  cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800';
                  badgeStyle = 'bg-emerald-500 text-white border-emerald-500';
                } else if (isSelected) {
                  cardStyle = 'bg-red-50 border-red-500 text-red-800';
                  badgeStyle = 'bg-red-500 text-white border-red-500';
                } else {
                  cardStyle = 'bg-white border-slate-200 opacity-60';
                }
              } else if (isSelected) {
                cardStyle = 'bg-sky-50 border-sky-500 text-sky-800';
                badgeStyle = 'bg-sky-500 text-white border-sky-500';
              }

              const letters = ['A', 'B', 'C', 'D'];

              return (
                <button
                  key={`opt-${index}`}
                  id={`option-btn-${index}`}
                  disabled={isAnswerChecked}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-3.5 rounded-2xl border-2 border-b-4 text-left flex items-center gap-3.5 transition-all ${
                    !isAnswerChecked ? 'cursor-pointer active:translate-y-1' : ''
                  } ${cardStyle}`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center border font-black text-xs shrink-0 ${badgeStyle}`}
                  >
                    {letters[index] || '?'}
                  </span>
                  <span className="font-extrabold text-xs sm:text-sm leading-snug">
                    {formatText(opt.texto)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Painel de Feedback da Resposta */}
          {isAnswerChecked && selectedOption && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border-2 mb-6 animate-pop flex items-start gap-3 text-left ${
                selectedOption.correta
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <img
                src={
                  selectedOption.correta
                    ? getAssetUrl('assets/fufu-acerto-joinha.png')
                    : getAssetUrl('assets/fufu-erro-nao-desista.png')
                }
                className="w-12 sm:w-14 h-auto shrink-0 drop-shadow-xs"
                alt="Fufu Reação"
              />

              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-black flex items-center gap-1.5 mb-1">
                  {selectedOption.correta ? (
                    <>
                      <CheckCircle2 className="text-emerald-600" size={17} /> Correto!
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600" size={17} /> Incorreto...
                    </>
                  )}
                </h4>

                <div className="text-xs font-semibold leading-relaxed">
                  {selectedOption.feedback && (
                    <p className="italic mb-1.5">&quot;{formatText(selectedOption.feedback)}&quot;</p>
                  )}

                  {!selectedOption.correta && (
                    <p className="border-t border-red-200/50 pt-1.5 mt-1.5 font-black text-slate-800">
                      Solução Correta:{' '}
                      <span className="text-emerald-700">
                        {formatText(currentQuestion.opcoes.find((o) => o.correta)?.texto || '')}
                      </span>
                    </p>
                  )}

                  {/* Barra de Metadados e Botão de Reportar Questão */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between flex-wrap gap-2">
                    {currentQuestion.referencia && (
                      <div className="inline-block bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200 text-[9px] sm:text-[10px] text-slate-600 font-extrabold uppercase tracking-wide">
                        📖 {currentQuestion.referencia.livro} • Fase {currentQuestion.referencia.fase} • Pág. {currentQuestion.referencia.pagina}
                        {currentQuestion.referencia.item && ` (${currentQuestion.referencia.item})`}
                      </div>
                    )}

                    <button
                      type="button"
                      id="btn-report-question"
                      onClick={() =>
                        setFeedbackQuestion({
                          id: currentQuestion.id,
                          pergunta: currentQuestion.pergunta,
                          referencia: currentQuestion.referencia,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 hover:bg-slate-100 text-slate-600 font-extrabold text-[10px] sm:text-[11px] transition-colors cursor-pointer border border-slate-200 min-h-[36px]"
                      title="Reportar problema nesta questão"
                    >
                      <Flag size={12} className="text-amber-500" />
                      <span>
                        {reportedIds.has(currentQuestion.id)
                          ? 'Feedback enviado ✓'
                          : 'Reportar questão'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rodapé de Ação Sticky */}
          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-xs border-t border-slate-200 p-3.5 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 mt-auto flex justify-end shadow-lg">
            {!isAnswerChecked ? (
              <button
                id="btn-verify-answer"
                disabled={!selectedOption}
                onClick={handleCheckAnswer}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-extrabold text-sm tracking-wider uppercase border-b-4 min-h-[48px] ${
                  selectedOption
                    ? 'bg-emerald-500 border-emerald-700 hover:bg-emerald-600 cursor-pointer active:border-b-0 active:translate-y-1'
                    : 'bg-slate-200 border-slate-300 text-slate-400 pointer-events-none'
                }`}
              >
                Verificar
              </button>
            ) : (
              <button
                id="btn-continue-quiz"
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 border-indigo-800 text-white font-extrabold text-sm tracking-wider uppercase border-b-4 rounded-2xl min-h-[48px] active:border-b-0 active:translate-y-1 cursor-pointer"
              >
                {currentIndex + 1 < questions.length ? 'Continuar' : 'Ver Resultados'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* TELA DE RESULTADOS */}
      {quizState === 'RESULTS' && (
        <div
          className="max-w-md mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col justify-center text-center animate-fade"
          id="simulado-resultados"
        >
          <img
            src={resultImg}
            className="w-28 sm:w-32 h-auto mx-auto mb-3 drop-shadow-lg animate-float"
            alt="Mascote Resultado"
          />
          <h2 className="text-2xl font-black text-slate-800 mb-0.5">Simulado Concluído!</h2>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold mb-5">{resultMsg}</p>

          <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 mb-5 shadow-sm text-left">
            <div className="grid grid-cols-2 gap-3 mb-4 text-center">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Precisão
                </span>
                <span className="text-2xl font-black text-emerald-500 mt-0.5 block">
                  {Math.round((score / questions.length) * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {score} de {questions.length} certas
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Tempo Gasto
                </span>
                <span className="text-2xl font-black text-amber-500 mt-0.5 block">
                  {timeSpentString}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Minutos : Segundos</span>
              </div>
            </div>

            {/* Revisão de Questões Incorretas */}
            {wrongAnswers.length > 0 && (
              <div className="border-t border-slate-200 pt-3.5">
                <h4 className="text-xs font-black text-red-500 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                  ⚠️ O que precisa revisar:
                </h4>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {wrongAnswers.map((item, idx) => (
                    <div
                      key={`wrong-${idx}`}
                      className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs"
                    >
                      <p className="font-extrabold text-slate-700 leading-normal mb-1">
                        {formatText(item.question)}
                      </p>
                      <p className="text-emerald-700 font-black flex items-center gap-1">
                        <Check size={12} /> {formatText(item.correctAnswer)}
                      </p>
                      <div className="flex items-center justify-between flex-wrap gap-2 mt-2 pt-1 border-t border-red-100/80">
                        {item.reference && (
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            📖 {item.reference.livro} • Fase {item.reference.fase} • Pág. {item.reference.pagina}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setFeedbackQuestion({
                              id: item.questionId || `q-review-${idx}`,
                              pergunta: item.question,
                              referencia: item.reference,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white hover:bg-red-50 text-slate-600 font-bold text-[10px] transition-colors cursor-pointer border border-slate-200 min-h-[30px]"
                        >
                          <Flag size={10} className="text-amber-500" />
                          <span>
                            {item.questionId && reportedIds.has(item.questionId)
                              ? 'Enviado ✓'
                              : 'Reportar'}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 text-white text-xs sm:text-sm font-extrabold rounded-2xl cursor-pointer shadow-md mb-2.5 uppercase tracking-wider transition-all min-h-[44px]"
          >
            Novo Simulado
          </button>

          <button
            onClick={() => setQuizState('MENU')}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 text-slate-600 font-extrabold rounded-2xl cursor-pointer text-xs uppercase tracking-wider transition-all min-h-[44px]"
          >
            Sair do Simulado
          </button>
        </div>
      )}

      {/* Modal de Feedback de Questões */}
      <QuestionFeedbackModal
        isOpen={Boolean(feedbackQuestion)}
        question={feedbackQuestion}
        onClose={() => setFeedbackQuestion(null)}
        onFeedbackSubmitted={(id) => setReportedIds((prev) => new Set([...prev, id]))}
      />

      {/* Modal de Edição In-Loco de Questão (Exclusivo Admin em Modo Edição) */}
      {editingQuestion && (
        <div
          data-testid="simulado-inline-edit-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative text-left">
            <button
              type="button"
              onClick={() => setEditingQuestion(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-[#1a3c5a] mb-4">
              Editar Questão In-Loco:{' '}
              <span className="font-mono text-indigo-600">{editingQuestion.id}</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                  Enunciado da Pergunta
                </label>
                <textarea
                  data-testid="simulado-edit-pergunta-input"
                  value={editingQuestion.pergunta}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, pergunta: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-xs font-black uppercase text-slate-600 block mb-3">
                  Alternativas (Marque a correta):
                </span>
                <div className="space-y-3">
                  {editingQuestion.opcoes.map((opcao, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-2xl border-2 ${
                        opcao.correta
                          ? 'bg-emerald-50/70 border-emerald-400'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="inline-correta-radio"
                          checked={opcao.correta}
                          onChange={() => {
                            const updated = editingQuestion.opcoes.map((o, idx) => ({
                              ...o,
                              correta: idx === optIdx,
                            }));
                            setEditingQuestion({ ...editingQuestion, opcoes: updated });
                          }}
                          className="w-4 h-4 text-emerald-600 cursor-pointer"
                        />
                        <span className="text-xs font-black uppercase text-slate-700">
                          Opção {String.fromCharCode(65 + optIdx)}{' '}
                          {opcao.correta && (
                            <strong className="text-emerald-700">(Correta ✓)</strong>
                          )}
                        </span>
                      </div>

                      <input
                        type="text"
                        value={opcao.texto}
                        onChange={(e) => {
                          const updated = [...editingQuestion.opcoes];
                          updated[optIdx] = { ...updated[optIdx], texto: e.target.value };
                          setEditingQuestion({ ...editingQuestion, opcoes: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium mb-1.5 bg-white text-slate-800"
                      />

                      <input
                        type="text"
                        value={opcao.feedback || ''}
                        onChange={(e) => {
                          const updated = [...editingQuestion.opcoes];
                          updated[optIdx] = { ...updated[optIdx], feedback: e.target.value };
                          setEditingQuestion({ ...editingQuestion, opcoes: updated });
                        }}
                        placeholder="Feedback pedagógico..."
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 text-slate-500 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  data-testid="simulado-save-question-btn"
                  onClick={async () => {
                    await contentStore.saveQuestion(editingQuestion);
                    setQuestions((prev) =>
                      prev.map((q) => (q.id === editingQuestion.id ? editingQuestion : q))
                    );
                    setEditingQuestion(null);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-xs rounded-xl shadow cursor-pointer"
                >
                  <Save size={16} /> Salvar Questão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
