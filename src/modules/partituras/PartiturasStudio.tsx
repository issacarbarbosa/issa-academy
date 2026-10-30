import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../core/contexts/AdminContext';
import { TopBar } from './components/TopBar';
import { TransportBar } from './components/TransportBar';
import { ViolinFingerboard } from './components/ViolinFingerboard';
import { RepertoirePanelModal } from './components/RepertoirePanelModal';
import {
  PRESET_SCORES,
  loadCatalogFromStorage,
  loadHiddenPresetIds,
  fetchCatalogFromSupabase,
  reimportScoreMusicXmlInStorage,
  addImportedScoreToStorage,
  restoreDefaultScoreInStorage,
  deleteScoreFromStorage,
  restoreHiddenFactoryScoresInStorage,
  updateScoreMetadataInStorage,
  removeScoreClefInStorage,
} from './data/sampleScores';
import { ScoreController } from './services/ScoreController';
import { AudioScheduler, SchedulerFramePayload } from './services/AudioScheduler';
import {
  CountInCondition,
  LoopConfig,
  MeasureBoundingBox,
  MetronomeBeatMode,
  MsaClefType,
  NotePayload,
  PresetScore,
  ScoreSliceEvent,
  SpeedTrainingConfig,
  UserRoleMode,
} from './types/music';
import {
  formatRhythmCount,
  getLoopBeatBounds,
  midiToPedagogicalAnnotation,
  normalizeLoopRange,
  resolveScoreXmlForClef,
  ScoreMetadataUpdate,
} from './utils/musicMath';

