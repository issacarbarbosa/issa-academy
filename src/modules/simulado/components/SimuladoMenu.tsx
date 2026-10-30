import React from 'react';
import { Check, AlertCircle, BookOpen, Layers, Maximize2, Minimize2 } from 'lucide-react';
import { getAssetUrl } from '../../../core/utils/paths';

export interface PhaseInfo {
  fase: number;
  periodo: number;
  title: string;
}

export const MSA_PHASES_CATALOG: readonly PhaseInfo[] = [
  { fase: 1, periodo: 1, title: 'Fase 1: Música, Som e Claves' },
  { fase: 2, periodo: 1, title: 'Fase 2: Figuras e Compasso em 4' },
  { fase: 3, periodo: 1, title: 'Fase 3: Endecagrama e Solfejo' },
  { fase: 4, periodo: 2, title: 'Fase 4: Ligaduras, Ponto e Compassos 2 e 3' },
  { fase: 5, periodo: 2, title: 'Fase 5: Compasso em 6 e Movimentos' },
  { fase: 6, periodo: 3, title: 'Fase 6: Escala Maior e Acidentes' },
  { fase: 7, periodo: 3, title: 'Fase 7: Armadura e Compassos 9 e 12' },
  { fase: 8, periodo: 3, title: 'Fase 8: Tonalidade e Acidentes Ocorrentes' },
  { fase: 9, periodo: 3, title: 'Fase 9: Ritornello e Casas de Repetição' },
  { fase: 10, periodo: 4, title: 'Fase 10: Dinâmica Natural e Artificial' },
  { fase: 11, periodo: 4, title: 'Fase 11: Acento Métrico e Compassos Alternados' },
  { fase: 12, periodo: 4, title: 'Fase 12: Síncopa e Contratempo' },
  { fase: 13, periodo: 4, title: 'Fase 13: Ritmos Iniciais (Tético, Anacrúsico, Acéfalo)' },
  { fase: 14, periodo: 4, title: 'Fase 14: Notas Pontuadas e Subdivisão' },
  { fase: 15, periodo: 4, title: 'Fase 15: Andamento e Poco Rallentando' },
  { fase: 16, periodo: 4, title: 'Fase 16: Frases, Semifrases e Interpretação' },
] as const;

