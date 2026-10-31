import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Minus,
  Plus,
  ChevronDown,
  Sliders,
} from 'lucide-react';
import {
  CountInCondition,
  LoopConfig,
  MetronomeBeatMode,
  SpeedTrainingConfig,
  VoicePartInfo,
} from '../types/music';
import {
  clampBpm,
  formatTime,
  MIN_BPM,
  MAX_BPM,
} from '../utils/musicMath';

interface TransportBarProps {
  isPlaying: boolean;
  isCountingIn: boolean;
  countInBeat: number | null;
  countInTotalBeats: number;
  onTogglePlay: () => void;
  onRestart: () => void;
  elapsedSeconds: number;
  totalSeconds: number;
  currentBeatInMeasure: number;
  beatsPerMeasure: number;
  bpm: number;
  baseBpm: number;
  onBpmChange: (bpm: number) => void;
  speedTraining: SpeedTrainingConfig;
  onSpeedTrainingChange: (config: SpeedTrainingConfig) => void;
  loop: LoopConfig;
  onToggleLoop: () => void;
  metronomeEnabled: boolean;
  onToggleMetronome: () => void;
  metronomeBeatMode: MetronomeBeatMode;
  onMetronomeBeatModeChange: (mode: MetronomeBeatMode) => void;
  metronomeVolume: number;
  onMetronomeVolumeChange: (vol: number) => void;
  countInEnabled: boolean;
  onToggleCountIn: () => void;
  countInCondition: CountInCondition;
  onCountInConditionChange: (cond: CountInCondition) => void;
  countInBars: 1 | 2;
  onCountInBarsChange: (bars: 1 | 2) => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  noteHighlightColor: string;
  onNoteHighlightColorChange: (color: string) => void;
  highlightBar: boolean;
  onHighlightBarChange: (enabled: boolean) => void;
  highlightNotes: boolean;
  onHighlightNotesChange: (enabled: boolean) => void;
  isCordasHymnal: boolean;
  showViolinNeck: boolean;
  onToggleViolinNeck: () => void;
  showFingering: boolean;
  onShowFingeringChange: (enabled: boolean) => void;
  showPitchNames: boolean;
  onShowPitchNamesChange: (enabled: boolean) => void;
  showRhythmCounts: boolean;
  onShowRhythmCountsChange: (enabled: boolean) => void;
  showBarNumbers: boolean;
  onShowBarNumbersChange: (enabled: boolean) => void;
  showScoreTitle: boolean;
  onShowScoreTitleChange: (enabled: boolean) => void;
  horizontalNotation: boolean;
  onHorizontalNotationChange: (enabled: boolean) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  // Multi-Voice Mixer (Vozes / Pentagramas)
  voices?: VoicePartInfo[];
  activeStaffIndices: number[];
  onToggleStaffVoice: (staffIndex: number) => void;
  onSoloStaffVoice: (staffIndex: number) => void;
  onResetAllVoices: () => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  isPlaying,
  isCountingIn,
  countInBeat,
  onTogglePlay,
  onRestart,
  elapsedSeconds,
  totalSeconds,
  currentBeatInMeasure,
  beatsPerMeasure,
  bpm,
  baseBpm,
  onBpmChange,
  speedTraining,
  onSpeedTrainingChange,
  loop,
  onToggleLoop,
  metronomeEnabled,
  onToggleMetronome,
  metronomeBeatMode,
  onMetronomeBeatModeChange,
  metronomeVolume,
  onMetronomeVolumeChange,
  countInEnabled,
  onToggleCountIn,
  countInCondition,
  onCountInConditionChange,
  countInBars,
  onCountInBarsChange,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  isSettingsOpen,
  onToggleSettings,
  noteHighlightColor,
  onNoteHighlightColorChange,
  highlightBar,
  onHighlightBarChange,
  highlightNotes,
  onHighlightNotesChange,
  isCordasHymnal,
  showViolinNeck,
  onToggleViolinNeck,
  showFingering,
  onShowFingeringChange,
  showPitchNames,
  onShowPitchNamesChange,
  showRhythmCounts,
  onShowRhythmCountsChange,
  showBarNumbers,
  onShowBarNumbersChange,
  showScoreTitle,
  onShowScoreTitleChange,
  horizontalNotation,
  onHorizontalNotationChange,
  zoom,
  onZoomChange,
  voices,
  activeStaffIndices,
  onToggleStaffVoice,
  onSoloStaffVoice,
  onResetAllVoices,
}) => {
  const [activePopover, setActivePopover] = useState<'none' | 'speed' | 'metronome' | 'voices'>('none');
  const [bottomClipOffset, setBottomClipOffset] = useState<number>(0);
  const viewportProbeRef = useRef<HTMLDivElement | null>(null);

  // Detecta automaticamente quando o iframe do Google AI Studio ou barra do navegador mobile
  // corta a base da viewport ao expandir a tela, elevando a barra de transporte para ficar 100% visível.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let ioClip = 0;

    const computeVisualViewportClip = () => {
      const vv = window.visualViewport;
      if (!vv) return 0;
      return Math.max(0, Math.round(window.innerHeight - (vv.offsetTop + vv.height)));
    };

    const updateOffset = () => {
      const vvClip = computeVisualViewportClip();
      const nextOffset = Math.min(180, Math.max(0, ioClip, vvClip));
      setBottomClipOffset((prev) => (Math.abs(prev - nextOffset) >= 2 ? nextOffset : prev));
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && viewportProbeRef.current) {
      const thresholds = Array.from({ length: 41 }, (_, i) => Number((i / 40).toFixed(3)));
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (entry.intersectionRatio > 0 && entry.intersectionRatio < 0.995) {
            ioClip = Math.max(
              0,
              Math.round(entry.boundingClientRect.bottom - entry.intersectionRect.bottom)
            );
          } else {
            ioClip = 0;
          }
          updateOffset();
        },
        { root: null, threshold: thresholds }
      );
      observer.observe(viewportProbeRef.current);
    }

    updateOffset();
    window.addEventListener('resize', updateOffset);
    window.visualViewport?.addEventListener('resize', updateOffset);
    window.visualViewport?.addEventListener('scroll', updateOffset);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateOffset);
      window.visualViewport?.removeEventListener('resize', updateOffset);
      window.visualViewport?.removeEventListener('scroll', updateOffset);
    };
  }, []);

  const togglePopover = (target: 'speed' | 'metronome' | 'voices') => {
    if (isSettingsOpen) {
      onToggleSettings();
    }
    setActivePopover((prev) => (prev === target ? 'none' : target));
  };

  const handleOpenSettings = () => {
    setActivePopover('none');
    onToggleSettings();
  };

  const progressPercent =
    totalSeconds > 0
      ? Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100))
      : 0;

  const activeBeatNumber = isCountingIn
    ? countInBeat ?? 1
    : isPlaying
    ? currentBeatInMeasure
    : null;

  const speedPercent = Math.round((bpm / Math.max(30, baseBpm)) * 100);
  const hasMultiVoices = Boolean(voices && voices.length > 1);
  const popoverBottomPx = 66 + bottomClipOffset;

  return (
    <>
      {/* Sonda invisível para detectar corte inferior em iframes expandidos (ex.: Google AI Studio Mobile) */}
      <div
        ref={viewportProbeRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-0"
      />

      {/* 0. MULTI-VOICE MIXER POPOVER (Vozes / Pentagramas da Partitura) */}
      {activePopover === 'voices' && hasMultiVoices && voices && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActivePopover('none')}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Mixer de Vozes da Partitura"
            data-testid="voices-popover"
            style={{ bottom: `${popoverBottomPx}px` }}
            className="fixed right-3 sm:right-36 z-50 w-[300px] max-w-[calc(100vw-24px)] bg-white text-[#1F2937] border border-[#E5E7EB] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.18)] p-4 space-y-3 select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-zinc-900">
                Vozes / Pentagramas ({voices.length})
              </span>
              <button
                type="button"
                onClick={onResetAllVoices}
                className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Tocar todas
              </button>
            </div>

            <div className="space-y-1.5">
              {voices.map((v) => {
                const isVoiceActive = activeStaffIndices.includes(v.staffIndex);
                const isSolo =
                  activeStaffIndices.length === 1 && activeStaffIndices[0] === v.staffIndex;
                return (
                  <div
                    key={v.staffIndex}
                    className={`flex items-center justify-between gap-2 p-2 rounded-lg border transition-colors ${
                      isVoiceActive
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        : 'bg-zinc-100/50 border-zinc-200/50 text-zinc-400'
                    }`}
                  >
                    <button
                      type="button"
                      data-testid={`voice-toggle-${v.staffIndex}`}
                      onClick={() => onToggleStaffVoice(v.staffIndex)}
                      className="flex-1 text-left flex items-center gap-2 cursor-pointer"
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isVoiceActive ? 'bg-emerald-500' : 'bg-zinc-300'
                        }`}
                      />
                      <div>
                        <div className="text-xs font-semibold leading-tight">{v.label}</div>
                        {v.role && <div className="text-[10.5px] text-zinc-500">{v.role}</div>}
                      </div>
                    </button>

                    <button
                      type="button"
                      data-testid={`voice-solo-${v.staffIndex}`}
                      onClick={() => onSoloStaffVoice(v.staffIndex)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border cursor-pointer ${
                        isSolo
                          ? 'bg-amber-400 text-zinc-950 border-amber-500'
                          : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      Solo
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 1. SPEED & SPEED TRAINING POPOVER */}
      {activePopover === 'speed' && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActivePopover('none')}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Velocidade e Treino de Velocidade"
            data-testid="speed-popover"
            style={{ bottom: `${popoverBottomPx}px` }}
            className="fixed right-3 sm:right-28 z-50 w-[300px] max-w-[calc(100vw-24px)] bg-white text-[#1F2937] border border-[#E5E7EB] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.18)] p-4 space-y-3.5 select-none"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#374151]">
                  Velocidade: <strong className="text-[#111827]">{speedPercent}%</strong>
                </span>
                <span className="text-xs font-mono font-bold text-[#111827] tabular-nums">
                  {bpm} BPM
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onBpmChange(clampBpm(bpm - 3))}
                  aria-label="Diminuir velocidade"
                  className="w-8 h-8 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  aria-label="Controle deslizante de BPM"
                  min={MIN_BPM}
                  max={MAX_BPM}
                  step={1}
                  value={bpm}
                  onChange={(e) => onBpmChange(clampBpm(Number(e.target.value)))}
                  className="flex-1 h-1.5 accent-[#10B981] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => onBpmChange(clampBpm(bpm + 3))}
                  aria-label="Aumentar velocidade"
                  className="w-8 h-8 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {bpm !== baseBpm && (
                <button
                  type="button"
                  onClick={() => onBpmChange(baseBpm)}
                  className="mt-2 text-[11px] font-medium text-[#2563EB] hover:underline cursor-pointer"
                >
                  Restaurar 100% ({baseBpm} BPM)
                </button>
              )}
            </div>

            <div className="border-t border-[#E5E7EB]" />

            {/* Speed Training (Treino de velocidade) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#1F2937]">
                  Treino de velocidade
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={speedTraining.enabled}
                  aria-label="Ativar treino de velocidade"
                  data-testid="speed-training-toggle"
                  onClick={() =>
                    onSpeedTrainingChange({
                      ...speedTraining,
                      enabled: !speedTraining.enabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                    speedTraining.enabled ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-150 ${
                      speedTraining.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="st-initial-bpm" className="text-[#4B5563]">
                    Velocidade inicial
                  </label>
                  <div className="flex items-center border border-[#D1D5DB] rounded-lg px-2 py-1 bg-white">
                    <input
                      id="st-initial-bpm"
                      type="number"
                      min={MIN_BPM}
                      max={MAX_BPM}
                      value={speedTraining.initialBpm}
                      onChange={(e) =>
                        onSpeedTrainingChange({
                          ...speedTraining,
                          initialBpm: clampBpm(Number(e.target.value)),
                        })
                      }
                      className="w-12 text-right font-mono font-semibold text-[#111827] focus:outline-none"
                    />
                    <span className="ml-1 text-[#6B7280]">BPM</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="st-final-bpm" className="text-[#4B5563]">
                    Velocidade final
                  </label>
                  <div className="flex items-center border border-[#D1D5DB] rounded-lg px-2 py-1 bg-white">
                    <input
                      id="st-final-bpm"
                      type="number"
                      min={MIN_BPM}
                      max={MAX_BPM}
                      value={speedTraining.finalBpm}
                      onChange={(e) =>
                        onSpeedTrainingChange({
                          ...speedTraining,
                          finalBpm: clampBpm(Number(e.target.value)),
                        })
                      }
                      className="w-12 text-right font-mono font-semibold text-[#111827] focus:outline-none"
                    />
                    <span className="ml-1 text-[#6B7280]">BPM</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="st-inc-bpm" className="text-[#4B5563]">
                    Aumentar em...
                  </label>
                  <select
                    id="st-inc-bpm"
                    value={speedTraining.incrementBpm}
                    onChange={(e) =>
                      onSpeedTrainingChange({
                        ...speedTraining,
                        incrementBpm: Number(e.target.value),
                      })
                    }
                    className="border border-[#D1D5DB] rounded-lg px-2.5 py-1 bg-white font-semibold text-[#111827] focus:outline-none cursor-pointer"
                  >
                    <option value={2}>2 BPM</option>
                    <option value={5}>5 BPM</option>
                    <option value={10}>10 BPM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. METRONOME & COUNT-IN POPOVER */}
      {activePopover === 'metronome' && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActivePopover('none')}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Metrônomo e Contagem Regressiva"
            data-testid="metronome-popover"
            style={{ bottom: `${popoverBottomPx}px` }}
            className="fixed right-3 sm:right-12 z-50 w-[264px] max-w-[calc(100vw-24px)] bg-white text-[#1F2937] border border-[#E5E7EB] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.18)] p-4 space-y-3 select-none"
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={metronomeEnabled}
                aria-label="Ativar ou desativar Metrônomo"
                data-testid="metronome-switch"
                onClick={onToggleMetronome}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                  metronomeEnabled ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition duration-150 ${
                    metronomeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-[15px] font-semibold text-[#374151]">
                Metrônomo
              </span>
            </div>

            <select
              aria-label="Modo de batida do metrônomo"
              data-testid="metronome-mode-select"
              value={metronomeBeatMode}
              onChange={(e) =>
                onMetronomeBeatModeChange(e.target.value as MetronomeBeatMode)
              }
              className="w-full h-9 px-3 rounded-lg border border-[#D1D5DB] bg-white text-[13px] font-medium text-[#374151] focus:outline-none focus:border-[#9CA3AF] cursor-pointer"
            >
              <option value="every-beat">Em cada tempo</option>
              <option value="first-beat">Apenas no 1º tempo</option>
              <option value="eighth">Subdivisão (colcheias)</option>
            </select>

            <div className="flex items-center gap-2.5 h-9 px-3 rounded-lg border border-[#D1D5DB] bg-white">
              <Volume2 className="w-4 h-4 text-[#4B5563] shrink-0" />
              <input
                type="range"
                aria-label="Volume do metrônomo"
                data-testid="metronome-volume-slider"
                min={0}
                max={1}
                step={0.05}
                value={metronomeVolume}
                onChange={(e) => onMetronomeVolumeChange(Number(e.target.value))}
                className="flex-1 h-1 accent-[#9CA3AF] cursor-pointer"
              />
            </div>

            <div className="border-t border-[#E5E7EB] my-1" />

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={countInEnabled}
                aria-label="Ativar ou desativar Contagem regressiva"
                data-testid="countin-switch"
                onClick={onToggleCountIn}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                  countInEnabled ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition duration-150 ${
                    countInEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-[15px] font-semibold text-[#374151]">
                Contagem regressiva
              </span>
            </div>

            <select
              aria-label="Quando usar contagem regressiva"
              data-testid="countin-condition-select"
              value={countInCondition}
              onChange={(e) =>
                onCountInConditionChange(e.target.value as CountInCondition)
              }
              className="w-full h-9 px-3 rounded-lg border border-[#D1D5DB] bg-white text-[13px] font-medium text-[#374151] focus:outline-none focus:border-[#9CA3AF] cursor-pointer"
            >
              <option value="always">Sempre</option>
              <option value="start-only">Apenas no início</option>
              <option value="loop-only">Apenas em loops</option>
            </select>

            <select
              aria-label="Duração da contagem regressiva"
              data-testid="countin-bars-select"
              value={countInBars}
              onChange={(e) =>
                onCountInBarsChange(Number(e.target.value) as 1 | 2)
              }
              className="w-full h-9 px-3 rounded-lg border border-[#D1D5DB] bg-white text-[13px] font-medium text-[#374151] focus:outline-none focus:border-[#9CA3AF] cursor-pointer"
            >
              <option value={1}>1 compasso</option>
              <option value={2}>2 compassos</option>
            </select>
          </div>
        </>
      )}

      {/* 3. NON-REDUNDANT SOUNDSLICE SETTINGS POPOVER (Layout, Notação, Estilo & Áudio) */}
      {isSettingsOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onToggleSettings}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Personalizar Layout e Notação"
            data-testid="settings-popover"
            style={{ bottom: `${popoverBottomPx - 2}px` }}
            className="fixed right-2 sm:right-4 z-50 w-[332px] sm:w-[364px] max-w-[calc(100vw-16px)] max-h-[78vh] overflow-y-auto bg-white text-[#1F2937] border border-[#E5E7EB] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.22)] p-4 space-y-4 select-none"
          >
            {/* Section 1: Personalizar layout */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Personalizar layout
                </h3>
                <button
                  type="button"
                  onClick={onToggleSettings}
                  className="text-xs font-semibold text-[#4B5563] hover:text-[#111827] cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-[#374151]">
                  Zoom ({Math.round(zoom * 100)}%)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onZoomChange(zoom - 0.1)}
                    aria-label="Reduzir zoom"
                    className="w-7 h-7 rounded-md bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center text-[#374151] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    aria-label="Zoom da partitura"
                    min={0.55}
                    max={2.2}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => onZoomChange(Number(e.target.value))}
                    className="w-24 h-1 accent-[#4B5563] cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => onZoomChange(zoom + 0.1)}
                    aria-label="Aumentar zoom"
                    className="w-7 h-7 rounded-md bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center text-[#374151] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[13px] font-medium text-[#374151]">
                  Notação horizontal
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={horizontalNotation}
                  aria-label="Alternar notação horizontal"
                  data-testid="toggle-horizontal-notation"
                  onClick={() => onHorizontalNotationChange(!horizontalNotation)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                    horizontalNotation ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-150 ${
                      horizontalNotation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-[#E5E7EB]" />

            {/* Section 2: Personalizar notação */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Personalizar notação
              </h3>

              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#374151]">
                  Nomes das notas (Dó, Ré...)
                </span>
                <button
                  type="button"
                  data-testid="toggle-pitch-names"
                  onClick={() => onShowPitchNamesChange(!showPitchNames)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer ${
                    showPitchNames
                      ? 'bg-[#374151] text-white border-[#374151]'
                      : 'bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]'
                  }`}
                >
                  {showPitchNames ? 'Mostrar' : 'Ocultar'}
                </button>
              </div>

              {isCordasHymnal && (
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[#374151]">
                    Dedilhado e arcadas
                  </span>
                  <button
                    type="button"
                    data-testid="toggle-fingering"
                    onClick={() => onShowFingeringChange(!showFingering)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer ${
                      showFingering
                        ? 'bg-[#374151] text-white border-[#374151]'
                        : 'bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]'
                    }`}
                  >
                    {showFingering ? 'Mostrar' : 'Ocultar'}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#374151]">
                  Contagem rítmica (1 2 3 4)
                </span>
                <button
                  type="button"
                  data-testid="toggle-rhythm-counts"
                  onClick={() => onShowRhythmCountsChange(!showRhythmCounts)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer ${
                    showRhythmCounts
                      ? 'bg-[#374151] text-white border-[#374151]'
                      : 'bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]'
                  }`}
                >
                  {showRhythmCounts ? 'Mostrar' : 'Ocultar'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#374151]">
                  Numeração de compassos
                </span>
                <div className="inline-flex rounded-md border border-[#D1D5DB] overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => onShowBarNumbersChange(true)}
                    className={`px-2 py-1 font-semibold cursor-pointer ${
                      showBarNumbers
                        ? 'bg-[#374151] text-white'
                        : 'bg-white text-[#4B5563]'
                    }`}
                  >
                    Cada compasso
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowBarNumbersChange(false)}
                    className={`px-2 py-1 font-semibold border-l border-[#D1D5DB] cursor-pointer ${
                      !showBarNumbers
                        ? 'bg-[#374151] text-white'
                        : 'bg-white text-[#4B5563]'
                    }`}
                  >
                    Ocultar
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#374151]">
                  Título da partitura
                </span>
                <button
                  type="button"
                  onClick={() => onShowScoreTitleChange(!showScoreTitle)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer ${
                    showScoreTitle
                      ? 'bg-[#374151] text-white border-[#374151]'
                      : 'bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]'
                  }`}
                >
                  {showScoreTitle ? 'Mostrar' : 'Ocultar'}
                </button>
              </div>
            </div>

            <div className="border-t border-[#E5E7EB]" />

            {/* Section 3: Estilo do reprodutor */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Estilo do reprodutor
              </h3>

              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#374151]">
                  Cor do destaque
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { label: 'Azul', value: '#3B82F6' },
                    { label: 'Âmbar', value: '#EAB308' },
                    { label: 'Verde', value: '#10B981' },
                  ].map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onNoteHighlightColorChange(c.value)}
                      className={`px-2 py-1 rounded-md text-xs font-semibold border cursor-pointer ${
                        noteHighlightColor === c.value
                          ? 'bg-[#374151] text-white border-[#374151]'
                          : 'bg-white text-[#4B5563] border-[#D1D5DB]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[13px] font-medium text-[#374151]">
                  Destacar:
                </span>
                <div className="flex items-center gap-3 text-xs font-medium text-[#374151]">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={highlightBar}
                      onChange={(e) => onHighlightBarChange(e.target.checked)}
                      className="rounded accent-[#10B981] cursor-pointer"
                    />
                    <span>Compasso</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={highlightNotes}
                      onChange={(e) => onHighlightNotesChange(e.target.checked)}
                      className="rounded accent-[#10B981] cursor-pointer"
                    />
                    <span>Notas</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-[#E5E7EB]" />

            {/* Section 4: Áudio (Volume do Piano) */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Áudio
              </h3>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onToggleMute}
                  className={`px-2.5 h-8 rounded-lg text-xs font-semibold border flex items-center gap-1 cursor-pointer ${
                    isMuted
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-[#F3F4F6] text-[#374151] border-[#D1D5DB]'
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Mudo</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Som</span>
                    </>
                  )}
                </button>
                <input
                  type="range"
                  aria-label="Volume do piano"
                  min={0}
                  max={1}
                  step={0.02}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="flex-1 h-1 accent-[#4B5563] cursor-pointer"
                />
                <span className="text-xs font-mono tabular-nums text-[#4B5563] w-9 text-right">
                  {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MINIMALIST SOUNDSLICE DARK CHARCOAL BOTTOM BAR (#2B2C30) */}
      <footer
        aria-label="Barra de Transporte Musical"
        style={bottomClipOffset > 0 ? { marginBottom: `${bottomClipOffset}px` } : undefined}
        className="relative w-full shrink-0 z-40 bg-[#2B2C30] text-white select-none touch-manipulation shadow-[0_-2px_10px_rgba(0,0,0,0.18)] pb-[max(env(safe-area-inset-bottom,0px),4px)]"
      >
        <div className="w-full h-[2px] bg-[#1F2023] overflow-hidden">
          <div
            className="h-full bg-amber-400 transition-transform duration-75 origin-left"
            style={{ transform: `scaleX(${progressPercent / 100})` }}
          />
        </div>

        <div className="max-w-[1440px] mx-auto px-2 sm:px-5 h-[56px] flex items-center justify-between gap-1 sm:gap-3">
          {/* Left: White Circular Play Button + Time + Inline Beat Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pausar reprodução' : 'Iniciar reprodução'}
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-gray-100 active:scale-95 text-[#2B2C30] flex items-center justify-center shadow-md transition-transform cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-[#2B2C30] text-[#2B2C30]" />
              ) : (
                <div className="flex flex-col items-center justify-center leading-none">
                  <Play
                    className={`w-4 h-4 fill-[#2B2C30] text-[#2B2C30] ml-0.5 ${
                      countInEnabled ? '-mt-1' : ''
                    }`}
                  />
                  {countInEnabled && (
                    <span className="text-[8.5px] font-extrabold tracking-tighter text-[#2B2C30] -mt-0.5 ml-1">
                      123
                    </span>
                  )}
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={onRestart}
              aria-label="Reiniciar ao início"
              title="Reiniciar ao início"
              className="flex w-8 h-8 rounded-lg bg-[#191A1D] hover:bg-black text-gray-300 hover:text-white items-center justify-center cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-300">
              <span className="tabular-nums text-gray-200">
                {formatTime(elapsedSeconds)} / {formatTime(totalSeconds)}
              </span>
            </div>

            <div
              data-testid="transport-metronome-beats"
              className="hidden lg:flex items-center gap-1 bg-[#191A1D] px-2 py-1 rounded-lg border border-white/10"
            >
              {Array.from({ length: beatsPerMeasure }, (_, idx) => {
                const bNum = idx + 1;
                const isActiveBeat = activeBeatNumber === bNum;
                const isStrongBeat = bNum === 1;
                return (
                  <span
                    key={bNum}
                    data-testid={`transport-beat-dot-${bNum}`}
                    data-active={isActiveBeat ? 'true' : 'false'}
                    className={`w-5 h-5 rounded text-[11px] font-mono font-bold flex items-center justify-center transition-all ${
                      isActiveBeat
                        ? isCountingIn
                          ? 'bg-amber-400 text-[#191A1D] scale-105'
                          : isStrongBeat
                          ? 'bg-amber-400 text-[#191A1D] scale-105'
                          : 'bg-blue-500 text-white scale-105'
                        : 'text-gray-400'
                    }`}
                  >
                    {bNum}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right: Soundslice Transport Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* 0. Multi-Voice Mixer Button (when active score has multiple voices/staves) */}
            {hasMultiVoices && voices && (
              <button
                type="button"
                data-testid="transport-voices-btn"
                onClick={() => togglePopover('voices')}
                aria-label="Selecionar vozes ou pentagramas do hino"
                aria-expanded={activePopover === 'voices'}
                className={`h-9 sm:h-10 px-2 sm:px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shrink-0 ${
                  activePopover === 'voices' || activeStaffIndices.length < voices.length
                    ? 'bg-[#111214] text-amber-400 border border-amber-400/40'
                    : 'bg-[#191A1D] hover:bg-[#111214] text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden min-[440px]:inline text-[12px] sm:text-[12.5px] font-semibold">
                  Vozes
                </span>
                <span className="text-[11px] sm:text-[12px] font-semibold tabular-nums">
                  ({activeStaffIndices.length}/{voices.length})
                </span>
              </button>
            )}

            {/* 1. Speed / BPM Control */}
            <button
              type="button"
              data-testid="transport-speed-btn"
              onClick={() => togglePopover('speed')}
              aria-label="Ajustar andamento BPM e treino de velocidade"
              aria-expanded={activePopover === 'speed'}
              className={`h-9 sm:h-10 px-2 sm:px-3 rounded-lg flex items-center gap-0.5 sm:gap-1 cursor-pointer transition-colors shrink-0 ${
                activePopover === 'speed' || speedTraining.enabled
                  ? 'bg-[#111214] text-amber-400 border border-amber-400/40'
                  : 'bg-[#191A1D] hover:bg-[#111214] text-white'
              }`}
            >
              <span className="text-[13px] sm:text-[14px] font-bold tabular-nums tracking-tight">
                {bpm}
              </span>
              <span className="text-[10.5px] sm:text-[11px] font-medium text-gray-300">BPM</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* 2. Loop Button ([↻ Loop]) */}
            <div
              data-testid="transport-loop-indicator"
              className={`flex items-center h-9 sm:h-10 rounded-lg transition-all shrink-0 ${
                loop.enabled
                  ? 'bg-[#191A1D] text-white border border-white/15'
                  : 'bg-[#191A1D]/70 text-gray-200 hover:bg-[#191A1D]'
              }`}
            >
              <button
                type="button"
                data-testid="transport-loop-toggle-btn"
                onClick={onToggleLoop}
                aria-label={
                  loop.enabled
                    ? 'Desativar Loop'
                    : 'Ativar Loop no compasso atual'
                }
                aria-pressed={loop.enabled}
                className="h-full px-2 sm:px-3 flex items-center gap-1.5 hover:text-white cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
                <span className="hidden sm:inline text-[13px] font-medium">
                  Loop
                </span>
              </button>
            </div>

            {/* 3. Violin Fingerboard Toggle (Disponível no Hinário de Cordas) */}
            {isCordasHymnal && (
              <button
                type="button"
                data-testid="transport-violin-btn"
                onClick={onToggleViolinNeck}
                aria-label={
                  showViolinNeck
                    ? 'Ocultar braço do violino'
                    : 'Mostrar braço do violino (Sol, Ré, Lá, Mi)'
                }
                aria-pressed={showViolinNeck}
                title="Espelho visual do braço do violino"
                className={`h-9 sm:h-10 px-2 sm:px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  showViolinNeck
                    ? 'bg-[#191A1D] text-amber-400 border border-amber-400/40'
                    : 'bg-[#191A1D]/70 hover:bg-[#191A1D] text-gray-200 hover:text-white'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 3v18" />
                  <path d="M13 3v18" />
                  <path d="M8 7c0-2 2-3 4-3s4 1 4 3-1.5 3-1.5 5S16 15 16 17.5 14 21 12 21s-4-1-4-3.5 1.5-3.5 1.5-5.5S8 9 8 7Z" />
                </svg>
                <span className="hidden md:inline text-[12.5px] font-semibold">
                  Violino
                </span>
              </button>
            )}

            {/* 4. Metronome & Count-in Popover Button */}
            <button
              type="button"
              data-testid="transport-metronome-btn"
              onClick={() => togglePopover('metronome')}
              aria-label="Abrir configurações de Metrônomo e Contagem regressiva"
              aria-expanded={activePopover === 'metronome'}
              title="Metrônomo e Contagem regressiva (Count-in)"
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                activePopover === 'metronome' || metronomeEnabled || countInEnabled
                  ? 'bg-[#191A1D] text-white border border-white/15'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 20L9.5 5h5L18 20H6z" />
                <line x1="7.5" y1="16.5" x2="16.5" y2="16.5" />
                <line x1="12" y1="16.5" x2="18.5" y2="6.5" />
                <circle cx="17.5" cy="8" r="1.4" fill="currentColor" />
              </svg>
              {countInEnabled && (
                <span
                  data-testid="metronome-countin-badge"
                  className="absolute -top-1 -right-1 px-1 rounded bg-[#10B981] text-[9px] font-mono font-extrabold text-white leading-tight"
                >
                  123
                </span>
              )}
            </button>

            {/* 6. Clean Settings Button */}
            <button
              type="button"
              data-testid="transport-settings-btn"
              onClick={handleOpenSettings}
              aria-label="Abrir configurações de layout e notação"
              aria-expanded={isSettingsOpen}
              title="Personalizar layout, notação e áudio"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isSettingsOpen
                  ? 'bg-[#191A1D] text-amber-400 border border-amber-400/40'
                  : 'text-gray-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2.5" />
                <line x1="8" y1="7" x2="8" y2="17" />
                <line x1="12" y1="7" x2="12" y2="17" />
                <line x1="16" y1="7" x2="16" y2="17" />
                <circle cx="8" cy="10" r="1.6" fill="#2B2C30" />
                <circle cx="12" cy="14" r="1.6" fill="#2B2C30" />
                <circle cx="16" cy="9.5" r="1.6" fill="#2B2C30" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
