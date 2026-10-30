import {
  CCBInstrumentOption,
  HymnalEdition,
  LoopConfig,
  MeasureBoundingBox,
  MsaClefType,
  PresetScore,
  ScoreSliceEvent,
  SpeedTrainingConfig,
} from '../types/music';

export const MIN_BPM = 30;
export const MAX_BPM = 240;

/**
 * As 3 claves utilizadas no Hinário e no MSA da CCB (conforme referência oficial):
 * - Clave de Sol na 2ª linha (utilizada principalmente para sons agudos)
 * - Clave de Dó na 3ª linha (utilizada principalmente para sons médios)
 * - Clave de Fá na 4ª linha (utilizada principalmente para sons graves)
 */
export interface MsaOfficialClefOption {
  value: MsaClefType;
  glyph: string;
  label: string;
  shortLabel: string;
  staffLineLabel: string;
  registerDescription: string;
  referenceNoteName: string;
}

export const MSA_OFFICIAL_CLEFS: readonly MsaOfficialClefOption[] = [
  {
    value: 'sol',
    glyph: '𝄞',
    label: 'Clave de Sol',
    shortLabel: '𝄞 Sol',
    staffLineLabel: '2ª linha',
    registerDescription: 'Sons agudos · 2ª linha = Sol',
    referenceNoteName: 'Sol',
  },
  {
    value: 'do',
    glyph: '𝄡',
    label: 'Clave de Dó',
    shortLabel: '𝄡 Dó',
    staffLineLabel: '3ª linha',
    registerDescription: 'Sons médios · 3ª linha = Dó',
    referenceNoteName: 'Dó',
  },
  {
    value: 'fa',
    glyph: '𝄢',
    label: 'Clave de Fá',
    shortLabel: '𝄢 Fá',
    staffLineLabel: '4ª linha',
    registerDescription: 'Sons graves · 4ª linha = Fá',
    referenceNoteName: 'Fá',
  },
];

export const HYMNAL_EDITION_LABELS: Record<HymnalEdition, string> = {
  cordas: 'Cordas',
  orgao: 'Órgão',
  do: 'Hinário em Dó',
  sib: 'Si bemol (Si♭)',
  mib: 'Mi bemol (Mi♭)',
  fa: 'Fá',
  tubas: 'Tubas',
};

export const HYMNAL_EDITION_SHORT_LABELS: Record<HymnalEdition, string> = {
  cordas: 'Cordas',
  orgao: 'Órgão',
  do: 'Dó',
  sib: 'Si♭',
  mib: 'Mi♭',
  fa: 'Fá',
  tubas: 'Tubas',
};

/**
 * Official list of instruments accepted in the CCB Orchestra (per MSA reference table)
 * grouped by family: Teclados, Cordas, Madeiras, Metais, and Estudo MSA.
 */
export const CCB_ORCHESTRA_INSTRUMENTS: readonly CCBInstrumentOption[] = [
  // Teclados
  { id: 'orgao-ccb', label: 'Órgão Eletrônico (Litúrgico CCB)', family: 'Teclados' },
  { id: 'acoustic-grand', label: 'Piano de Cauda Real (Steinway)', family: 'Teclados' },
  { id: 'studio-upright', label: 'Piano Vertical de Estúdio', family: 'Teclados' },
  // Cordas
  { id: 'violin', label: 'Violino (Arco Expressivo)', family: 'Cordas' },
  { id: 'viola', label: 'Viola (Clave de Dó)', family: 'Cordas' },
  { id: 'violoncelo', label: 'Violoncelo (Clave de Fá)', family: 'Cordas' },
  // Madeiras
  { id: 'flauta-transversal', label: 'Flauta Transversal (Dó)', family: 'Madeiras' },
  { id: 'oboe', label: 'Oboé (Dó)', family: 'Madeiras' },
  { id: 'oboe-damore', label: "Oboé d'Amore (Lá)", family: 'Madeiras' },
  { id: 'corne-ingles', label: 'Corne Inglês (Fá)', family: 'Madeiras' },
  { id: 'fagote', label: 'Fagote (Dó - Clave de Fá)', family: 'Madeiras' },
  { id: 'clarinete-sib', label: 'Clarinete em Si♭', family: 'Madeiras' },
  { id: 'clarinete-alto-mib', label: 'Clarinete Alto em Mi♭', family: 'Madeiras' },
  { id: 'clarinete-baixo-sib', label: 'Clarinete Baixo em Si♭', family: 'Madeiras' },
  { id: 'sax-soprano-sib', label: 'Saxofone Soprano em Si♭', family: 'Madeiras' },
  { id: 'sax-alto-mib', label: 'Saxofone Alto em Mi♭', family: 'Madeiras' },
  { id: 'sax-tenor-sib', label: 'Saxofone Tenor em Si♭', family: 'Madeiras' },
  { id: 'sax-baritono-mib', label: 'Saxofone Barítono em Mi♭', family: 'Madeiras' },
  // Metais
  { id: 'trompete-sib', label: 'Trompete em Dó ou Si♭', family: 'Metais' },
  { id: 'cornet-sib', label: 'Cornet em Si♭', family: 'Metais' },
  { id: 'flugelhorn-sib', label: 'Flugelhorn em Si♭', family: 'Metais' },
  { id: 'trompa-fa', label: 'Trompa em Fá', family: 'Metais' },
  { id: 'trombone-sib', label: 'Trombone em Si♭', family: 'Metais' },
  { id: 'trombonito-sib', label: 'Trombonito em Si♭', family: 'Metais' },
  { id: 'baritono-sib', label: 'Barítono em Si♭', family: 'Metais' },
  { id: 'eufonio-sib', label: 'Eufônio em Si♭', family: 'Metais' },
  { id: 'tuba', label: 'Tuba (Clave de Fá)', family: 'Metais' },
  // Estudo MSA
  { id: 'ritmo-percussivo', label: 'Pulso Rítmico MSA (Leitura Rítmica)', family: 'Estudo MSA' },
];

