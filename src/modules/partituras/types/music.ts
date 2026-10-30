export type TimbreType =
  // Teclados (CCB)
  | 'orgao-ccb'
  | 'acoustic-grand'
  | 'studio-upright'
  | 'electric-rhodes'
  // Cordas (CCB)
  | 'violin'
  | 'viola'
  | 'violoncelo'
  // Madeiras (CCB)
  | 'flauta-transversal'
  | 'oboe'
  | 'oboe-damore'
  | 'corne-ingles'
  | 'fagote'
  | 'clarinete-sib'
  | 'clarinete-alto-mib'
  | 'clarinete-baixo-sib'
  | 'sax-soprano-sib'
  | 'sax-alto-mib'
  | 'sax-tenor-sib'
  | 'sax-baritono-mib'
  // Metais (CCB)
  | 'trompete-sib'
  | 'cornet-sib'
  | 'flugelhorn-sib'
  | 'trompa-fa'
  | 'trombone-sib'
  | 'trombonito-sib'
  | 'baritono-sib'
  | 'eufonio-sib'
  | 'tuba'
  // Estudo Rítmico (MSA)
  | 'ritmo-percussivo'
  | 'warm-triangle';

export type CCBInstrumentFamily = 'Teclados' | 'Cordas' | 'Madeiras' | 'Metais' | 'Estudo MSA';

export interface CCBInstrumentOption {
  id: TimbreType;
  label: string;
  family: CCBInstrumentFamily;
  transposition?: string;
}

/**
 * Conforme especificação oficial do MSA CCB:
 * Utilizamos exclusivamente as 3 claves nas seguintes posições:
 * - 'sol': Clave de Sol (2ª linha)
 * - 'do':  Clave de Dó (3ª linha)
 * - 'fa':  Clave de Fá (4ª linha)
 */
export type MsaClefType = 'sol' | 'do' | 'fa';

export type UserRoleMode = 'student' | 'admin';

export type HymnalEdition =
  | 'cordas'
  | 'orgao'
  | 'do'
  | 'sib'
  | 'mib'
  | 'fa'
  | 'tubas';

/**
 * Modalidades de lição do MSA:
 * - 'ritmica': Leitura Rítmica (sem clave e sem pentagrama, igual à Lição 1)
 * - 'solfejo': Solfejo musical podendo alternar entre as 3 claves (Sol, Dó e Fá), buscando o MusicXML correspondente
 */
export type MsaPhaseCategory = 'ritmica' | 'solfejo';

export interface VoicePartInfo {
  id: string;
  label: string;
  role?: string;
  staffIndex: number;
  voiceIndex?: number;
}

export type MetronomeBeatMode = 'every-beat' | 'first-beat' | 'eighth';

export type CountInCondition = 'always' | 'start-only' | 'loop-only';

export interface SpeedTrainingConfig {
  enabled: boolean;
  initialBpm: number;
  finalBpm: number;
  incrementBpm: number;
}

export interface ScoreNote {
  id: string;
  midi: number;
  frequency: number;
  pitchLabel: string;
  isRest: boolean;
  measureIndex: number; // 0-based in currently rendered score
  measureNumber: number; // 1-based original measure number in full score
  startBeatInScore: number; // Quarter-note beats from start of rendered score
  durationBeats: number; // Duration in quarter-note beats
  startBeatInMeasure: number; // 0-based quarter-note beat inside measure
  staffIndex: number;
  voiceIndex: number;
  voicePartId?: string;
  graphicalNoteRef?: unknown;
}

export type NotePayload = ScoreNote;

export interface ScoreSliceEvent {
  id: string;
  measureIndex: number;
  measureNumber: number;
  startBeatInScore: number;
  durationBeats: number;
  startBeatInMeasure: number;
  notes: ScoreNote[];
  /** Relative X ratio [0..1] inside the measure bounding box */
  relativeXInMeasure: number;
  /** Exact SVG X coordinate in OSMD units if available */
  osmdX?: number;
}

export interface MeasureBoundingBox {
  measureIndex: number;
  measureNumber: number;
  startBeatInScore: number;
  durationBeats: number;
  beatsPerMeasure: number;
  beatType: number;
  /** Pixel coordinates relative to the score stage wrapper */
  x: number;
  y: number;
  width: number;
  height: number;
  systemIndex: number;
  /** Exact Y pixel coordinate of the 5th (top) staff line of the pentagram */
  staffTopY?: number;
  /** Exact Y pixel coordinate of the 1st (bottom) staff line of the pentagram */
  staffBottomY?: number;
}

export interface LoopConfig {
  enabled: boolean;
  startMeasure: number; // 1-based measure number
  endMeasure: number;   // 1-based measure number
  /** Exact sub-measure start beat in score (e.g. 2.0 = 3rd beat of Measure 1) */
  startBeat?: number;
  /** Exact sub-measure end beat in score (e.g. 10.0 = after 2nd beat of Measure 3) */
  endBeat?: number;
}

export interface PlaybackVisualFrame {
  currentBeat: number;
  elapsedSeconds: number;
  totalSeconds: number;
  currentMeasureNumber: number; // 1-based
  currentBeatInMeasure: number; // 1-based integer (1, 2, 3, 4)
  activeSliceIds: string[];
  activeNotes: ScoreNote[];
  isCountingIn: boolean;
  countInBeat: number | null; // 1, 2, 3, 4 during count-in
  countInTotalBeats: number;
  cursorBox: {
    x: number;
    y: number;
    height: number;
    measureBox: MeasureBoundingBox | null;
  };
}

export interface PresetScore {
  id: string;
  title: string;
  composer: string;
  difficulty: string;
  defaultBpm: number;
  maxBpm?: number;
  tempoLabel?: string;
  timeSignature: string;
  keySignature: string;
  description: string;
  collection: 'hinario5' | 'msa';
  number: number; // Hymn number (1..480) or MSA Lesson number (1..113)
  edition?: HymnalEdition;
  msaPhase?: MsaPhaseCategory;
  defaultClef?: MsaClefType;
  defaultTimbre?: TimbreType;
  voices?: VoicePartInfo[];
  isCustomCreated?: boolean;
  hasAdminOverride?: boolean;
  updatedAt?: string;
  /** MusicXML principal (usado em Hinos, Leitura Rítmica ou fallback de Solfejo) */
  xml: string;
  /**
   * Mapa de MusicXML por Clave para lições de Solfejo do MSA.
   * Ao selecionar uma das 3 claves ('sol', 'do', 'fa'), o sistema busca o MusicXML referente.
   */
  xmlByClef?: Partial<Record<MsaClefType, string>>;
}

export type MeasureClickMode = 'seek' | 'loop';
