import React, { useState, useEffect } from 'react';
import { Check, CheckCircle2, X, XCircle, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  SimuladoQuestion,
  SimuladoQuestionOption,
  WrongAnswerRecord,
  validateQuestionBank,
} from './questions/schema';
import { playSuccessSound, playErrorSound } from '../../core/utils/audio';
import { getAssetUrl } from '../../core/utils/paths';

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

export async function loadQuestionBankForPeriods(selectedPeriods: Set<number>): Promise<unknown[]> {
  let bank: unknown[] = [];
  if (selectedPeriods.has(1)) {
    const [q1, q2, q3] = await Promise.all([
      import('./questions/q_f01.json'),
      import('./questions/q_f02.json'),
      import('./questions/q_f03.json'),
    ]);
    bank = bank.concat(q1.default, q2.default, q3.default);
  }
  if (selectedPeriods.has(2)) {
    const [q4, q5] = await Promise.all([
      import('./questions/q_f04.json'),
      import('./questions/q_f05.json'),
    ]);
    bank = bank.concat(q4.default, q5.default);
  }
  if (selectedPeriods.has(3)) {
    const [q6, q7, q8, q9] = await Promise.all([
      import('./questions/q_f06.json'),
      import('./questions/q_f07.json'),
      import('./questions/q_f08.json'),
      import('./questions/q_f09.json'),
    ]);
    bank = bank.concat(q6.default, q7.default, q8.default, q9.default);
  }
  if (selectedPeriods.has(4)) {
    const [q10, q11, q12, q13, q14, q15, q16] = await Promise.all([
      import('./questions/q_f10.json'),
      import('./questions/q_f11.json'),
      import('./questions/q_f12.json'),
      import('./questions/q_f13.json'),
      import('./questions/q_f14.json'),
      import('./questions/q_f15.json'),
      import('./questions/q_f16.json'),
    ]);
    bank = bank.concat(
      q10.default,
      q11.default,
      q12.default,
      q13.default,
      q14.default,
      q15.default,
      q16.default,
    );
  }
  return bank;
}