interface SimuladoMenuProps {
  quizMode: 'period' | 'phase';
  onSelectMode: (mode: 'period' | 'phase') => void;
  selectedPeriods: Set<number>;
  onTogglePeriod: (p: number) => void;
  onToggleSelectAllPeriods: () => void;
  selectedPhases: Set<number>;
  onTogglePhase: (f: number) => void;
  onToggleSelectAllPhases: () => void;
  errorMessage: string | null;
  onStartQuiz: () => void;
  onBack: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const SimuladoMenu: React.FC<SimuladoMenuProps> = ({
  quizMode,
  onSelectMode,
  selectedPeriods,
  onTogglePeriod,
  onToggleSelectAllPeriods,
  selectedPhases,
  onTogglePhase,
  onToggleSelectAllPhases,
  errorMessage,
  onStartQuiz,
  onBack,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const allPeriodsChecked = [1, 2, 3, 4].every((p) => selectedPeriods.has(p));
  const allPhasesChecked = MSA_PHASES_CATALOG.every((item) => selectedPhases.has(item.fase));

  const isStartDisabled =
    quizMode === 'period' ? selectedPeriods.size === 0 : selectedPhases.size === 0;

  return (
    <div
      className="max-w-xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex-1 flex flex-col justify-center text-center animate-fade relative"
      id="simulado-menu"
    >
      {onToggleFullscreen && (
        <div className="flex justify-end mb-1">
          <button
            type="button"
            data-testid="simulado-menu-fullscreen-btn"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Sair da tela cheia' : 'Expandir para tela cheia'}
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Expandir para tela cheia'}
            className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 shadow-xs'
            }`}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}</span>
          </button>
        </div>
      )}
      <img
        src={getAssetUrl('assets/fufu-capa-simulado.png')}
        className="w-20 sm:w-28 h-auto mx-auto mb-2.5 drop-shadow-lg animate-float"
        alt="Fufu Simulado"
      />
      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-1">Simulado MSA</h2>
      <p className="text-xs sm:text-sm text-slate-500 font-bold mb-4">
        Prepare-se para o teste de oficialização CCB respondendo questões reais do método.
      </p>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 text-left">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Seletor de Modalidade: Por Período (20q) vs Por Fase (10q) */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl mb-4 gap-1 border border-slate-300/60">
        <button
          id="tab-mode-period"
          onClick={() => onSelectMode('period')}
          className={`flex-1 py-2.5 px-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
            quizMode === 'period'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Layers size={16} />
          <span>Por Período</span>
          <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-black ml-0.5">
            20q
          </span>
        </button>

        <button
          id="tab-mode-phase"
          onClick={() => onSelectMode('phase')}
          className={`flex-1 py-2.5 px-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
            quizMode === 'phase'
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <BookOpen size={16} />
          <span>Por Fase</span>
          <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-black ml-0.5">
            10q
          </span>
        </button>
      </div>

      {/* Conteúdo do Modo POR PERÍODO */}
      {quizMode === 'period' && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-200 mb-5 text-left animate-slide">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Selecione os Períodos:
            </span>
            <button
              onClick={onToggleSelectAllPeriods}
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer min-h-[44px] px-2 -my-2 flex items-center"
            >
              {allPeriodsChecked ? 'Limpar Todos' : 'Selecionar Todos'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 1, name: 'Período 1', desc: 'Fases 1, 2 e 3' },
              { id: 2, name: 'Período 2', desc: 'Fases 4 e 5' },
              { id: 3, name: 'Período 3', desc: 'Fases 6, 7, 8 e 9' },
              { id: 4, name: 'Período 4', desc: 'Fases 10 a 16' },
            ].map((p) => {
              const isChecked = selectedPeriods.has(p.id);
              return (
                <button
                  key={`period-btn-${p.id}`}
                  onClick={() => onTogglePeriod(p.id)}
                  className={`p-3.5 rounded-xl border-2 text-left flex items-center justify-between transition-all cursor-pointer min-h-[56px] ${
                    isChecked
                      ? 'bg-indigo-50/60 border-indigo-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{p.name}</h4>
                    <p className="text-[11px] text-slate-400 font-bold">{p.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isChecked && <Check size={12} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conteúdo do Modo POR FASE */}
      {quizMode === 'phase' && (
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border-2 border-slate-200 mb-5 text-left animate-slide">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Fases ({selectedPhases.size} selecionadas):
            </span>
            <button
              id="btn-toggle-all-phases"
              onClick={onToggleSelectAllPhases}
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-800 cursor-pointer min-h-[44px] px-2 -my-2 flex items-center"
            >
              {allPhasesChecked ? 'Limpar Todas' : 'Selecionar Todas'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {MSA_PHASES_CATALOG.map((item) => {
              const isChecked = selectedPhases.has(item.fase);
              return (
                <button
                  key={`phase-btn-${item.fase}`}
                  id={`phase-btn-${item.fase}`}
                  onClick={() => onTogglePhase(item.fase)}
                  className={`p-2.5 rounded-xl border-2 text-left flex items-center justify-between transition-all cursor-pointer min-h-[48px] ${
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                      {item.periodo}º Período
                    </span>
                    <h5 className="font-extrabold text-slate-800 text-xs leading-snug truncate">
                      {item.title}
                    </h5>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {isChecked && <Check size={12} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <button
        id="btn-start-quiz"
        onClick={onStartQuiz}
        disabled={isStartDisabled}
        className={`w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm sm:text-base font-extrabold rounded-2xl border-b-4 border-emerald-700 active:border-b-0 hover:scale-[1.01] active:translate-y-1 transition-all cursor-pointer shadow-md mb-2.5 uppercase tracking-wider ${
          isStartDisabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {quizMode === 'period'
          ? 'Começar Simulado (20 Questões)'
          : `Começar Simulado (10 Questões)`}
      </button>

      <button
        id="btn-back-home"
        onClick={onBack}
        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
      >
        Voltar ao Início
      </button>
    </div>
  );
};
