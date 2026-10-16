export interface MusicalNote {
  id: string;
  name: string; // e.g., "Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"
  frequency: number; // pitch frequency in Hz
  octave: number; // e.g., 3 for Dó3
  type: 'line' | 'space';
  positionIndex: number; // Y position offset index on the staff (0 = lowest space/line, higher is higher pitch)
  clef: 'sol' | 'fá' | 'dó' | 'central';
  description: string; // Detail about the note's position in Brazilian MSA nomenclature
  pianoKeyIndex: number; // index on a standard simplified piano keyboard
}