export function SimuladoMsa({ onBack }: SimuladoMsaProps) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/'));
  const [selectedPeriods, setSelectedPeriods] = useState<Set<number>>(new Set([1]));
  const [quizState, setQuizState] = useState<'MENU' | 'LOADING' | 'QUIZ' | 'RESULTS'>('MENU');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Quiz variables
  const [questions, setQuestions] = useState<SimuladoQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<SimuladoQuestionOption | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswerRecord[]>([]);

  // Timer & Results
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

  const availablePeriods = [1, 2, 3, 4];

  const togglePeriod = (p: number) => {
    setSelectedPeriods((prev) => {
      const next = new Set(prev);
      if (next.has(p)) {
        next.delete(p);
      } else {
        next.add(p);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allSelected = availablePeriods.every((p) => selectedPeriods.has(p));
    if (allSelected) {
      setSelectedPeriods(new Set());
    } else {
      setSelectedPeriods(new Set(availablePeriods));
    }
  };

  const handleStartQuiz = async () => {
    if (selectedPeriods.size === 0) return;
    setErrorMessage(null);
    setQuizState('LOADING');

    let bank: unknown[] = [];
    try {
      bank = await loadQuestionBankForPeriods(selectedPeriods);
    } catch (e) {
      console.error('Falha ao importar bancos de questões:', e);
      setErrorMessage('Não foi possível carregar os arquivos de questões.');
      setQuizState('MENU');
      return;
    }

    const validatedBank = validateQuestionBank(bank);

    if (validatedBank.length === 0) {
      setErrorMessage('Nenhuma questão válida encontrada para os períodos selecionados.');
      setQuizState('MENU');
      return;
    }

    // Embaralha questões e também as alternativas (opcoes) de cada questão sorteada
    const activeQuestions = prepareQuizQuestions(validatedBank, 20);

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

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption.correta === true;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      playSuccessSound();
    } else {
      playErrorSound();
      const correctOpt = currentQuestion.opcoes.find((o) => o.correta);
      if (correctOpt) {
        setWrongAnswers((prev) => [
          ...prev,
          {
            question: currentQuestion.pergunta,
            correctAnswer: correctOpt.texto,
            reference: currentQuestion.referencia,
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
      // Quiz concluído
      const totalTime = Math.floor((Date.now() - quizStartTime) / 1000);
      setTimeSpentString(formatTimeSpent(totalTime));

      const { img, msg } = computeQuizResult(score, questions.length);
      setResultImg(img);
      setResultMsg(msg);
      setQuizState('RESULTS');
    }
  };

  const allPeriodsChecked = availablePeriods.every((p) => selectedPeriods.has(p));
  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

  return (
    <div
      className="flex-1 flex flex-col bg-slate-50 font-sans h-full overflow-y-auto"
      id="simulado-msa-root"
    >
      {/* MENU SCREEN */}
      {quizState === 'MENU' && (
        <div
          className="max-w-xl mx-auto w-full px-6 py-6 sm:py-8 flex-1 flex flex-col justify-center text-center animate-fade"
          id="simulado-menu"
        >
          <img
            src={getAssetUrl('assets/fufu-capa-simulado.png')}
            className="w-24 sm:w-28 h-auto mx-auto mb-3 drop-shadow-lg animate-float"
            alt="Fufu Simulado"
          />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-1">Simulado MSA</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-bold mb-5">
            Prepare-se para o teste de oficialização CCB respondendo questões reais do método.
          </p>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 text-left">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 mb-6 text-left">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Selecione os Períodos:
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer min-h-[44px] px-2 -my-2 flex items-center"
              >
                {allPeriodsChecked ? 'Limpar Todos' : 'Selecionar Todos'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Period 1 */}
              <button
                onClick={() => togglePeriod(1)}
                className={`p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPeriods.has(1)
                    ? 'bg-indigo-50/50 border-indigo-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Período 1</h4>
                  <p className="text-xs text-slate-400 font-bold">Fases 1, 2 e 3</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    selectedPeriods.has(1)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {selectedPeriods.has(1) && <Check size={12} />}
                </div>
              </button>

              {/* Period 2 */}
              <button
                onClick={() => togglePeriod(2)}
                className={`p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPeriods.has(2)
                    ? 'bg-indigo-50/50 border-indigo-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Período 2</h4>
                  <p className="text-xs text-slate-400 font-bold">Fases 4 e 5</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    selectedPeriods.has(2)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {selectedPeriods.has(2) && <Check size={12} />}
                </div>
              </button>

              {/* Period 3 */}
              <button
                onClick={() => togglePeriod(3)}
                className={`p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPeriods.has(3)
                    ? 'bg-indigo-50/50 border-indigo-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Período 3</h4>
                  <p className="text-xs text-slate-400 font-bold">Fases 6, 7, 8 e 9</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    selectedPeriods.has(3)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {selectedPeriods.has(3) && <Check size={12} />}
                </div>
              </button>

              {/* Period 4 */}
              <button
                onClick={() => togglePeriod(4)}
                className={`p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedPeriods.has(4)
                    ? 'bg-indigo-50/50 border-indigo-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Período 4</h4>
                  <p className="text-xs text-slate-400 font-bold">Fases 10 a 16</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    selectedPeriods.has(4)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {selectedPeriods.has(4) && <Check size={12} />}
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={selectedPeriods.size === 0}
            className={`w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-base font-extrabold rounded-2xl border-b-4 border-emerald-700 active:border-b-0 hover:scale-[1.01] active:translate-y-1 transition-all cursor-pointer shadow-md mb-3 uppercase tracking-wider ${
              selectedPeriods.size === 0 ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            Começar Simulado
          </button>

          <button
            onClick={handleBack}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 transition-all cursor-pointer text-sm uppercase tracking-wider"
          >
            Voltar ao Início
          </button>
        </div>
      )}

      {/* LOADING SCREEN */}
      {quizState === 'LOADING' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white animate-fade">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-lg font-black text-slate-800">Carregando Banco de Questões...</h3>
          <p className="text-sm text-slate-400 font-semibold mt-1">
            Sorteando perguntas de teoria musical
          </p>
        </div>
      )}

      {/* QUIZ WORKSPACE */}
      {quizState === 'QUIZ' && currentQuestion && (
        <div
          className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-6 relative animate-fade min-h-full"
          id="simulado-quiz"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 mb-6">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer border border-slate-200 shrink-0"
              title="Sair do Simulado"
            >
              <X size={20} />
            </button>

            {/* Progress bar */}
            <div className="flex-1 bg-slate-200 rounded-full h-3 border border-slate-300/40 overflow-hidden relative">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

          {/* Modal de confirmação de saída */}
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

          {/* Question card */}
          <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-6 relative shadow-sm mb-6 animate-slide">
            <span className="absolute -top-4 -left-3 w-10 h-10 bg-indigo-600 text-white font-black text-sm flex items-center justify-center rounded-xl border-2 border-white shadow shadow-indigo-600/20 rotate-[-5deg]">
              {currentIndex + 1}
            </span>
            <p className="text-slate-700 font-bold leading-relaxed">
              {formatText(currentQuestion.pergunta)}
            </p>
          </div>

          {/* Multiple choice options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
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

              const letters = ['A', 'B', 'C', 'D', 'E'];

              return (
                <button
                  key={`opt-${index}`}
                  disabled={isAnswerChecked}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-2xl border-2 border-b-4 text-left flex items-center gap-4 transition-all ${
                    !isAnswerChecked ? 'cursor-pointer active:translate-y-1' : ''
                  } ${cardStyle}`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center border font-black text-xs shrink-0 ${badgeStyle}`}
                  >
                    {letters[index] || '?'}
                  </span>
                  <span className="font-extrabold text-sm">{formatText(opt.texto)}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic feedback panel */}
          {isAnswerChecked && selectedOption && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border-2 mb-6 animate-pop flex items-start gap-3 sm:gap-4 ${
                selectedOption.correta
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {/* Mini Fufu sticker */}
              <img
                src={
                  selectedOption.correta
                    ? getAssetUrl('assets/fufu-acerto-joinha.png')
                    : getAssetUrl('assets/fufu-erro-nao-desista.png')
                }
                className="w-14 sm:w-16 h-auto shrink-0 drop-shadow-sm"
                alt="Fufu Reação"
              />

              <div className="flex-1 min-w-0">
                <h4 className="text-base font-black flex items-center gap-1.5 mb-1.5">
                  {selectedOption.correta ? (
                    <>
                      <CheckCircle2 className="text-emerald-600" size={18} /> Correto!
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600" size={18} /> Incorreto...
                    </>
                  )}
                </h4>

                <div className="text-xs font-semibold leading-relaxed">
                  {selectedOption.feedback && (
                    <p className="italic mb-2">"{formatText(selectedOption.feedback)}"</p>
                  )}

                  {!selectedOption.correta && (
                    <p className="border-t border-red-200/50 pt-2 mt-2 font-black text-slate-800">
                      Solução Correta:{' '}
                      <span className="text-emerald-700">
                        {formatText(currentQuestion.opcoes.find((o) => o.correta)?.texto || '')}
                      </span>
                    </p>
                  )}

                  {/* Question reference */}
                  {currentQuestion.referencia && (
                    <div className="inline-block mt-3 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-600 font-extrabold uppercase tracking-wide">
                      📖 {currentQuestion.referencia.livro} • Fase {currentQuestion.referencia.fase} •
                      Pág. {currentQuestion.referencia.pagina}
                      {currentQuestion.referencia.item && ` (${currentQuestion.referencia.item})`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-xs border-t border-slate-200 p-4 -mx-6 -mb-6 mt-auto flex justify-end shadow-lg">
            {!isAnswerChecked ? (
              <button
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
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 border-indigo-800 text-white font-extrabold text-sm tracking-wider uppercase border-b-4 rounded-2xl min-h-[48px] active:border-b-0 active:translate-y-1 cursor-pointer"
              >
                {currentIndex + 1 < questions.length ? 'Continuar' : 'Ver Resultados'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* RESULTS SCREEN */}
      {quizState === 'RESULTS' && (
        <div
          className="max-w-md mx-auto w-full px-6 py-8 flex-1 flex flex-col justify-center text-center animate-fade"
          id="simulado-resultados"
        >
          <img
            src={resultImg}
            className="w-32 h-auto mx-auto mb-4 drop-shadow-lg animate-float"
            alt="Mascote Resultado"
          />
          <h2 className="text-2xl font-black text-slate-800 mb-1">Simulado Concluído!</h2>
          <p className="text-sm text-slate-400 font-semibold mb-6">{resultMsg}</p>

          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 mb-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Precisão
                </span>
                <span className="text-2xl font-black text-emerald-500 mt-1 block">
                  {Math.round((score / questions.length) * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {score} de {questions.length} certas
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Tempo Gasto
                </span>
                <span className="text-2xl font-black text-amber-500 mt-1 block">
                  {timeSpentString}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Minutos : Segundos</span>
              </div>
            </div>

            {/* Wrong Answers Review */}
            {wrongAnswers.length > 0 && (
              <div className="text-left border-t border-slate-200 pt-4">
                <h4 className="text-xs font-black text-red-500 flex items-center gap-1.5 mb-2.5 uppercase tracking-wide">
                  ⚠️ O que precisa revisar:
                </h4>
                <div className="space-y-2.5">
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
                      {item.reference && (
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                          📖 {item.reference.livro} • Fase {item.reference.fase} • Pág.{' '}
                          {item.reference.pagina}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 text-white text-sm font-extrabold rounded-2xl cursor-pointer shadow-md mb-3 uppercase tracking-wider transition-all"
          >
            Novo Simulado
          </button>

          <button
            onClick={() => setQuizState('MENU')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 text-slate-600 font-extrabold rounded-2xl cursor-pointer text-sm uppercase tracking-wider transition-all"
          >
            Sair do Simulado
          </button>
        </div>
      )}
    </div>
  );
}