/**
 * Clamps BPM within the valid 30..240 range.
 */
export function clampBpm(bpm: number): number {
  if (!Number.isFinite(bpm)) return 100;
  return Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(bpm)));
}

/**
 * Converts a MIDI note number (e.g. 69 = A4) to frequency in Hz.
 */
export function midiToFrequency(midi: number): number {
  return Number((440 * Math.pow(2, (midi - 69) / 12)).toFixed(3));
}

/**
 * Converts a MIDI note number to human-readable scientific pitch notation (e.g. 60 -> "C4").
 */
export function midiToNoteName(midi: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const clamped = Math.max(0, Math.min(127, Math.round(midi)));
  const octave = Math.floor(clamped / 12) - 1;
  const noteName = names[clamped % 12];
  return `${noteName}${octave}`;
}

/**
 * Converts quarter-note beats to seconds at a given BPM.
 */
export function beatsToSeconds(beats: number, bpm: number): number {
  const safeBpm = clampBpm(bpm);
  return (beats * 60) / safeBpm;
}

/**
 * Converts seconds to quarter-note beats at a given BPM.
 */
export function secondsToBeats(seconds: number, bpm: number): number {
  const safeBpm = clampBpm(bpm);
  return (seconds * safeBpm) / 60;
}

/**
 * Formats seconds into MM:SS.d or MM:SS tabular format.
 */