export default function PartiturasStudio() {
  const navigate = useNavigate();
  const { isAdmin, mode, setMode } = useAdmin();

  // Catálogo Estruturado (PRESET_SCORES + substituições/importações MusicXML do Administrador via Supabase / localStorage)
  const [catalogScores, setCatalogScores] = useState<PresetScore[]>(() =>
    loadCatalogFromStorage()
  );
  const [hiddenFactoryCount, setHiddenFactoryCount] = useState<number>(() =>
    loadHiddenPresetIds().length
  );

  useEffect(() => {
    void fetchCatalogFromSupabase().then((cloudCatalog) => {
      if (cloudCatalog) {
        setCatalogScores(cloudCatalog);
      }
    });
  }, []);

  // Sincronização Bidirecional entre AdminContext (global) e Estúdio de Partituras
  const [userRole, setUserRole] = useState<UserRoleMode>(() =>
    isAdmin && mode === 'edicao' ? 'admin' : 'student'
  );

  useEffect(() => {
    setUserRole(isAdmin && mode === 'edicao' ? 'admin' : 'student');
  }, [isAdmin, mode]);

  const handleUserRoleChange = useCallback(
    (role: UserRoleMode) => {
      if (!isAdmin) {
        setUserRole('student');
        return;
      }
      setUserRole(role);
      setMode(role === 'admin' ? 'edicao' : 'aluno');
    },
    [isAdmin, setMode]
  );

  // Preset & Score Metadata State
  const [activePresetId, setActivePresetId] = useState<string>(PRESET_SCORES[0].id);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [scoreTitle, setScoreTitle] = useState<string>(PRESET_SCORES[0].title);
  const [baseBpm, setBaseBpm] = useState<number>(PRESET_SCORES[0].defaultBpm);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isScoreLoading, setIsScoreLoading] = useState<boolean>(true);
  const [isRepertoireOpen, setIsRepertoireOpen] = useState<boolean>(false);

  // Clave ativa nas lições de Solfejo do MSA (3 claves oficiais: 'sol' | 'do' | 'fa')
  const [msaClef, setMsaClef] = useState<MsaClefType>('sol');
  const [activeVoiceId, setActiveVoiceId] = useState<string>('all');

  // Multi-Voice Mixer State (Active Staff Indices, 0-indexed)
  const [activeStaffIndices, setActiveStaffIndices] = useState<number[]>([0]);

  // Notation & Player Appearance Toggles (Soundslice Settings)
  const [showPitchNames, setShowPitchNames] = useState<boolean>(true);
  const [showFingering, setShowFingering] = useState<boolean>(true);
  const [showRhythmCounts, setShowRhythmCounts] = useState<boolean>(false);
  const [showBarNumbers, setShowBarNumbers] = useState<boolean>(false);
  const [showScoreTitle, setShowScoreTitle] = useState<boolean>(false);
  const [horizontalNotation, setHorizontalNotation] = useState<boolean>(false);
  const [highlightBar, setHighlightBar] = useState<boolean>(true);
  const [highlightNotes, setHighlightNotes] = useState<boolean>(true);
  const [noteHighlightColor, setNoteHighlightColor] = useState<string>('#3B82F6');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showViolinNeck, setShowViolinNeck] = useState<boolean>(false);

  // Playback & Transport State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCountingIn, setIsCountingIn] = useState<boolean>(false);
  const [countInBeat, setCountInBeat] = useState<number | null>(null);
  const [countInTotalBeats, setCountInTotalBeats] = useState<number>(4);
  const [bpm, setBpm] = useState<number>(PRESET_SCORES[0].defaultBpm);
  const [speedTraining, setSpeedTraining] = useState<SpeedTrainingConfig>({
    enabled: false,
    initialBpm: 55,
    finalBpm: 90,
    incrementBpm: 5,
  });

  const [zoom, setZoom] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 0.92 : 1.08
  );

  // Metronome & Count-in State (inside Metronome popover)
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(true);
  const [metronomeBeatMode, setMetronomeBeatMode] = useState<MetronomeBeatMode>('every-beat');
  const [metronomeVolume, setMetronomeVolume] = useState<number>(0.75);
  const [countInEnabled, setCountInEnabled] = useState<boolean>(false);
  const [countInCondition, setCountInCondition] = useState<CountInCondition>('always');
  const [countInBars, setCountInBars] = useState<1 | 2>(1);

  const [volume, setVolume] = useState<number>(0.88);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Measure, Slice & Timing Readouts
  const [measures, setMeasures] = useState<MeasureBoundingBox[]>([]);
  const [fullScoreTotalMeasures, setFullScoreTotalMeasures] = useState<number>(11);
  const [slices, setSlices] = useState<ScoreSliceEvent[]>([]);
  const [activeSliceIds, setActiveSliceIds] = useState<string[]>([]);
  const [currentMeasureNumber, setCurrentMeasureNumber] = useState<number>(1);
  const [currentBeatInMeasure, setCurrentBeatInMeasure] = useState<number>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);

  // Loop & Focus Isolation State
  const [loop, setLoop] = useState<LoopConfig>({
    enabled: false,
    startMeasure: 1,
    endMeasure: 1,
    startBeat: 0,
    endBeat: 4,
  });
  const [isFocusIsolated, setIsFocusIsolated] = useState<boolean>(false);
  const [isFocusTransitioning, setIsFocusTransitioning] = useState<boolean>(false);
  const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | 'canvas' | null>(null);

  // Core Engine Refs
  const scoreControllerRef = useRef<ScoreController | null>(null);
  const audioSchedulerRef = useRef<AudioScheduler | null>(null);
  const osmdContainerRef = useRef<HTMLDivElement | null>(null);
  const stageWrapperRef = useRef<HTMLDivElement | null>(null);
  const stageInnerRef = useRef<HTMLDivElement | null>(null);
  const focusTransitionTimeoutRef = useRef<number | null>(null);
  const loopRef = useRef<LoopConfig>(loop);
  const measuresRef = useRef<MeasureBoundingBox[]>(measures);
  const highlightBarRef = useRef<boolean>(highlightBar);
  const highlightNotesRef = useRef<boolean>(highlightNotes);
  const noteHighlightColorRef = useRef<string>(noteHighlightColor);
  const horizontalNotationRef = useRef<boolean>(horizontalNotation);

  const canvasDragMetaRef = useRef<{
    startX: number;
    startY: number;
    anchorStartBeat: number;
    anchorEndBeat: number;
    hasDragged: boolean;
  } | null>(null);

  // Direct DOM refs for 60fps Playhead Cursor & Measure Shading
  const playheadRef = useRef<HTMLDivElement | null>(null);
  const measureShadeRef = useRef<HTMLDivElement | null>(null);
  const lastScrolledSystemRef = useRef<number>(-1);
  const lastMeasureNumberRef = useRef<number>(-1);
  const currentBeatRef = useRef<number>(0);

  const activePresetObj = useMemo(
    () => catalogScores.find((p) => p.id === activePresetId) ?? catalogScores[0],
    [catalogScores, activePresetId]
  );

  useEffect(() => {
    noteHighlightColorRef.current = noteHighlightColor;
  }, [noteHighlightColor]);

  useEffect(() => {
    highlightBarRef.current = highlightBar;
  }, [highlightBar]);

  useEffect(() => {
    highlightNotesRef.current = highlightNotes;
  }, [highlightNotes]);

  useEffect(() => {
    horizontalNotationRef.current = horizontalNotation;
  }, [horizontalNotation]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  useEffect(() => {
    measuresRef.current = measures;
  }, [measures]);

  // Synchronize visual overlays (Playhead Cursor, Measure Shading, Notehead Coloring) in real time
  const updateVisualSynchronization = useCallback((beat: number, currentActiveSliceIds: string[]) => {
    currentBeatRef.current = beat;
    const controller = scoreControllerRef.current;
    if (!controller) return;

    const geometry = controller.getCursorAndMeasureGeometry(beat);
    const { x, y, height, measureBox } = geometry;

    // 1. Update Playhead Vertical Band/Line Cursor via direct DOM style
    if (playheadRef.current) {
      if (measureBox) {
        const isMeasureTransition =
          lastMeasureNumberRef.current !== -1 &&
          lastMeasureNumberRef.current !== measureBox.measureNumber;
        lastMeasureNumberRef.current = measureBox.measureNumber;

        if (isMeasureTransition) {
          playheadRef.current.classList.add('playhead-cursor-measure-hop');
          playheadRef.current.classList.remove('playhead-cursor-smooth');
        } else if (!playheadRef.current.classList.contains('playhead-cursor-smooth')) {
          playheadRef.current.classList.add('playhead-cursor-smooth');
          playheadRef.current.classList.remove('playhead-cursor-measure-hop');
        }

        playheadRef.current.style.opacity = '1';
        playheadRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        playheadRef.current.style.height = `${height}px`;
      } else {
        playheadRef.current.style.opacity = '0';
      }
    }

    // 2. Update Measure Shading Rectangle via direct DOM style (if highlightBar is enabled)
    if (measureShadeRef.current) {
      if (measureBox && highlightBarRef.current) {
        measureShadeRef.current.style.opacity = '1';
        measureShadeRef.current.style.transform = `translate3d(${measureBox.x}px, ${measureBox.y}px, 0)`;
        measureShadeRef.current.style.width = `${measureBox.width}px`;
        measureShadeRef.current.style.height = `${measureBox.height}px`;
      } else {
        measureShadeRef.current.style.opacity = '0';
      }
    }

    // 3. Highlight active SVG noteheads (.vf-notehead path) and restore previous notes
    controller.highlightSlices(
      highlightNotesRef.current ? currentActiveSliceIds : [],
      noteHighlightColorRef.current
    );

    // 4. Smooth vertical or horizontal auto-scroll when playback advances
    if (measureBox) {
      if (horizontalNotationRef.current && stageWrapperRef.current) {
        const targetScrollLeft = Math.max(0, x - stageWrapperRef.current.clientWidth * 0.35);
        if (Math.abs(stageWrapperRef.current.scrollLeft - targetScrollLeft) > 80) {
          stageWrapperRef.current.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth',
          });
        }
      } else if (measureBox.systemIndex !== lastScrolledSystemRef.current) {
        lastScrolledSystemRef.current = measureBox.systemIndex;
        if (stageWrapperRef.current) {
          const stageTop = stageWrapperRef.current.getBoundingClientRect().top + window.scrollY;
          const targetScrollY = stageTop + measureBox.y - 120;
          if (Math.abs(window.scrollY - targetScrollY) > 150) {
            window.scrollTo({
              top: Math.max(0, targetScrollY),
              behavior: 'smooth',
            });
          }
        }
      }
    }
  }, []);

  // Initialize ScoreController & AudioScheduler once
  useEffect(() => {
    const controller = new ScoreController();
    const scheduler = new AudioScheduler();

    scoreControllerRef.current = controller;
    audioSchedulerRef.current = scheduler;

    scheduler.setCountInEnabled(false);
    scheduler.setMetronomeEnabled(true);
    scheduler.setTimbre('acoustic-grand');

    scheduler.setCallbacks(
      (frame: SchedulerFramePayload) => {
        updateVisualSynchronization(frame.currentBeat, frame.activeSliceIds);
        setActiveSliceIds(frame.activeSliceIds);
        setElapsedSeconds(frame.elapsedSeconds);
        setTotalSeconds(frame.totalSeconds);
        setCurrentMeasureNumber(frame.currentMeasureNumber);
        setCurrentBeatInMeasure(frame.currentBeatInMeasure);
        setIsCountingIn(frame.isCountingIn);
        setCountInBeat(frame.countInBeat);
        setCountInTotalBeats(frame.countInTotalBeats);
        setIsPlaying(frame.isPlaying);
      },
      () => {
        setIsPlaying(false);
        setActiveSliceIds([]);
        scoreControllerRef.current?.clearAllNoteHighlights();
      },
      (autoIncrementedBpm: number) => {
        setBpm(autoIncrementedBpm);
      }
    );

    let isCancelled = false;

    const initDefaultScore = async () => {
      if (!osmdContainerRef.current || isCancelled) return;
      try {
        setIsScoreLoading(true);
        await controller.init(osmdContainerRef.current);
        if (isCancelled) return;
        const initialCatalog = loadCatalogFromStorage();
        const hashQuery = window.location.hash.includes('?')
          ? window.location.hash.split('?')[1]
          : window.location.search;
        const requestedScoreId = new URLSearchParams(hashQuery).get('scoreId');
        const defaultPreset =
          (requestedScoreId
            ? initialCatalog.find((s) => s.id === requestedScoreId)
            : undefined) ??
          initialCatalog[0] ??
          PRESET_SCORES[0];
        setActivePresetId(defaultPreset.id);
        setScoreTitle(defaultPreset.title);
        setBpm(defaultPreset.defaultBpm);
        setBaseBpm(defaultPreset.defaultBpm);
        const initialZoom = window.innerWidth < 640 ? 0.92 : 1.08;
        setZoom(initialZoom);
        const initialClef: MsaClefType = defaultPreset.defaultClef ?? 'sol';
        setMsaClef(initialClef);
        const xmlToLoad = resolveScoreXmlForClef(defaultPreset, initialClef);
        const result = await controller.loadScore(xmlToLoad, initialZoom, {
          msaPhase: defaultPreset.msaPhase,
          msaClef: initialClef,
        });
        if (isCancelled) return;
        setMeasures(result.measures);
        setFullScoreTotalMeasures(result.fullScoreTotalMeasures);
        setSlices(result.slices);
        scheduler.setBpm(defaultPreset.defaultBpm);
        scheduler.setScoreData(result.measures, result.slices, result.totalBeats);
        updateVisualSynchronization(0, []);
        setIsScoreLoading(false);
      } catch (err) {
        if (isCancelled) return;
        setLoadError(
          err instanceof Error ? err.message : 'Erro ao renderizar a partitura MusicXML.'
        );
        setIsScoreLoading(false);
      }
    };

    initDefaultScore();

    const handleResize = () => {
      if (!scoreControllerRef.current || !audioSchedulerRef.current) return;
      const responsiveZoom = window.innerWidth < 640 ? 0.92 : 1.08;
      setZoom(responsiveZoom);
      const updated = scoreControllerRef.current.setZoom(responsiveZoom);
      setMeasures(updated.measures);
      setSlices([...updated.slices]);
      audioSchedulerRef.current.setScoreData(
        updated.measures,
        updated.slices,
        scoreControllerRef.current.getTotalBeats(),
        true
      );
      updateVisualSynchronization(currentBeatRef.current, []);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      isCancelled = true;
      window.removeEventListener('resize', handleResize);
      scheduler.pause();
    };
  }, [updateVisualSynchronization]);

  // Keyboard shortcut: Space to Play/Pause
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'SELECT' &&
        document.activeElement?.tagName !== 'BUTTON'
      ) {
        e.preventDefault();
        if (isPlaying) {
          audioSchedulerRef.current?.pause();
        } else {
          audioSchedulerRef.current?.start();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaying]);

  // Helper to apply a beat-level loop configuration and sync with AudioScheduler
  const applyBeatLoop = useCallback(
    (rawStartBeat: number, rawEndBeat: number, enabled: boolean = true) => {
      const currentMeasures = measuresRef.current;
      const totalScoreBeats = scoreControllerRef.current?.getTotalBeats() ?? 4;
      const minBeat = Math.max(0, Math.min(rawStartBeat, rawEndBeat));
      const maxBeat = Math.min(
        Math.max(0.5, totalScoreBeats),
        Math.max(rawStartBeat, rawEndBeat, minBeat + 0.5)
      );

      const startMeasureObj =
        currentMeasures.find(
          (m) =>
            minBeat >= m.startBeatInScore - 0.001 &&
            minBeat < m.startBeatInScore + m.durationBeats - 0.001
        ) ?? currentMeasures[0];

      const endMeasureObj =
        currentMeasures.find(
          (m) =>
            maxBeat > m.startBeatInScore + 0.001 &&
            maxBeat <= m.startBeatInScore + m.durationBeats + 0.001
        ) ??
        currentMeasures[currentMeasures.length - 1] ??
        startMeasureObj;

      const nextLoop: LoopConfig = {
        enabled,
        startMeasure: startMeasureObj?.measureNumber ?? 1,
        endMeasure: endMeasureObj?.measureNumber ?? 1,
        startBeat: Number(minBeat.toFixed(2)),
        endBeat: Number(maxBeat.toFixed(2)),
      };

      setLoop(nextLoop);
      loopRef.current = nextLoop;
      audioSchedulerRef.current?.setLoop(nextLoop);
      return nextLoop;
    },
    []
  );

  // Global Pointer Move / Up listener for dragging Start/End loop bars or dragging on score canvas
  useEffect(() => {
    if (!draggingHandle) return;

    const handlePointerMove = (e: PointerEvent) => {
      const controller = scoreControllerRef.current;
      const container = osmdContainerRef.current;
      if (!controller || !container) return;

      const rect = container.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const totalScoreBeats = Math.max(1, controller.getTotalBeats());
      const currentBounds = getLoopBeatBounds(
        loopRef.current,
        measuresRef.current,
        totalScoreBeats
      );

      if (draggingHandle === 'start') {
        const candidateStart = controller.getBeatAtPoint(relX, relY, 'start');
        const clampedStart = Math.max(
          0,
          Math.min(candidateStart, currentBounds.endBeat - 0.5)
        );
        applyBeatLoop(clampedStart, currentBounds.endBeat, true);
        if (!isPlaying) {
          audioSchedulerRef.current?.seekToBeat(clampedStart);
        }
      } else if (draggingHandle === 'end') {
        const candidateEnd = controller.getBeatAtPoint(relX, relY, 'end');
        const clampedEnd = Math.min(
          totalScoreBeats,
          Math.max(candidateEnd, currentBounds.startBeat + 0.5)
        );
        applyBeatLoop(currentBounds.startBeat, clampedEnd, true);
      } else if (draggingHandle === 'canvas' && canvasDragMetaRef.current) {
        const meta = canvasDragMetaRef.current;
        const dist = Math.hypot(e.clientX - meta.startX, e.clientY - meta.startY);
        if (dist > 10) {
          meta.hasDragged = true;
          const dragStartCandidate = controller.getBeatAtPoint(relX, relY, 'start');
          const dragEndCandidate = controller.getBeatAtPoint(relX, relY, 'end');
          if (dragStartCandidate < meta.anchorStartBeat) {
            applyBeatLoop(dragStartCandidate, meta.anchorEndBeat, true);
          } else {
            applyBeatLoop(
              meta.anchorStartBeat,
              Math.max(meta.anchorStartBeat + 0.5, dragEndCandidate),
              true
            );
          }
        }
      }
    };

    const handlePointerUp = () => {
      if (draggingHandle === 'canvas' && canvasDragMetaRef.current) {
        const meta = canvasDragMetaRef.current;
        if (!meta.hasDragged) {
          audioSchedulerRef.current?.seekToBeat(meta.anchorStartBeat);
        } else if (!isPlaying) {
          const bounds = getLoopBeatBounds(
            loopRef.current,
            measuresRef.current,
            scoreControllerRef.current?.getTotalBeats() ?? 4
          );
          audioSchedulerRef.current?.seekToBeat(bounds.startBeat);
        }
      }
      canvasDragMetaRef.current = null;
      setDraggingHandle(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggingHandle, applyBeatLoop, isPlaying]);

  // Carrega uma partitura do catálogo (Hino ou Lição do MSA), buscando o MusicXML referente à clave selecionada
  const loadScoreFromPresetObject = async (
    preset: PresetScore,
    preferredClef?: MsaClefType
  ) => {
    if (!scoreControllerRef.current || !audioSchedulerRef.current) return;

    audioSchedulerRef.current.pause();
    setLoadError(null);
    setIsScoreLoading(true);
    setActivePresetId(preset.id);
    setCustomFileName(null);
    setScoreTitle(preset.title);
    setBpm(preset.defaultBpm);
    setBaseBpm(preset.defaultBpm);
    setIsFocusIsolated(false);
    setActiveVoiceId('all');

    const targetClef: MsaClefType =
      preferredClef ?? preset.defaultClef ?? msaClef ?? 'sol';
    setMsaClef(targetClef);

    if (preset.msaPhase === 'ritmica') {
      setShowRhythmCounts(true);
    }
    audioSchedulerRef.current.setTimbre('acoustic-grand');

    // Reinicia o mixer de vozes (0-indexed staffIndex)
    const nextStaffs =
      preset.voices && preset.voices.length > 0
        ? preset.voices.map((v) => v.staffIndex)
        : [0];
    setActiveStaffIndices(nextStaffs);
    audioSchedulerRef.current.setActiveStaffIndices(
      preset.voices && preset.voices.length > 1 ? nextStaffs : null
    );

    const xmlToLoad = resolveScoreXmlForClef(preset, targetClef);

    try {
      const result = await scoreControllerRef.current.loadScore(xmlToLoad, zoom, {
        horizontalNotation,
        isolatedRange: null,
        msaPhase: preset.msaPhase ?? null,
        msaClef: targetClef,
      });
      setMeasures(result.measures);
      setFullScoreTotalMeasures(result.fullScoreTotalMeasures);
      setSlices([...result.slices]);
      const firstMeasure = result.measures[0];
      const nextLoop: LoopConfig = {
        enabled: false,
        startMeasure: 1,
        endMeasure: 1,
        startBeat: firstMeasure?.startBeatInScore ?? 0,
        endBeat: (firstMeasure?.startBeatInScore ?? 0) + (firstMeasure?.durationBeats ?? 4),
      };
      setLoop(nextLoop);
      audioSchedulerRef.current.setBpm(preset.defaultBpm);
      audioSchedulerRef.current.setScoreData(
        result.measures,
        result.slices,
        result.totalBeats
      );
      audioSchedulerRef.current.setLoop(nextLoop);
      updateVisualSynchronization(0, []);
      setIsScoreLoading(false);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Falha ao carregar partitura selecionada.'
      );
      setIsScoreLoading(false);
    }
  };

  const handleSelectPreset = async (
    presetId: string,
    preferredClef?: MsaClefType
  ) => {
    const preset = catalogScores.find((p) => p.id === presetId);
    if (!preset) return;
    await loadScoreFromPresetObject(preset, preferredClef);
  };

  // Seleção de Clave nas Lições de Solfejo do MSA: busca e carrega o MusicXML referente à Clave (Sol, Dó ou Fá)
  const handleMsaClefChange = async (newClef: MsaClefType) => {
    if (!scoreControllerRef.current || !audioSchedulerRef.current || !activePresetObj) return;
    audioSchedulerRef.current.pause();
    setMsaClef(newClef);
    setLoadError(null);
    setIsScoreLoading(true);
    setIsFocusIsolated(false);

    const xmlForClef = resolveScoreXmlForClef(activePresetObj, newClef);

    try {
      const updated = await scoreControllerRef.current.loadScore(xmlForClef, zoom, {
        horizontalNotation,
        isolatedRange: null,
        msaPhase: activePresetObj.msaPhase ?? null,
        msaClef: newClef,
      });
      setMeasures(updated.measures);
      setFullScoreTotalMeasures(updated.fullScoreTotalMeasures);
      setSlices([...updated.slices]);
      const firstMeasure = updated.measures[0];
      const nextLoop: LoopConfig = {
        enabled: false,
        startMeasure: 1,
        endMeasure: 1,
        startBeat: firstMeasure?.startBeatInScore ?? 0,
        endBeat: (firstMeasure?.startBeatInScore ?? 0) + (firstMeasure?.durationBeats ?? 4),
      };
      setLoop(nextLoop);
      audioSchedulerRef.current.setScoreData(
        updated.measures,
        updated.slices,
        updated.totalBeats
      );
      audioSchedulerRef.current.setLoop(nextLoop);
      updateVisualSynchronization(0, []);
      setIsScoreLoading(false);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o MusicXML referente à clave selecionada.'
      );
      setIsScoreLoading(false);
    }
  };

  // Seletor rápido de Voz na TopBar (Todas, Soprano, Contralto, Tenor, Baixo)
  const handleVoiceChange = (voiceId: string) => {
    setActiveVoiceId(voiceId);
    const allVoices = activePresetObj?.voices?.map((v) => v.staffIndex) ?? [0];
    if (voiceId === 'all') {
      setActiveStaffIndices(allVoices);
      audioSchedulerRef.current?.setActiveStaffIndices(allVoices);
      return;
    }
    const targetVoice = activePresetObj?.voices?.find((v) => v.id === voiceId);
    if (targetVoice) {
      const next = [targetVoice.staffIndex];
      setActiveStaffIndices(next);
      audioSchedulerRef.current?.setActiveStaffIndices(next);
    }
  };

  // Multi-Voice Mixer Handlers
  const handleToggleStaffVoice = (staffIndex: number) => {
    const allVoices = activePresetObj?.voices?.map((v) => v.staffIndex) ?? [0];
    setActiveStaffIndices((prev) => {
      const exists = prev.includes(staffIndex);
      const next = exists
        ? prev.filter((id) => id !== staffIndex)
        : [...prev, staffIndex].sort();
      const safeNext = next.length > 0 ? next : allVoices;
      audioSchedulerRef.current?.setActiveStaffIndices(safeNext);
      setActiveVoiceId(safeNext.length === allVoices.length ? 'all' : 'custom');
      return safeNext;
    });
  };

  const handleSoloStaffVoice = (staffIndex: number) => {
    const next = [staffIndex];
    setActiveStaffIndices(next);
    audioSchedulerRef.current?.setActiveStaffIndices(next);
    const matchedVoice = activePresetObj?.voices?.find((v) => v.staffIndex === staffIndex);
    setActiveVoiceId(matchedVoice?.id ?? 'custom');
  };

  const handleResetAllVoices = () => {
    const allVoices = activePresetObj?.voices?.map((v) => v.staffIndex) ?? [0];
    setActiveStaffIndices(allVoices);
    audioSchedulerRef.current?.setActiveStaffIndices(allVoices);
    setActiveVoiceId('all');
  };

  // Reimportação de MusicXML pelo Administrador (substitui o anterior por Lição/Clave/Hino)
  const handleReimportScoreXml = async (
    scoreId: string,
    newXml: string,
    targetClef?: MsaClefType
  ) => {
    const nextCatalog = reimportScoreMusicXmlInStorage(
      catalogScores,
      scoreId,
      newXml,
      targetClef
    );
    setCatalogScores(nextCatalog);

    const updatedScore = nextCatalog.find((s) => s.id === scoreId);
    if (updatedScore && activePresetId === scoreId) {
      await loadScoreFromPresetObject(updatedScore, targetClef ?? msaClef);
    }
  };

  // Nova importação MusicXML pelo Administrador
  const handleAddNewScore = async (newScore: PresetScore) => {
    const nextCatalog = addImportedScoreToStorage(catalogScores, newScore);
    setCatalogScores(nextCatalog);
    setHiddenFactoryCount(loadHiddenPresetIds().length);
    await loadScoreFromPresetObject(newScore, newScore.defaultClef ?? 'sol');
  };

  // Restaurar MusicXML padrão de fábrica
  const handleRestoreDefaultScore = async (scoreId: string) => {
    const nextCatalog = restoreDefaultScoreInStorage(catalogScores, scoreId);
    setCatalogScores(nextCatalog);
    const restored = nextCatalog.find((s) => s.id === scoreId);
    if (restored && activePresetId === scoreId) {
      await loadScoreFromPresetObject(restored, msaClef);
    }
  };

  // Excluir partitura/hino do catálogo (incluindo de fábrica, que pode ser restaurado)
  const handleDeleteCustomScore = async (scoreId: string) => {
    const nextCatalog = deleteScoreFromStorage(catalogScores, scoreId);
    setCatalogScores(nextCatalog);
    setHiddenFactoryCount(loadHiddenPresetIds().length);
    if (activePresetId === scoreId && nextCatalog.length > 0) {
      await loadScoreFromPresetObject(nextCatalog[0]);
    }
  };

  // Restaurar todas as partituras de fábrica que haviam sido ocultadas
  const handleRestoreHiddenFactoryScores = async () => {
    const nextCatalog = restoreHiddenFactoryScoresInStorage();
    setCatalogScores(nextCatalog);
    setHiddenFactoryCount(0);
  };

  // Atualizar metadados (título, número, BPM, compasso, edição/modalidade)
  const handleUpdateScoreMetadata = async (
    scoreId: string,
    updates: ScoreMetadataUpdate
  ) => {
    const nextCatalog = updateScoreMetadataInStorage(catalogScores, scoreId, updates);
    setCatalogScores(nextCatalog);
    const updated = nextCatalog.find((s) => s.id === scoreId);
    if (updated && activePresetId === scoreId) {
      setScoreTitle(updated.title);
      setBpm(updated.defaultBpm);
      setBaseBpm(updated.defaultBpm);
      audioSchedulerRef.current?.setBpm(updated.defaultBpm);
    }
  };

  // Remover uma clave específica de uma lição de Solfejo do MSA
  const handleRemoveScoreClef = async (scoreId: string, clef: MsaClefType) => {
    const nextCatalog = removeScoreClefInStorage(catalogScores, scoreId, clef);
    setCatalogScores(nextCatalog);
    const updated = nextCatalog.find((s) => s.id === scoreId);
    if (updated && activePresetId === scoreId && msaClef === clef) {
      await loadScoreFromPresetObject(updated, updated.defaultClef ?? 'sol');
    }
  };

  const handleTogglePlay = () => {
    if (!audioSchedulerRef.current) return;
    if (isPlaying) {
      audioSchedulerRef.current.pause();
    } else {
      audioSchedulerRef.current.start();
    }
  };

  const handleRestart = () => {
    audioSchedulerRef.current?.restart();
    setActiveSliceIds([]);
    scoreControllerRef.current?.clearAllNoteHighlights();
  };

  const handleBpmChange = (nextBpm: number) => {
    setBpm(nextBpm);
    audioSchedulerRef.current?.setBpm(nextBpm);
  };

  const handleSpeedTrainingChange = (nextConfig: SpeedTrainingConfig) => {
    setSpeedTraining(nextConfig);
    audioSchedulerRef.current?.setSpeedTraining(nextConfig);
  };

  const handleZoomChange = (nextZoom: number) => {
    if (!scoreControllerRef.current || !audioSchedulerRef.current) return;
    const clampedZoom = Math.max(0.65, Math.min(1.55, Number(nextZoom.toFixed(2))));
    setZoom(clampedZoom);
    const updated = scoreControllerRef.current.setZoom(clampedZoom);
    setMeasures(updated.measures);
    setSlices([...updated.slices]);
    audioSchedulerRef.current.setScoreData(
      updated.measures,
      updated.slices,
      scoreControllerRef.current.getTotalBeats(),
      true
    );
    updateVisualSynchronization(currentBeatRef.current, activeSliceIds);
  };

  const handleHorizontalNotationChange = async (enabled: boolean) => {
    if (!scoreControllerRef.current || !audioSchedulerRef.current) return;
    setHorizontalNotation(enabled);
    const updated = await scoreControllerRef.current.applyRenderOptions({
      horizontalNotation: enabled,
    });
    setMeasures(updated.measures);
    setSlices([...updated.slices]);
    audioSchedulerRef.current.setScoreData(
      updated.measures,
      updated.slices,
      updated.totalBeats,
      true
    );
    updateVisualSynchronization(currentBeatRef.current, activeSliceIds);
  };

  const triggerFocusHorizontalTransition = useCallback(
    (mode: 'enter' | 'exit' | 'adjust') => {
      if (focusTransitionTimeoutRef.current !== null) {
        window.clearTimeout(focusTransitionTimeoutRef.current);
      }
      setIsFocusTransitioning(true);

      const targets = [stageInnerRef.current, osmdContainerRef.current].filter(
        (el): el is HTMLDivElement => el !== null
      );

      const startScaleX =
        mode === 'enter' ? 0.935 : mode === 'exit' ? 1.045 : 0.975;
      const startOpacity =
        mode === 'enter' ? '0.38' : mode === 'exit' ? '0.42' : '0.68';

      for (const el of targets) {
        el.style.transition = 'none';
        el.style.transform = `scaleX(${startScaleX}) translate3d(0, 0, 0)`;
        el.style.opacity = startOpacity;
      }

      // Force synchronous layout reflow so the browser registers the pre-transition horizontal scale
      if (stageInnerRef.current) {
        void stageInnerRef.current.offsetWidth;
      }

      for (const el of targets) {
        el.style.transition = '';
        el.style.transform = 'scaleX(1) translate3d(0, 0, 0)';
        el.style.opacity = '1';
      }

      focusTransitionTimeoutRef.current = window.setTimeout(() => {
        setIsFocusTransitioning(false);
        focusTransitionTimeoutRef.current = null;
      }, 320);
    },
    []
  );

  const applyFocusIsolationRange = async (
    targetStartMeasure: number,
    targetEndMeasure: number,
    isolate: boolean
  ) => {
    if (!scoreControllerRef.current || !audioSchedulerRef.current) return;
    const wasIsolated = isFocusIsolated;
    const maxM = Math.max(1, fullScoreTotalMeasures);
    const normalized = normalizeLoopRange(targetStartMeasure, targetEndMeasure, maxM);

    const updated = await scoreControllerRef.current.applyRenderOptions({
      isolatedRange: isolate ? normalized : null,
    });

    setMeasures(updated.measures);
    setSlices([...updated.slices]);
    setIsFocusIsolated(isolate);

    const transitionMode: 'enter' | 'exit' | 'adjust' =
      isolate && !wasIsolated ? 'enter' : !isolate && wasIsolated ? 'exit' : 'adjust';
    triggerFocusHorizontalTransition(transitionMode);

    const startObj =
      updated.measures.find((m) => m.measureNumber === normalized.startMeasure) ??
      updated.measures[0];
    const endObj =
      updated.measures.find((m) => m.measureNumber === normalized.endMeasure) ??
      updated.measures[updated.measures.length - 1];

    const startBeat = startObj ? startObj.startBeatInScore : 0;
    const endBeat = endObj
      ? endObj.startBeatInScore + endObj.durationBeats
      : updated.totalBeats;

    const nextLoop: LoopConfig = {
      enabled: true,
      startMeasure: normalized.startMeasure,
      endMeasure: normalized.endMeasure,
      startBeat: Number(startBeat.toFixed(2)),
      endBeat: Number(endBeat.toFixed(2)),
    };

    setLoop(nextLoop);
    loopRef.current = nextLoop;
    audioSchedulerRef.current.setScoreData(
      updated.measures,
      updated.slices,
      updated.totalBeats,
      false
    );
    audioSchedulerRef.current.setLoop(nextLoop);
    audioSchedulerRef.current.seekToBeat(startBeat);
    updateVisualSynchronization(startBeat, []);
  };

  const handleEnterFocusIsolation = async () => {
    await applyFocusIsolationRange(loop.startMeasure, loop.endMeasure, true);
  };

  const handleExitFocusIsolation = async () => {
    await applyFocusIsolationRange(loop.startMeasure, loop.endMeasure, false);
  };

  const handleAdjustFocusedMeasures = async (
    newStartMeasure: number,
    newEndMeasure: number
  ) => {
    const maxM = Math.max(1, fullScoreTotalMeasures);
    const clampedStart = Math.max(1, Math.min(maxM, newStartMeasure));
    const clampedEnd = Math.max(clampedStart, Math.min(maxM, newEndMeasure));
    await applyFocusIsolationRange(clampedStart, clampedEnd, true);
  };

  const handleToggleLoop = async () => {
    if (loop.enabled) {
      if (isFocusIsolated && scoreControllerRef.current && audioSchedulerRef.current) {
        const updated = await scoreControllerRef.current.applyRenderOptions({
          isolatedRange: null,
        });
        setMeasures(updated.measures);
        setSlices([...updated.slices]);
        setIsFocusIsolated(false);
        triggerFocusHorizontalTransition('exit');
        audioSchedulerRef.current.setScoreData(
          updated.measures,
          updated.slices,
          updated.totalBeats,
          false
        );
      }
      const disabledLoop: LoopConfig = {
        ...loop,
        enabled: false,
      };
      setLoop(disabledLoop);
      loopRef.current = disabledLoop;
      audioSchedulerRef.current?.setLoop(disabledLoop);
      return;
    }

    const cursorBeat = currentBeatRef.current;
    const targetMeasure =
      measures.find(
        (m) =>
          cursorBeat >= m.startBeatInScore - 0.001 &&
          cursorBeat < m.startBeatInScore + m.durationBeats - 0.001
      ) ??
      measures.find((m) => m.measureNumber === currentMeasureNumber) ??
      measures[0];

    const startBeat = targetMeasure?.startBeatInScore ?? 0;
    const endBeat = startBeat + (targetMeasure?.durationBeats ?? 4);
    applyBeatLoop(startBeat, endBeat, true);
  };

  const handleToggleMetronome = () => {
    const next = !metronomeEnabled;
    setMetronomeEnabled(next);
    audioSchedulerRef.current?.setMetronomeEnabled(next);
  };

  const handleMetronomeBeatModeChange = (mode: MetronomeBeatMode) => {
    setMetronomeBeatMode(mode);
    audioSchedulerRef.current?.setMetronomeBeatMode(mode);
  };

  const handleMetronomeVolumeChange = (vol: number) => {
    setMetronomeVolume(vol);
    audioSchedulerRef.current?.setMetronomeVolume(vol);
  };

  const handleToggleCountIn = () => {
    const next = !countInEnabled;
    setCountInEnabled(next);
    audioSchedulerRef.current?.setCountInEnabled(next);
  };

  const handleCountInConditionChange = (cond: CountInCondition) => {
    setCountInCondition(cond);
    audioSchedulerRef.current?.setCountInCondition(cond);
  };

  const handleCountInBarsChange = (bars: 1 | 2) => {
    setCountInBars(bars);
    audioSchedulerRef.current?.setCountInBars(bars);
  };

  const handleVolumeChange = (nextVol: number) => {
    setVolume(nextVol);
    setIsMuted(nextVol === 0);
    audioSchedulerRef.current?.setVolume(nextVol, nextVol === 0);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioSchedulerRef.current?.setVolume(volume, nextMuted);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Pointer down on the score stage: click-to-seek OR click-and-drag to create a loop directly on the score
  const handleScorePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scoreControllerRef.current || !osmdContainerRef.current) return;
    const rect = osmdContainerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    const anchorStartBeat = scoreControllerRef.current.getBeatAtPoint(relX, relY, 'start');
    const anchorEndBeat = scoreControllerRef.current.getBeatAtPoint(relX, relY, 'end');

    canvasDragMetaRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      anchorStartBeat,
      anchorEndBeat: Math.max(anchorStartBeat + 0.5, anchorEndBeat),
      hasDragged: false,
    };
    setDraggingHandle('canvas');
  };

  const activeMeasureObj =
    measures.find((m) => m.measureNumber === currentMeasureNumber) ?? measures[0];
  const beatsPerMeasure = activeMeasureObj?.beatsPerMeasure ?? 4;
  const totalScoreBeats = scoreControllerRef.current?.getTotalBeats() ?? 4;

  const loopBounds = getLoopBeatBounds(loop, measures, totalScoreBeats);

  const startHandleGeom =
    loop.enabled && !isFocusIsolated && scoreControllerRef.current
      ? scoreControllerRef.current.getLoopBoundaryGeometry(loopBounds.startBeat, 'start')
      : null;
  const endHandleGeom =
    loop.enabled && !isFocusIsolated && scoreControllerRef.current
      ? scoreControllerRef.current.getLoopBoundaryGeometry(loopBounds.endBeat, 'end')
      : null;

  // Group measures by systemIndex for clean outside-loop dimming veils
  const systemRows = React.useMemo(() => {
    const map = new Map<
      number,
      { systemIndex: number; x: number; y: number; right: number; height: number }
    >();
    for (const m of measures) {
      const existing = map.get(m.systemIndex);
      if (!existing) {
        map.set(m.systemIndex, {
          systemIndex: m.systemIndex,
          x: m.x,
          y: m.y,
          right: m.x + m.width,
          height: m.height,
        });
      } else {
        existing.x = Math.min(existing.x, m.x);
        existing.y = Math.min(existing.y, m.y);
        existing.right = Math.max(existing.right, m.x + m.width);
        existing.height = Math.max(existing.height, m.height);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.systemIndex - b.systemIndex);
  }, [measures]);

  const activeMsaPhase = !customFileName ? activePresetObj?.msaPhase : undefined;
  const isRhythmicMsaMode = activeMsaPhase === 'ritmica';
  const isCordasHymnal =
    !customFileName &&
    activePresetObj?.collection === 'hinario5' &&
    activePresetObj?.edition === 'cordas';

  // Active notes currently sounding (filtered by active voices) for ViolinFingerboard
  const activeNotes: NotePayload[] = React.useMemo(() => {
    if (activeSliceIds.length === 0) return [];
    const activeSet = new Set(activeSliceIds);
    const collected: NotePayload[] = [];
    for (const s of slices) {
      if (activeSet.has(s.id)) {
        for (const n of s.notes) {
          if (!n.isRest && activeStaffIndices.includes(n.staffIndex ?? 0)) {
            collected.push(n);
          }
        }
      }
    }
    return collected;
  }, [activeSliceIds, slices, activeStaffIndices]);

  // No modo Leitura Rítmica do MSA, oculta nomes de altura e mostra apenas a contagem rítmica.
  // O dedilhado e o braço do violino ficam disponíveis exclusivamente no Hinário de Cordas.
  const effectiveShowPitchNames = showPitchNames && !isRhythmicMsaMode;
  const effectiveShowFingering = showFingering && isCordasHymnal;
  const effectiveShowViolinNeck = showViolinNeck && isCordasHymnal;
  const effectiveShowRhythmCounts = showRhythmCounts || isRhythmicMsaMode;
  const showAnyAnnotations =
    effectiveShowPitchNames || effectiveShowFingering || effectiveShowRhythmCounts;

  // #22: Prevenção invisível de bloqueio de tela (Screen Wake Lock API) durante o estudo na estante
  useEffect(() => {
    let wakeLockSentinel: { release: () => Promise<void> } | null = null;
    let isCancelled = false;

    const requestWakeLock = async () => {
      if (isCancelled || typeof navigator === 'undefined') return;
      const nav = navigator as Navigator & {
        wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
      };
      if (!nav.wakeLock || document.visibilityState !== 'visible') return;
      try {
        wakeLockSentinel = await nav.wakeLock.request('screen');
      } catch {
        // Ignorado silenciosamente se o navegador/dispositivo restringir Wake Lock sem gesto prévio
      }
    };

    void requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      isCancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinel) {
        void wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [activePresetId, isPlaying]);

  return (
    <div
      id="top"
      className={`min-h-screen flex flex-col bg-white text-[#1F2937] ${
        effectiveShowViolinNeck ? 'pb-[200px]' : 'pb-[64px]'
      }`}
    >
      {/* 1. Barra Superior Única (48px — "Menos é mais") */}
      <TopBar
        presets={catalogScores}
        activePresetId={activePresetId}
        scoreTitle={scoreTitle}
        isCustomUpload={Boolean(customFileName)}
        activeMsaClef={msaClef}
        userRole={userRole}
        isAdmin={isAdmin}
        onUserRoleChange={handleUserRoleChange}
        onOpenRepertoirePanel={() => setIsRepertoireOpen(true)}
        onSelectPreset={handleSelectPreset}
        onReimportScoreXml={handleReimportScoreXml}
        onMsaClefChange={handleMsaClefChange}
        onBackToHome={() => navigate('/')}
        onOpenAdminDashboard={() => navigate('/admin')}
      />

      {/* Painel Amigável de Navegação de Repertório (MSA & Hinário 5) e Gestão Admin */}
      <RepertoirePanelModal
        isOpen={isRepertoireOpen}
        onClose={() => setIsRepertoireOpen(false)}
        catalogScores={catalogScores}
        activePresetId={activePresetId}
        activeMsaClef={msaClef}
        userRole={userRole}
        isAdmin={isAdmin}
        hiddenFactoryCount={hiddenFactoryCount}
        onUserRoleChange={handleUserRoleChange}
        onSelectScore={handleSelectPreset}
        onReimportScoreXml={handleReimportScoreXml}
        onAddNewScore={handleAddNewScore}
        onRestoreDefaultScore={handleRestoreDefaultScore}
        onDeleteCustomScore={handleDeleteCustomScore}
        onUpdateScoreMetadata={handleUpdateScoreMetadata}
        onRemoveScoreClef={handleRemoveScoreClef}
        onRestoreHiddenFactoryScores={handleRestoreHiddenFactoryScores}
      />

      {/* 2. Pure White Full-Bleed Sheet Music Canvas (Minimalist: "Menos é mais") */}
      <main className="flex-1 w-full max-w-[1180px] mx-auto px-1 sm:px-6 pt-3 pb-16 bg-white">
        {showScoreTitle && (
          <div className="px-4 pt-2 pb-1 text-center">
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">
              {scoreTitle}
            </h1>
          </div>
        )}

        {loadError && (
          <div
            role="alert"
            className="mx-3 mb-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between"
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => handleSelectPreset(PRESET_SCORES[0].id)}
              className="text-xs font-semibold underline hover:text-red-950 cursor-pointer"
            >
              Restaurar Partitura Padrão
            </button>
          </div>
        )}

        <div
          ref={stageWrapperRef}
          onPointerDown={handleScorePointerDown}
          data-testid="score-stage-surface"
          data-focus-isolated={isFocusIsolated ? 'true' : 'false'}
          data-focus-transitioning={isFocusTransitioning ? 'true' : 'false'}
          className={`score-focus-stage-transition relative bg-white text-[#111827] cursor-pointer select-none min-h-[480px] pt-5 pb-6 ${
            isFocusIsolated ? 'px-2 sm:px-6' : 'px-1 sm:px-4'
          } ${horizontalNotation ? 'overflow-x-auto' : 'overflow-x-hidden'}`}
        >
          {isScoreLoading && (
            <div className="absolute inset-0 z-30 bg-white/90 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500">
                Carregando partitura...
              </span>
            </div>
          )}

          {/* Prominent Count-in Floating Overlay when Count-in is actively ticking */}
          {isCountingIn && countInBeat !== null && (
            <div
              data-testid="count-in-overlay"
              className="pointer-events-none fixed top-[58px] left-1/2 -translate-x-1/2 z-40 bg-[#2B2C30] text-white px-3.5 py-1.5 rounded-xl shadow-lg border border-amber-400/50 flex items-center gap-2 font-mono whitespace-nowrap"
            >
              <span className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold">
                Contagem
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: countInTotalBeats }, (_, i) => {
                  const b = i + 1;
                  const active = b === countInBeat;
                  const passed = b <= countInBeat;
                  return (
                    <span
                      key={b}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        active
                          ? 'bg-amber-400 text-[#191A1D] scale-110'
                          : passed
                          ? 'bg-amber-400/30 text-amber-300'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {b}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Overlay Container aligned with OSMD SVG Container */}
          <div
            ref={stageInnerRef}
            data-testid="score-focus-transition-wrapper"
            data-focus-isolated={isFocusIsolated ? 'true' : 'false'}
            className="score-focus-stage-transition relative"
          >
            {/* 1. Soundslice Outside-Loop Soft Dimming Veils + Draggable Lollipop Bars */}
            {loop.enabled && !isFocusIsolated && startHandleGeom && endHandleGeom && (() => {
              const startSysIdx = startHandleGeom.measureBox?.systemIndex ?? 0;
              const endSysIdx = endHandleGeom.measureBox?.systemIndex ?? 0;

              return (
                <div
                  data-testid="soundslice-loop-overlay"
                  className="pointer-events-none absolute inset-0 z-30"
                >
                  {systemRows.map((row) => {
                    const padY = 22;
                    const veilTop = Math.max(0, row.y - padY);
                    const veilHeight = row.height + padY * 2;

                    if (row.systemIndex < startSysIdx || row.systemIndex > endSysIdx) {
                      return (
                        <div
                          key={`dim_full_sys_${row.systemIndex}`}
                          data-testid={`loop-dim-row-${row.systemIndex}`}
                          style={{
                            top: `${veilTop}px`,
                            left: 0,
                            right: 0,
                            height: `${veilHeight}px`,
                            backgroundColor: 'rgba(255, 255, 255, 0.72)',
                          }}
                          className="pointer-events-none absolute"
                        />
                      );
                    }

                    return (
                      <React.Fragment key={`dim_partial_sys_${row.systemIndex}`}>
                        {row.systemIndex === startSysIdx && startHandleGeom.x > 0 && (
                          <div
                            data-testid="loop-dim-before-start"
                            style={{
                              top: `${veilTop}px`,
                              left: 0,
                              width: `${startHandleGeom.x}px`,
                              height: `${veilHeight}px`,
                              backgroundColor: 'rgba(255, 255, 255, 0.72)',
                            }}
                            className="pointer-events-none absolute"
                          />
                        )}
                        {row.systemIndex === endSysIdx && (
                          <div
                            data-testid="loop-dim-after-end"
                            style={{
                              top: `${veilTop}px`,
                              left: `${endHandleGeom.x}px`,
                              right: 0,
                              height: `${veilHeight}px`,
                              backgroundColor: 'rgba(255, 255, 255, 0.72)',
                            }}
                            className="pointer-events-none absolute"
                          />
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* DRAGGABLE LOOP START HANDLE */}
                  <div
                    role="slider"
                    tabIndex={0}
                    aria-label="Barra inicial do loop (arraste para ajustar o início)"
                    aria-valuemin={0}
                    aria-valuemax={totalScoreBeats}
                    aria-valuenow={loopBounds.startBeat}
                    data-testid="loop-handle-start"
                    data-beat={loopBounds.startBeat}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDraggingHandle('start');
                    }}
                    style={{
                      transform: `translate3d(${startHandleGeom.x}px, ${
                        startHandleGeom.y - 6
                      }px, 0)`,
                      height: `${startHandleGeom.height + 12}px`,
                    }}
                    title="Arraste para definir onde o loop começa"
                    className="pointer-events-auto absolute top-0 left-0 z-40 w-9 -ml-[18px] flex justify-center cursor-ew-resize touch-none group"
                  >
                    <div className="relative w-[2.5px] h-full bg-[#374151] group-hover:bg-black transition-colors shadow-[0_0_4px_rgba(255,255,255,0.9)]">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#374151] group-hover:scale-125 transition-transform shadow-sm" />
                    </div>
                  </div>

                  {/* DRAGGABLE LOOP END HANDLE */}
                  <div
                    role="slider"
                    tabIndex={0}
                    aria-label="Barra final do loop (arraste para ajustar o fim)"
                    aria-valuemin={0}
                    aria-valuemax={totalScoreBeats}
                    aria-valuenow={loopBounds.endBeat}
                    data-testid="loop-handle-end"
                    data-beat={loopBounds.endBeat}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDraggingHandle('end');
                    }}
                    style={{
                      transform: `translate3d(${endHandleGeom.x}px, ${
                        endHandleGeom.y - 6
                      }px, 0)`,
                      height: `${endHandleGeom.height + 12}px`,
                    }}
                    title="Arraste para definir onde o loop termina"
                    className="pointer-events-auto absolute top-0 left-0 z-40 w-9 -ml-[18px] flex justify-center cursor-ew-resize touch-none group"
                  >
                    <div className="relative w-[2.5px] h-full bg-[#374151] group-hover:bg-black transition-colors shadow-[0_0_4px_rgba(255,255,255,0.9)]">
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#374151] group-hover:scale-125 transition-transform shadow-sm" />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Measure Hit Targets & Bar Numbers */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {measures.map((m, idx) => (
                <div
                  key={`measure_zone_${m.measureNumber}`}
                  data-testid={`score-measure-${m.measureNumber}`}
                  style={{
                    transform: `translate3d(${m.x}px, ${m.y}px, 0)`,
                    width: `${m.width}px`,
                    height: `${m.height}px`,
                  }}
                  className="focus-smooth-measure-zone pointer-events-none absolute top-0 left-0"
                >
                  {(showBarNumbers || (isFocusIsolated && idx === 0)) && (
                    <span
                      data-testid={`measure-number-label-${m.measureNumber}`}
                      className="absolute -top-3 left-1 text-[13px] font-serif italic text-[#111827] select-none"
                    >
                      {m.measureNumber}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* 2. Dynamic Measure Shading */}
            <div
              ref={measureShadeRef}
              data-testid="measure-shading-overlay"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.11)',
                opacity: 0,
              }}
              className="measure-shade-smooth pointer-events-none absolute top-0 left-0 z-10 rounded-xs will-change-transform"
            />

            {/* 3. Smooth Playhead Vertical Highlight Band & Cursor Line */}
            <div
              ref={playheadRef}
              data-testid="playhead-cursor"
              style={{ opacity: 0 }}
              className="playhead-cursor-smooth pointer-events-none absolute top-0 left-0 z-20 w-[18px] -ml-[9px] rounded-xs bg-[#D9824B]/25 border-x border-[#D9824B]/45 will-change-transform"
            />

            {/* 4. Pedagogical Solfege (Dó, Ré, Mi, Fá♯, Sol, Lá, Si), Violin Fingering (Cordas) & Rhythm Counts Overlay */}
            {showAnyAnnotations && measures.length > 0 && (
              <div
                data-testid="pedagogical-annotations-layer"
                className="pointer-events-none absolute inset-0 z-20"
              >
                {slices.map((slice) => {
                  const mBox = measures[slice.measureIndex];
                  if (!mBox) return null;
                  const primaryNote =
                    slice.notes.find(
                      (n) => !n.isRest && activeStaffIndices.includes(n.staffIndex ?? 0)
                    ) ?? slice.notes.find((n) => !n.isRest);
                  if (!primaryNote) return null;

                  const noteX = mBox.x + slice.relativeXInMeasure * mBox.width;
                  const ann = midiToPedagogicalAnnotation(primaryNote.midi);
                  const rhythmLabel = formatRhythmCount(slice.startBeatInMeasure);
                  const isDownBowStart =
                    slice.startBeatInMeasure < 0.05 &&
                    (mBox.measureNumber === 1 ||
                      mBox.measureNumber === 5 ||
                      mBox.measureNumber === 9);
                  const isPhraseBreathEnd =
                    (mBox.measureNumber === 4 || mBox.measureNumber === 8) &&
                    slice.startBeatInMeasure + slice.durationBeats >=
                      mBox.durationBeats - 0.1;
                  const isSliceActive = activeSliceIds.includes(slice.id);

                  return (
                    <React.Fragment key={`ann_${slice.id}`}>
                      <div
                        data-testid={`note-annotation-${slice.id}`}
                        data-active={isSliceActive ? 'true' : 'false'}
                        style={{
                          left: `${noteX}px`,
                          top: `${Math.max(
                            0,
                            mBox.y - (effectiveShowRhythmCounts ? 14 : 2)
                          )}px`,
                        }}
                        className={`focus-smooth-annotation absolute -translate-x-1/2 flex flex-col items-center leading-none select-none ${
                          isSliceActive ? 'scale-110' : ''
                        }`}
                      >
                        {/* Rhythm Counts (1, +, 2, 3, 4) */}
                        {effectiveShowRhythmCounts && (
                          <span
                            data-testid={`rhythm-count-${slice.id}`}
                            className="text-[11px] font-mono font-bold text-[#6B7280] mb-[2px]"
                          >
                            {rhythmLabel}
                          </span>
                        )}

                        {/* Down-bow symbol (⊓) at phrase start (Hinário de Cordas) */}
                        {effectiveShowFingering && isDownBowStart && (
                          <svg
                            viewBox="0 0 12 10"
                            className="w-[10px] h-[8px] text-[#111827] mb-[2px]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M1.5 9V1.5H10.5V9" />
                          </svg>
                        )}

                        {/* Accented Portuguese Solfege (Dó, Ré, Mi, Fá♯, Sol, Lá, Si) */}
                        {effectiveShowPitchNames && (
                          <span
                            data-testid={`solfege-label-${slice.id}`}
                            className={`inline-flex items-center text-[12.5px] sm:text-[13.5px] font-medium tracking-tight mb-[2px] whitespace-nowrap ${
                              isSliceActive
                                ? 'text-[#3B82F6] font-bold'
                                : 'text-[#111827]'
                            }`}
                          >
                            {ann.solfege.includes('♯') ? (
                              <>
                                <span>{ann.solfege.replace('♯', '')}</span>
                                <svg
                                  viewBox="0 0 10 14"
                                  className="w-[8px] h-[12px] ml-[0.5px] -mt-[1px] currentColor"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                >
                                  <line x1="3.2" y1="1.5" x2="3.2" y2="12.5" strokeWidth="1.2" />
                                  <line x1="6.8" y1="0.8" x2="6.8" y2="11.8" strokeWidth="1.2" />
                                  <line x1="1.2" y1="5.4" x2="8.8" y2="3.8" strokeWidth="1.6" />
                                  <line x1="1.2" y1="9.6" x2="8.8" y2="8.0" strokeWidth="1.6" />
                                </svg>
                              </>
                            ) : (
                              ann.solfege
                            )}
                          </span>
                        )}

                        {/* Colored Violin Fingering Number (0, 1, 2, 3) — Hinário de Cordas */}
                        {effectiveShowFingering && (
                          <span
                            data-testid={`fingering-label-${slice.id}`}
                            style={{ color: ann.color }}
                            className={`text-[12px] sm:text-[13px] font-bold leading-none ${
                              ann.circled
                                ? 'w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10.5px]'
                                : ''
                            }`}
                          >
                            {ann.finger}
                          </span>
                        )}
                      </div>

                      {/* Breath mark comma (,) at end of Measure 4 & Measure 8 */}
                      {effectiveShowFingering && isPhraseBreathEnd && (
                        <span
                          style={{
                            left: `${mBox.x + mBox.width - 10}px`,
                            top: `${Math.max(4, mBox.y + 12)}px`,
                          }}
                          className="focus-smooth-annotation absolute text-[22px] font-serif font-bold text-[#111827] leading-none select-none"
                        >
                          ,
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* 5. OpenSheetMusicDisplay SVG Mount Container */}
            <div
              ref={osmdContainerRef}
              data-testid="osmd-svg-container"
              className="osmd-canvas-container score-focus-stage-transition relative z-0 min-h-[260px]"
            />
          </div>
        </div>

        {/* Floating Soundslice Loop / Focus Bar ([Foco] [✕] — no Save Clip, no C1/C2) */}
        {loop.enabled && (
          <div
            data-testid="floating-loop-pill"
            style={{ bottom: effectiveShowViolinNeck ? '234px' : '68px' }}
            className="fixed left-1/2 -translate-x-1/2 z-40 bg-[#3B3D42] text-white px-3 py-1.5 rounded-lg shadow-xl border border-white/15 flex flex-wrap items-center justify-center gap-2 select-none max-w-[96vw] transition-all duration-300 ease-out"
          >
            {isFocusIsolated ? (
              <>
                <span
                  data-testid="focus-isolated-label"
                  className="text-xs font-medium text-gray-200 whitespace-nowrap"
                >
                  Compassos
                </span>

                <div className="inline-flex items-center rounded bg-[#191A1D] border border-white/15 overflow-hidden text-xs font-mono">
                  <span
                    data-testid="focus-start-bar-val"
                    className="px-2 py-1 font-bold text-white"
                  >
                    {loop.startMeasure}
                  </span>
                  <button
                    type="button"
                    data-testid="focus-start-minus"
                    onClick={() =>
                      handleAdjustFocusedMeasures(
                        loop.startMeasure - 1,
                        loop.endMeasure
                      )
                    }
                    aria-label="Diminuir compasso inicial do foco"
                    className="px-2 py-1 hover:bg-white/10 text-gray-300 hover:text-white border-l border-white/10 cursor-pointer"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    data-testid="focus-start-plus"
                    onClick={() =>
                      handleAdjustFocusedMeasures(
                        Math.min(loop.endMeasure, loop.startMeasure + 1),
                        loop.endMeasure
                      )
                    }
                    aria-label="Aumentar compasso inicial do foco"
                    className="px-2 py-1 hover:bg-white/10 text-gray-300 hover:text-white border-l border-white/10 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <span className="text-xs italic text-gray-300">até</span>

                <div className="inline-flex items-center rounded bg-[#191A1D] border border-white/15 overflow-hidden text-xs font-mono">
                  <span
                    data-testid="focus-end-bar-val"
                    className="px-2 py-1 font-bold text-white"
                  >
                    {loop.endMeasure}
                  </span>
                  <button
                    type="button"
                    data-testid="focus-end-minus"
                    onClick={() =>
                      handleAdjustFocusedMeasures(
                        loop.startMeasure,
                        Math.max(loop.startMeasure, loop.endMeasure - 1)
                      )
                    }
                    aria-label="Diminuir compasso final do foco"
                    className="px-2 py-1 hover:bg-white/10 text-gray-300 hover:text-white border-l border-white/10 cursor-pointer"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    data-testid="focus-end-plus"
                    onClick={() =>
                      handleAdjustFocusedMeasures(
                        loop.startMeasure,
                        loop.endMeasure + 1
                      )
                    }
                    aria-label="Aumentar compasso final do foco"
                    className="px-2 py-1 hover:bg-white/10 text-gray-300 hover:text-white border-l border-white/10 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  data-testid="focus-mode-close-btn"
                  onClick={handleExitFocusIsolation}
                  aria-label="Fechar modo foco"
                  title="Sair do modo foco"
                  className="px-2 py-1 rounded bg-[#191A1D] hover:bg-black text-gray-300 hover:text-white text-xs font-bold border border-white/15 cursor-pointer"
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  data-testid="loop-focus-toggle-btn"
                  onClick={handleEnterFocusIsolation}
                  className="px-2.5 py-1 rounded bg-[#191A1D] hover:bg-black text-white text-xs font-semibold border border-white/15 cursor-pointer whitespace-nowrap"
                >
                  Foco
                </button>
                <button
                  type="button"
                  data-testid="floating-loop-close-btn"
                  onClick={handleToggleLoop}
                  aria-label="Fechar Loop"
                  title="Desativar Loop"
                  className="px-2 py-1 rounded bg-[#191A1D] hover:bg-black text-gray-300 hover:text-white text-xs font-bold border border-white/15 cursor-pointer"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* 2.5. Interactive Violin Fingerboard Mirror (Disponível no Hinário de Cordas) */}
      {effectiveShowViolinNeck && (
        <ViolinFingerboard
          activeNotes={activeNotes}
          onPlayNote={(freq) => audioSchedulerRef.current?.playPreviewNote(freq)}
          onClose={() => setShowViolinNeck(false)}
        />
      )}

      {/* 3. Fixed Minimalist Soundslice Dark Charcoal Bottom Transport Bar (#2B2C30) */}
      <TransportBar
        isPlaying={isPlaying}
        isCountingIn={isCountingIn}
        countInBeat={countInBeat}
        countInTotalBeats={countInTotalBeats}
        onTogglePlay={handleTogglePlay}
        onRestart={handleRestart}
        elapsedSeconds={elapsedSeconds}
        totalSeconds={totalSeconds}
        currentBeatInMeasure={currentBeatInMeasure}
        beatsPerMeasure={beatsPerMeasure}
        bpm={bpm}
        baseBpm={baseBpm}
        onBpmChange={handleBpmChange}
        speedTraining={speedTraining}
        onSpeedTrainingChange={handleSpeedTrainingChange}
        loop={loop}
        onToggleLoop={handleToggleLoop}
        metronomeEnabled={metronomeEnabled}
        onToggleMetronome={handleToggleMetronome}
        metronomeBeatMode={metronomeBeatMode}
        onMetronomeBeatModeChange={handleMetronomeBeatModeChange}
        metronomeVolume={metronomeVolume}
        onMetronomeVolumeChange={handleMetronomeVolumeChange}
        countInEnabled={countInEnabled}
        onToggleCountIn={handleToggleCountIn}
        countInCondition={countInCondition}
        onCountInConditionChange={handleCountInConditionChange}
        countInBars={countInBars}
        onCountInBarsChange={handleCountInBarsChange}
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        isSettingsOpen={isSettingsOpen}
        onToggleSettings={() => setIsSettingsOpen((prev) => !prev)}
        noteHighlightColor={noteHighlightColor}
        onNoteHighlightColorChange={setNoteHighlightColor}
        highlightBar={highlightBar}
        onHighlightBarChange={setHighlightBar}
        highlightNotes={highlightNotes}
        onHighlightNotesChange={setHighlightNotes}
        isCordasHymnal={isCordasHymnal}
        showViolinNeck={effectiveShowViolinNeck}
        onToggleViolinNeck={() => setShowViolinNeck((prev) => !prev)}
        showFingering={showFingering}
        onShowFingeringChange={setShowFingering}
        showPitchNames={showPitchNames}
        onShowPitchNamesChange={setShowPitchNames}
        showRhythmCounts={showRhythmCounts}
        onShowRhythmCountsChange={setShowRhythmCounts}
        showBarNumbers={showBarNumbers}
        onShowBarNumbersChange={setShowBarNumbers}
        showScoreTitle={showScoreTitle}
        onShowScoreTitleChange={setShowScoreTitle}
        horizontalNotation={horizontalNotation}
        onHorizontalNotationChange={handleHorizontalNotationChange}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        voices={ !customFileName ? activePresetObj?.voices : undefined }
        activeStaffIndices={activeStaffIndices}
        onToggleStaffVoice={handleToggleStaffVoice}
        onSoloStaffVoice={handleSoloStaffVoice}
        onResetAllVoices={handleResetAllVoices}
      />
    </div>
  );
}
