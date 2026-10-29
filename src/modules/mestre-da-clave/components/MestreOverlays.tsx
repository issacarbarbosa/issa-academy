import React from 'react';
import { getAssetUrl } from '../../../core/utils/paths';
import { ClefType, CLEF_CONFIGS } from '../engine/gameEntities';

interface MestreOverlaysProps {
  gameState: 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';
  selectedClef: ClefType;
  onSelectClef: (clef: ClefType) => void;
  score: number;
  level: number;
  highScore: number;
  pausesLeft: number;
  onStartGame: () => void;
  onPauseToggle: () => void;
  onResetToStart: () => void;
  onBack: () => void;
}

export const MestreOverlays: React.FC<MestreOverlaysProps> = ({
  gameState,
  selectedClef,
  onSelectClef,
  score,
  level,
  highScore,
  pausesLeft,
  onStartGame,
  onPauseToggle,
  onResetToStart,
  onBack,
}) => {
  if (gameState === 'PLAYING') return null;

  const currentConfig = CLEF_CONFIGS[selectedClef] || CLEF_CONFIGS.sol;
  const firstNote = currentConfig.progression[0]?.base || 'Dó';
  const secondNote = currentConfig.progression[1]?.base || 'Ré';

  const clefOptions: { id: ClefType; name: string; line: string; symbol: string }[] = [
    { id: 'sol', name: 'Sol', line: '2ª Linha', symbol: '𝄞' },
    { id: 'fa', name: 'Fá', line: '4ª Linha', symbol: '𝄢' },
    { id: 'do', name: 'Dó', line: '3ª Linha', symbol: '𝄡' },
  ];

  return (
    <>
      {/* ==================== TELA DE INÍCIO (START) ==================== */}
      {gameState === 'START' && (
        <div
          className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-50 overflow-y-auto flex flex-col items-center justify-center p-3 sm:p-4 py-4"
          id="mestre-start-overlay"
        >
          <div className="bg-white p-4 sm:p-6 rounded-3xl text-center max-w-sm sm:max-w-2xl w-full border-2 border-slate-200 shadow-2xl animate-pop flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center my-auto">
            <div className="w-full sm:w-1/2 flex flex-col items-center sm:border-r sm:border-slate-100 sm:pr-4">
              <img
                src={getAssetUrl('assets/fufu-capa-mestre-da-clave.png')}
                className="w-16 sm:w-24 h-auto object-contain mx-auto mb-1.5 drop-shadow-lg"
                alt="Fufu Mestre da Clave"
              />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                Mestre da Clave
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-bold leading-normal mt-1">
                Comece com <strong className="text-indigo-600 font-black">{firstNote} e {secondNote}</strong>.<br />
                Acerte as notas na pauta e suba de nível! 🚀
              </p>
              <div className="mt-2 text-[10px] sm:text-xs text-amber-500 font-black uppercase tracking-wider">
                🏆 RECORDE ({currentConfig.name}): {highScore}
              </div>
            </div>

            <div className="w-full sm:w-1/2 flex flex-col gap-2.5">
              {/* Seletor de Clave com touch target >= 44px */}
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Selecione a Clave:
                </span>
                <div className="grid grid-cols-3 gap-1.5" id="clef-selector-group">
                  {clefOptions.map((opt) => {
                    const isSelected = selectedClef === opt.id;
                    return (
                      <button
                        key={`clef-opt-${opt.id}`}
                        id={`clef-select-${opt.id}`}
                        onClick={() => onSelectClef(opt.id)}
                        className={`p-2 min-h-[44px] rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-sm ring-2 ring-sky-400/20'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="text-base sm:text-lg leading-none font-serif">{opt.symbol}</span>
                        <span className="text-[11px] font-black mt-0.5">{opt.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold leading-none">{opt.line}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                id="btn-mestre-start"
                onClick={onStartGame}
                className="w-full py-3.5 bg-[#4ade80] hover:bg-[#22c55e] text-white font-extrabold rounded-2xl border-b-4 border-emerald-700 active:border-b-0 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider shadow-md mt-1"
              >
                COMEÇAR ({currentConfig.name})
              </button>

              <button
                onClick={onBack}
                className="w-full py-2.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-slate-700 font-extrabold rounded-2xl border-b-4 border-slate-400 active:border-b-0 active:translate-y-1 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
              >
                VOLTAR AO INÍCIO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TELA DE PAUSA (PAUSED) ==================== */}
      {gameState === 'PAUSED' && (
        <div
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 overflow-y-auto flex flex-col items-center justify-center p-3 sm:p-4 py-4"
          id="mestre-paused-overlay"
        >
          <div className="bg-white p-4 sm:p-6 rounded-3xl text-center max-w-sm sm:max-w-2xl w-full border-2 border-slate-200 shadow-2xl my-auto animate-pop flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center">
            <div className="w-full sm:w-1/2 flex flex-col items-center sm:border-r sm:border-slate-100 sm:pr-4">
              <img
                src={getAssetUrl('assets/fufu-pensativo.png')}
                className="w-16 sm:w-20 h-auto object-contain mx-auto mb-1.5"
                alt="Fufu Pausado"
              />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                Jogo Pausado
              </h2>
              <div className="mt-1 inline-flex items-center gap-1 bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full text-[10px] font-black border border-sky-200">
                <span>{currentConfig.symbol}</span>
                <span>{currentConfig.name}</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-bold mt-1.5">
                Pausas restantes: <strong className="text-amber-500 font-black">{pausesLeft}</strong>
              </p>
            </div>

            <div className="w-full sm:w-1/2 flex flex-col gap-2">
              <button
                onClick={onPauseToggle}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl border-b-4 border-emerald-700 active:border-b-0 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider shadow-md"
              >
                Continuar
              </button>

              <button
                onClick={onResetToStart}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl border-b-4 border-amber-700 active:border-b-0 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
              >
                Trocar Clave / Reiniciar
              </button>

              <button
                onClick={onBack}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl border-b-4 border-red-800 active:border-b-0 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
              >
                Sair do Jogo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TELA DE FIM DE JOGO (GAMEOVER) ==================== */}
      {gameState === 'GAMEOVER' && (
        <div
          className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 overflow-y-auto flex flex-col items-center justify-center p-3 sm:p-4 py-4"
          id="mestre-gameover-overlay"
        >
          <div className="bg-white p-4 sm:p-6 rounded-3xl text-center max-w-sm sm:max-w-2xl w-full border-2 border-slate-200 shadow-2xl my-auto animate-pop flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center">
            <div className="w-full sm:w-1/2 flex flex-col items-center sm:border-r sm:border-slate-100 sm:pr-4">
              <img
                src={getAssetUrl('assets/fufu-erro-acontece.png')}
                className="w-16 sm:w-22 h-auto object-contain mx-auto mb-1.5"
                alt="Fufu Game Over"
              />
              <h2 className="text-lg sm:text-xl font-black text-red-500 leading-tight">
                Fim de Jogo!
              </h2>
              <div className="mt-1 inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-slate-200">
                <span>{currentConfig.symbol}</span>
                <span>{currentConfig.name}</span>
              </div>
              <div className="text-[10px] text-indigo-500 font-black uppercase tracking-wider mt-1.5">
                🏆 Recorde ({currentConfig.name}): {highScore} pts
              </div>
            </div>

            <div className="w-full sm:w-1/2 flex flex-col gap-2">
              <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200 shadow-inner">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">
                  Sua Pontuação
                </p>
                <div className="text-xl sm:text-2xl font-black text-indigo-600">{score}</div>
                <div className="text-[9px] font-black text-amber-500 mt-0.5 uppercase">
                  NÍVEL ALCANÇADO: {level}
                </div>
              </div>

              <button
                onClick={onStartGame}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl border-b-4 border-emerald-700 active:border-b-0 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider shadow-md"
              >
                Jogar Novamente
              </button>

              <button
                onClick={onResetToStart}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl border-b-4 border-slate-300 active:border-b-0 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
              >
                Trocar Clave
              </button>

              <button
                onClick={onBack}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl border-b-4 border-slate-300 active:border-b-0 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