export function formatTime(seconds: number, includeTenths = false): string {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  if (includeTenths) {
    const tenths = Math.floor((safe % 1) * 10);
    return `${mm}:${ss}.${tenths}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Ensures loop start and end measures are valid 1-based measure numbers with start <= end.
 */
export function normalizeLoopRange(
  startMeasure: number,
  endMeasure: number,
  totalMeasures: number
): { startMeasure: number; endMeasure: number } {
  const maxM = Math.max(1, totalMeasures);
  const s = Math.max(1, Math.min(maxM, Math.round(startMeasure)));
  const e = Math.max(1, Math.min(maxM, Math.round(endMeasure)));
  return {
    startMeasure: Math.min(s, e),
    endMeasure: Math.max(s, e),
  };
}

/**
 * Computes the beat range [startBeat, endBeat] for a given loop configuration.
 * Supports both sub-measure beat boundaries (startBeat/endBeat) and full measure boundaries.
 */
export function getLoopBeatBounds(
  loop: LoopConfig,
  measures: Pick<MeasureBoundingBox, 'measureNumber' | 'startBeatInScore' | 'durationBeats'>[],
  totalBeats: number
): { startBeat: number; endBeat: number } {
  if (!loop.enabled || measures.length === 0) {
    return { startBeat: 0, endBeat: Math.max(0.001, totalBeats) };
  }

  if (typeof loop.startBeat === 'number' && typeof loop.endBeat === 'number') {
    const rawMin = Math.min(loop.startBeat, loop.endBeat);
    const rawMax = Math.max(loop.startBeat, loop.endBeat);
    const startBeat = Math.max(0, Math.min(totalBeats - 0.25, rawMin));
    const endBeat = Math.max(startBeat + 0.25, Math.min(totalBeats, rawMax));
    return {
      startBeat: Number(startBeat.toFixed(4)),
      endBeat: Number(endBeat.toFixed(4)),
    };
  }

  const minMeasureNum = measures[0].measureNumber;
  const maxMeasureNum = measures[measures.length - 1].measureNumber;
  const clampedStartM = Math.max(minMeasureNum, Math.min(maxMeasureNum, Math.round(loop.startMeasure)));
  const clampedEndM = Math.max(clampedStartM, Math.min(maxMeasureNum, Math.round(loop.endMeasure)));

  const startM = measures.find((m) => m.measureNumber === clampedStartM) ?? measures[0];
  const endM =
    measures.find((m) => m.measureNumber === clampedEndM) ??
    measures[measures.length - 1];

  const startBeat = startM.startBeatInScore;
  const endBeat = endM.startBeatInScore + endM.durationBeats;
  return {
    startBeat,
    endBeat: Math.max(startBeat + 0.25, endBeat),
  };
}

/**
 * Formats a loop's beat/measure boundaries into a concise readable label.
 */
export function formatLoopBeatRange(
  loop: LoopConfig,
  measures: Pick<MeasureBoundingBox, 'measureNumber' | 'startBeatInScore' | 'durationBeats'>[],
  totalBeats: number
): string {
  if (measures.length === 0) {
    return `C${loop.startMeasure}–C${loop.endMeasure}`;
  }
  const { startBeat, endBeat } = getLoopBeatBounds(
    { ...loop, enabled: true },
    measures,
    totalBeats
  );

  const startM = findActiveMeasureAtBeat(measures, startBeat) ?? measures[0];
  const endM =
    findActiveMeasureAtBeat(measures, Math.max(0, endBeat - 0.01)) ??
    measures[measures.length - 1];

  const startOffset = Math.max(0, startBeat - startM.startBeatInScore);
  const endOffset = Math.max(0, endBeat - endM.startBeatInScore);

  const isFullStart = startOffset < 0.08;
  const isFullEnd = Math.abs(endOffset - endM.durationBeats) < 0.08;

  if (isFullStart && isFullEnd) {
    if (startM.measureNumber === endM.measureNumber) {
      return `C${startM.measureNumber}`;
    }
    return `C${startM.measureNumber}–C${endM.measureNumber}`;
  }

  const startBeatNum = Math.floor(startOffset + 0.05) + 1;
  const endBeatNum = isFullEnd
    ? endM.durationBeats
    : Math.max(1, Math.round(endOffset));

  const startLabel = isFullStart
    ? `C${startM.measureNumber}`
    : `C${startM.measureNumber}.${startBeatNum}`;
  const endLabel = isFullEnd
    ? `C${endM.measureNumber}`
    : `C${endM.measureNumber}.${endBeatNum}`;

  return `${startLabel}–${endLabel}`;
}

/**
 * Advances a beat position by deltaBeats, respecting active loop boundaries or score end.
 */
export function advanceBeatWithLoop(
  currentBeat: number,
  deltaBeats: number,
  loop: LoopConfig,
  measures: Pick<MeasureBoundingBox, 'measureNumber' | 'startBeatInScore' | 'durationBeats'>[],
  totalBeats: number
): { nextBeat: number; wrappedLoop: boolean; reachedEnd: boolean } {
  const { startBeat, endBeat } = getLoopBeatBounds(loop, measures, totalBeats);
  const candidate = currentBeat + deltaBeats;

  if (loop.enabled && measures.length > 0) {
    const loopLength = Math.max(0.25, endBeat - startBeat);
    if (candidate >= endBeat) {
      const overshoot = (candidate - startBeat) % loopLength;
      return {
        nextBeat: startBeat + overshoot,
        wrappedLoop: true,
        reachedEnd: false,
      };
    }
    if (candidate < startBeat) {
      return {
        nextBeat: startBeat,
        wrappedLoop: false,
        reachedEnd: false,
      };
    }
    return {
      nextBeat: candidate,
      wrappedLoop: false,
      reachedEnd: false,
    };
  }

  if (candidate >= totalBeats) {
    return {
      nextBeat: totalBeats,
      wrappedLoop: false,
      reachedEnd: true,
    };
  }

  return {
    nextBeat: Math.max(0, candidate),
    wrappedLoop: false,
    reachedEnd: false,
  };
}

/**
 * Finds the active measure at a given beat in the score.
 */
export function findActiveMeasureAtBeat<
  T extends Pick<MeasureBoundingBox, 'measureNumber' | 'startBeatInScore' | 'durationBeats'>
>(measures: T[], beat: number): T | null {
  if (measures.length === 0) return null;
  const eps = 1e-4;
  for (let i = 0; i < measures.length; i++) {
    const m = measures[i];
    if (beat >= m.startBeatInScore - eps && beat < m.startBeatInScore + m.durationBeats - eps) {
      return m;
    }
  }
  if (beat < measures[0].startBeatInScore) {
    return measures[0];
  }
  return measures[measures.length - 1];
}

/**
 * Finds all score slice events active at a given beat.
 */
export function findActiveSlicesAtBeat(
  slices: ScoreSliceEvent[],
  beat: number
): ScoreSliceEvent[] {
  const eps = 0.015;
  return slices.filter(
    (s) => beat >= s.startBeatInScore - eps && beat < s.startBeatInScore + s.durationBeats - eps
  );
}

/**
 * Computes the real acoustic piano partial frequency including string stiffness inharmonicity:
 * f_n = n * f_0 * sqrt(1 + B * n^2)
 */
export function computePianoPartialFrequency(
  fundamentalHz: number,
  partialIndex: number,
  inharmonicityB = 0.00038
): number {
  const n = Math.max(1, Math.round(partialIndex));
  const factor = Math.sqrt(1 + inharmonicityB * n * n);
  return Number((n * fundamentalHz * factor).toFixed(3));
}

/**
 * Given a target MIDI note and a list of available sampled MIDI notes,
 * returns the closest sampled MIDI note and the exact AudioBufferSourceNode playbackRate.
 */
export function findNearestSampleMidi(
  targetMidi: number,
  availableSampleMidis: number[]
): { sampleMidi: number; playbackRate: number } {
  if (availableSampleMidis.length === 0) {
    return { sampleMidi: targetMidi, playbackRate: 1 };
  }
  let closest = availableSampleMidis[0];
  let minDiff = Math.abs(targetMidi - closest);

  for (let i = 1; i < availableSampleMidis.length; i++) {
    const candidate = availableSampleMidis[i];
    const diff = Math.abs(targetMidi - candidate);
    if (diff < minDiff) {
      minDiff = diff;
      closest = candidate;
    }
  }

  const semitoneDelta = targetMidi - closest;
  const playbackRate = Number(Math.pow(2, semitoneDelta / 12).toFixed(6));
  return { sampleMidi: closest, playbackRate };
}

export interface PedagogicalNoteAnnotation {
  solfege: string;
  finger: string;
  color: string;
  circled?: boolean;
}

/**
 * Official Portuguese Fixed-Do Solfege names with proper acute accents:
 * Dó, Ré, Mi, Fá, Sol, Lá, Si
 */
export const SOLFEGE_NAMES_PT: readonly string[] = [
  'Dó',
  'Dó♯',
  'Ré',
  'Ré♯',
  'Mi',
  'Fá',
  'Fá♯',
  'Sol',
  'Sol♯',
  'Lá',
  'Si♭',
  'Si',
];

/**
 * Maps a MIDI note to its Portuguese Fixed-Do Solfege name (with acute accents: Dó, Ré, Mi, Fá, Sol, Lá, Si)
 * and colored string/position fingering matching the Soundslice pedagogical violin/melody notation.
 */
export function midiToPedagogicalAnnotation(midi: number): PedagogicalNoteAnnotation {
  const clamped = Math.max(0, Math.min(127, Math.round(midi)));
  const pitchClass = clamped % 12;
  const solfege = SOLFEGE_NAMES_PT[pitchClass] ?? 'Dó';

  let finger = '0';
  let color = '#2563EB';
  let circled = false;

  if (clamped >= 69 && clamped <= 75) {
    color = '#DC2626';
    if (clamped === 69) finger = '0'; // Lá
    else if (clamped === 70 || clamped === 71) finger = '1'; // Si
    else if (clamped === 72) {
      finger = '2'; // Dó (low 2 circled)
      circled = true;
    } else if (clamped === 73) finger = '2'; // Dó♯
    else finger = '3'; // Ré5
  } else if (clamped >= 62 && clamped <= 68) {
    color = '#2563EB';
    if (clamped === 62) finger = '0'; // Ré
    else if (clamped === 63 || clamped === 64) finger = '1'; // Mi
    else if (clamped === 65 || clamped === 66) finger = '2'; // Fá / Fá♯
    else finger = '3'; // Sol
  } else if (clamped < 62) {
    color = '#2563EB';
    if (clamped <= 55) finger = '0'; // Sol3
    else if (clamped <= 57) finger = '1'; // Lá3
    else if (clamped <= 59) finger = '2'; // Si3
    else finger = '3'; // Dó4
  } else {
    color = '#16A34A';
    if (clamped === 76) finger = '0'; // Mi5
    else if (clamped <= 78) finger = '1'; // Fá5 / Fá♯5
    else if (clamped <= 80) finger = '2'; // Sol5 / Sol♯5
    else finger = '3'; // Lá5+
  }

  return { solfege, finger, color, circled };
}

export interface ViolinFingerboardPosition {
  stringId: 'G' | 'D' | 'A' | 'E';
  stringNamePt: 'Sol' | 'Ré' | 'Lá' | 'Mi';
  stringIndex: number; // 0 = G (Sol), 1 = D (Ré), 2 = A (Lá), 3 = E (Mi)
  openStringMidi: number; // 55, 62, 69, 76
  semitonesFromNut: number; // 0 (open) .. 7
  finger: number; // 0, 1, 2, 3, 4
  solfege: string;
  midi: number;
}

/**
 * Maps a MIDI note (55..84) to its 1st-position Violin String (Sol, Ré, Lá, Mi),
 * semitone offset from nut (0..7), and finger number for the Soundslice Visual Violin Fingerboard.
 */
export function midiToViolinFingerboardPosition(midi: number): ViolinFingerboardPosition {
  const clamped = Math.max(55, Math.min(84, Math.round(midi)));
  const solfege = SOLFEGE_NAMES_PT[clamped % 12] ?? 'Dó';

  let stringId: 'G' | 'D' | 'A' | 'E' = 'D';
  let stringNamePt: 'Sol' | 'Ré' | 'Lá' | 'Mi' = 'Ré';
  let stringIndex = 1;
  let openStringMidi = 62;

  if (clamped < 62) {
    stringId = 'G';
    stringNamePt = 'Sol';
    stringIndex = 0;
    openStringMidi = 55;
  } else if (clamped < 69) {
    stringId = 'D';
    stringNamePt = 'Ré';
    stringIndex = 1;
    openStringMidi = 62;
  } else if (clamped < 76) {
    stringId = 'A';
    stringNamePt = 'Lá';
    stringIndex = 2;
    openStringMidi = 69;
  } else {
    stringId = 'E';
    stringNamePt = 'Mi';
    stringIndex = 3;
    openStringMidi = 76;
  }

  const semitonesFromNut = Math.max(0, Math.min(8, clamped - openStringMidi));
  let finger = 0;
  if (semitonesFromNut === 0) finger = 0;
  else if (semitonesFromNut <= 2) finger = 1;
  else if (semitonesFromNut <= 4) finger = 2;
  else if (semitonesFromNut <= 6) finger = 3;
  else finger = 4;

  return {
    stringId,
    stringNamePt,
    stringIndex,
    openStringMidi,
    semitonesFromNut,
    finger,
    solfege,
    midi: clamped,
  };
}

/**
 * Formats a note's beat position within a measure into a Soundslice Rhythm Count label
 * ("1", "+", "2", "+", "3", "+", "4", etc.).
 */
export function formatRhythmCount(startBeatInMeasure: number): string {
  const beatNumber = Math.floor(startBeatInMeasure + 0.04) + 1;
  const frac = startBeatInMeasure - Math.floor(startBeatInMeasure + 0.04);
  if (Math.abs(frac) < 0.08) {
    return String(beatNumber);
  }
  if (Math.abs(frac - 0.5) < 0.12) {
    return '+';
  }
  if (Math.abs(frac - 0.25) < 0.1) {
    return 'e';
  }
  if (Math.abs(frac - 0.75) < 0.1) {
    return 'a';
  }
  return String(beatNumber);
}

/**
 * Computes the next BPM when a loop repeats with Speed Training (Treino de Velocidade) active.
 */
export function computeNextSpeedTrainingBpm(
  currentBpm: number,
  config: SpeedTrainingConfig
): number {
  if (!config.enabled) return clampBpm(currentBpm);
  const target = clampBpm(config.finalBpm);
  const step = Math.max(1, Math.round(config.incrementBpm));
  if (currentBpm >= target) return target;
  return Math.min(target, clampBpm(currentBpm + step));
}

// ============================================================================
// REPERTOIRE CATALOG & CLEF MUSICXML LOOKUP (Pure Logic)
// ============================================================================

/**
 * Busca o arquivo MusicXML correspondente à Clave selecionada ('sol' | 'do' | 'fa')
 * para uma lição de Solfejo do MSA, ou retorna o MusicXML único da lição/hino.
 */
/**
 * Normaliza qualquer MusicXML de Leitura Rítmica (lições sem clave) para que todas as notas
 * fiquem posicionadas na altura do PRIMEIRO ESPAÇO (F4 na referência de 2ª linha, com haste para cima),
 * evitando que as cabeças de nota fiquem flutuando na altura da 3ª linha (B4).
 * Suporta tanto notas exportadas com `<pitch>` quanto `<unpitched>` (percussão/1 linha do MuseScore).
 */
export function normalizeRhythmicMusicXmlToFirstSpace(xml: string): string {
  if (!xml || typeof xml !== 'string') return xml;

  let normalized = xml;

  // 1. Garante clave base G na 2ª linha (oculta no SVG pós-renderização) para que F4 = 1º espaço exato
  normalized = normalized.replace(
    /<clef(?:\s+[^>]*)?>[\s\S]*?<\/clef>/gi,
    '<clef><sign>G</sign><line>2</line></clef>'
  );

  // Remove <staff-details> (ex.: <staff-lines>1</staff-lines>) para manter barras de compasso completas
  normalized = normalized.replace(
    /<staff-details(?:\s+[^>]*)?>[\s\S]*?<\/staff-details>/gi,
    ''
  );

  // 2. Converte <unpitched>...</unpitched> ou <pitch>...</pitch> para <pitch><step>F</step><octave>4</octave></pitch> (1º espaço)
  normalized = normalized.replace(
    /<unpitched(?:\s+[^>]*)?>[\s\S]*?<\/unpitched>/gi,
    '<pitch><step>F</step><octave>4</octave></pitch>'
  );
  normalized = normalized.replace(
    /<pitch(?:\s+[^>]*)?>[\s\S]*?<\/pitch>/gi,
    '<pitch><step>F</step><octave>4</octave></pitch>'
  );

  // 3. Remove acidentes visuais (<accidental>...</accidental>) caso o arquivo original tivesse algum
  normalized = normalized.replace(
    /<accidental(?:\s+[^>]*)?>[\s\S]*?<\/accidental>/gi,
    ''
  );

  // 4. Garante hastes para cima (<stem>up</stem>) nas figuras com haste
  normalized = normalized.replace(
    /<stem(?:\s+[^>]*)?>\s*down\s*<\/stem>/gi,
    '<stem>up</stem>'
  );

  return normalized;
}

export function resolveScoreXmlForClef(
  score: PresetScore,
  clef: MsaClefType = 'sol'
): string {
  if (score.collection === 'msa' && score.msaPhase === 'ritmica') {
    return normalizeRhythmicMusicXmlToFirstSpace(score.xml);
  }
  if (
    score.collection === 'msa' &&
    score.msaPhase === 'solfejo' &&
    score.xmlByClef
  ) {
    const specificXml = score.xmlByClef[clef];
    if (typeof specificXml === 'string' && specificXml.trim().length > 0) {
      return specificXml;
    }
    if (typeof score.xmlByClef.sol === 'string' && score.xmlByClef.sol.trim().length > 0) {
      return score.xmlByClef.sol;
    }
  }
  return score.xml;
}

/**
 * Substitui (reimporta) o MusicXML de uma lição do MSA ou de um Hino no catálogo.
 * - Se for uma lição de Solfejo do MSA e `targetClef` ('sol' | 'do' | 'fa') for informada,
 *   substitui apenas o MusicXML referente àquela clave.
 * - Se for Leitura Rítmica do MSA (`msaPhase === 'ritmica'`), normaliza automaticamente
 *   todas as notas para a altura do 1º espaço (`F4`).
 */
export function applyMusicXmlReimport(
  catalog: PresetScore[],
  scoreId: string,
  newXml: string,
  targetClef?: MsaClefType,
  timestampIso = new Date().toISOString()
): PresetScore[] {
  const trimmed = newXml.trim();
  if (!trimmed) return catalog;

  return catalog.map((item) => {
    if (item.id !== scoreId) return item;

    if (item.collection === 'msa' && item.msaPhase === 'solfejo' && targetClef) {
      const nextXmlByClef: Partial<Record<MsaClefType, string>> = {
        ...(item.xmlByClef ?? { sol: item.xml }),
        [targetClef]: trimmed,
      };
      return {
        ...item,
        xml: targetClef === 'sol' ? trimmed : item.xml,
        xmlByClef: nextXmlByClef,
        hasAdminOverride: true,
        updatedAt: timestampIso,
      };
    }

    const finalXml =
      item.collection === 'msa' && item.msaPhase === 'ritmica'
        ? normalizeRhythmicMusicXmlToFirstSpace(trimmed)
        : trimmed;

    return {
      ...item,
      xml: finalXml,
      hasAdminOverride: true,
      updatedAt: timestampIso,
    };
  });
}

export interface GroupedHymnEntry {
  hymnNumber: number;
  baseTitle: string;
  composer: string;
  timeSignature: string;
  defaultBpm: number;
  tempoLabel?: string;
  editions: PresetScore[];
}

/**
 * Agrupa os hinos do Hinário 5 por número (ex.: Hino 15 com edições Cordas, Órgão, Dó, Si♭)
 * para uma navegação limpa e intuitiva no painel do aluno e do administrador.
 */
export function groupHymnsByNumber(scores: PresetScore[]): GroupedHymnEntry[] {
  const hymns = scores.filter((s) => s.collection === 'hinario5');
  const map = new Map<number, PresetScore[]>();

  for (const h of hymns) {
    const num = h.number || 1;
    const list = map.get(num) ?? [];
    list.push(h);
    map.set(num, list);
  }

  const editionOrder: HymnalEdition[] = [
    'cordas',
    'orgao',
    'do',
    'sib',
    'mib',
    'fa',
    'tubas',
  ];

  const groups: GroupedHymnEntry[] = [];
  for (const [hymnNumber, items] of map.entries()) {
    const sortedEditions = [...items].sort((a, b) => {
      const idxA = a.edition ? editionOrder.indexOf(a.edition) : 99;
      const idxB = b.edition ? editionOrder.indexOf(b.edition) : 99;
      return idxA - idxB;
    });

    const primary = sortedEditions[0];
    const cleanTitle = primary.title.replace(/\s*\([^)]+\)\s*$/, '').trim();

    groups.push({
      hymnNumber,
      baseTitle: cleanTitle,
      composer: primary.composer,
      timeSignature: primary.timeSignature,
      defaultBpm: primary.defaultBpm,
      tempoLabel: primary.tempoLabel,
      editions: sortedEditions,
    });
  }

  return groups.sort((a, b) => a.hymnNumber - b.hymnNumber);
}

export interface ExtractedMusicXmlMetadata {
  title: string | null;
  timeSignature: string | null;
  defaultBpm: number | null;
  detectedClef: MsaClefType | null;
  detectedNumber: number | null;
  detectedCollection: 'msa' | 'hinario5' | null;
  isRhythmicUnpitched: boolean;
}

/**
 * Extrai automaticamente metadados musicais (título, compasso, BPM, clave, número e coleção)
 * diretamente do conteúdo XML e do nome do arquivo para agilizar a importação pelo Administrador.
 */
export function extractMusicXmlMetadata(
  xml: string,
  fileName?: string
): ExtractedMusicXmlMetadata {
  const safeXml = typeof xml === 'string' ? xml : '';
  const safeFile = typeof fileName === 'string' ? fileName : '';

  // 1. Título (<work-title> ou <movement-title>)
  const workTitleMatch = safeXml.match(/<work-title[^>]*>([\s\S]*?)<\/work-title>/i);
  const movementTitleMatch = safeXml.match(/<movement-title[^>]*>([\s\S]*?)<\/movement-title>/i);
  const rawTitle = (workTitleMatch?.[1] || movementTitleMatch?.[1] || '').trim();
  const title = rawTitle ? rawTitle.replace(/\s+/g, ' ') : null;

  // 2. Fórmula de Compasso (<beats> / <beat-type>)
  const timeMatch = safeXml.match(
    /<time[^>]*>[\s\S]*?<beats[^>]*>\s*(\d+)\s*<\/beats>[\s\S]*?<beat-type[^>]*>\s*(\d+)\s*<\/beat-type>[\s\S]*?<\/time>/i
  );
  const timeSignature =
    timeMatch && timeMatch[1] && timeMatch[2] ? `${timeMatch[1]}/${timeMatch[2]}` : null;

  // 3. Andamento BPM (<per-minute> ou <sound tempo="...">)
  const perMinuteMatch = safeXml.match(/<per-minute[^>]*>\s*(\d+(?:\.\d+)?)\s*<\/per-minute>/i);
  const soundTempoMatch = safeXml.match(/<sound[^>]*\btempo=["'](\d+(?:\.\d+)?)["']/i);
  const rawTempo = perMinuteMatch?.[1] || soundTempoMatch?.[1];
  const defaultBpm = rawTempo ? clampBpm(Number(rawTempo)) : null;

  // 4. Detecção de Leitura Rítmica vs Clave (Sol, Dó, Fá)
  const isRhythmicUnpitched =
    /<unpitched[\s>]/i.test(safeXml) ||
    /<sign[^>]*>\s*(?:percussion|none)\s*<\/sign>/i.test(safeXml);

  let detectedClef: MsaClefType | null = null;
  const lowerSource = `${safeFile} ${title ?? ''}`.toLowerCase();
  if (/\b(?:clave[-_\s]*de[-_\s]*)?fa\b|\bfá\b|[-_]fa\b/i.test(lowerSource)) {
    detectedClef = 'fa';
  } else if (/\b(?:clave[-_\s]*de[-_\s]*)?do\b|\bdó\b|[-_]do\b/i.test(lowerSource)) {
    detectedClef = 'do';
  } else if (/\b(?:clave[-_\s]*de[-_\s]*)?sol\b|[-_]sol\b/i.test(lowerSource)) {
    detectedClef = 'sol';
  } else if (!isRhythmicUnpitched) {
    const clefSignMatch = safeXml.match(/<clef[^>]*>[\s\S]*?<sign[^>]*>\s*([GCF])\s*<\/sign>/i);
    const sign = clefSignMatch?.[1]?.toUpperCase();
    if (sign === 'G') detectedClef = 'sol';
    else if (sign === 'C') detectedClef = 'do';
    else if (sign === 'F') detectedClef = 'fa';
  }

  // 5. Coleção e Número (Lição ou Hino)
  let detectedCollection: 'msa' | 'hinario5' | null = null;
  if (/\bhino\b|\bhin[aá]rio\b/i.test(lowerSource)) {
    detectedCollection = 'hinario5';
  } else if (/\bmsa\b|\bli[cç][aã]o\b/i.test(lowerSource)) {
    detectedCollection = 'msa';
  }

  let detectedNumber: number | null = null;
  const explicitNumMatch = lowerSource.match(
    /(?:li[cç][aã]o|msa|hino)[-_\s#º]*(\d{1,3})\b/i
  );
  if (explicitNumMatch?.[1]) {
    detectedNumber = Math.max(1, parseInt(explicitNumMatch[1], 10));
  } else {
    const anyNumMatch = safeFile.match(/(\d{1,3})/);
    if (anyNumMatch?.[1]) {
      detectedNumber = Math.max(1, parseInt(anyNumMatch[1], 10));
    }
  }

  return {
    title,
    timeSignature,
    defaultBpm,
    detectedClef,
    detectedNumber,
    detectedCollection,
    isRhythmicUnpitched,
  };
}

export interface ScoreMetadataUpdate {
  title?: string;
  number?: number;
  defaultBpm?: number;
  timeSignature?: string;
  msaPhase?: 'ritmica' | 'solfejo';
  edition?: HymnalEdition;
  composer?: string;
  description?: string;
}

/**
 * Atualiza os metadados de uma partitura (título, número, compasso, BPM, modalidade/edição)
 * sem exigir novo upload do arquivo MusicXML.
 */
export function applyScoreMetadataUpdate(
  catalog: PresetScore[],
  scoreId: string,
  updates: ScoreMetadataUpdate,
  timestampIso = new Date().toISOString()
): PresetScore[] {
  return catalog.map((item) => {
    if (item.id !== scoreId) return item;

    const nextNumber =
      typeof updates.number === 'number' && Number.isFinite(updates.number)
        ? Math.max(1, Math.round(updates.number))
        : item.number;
    const nextBpm =
      typeof updates.defaultBpm === 'number' && Number.isFinite(updates.defaultBpm)
        ? clampBpm(updates.defaultBpm)
        : item.defaultBpm;
    const nextTimeSignature =
      typeof updates.timeSignature === 'string' && updates.timeSignature.trim()
        ? updates.timeSignature.trim()
        : item.timeSignature;
    const nextTitle =
      typeof updates.title === 'string' && updates.title.trim()
        ? updates.title.trim()
        : item.title;
    const nextMsaPhase =
      item.collection === 'msa' && updates.msaPhase ? updates.msaPhase : item.msaPhase;
    const nextEdition =
      item.collection === 'hinario5' && updates.edition ? updates.edition : item.edition;

    const editionLabel = nextEdition ? HYMNAL_EDITION_LABELS[nextEdition] : '';
    const nextDifficulty =
      item.collection === 'msa'
        ? `MSA · ${nextTimeSignature}`
        : `${editionLabel || 'Hinário 5'} · ${nextTimeSignature}`;

    return {
      ...item,
      title: nextTitle,
      number: nextNumber,
      defaultBpm: nextBpm,
      tempoLabel: `♩ = ${nextBpm}`,
      timeSignature: nextTimeSignature,
      difficulty: nextDifficulty,
      msaPhase: nextMsaPhase,
      edition: nextEdition,
      composer: updates.composer !== undefined ? updates.composer : item.composer,
      description: updates.description !== undefined ? updates.description : item.description,
      hasAdminOverride: true,
      updatedAt: timestampIso,
    };
  });
}

/**
 * Remove o MusicXML de uma clave específica ('sol' | 'do' | 'fa') de uma lição de Solfejo do MSA,
 * preservando ao menos uma clave ativa na lição.
 */
export function removeScoreClefXml(
  catalog: PresetScore[],
  scoreId: string,
  clefToRemove: MsaClefType,
  timestampIso = new Date().toISOString()
): PresetScore[] {
  return catalog.map((item) => {
    if (item.id !== scoreId || !item.xmlByClef) return item;

    const nextClefs: Partial<Record<MsaClefType, string>> = { ...item.xmlByClef };
    delete nextClefs[clefToRemove];

    const remainingOrder: MsaClefType[] = ['sol', 'do', 'fa'];
    const remainingClefs = remainingOrder.filter((c) => Boolean(nextClefs[c]?.trim()));
    if (remainingClefs.length === 0) {
      // Impede deixar a lição sem nenhuma clave válida
      return item;
    }

    const nextDefaultClef = remainingClefs.includes(item.defaultClef ?? 'sol')
      ? (item.defaultClef ?? remainingClefs[0])
      : remainingClefs[0];
    const nextPrimaryXml = nextClefs[nextDefaultClef] || item.xml;

    return {
      ...item,
      defaultClef: nextDefaultClef,
      xml: nextPrimaryXml,
      xmlByClef: nextClefs,
      hasAdminOverride: true,
      updatedAt: timestampIso,
    };
  });
}

