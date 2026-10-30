import React from 'react';

interface CountInBannerProps {
  isCountingIn: boolean;
  countInBeat: number | null;
  countInTotalBeats: number;
  isPlaying: boolean;
  metronomeEnabled: boolean;
  currentBeatInMeasure: number;
  beatsPerMeasure: number;
}

export const CountInBanner: React.FC<CountInBannerProps> = ({
  isCountingIn,
  countInBeat,
  countInTotalBeats,
  isPlaying,
  metronomeEnabled,
  currentBeatInMeasure,
  beatsPerMeasure,
}) => {
  const totalBeats = isCountingIn ? countInTotalBeats : beatsPerMeasure;
  const activeBeat = isCountingIn ? countInBeat : isPlaying ? currentBeatInMeasure : null;

  return (
    <div
      aria-live="polite"
      className="hidden lg:flex max-w-[1380px] mx-auto px-6 pt-3.5 flex-nowrap items-center justify-between gap-3"
    >
      {/* Left: Visual Metronome Beat Sequencer ("1... 2... 3... 4...") */}
      <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl shrink-0">
        <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
          {isCountingIn ? 'Contagem (Count-in):' : 'Pulso do Compasso:'}
        </span>

        <div className="flex items-center gap-1.5 font-mono tabular-nums">
          {Array.from({ length: totalBeats }, (_, i) => i + 1).map((beatNum) => {
            const isBeatActive = activeBeat === beatNum;
            const isDownbeat = beatNum === 1;
            return (
              <div
                key={beatNum}
                className={`px-2 py-0.5 rounded-md text-xs font-bold transition-transform duration-100 ${
                  isBeatActive
                    ? isDownbeat
                      ? 'bg-amber-400 text-slate-950 scale-105 shadow-xs'
                      : 'bg-sky-500 text-slate-950 scale-105 shadow-xs'
                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                {beatNum}
                {beatNum < totalBeats ? '...' : ''}
              </div>
            );
          })}
        </div>

        <span className="text-xs text-slate-400 whitespace-nowrap">
          {metronomeEnabled
            ? 'Tempo 1: 1200 Hz · Tempos 2–4: 800 Hz'
            : 'Metrônomo silenciado'}
        </span>
      </div>

      {/* Right: Interactive Help / Measure Selection Hint */}
      <div className="text-xs text-slate-400 truncate">
        Clique em qualquer compasso da partitura para posicionar o cursor ou definir o Loop.
      </div>
    </div>
  );
};
