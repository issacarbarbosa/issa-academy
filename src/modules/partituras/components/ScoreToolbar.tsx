import React from 'react';
import { Minus, Plus } from 'lucide-react';
import {
  MeasureClickMode,
  ScoreNote,
  TimbreType,
} from '../types/music';
import { PRESET_SCORES } from '../data/sampleScores';

interface ScoreToolbarProps {
  title: string;
  composer: string;
  timeSignature: string;
  keySignature: string;
  totalMeasures: number;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  clickMode: MeasureClickMode;
  onClickModeChange: (mode: MeasureClickMode) => void;
  timbre: TimbreType;
  onTimbreChange: (timbre: TimbreType) => void;
  noteHighlightColor: string;
  onNoteHighlightColorChange: (color: string) => void;
  activeNotes: ScoreNote[];
  currentMeasureNumber: number;
  currentBeatInMeasure: number;
  beatsPerMeasure: number;
  isPlaying: boolean;
  isCountingIn: boolean;
  countInBeat: number | null;
  activePresetId: string;
  onSelectPreset: (id: string) => void;
  onAuditionNote: (freq: number) => void;
  onAuditionPianoChord: () => void;
  onOpenMobileSettings: () => void;
}

export const ScoreToolbar: React.FC<ScoreToolbarProps> = ({
  title,
  composer,
  timeSignature,
  keySignature,
  totalMeasures,
  zoom,
  onZoomChange,
  clickMode,
  onClickModeChange,
  timbre,
  onTimbreChange,
  noteHighlightColor,
  onNoteHighlightColorChange,
  activeNotes,
  currentMeasureNumber,
  currentBeatInMeasure,
  beatsPerMeasure,
  isPlaying,
  isCountingIn,
  countInBeat,
  activePresetId,
  onSelectPreset,
  onAuditionNote,
  onAuditionPianoChord,
  onOpenMobileSettings,
}) => {
  const soundingNotes = activeNotes.filter((n) => !n.isRest);
  const activeBeat = isCountingIn ? countInBeat : isPlaying ? currentBeatInMeasure : null;

  return (
    <section
      aria-label="Controles de Visualização e Partitura"
      className="bg-slate-900/95 border-b border-slate-800/80 px-3.5 sm:px-6 py-2 sm:py-3"
    >
      {/* MOBILE COMPACT STUDIO BAR (< lg) */}
      <div className="flex flex-col gap-2 lg:hidden">
        {/* Row 1: Repertoire Selector + Ouvir Piano */}
        <div className="flex items-center gap-2 w-full">
          <select
            aria-label="Selecionar partitura de exemplo"
            value={activePresetId}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="min-w-0 flex-1 min-h-[42px] bg-slate-950 text-slate-100 text-xs font-semibold rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-amber-400 truncate"
          >
            {PRESET_SCORES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.composer}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onAuditionPianoChord}
            aria-label="Testar som de piano real"
            className="min-h-[42px] px-3 text-xs font-semibold text-amber-300 bg-amber-500/15 active:bg-amber-500/30 border border-amber-500/30 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
          >
            Ouvir Piano
          </button>
        </div>

        {/* Row 2: Compact Live Telemetry + 4-Beat Pulse Strip */}
        <div className="flex items-center justify-between gap-2 bg-slate-950/90 border border-slate-800/90 px-3 py-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-2 font-mono tabular-nums truncate">
            <span className="text-amber-400 font-bold">
              C{currentMeasureNumber}:{currentBeatInMeasure}
            </span>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            {soundingNotes.length > 0 ? (
              <button
                type="button"
                onClick={() => onAuditionNote(soundingNotes[0].frequency)}
                className="text-sky-400 font-semibold truncate cursor-pointer"
              >
                {soundingNotes.map((n) => n.pitchLabel).join('+')} (
                {Math.round(soundingNotes[0].frequency)}Hz)
              </button>
            ) : (
              <span className="text-slate-400 truncate">Pausa / Pronto</span>
            )}
          </div>

          {/* Inline Mobile Beat Pulse */}
          <div className="flex items-center gap-1 font-mono tabular-nums shrink-0">
            {Array.from({ length: beatsPerMeasure }, (_, i) => i + 1).map(
              (beatNum) => {
                const isBeatActive = activeBeat === beatNum;
                const isDownbeat = beatNum === 1;
                return (
                  <span
                    key={beatNum}
                    className={`w-5 h-5 flex items-center justify-center rounded text-[11px] font-bold ${
                      isBeatActive
                        ? isDownbeat
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-sky-500 text-slate-950'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {beatNum}
                  </span>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP FULL TOOLBAR (lg+) */}
      <div className="hidden lg:flex max-w-[1380px] mx-auto flex-wrap items-center justify-between gap-4">
        {/* Left: Score Title & Unboxed Metadata */}
        <div className="flex flex-col gap-0.5 min-w-[220px]">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-100 tracking-tight truncate">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{composer || 'Autor Clássico'}</span>
            <span aria-hidden="true">·</span>
            <span>Compasso {timeSignature}</span>
            <span aria-hidden="true">·</span>
            <span>{keySignature}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{totalMeasures} compassos</span>
          </div>
        </div>

        {/* Center: Live Active Note & Measure Readout */}
        <div className="flex items-center gap-4 text-xs text-slate-300 bg-slate-950/90 border border-slate-800 px-3.5 py-2 rounded-lg">
          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className="text-slate-400">Posição:</span>
            <span className="text-amber-400 font-semibold">
              C{currentMeasureNumber}:{currentBeatInMeasure}
            </span>
          </div>
          <span className="text-slate-700" aria-hidden="true">
            |
          </span>
          <div className="flex items-center gap-2 font-mono tabular-nums min-w-[155px]">
            <span className="text-slate-400">Nota Ativa:</span>
            {soundingNotes.length > 0 ? (
              <button
                type="button"
                onClick={() => onAuditionNote(soundingNotes[0].frequency)}
                title="Clique para ouvir a nota ativa no piano"
                className="text-sky-400 font-semibold hover:underline cursor-pointer whitespace-nowrap"
              >
                {soundingNotes.map((n) => n.pitchLabel).join(' + ')} (
                {Math.round(soundingNotes[0].frequency)} Hz)
              </button>
            ) : (
              <span className="text-slate-500">Pausa / Aguardando</span>
            )}
          </div>
        </div>

        {/* Right: Interactive Stage Controls (Click Mode, Timbre, Highlight Color, Zoom) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Click Behavior Control */}
          <div
            role="group"
            aria-label="Ação ao clicar no compasso"
            className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800"
          >
            <button
              type="button"
              onClick={() => onClickModeChange('seek')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                clickMode === 'seek'
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Clique: Ir ao Compasso
            </button>
            <button
              type="button"
              onClick={() => onClickModeChange('loop')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                clickMode === 'loop'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Clique: Selecionar Loop
            </button>
          </div>

          {/* Piano & Instrument Timbre Selector + Quick Audition Button */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="timbre-select"
              className="text-xs text-slate-400 whitespace-nowrap"
            >
              Piano:
            </label>
            <select
              id="timbre-select"
              value={timbre}
              onChange={(e) => onTimbreChange(e.target.value as TimbreType)}
              className="bg-slate-950 text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="acoustic-grand">Piano de Cauda Real (Steinway)</option>
              <option value="studio-upright">Piano Vertical de Estúdio</option>
              <option value="electric-rhodes">Piano Elétrico Vintage (Rhodes)</option>
              <option value="warm-triangle">Sintetizador Suave (Triangle)</option>
            </select>
            <button
              type="button"
              onClick={onAuditionPianoChord}
              aria-label="Testar som de piano real"
              className="px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Ouvir Piano
            </button>
          </div>

          {/* Notehead Highlight Color Selector */}
          <div
            role="group"
            aria-label="Cor de destaque da nota ativa"
            className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800"
          >
            <button
              type="button"
              onClick={() => onNoteHighlightColorChange('#3B82F6')}
              aria-label="Cor da nota: Azul Elétrico"
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                noteHighlightColor === '#3B82F6'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Nota Azul
            </button>
            <button
              type="button"
              onClick={() => onNoteHighlightColorChange('#EAB308')}
              aria-label="Cor da nota: Âmbar Dourado"
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                noteHighlightColor === '#EAB308'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Nota Âmbar
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => onZoomChange(zoom - 0.1)}
              aria-label="Reduzir zoom da partitura"
              className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono tabular-nums text-slate-200 px-1.5 min-w-[46px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => onZoomChange(zoom + 0.1)}
              aria-label="Aumentar zoom da partitura"
              className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
