import React from 'react';
import { X } from 'lucide-react';
import { ScoreNote } from '../types/music';
import {
  midiToFrequency,
  midiToViolinFingerboardPosition,
  SOLFEGE_NAMES_PT,
} from '../utils/musicMath';

interface ViolinFingerboardProps {
  activeNotes: ScoreNote[];
  onPlayNote: (frequency: number) => void;
  onClose: () => void;
}

interface StringDefinition {
  id: 'E' | 'A' | 'D' | 'G';
  label: string;
  openMidi: number;
  thicknessPx: number;
}

// 4 Violin Strings ordered from highest (Mi/E5) to lowest (Sol/G3) matching Soundslice visual violin
const VIOLIN_STRINGS: StringDefinition[] = [
  { id: 'E', label: 'Mi', openMidi: 76, thicknessPx: 1.5 },
  { id: 'A', label: 'Lá', openMidi: 69, thicknessPx: 2.0 },
  { id: 'D', label: 'Ré', openMidi: 62, thicknessPx: 2.5 },
  { id: 'G', label: 'Sol', openMidi: 55, thicknessPx: 3.2 },
];

// Diatonic + common semitone offsets (0 = open string, 1..7 = 1st position semitones)
const SEMITONE_POSITIONS = [0, 1, 2, 3, 4, 5, 6, 7];

// Highlight standard G-major / D-major diatonic reference positions like Soundslice's guide dots
const DIATONIC_PITCH_CLASSES = new Set([0, 2, 4, 6, 7, 9, 11]); // Dó, Ré, Mi, Fá♯, Sol, Lá, Si

export const ViolinFingerboard: React.FC<ViolinFingerboardProps> = ({
  activeNotes,
  onPlayNote,
  onClose,
}) => {
  const activeMidis = new Set(
    activeNotes.filter((n) => !n.isRest).map((n) => n.midi)
  );

  // Also map active notes to their exact (stringId, semitonesFromNut)
  const activePositions = activeNotes
    .filter((n) => !n.isRest)
    .map((n) => midiToViolinFingerboardPosition(n.midi));

  return (
    <section
      aria-label="Violino Visual Interativo"
      data-testid="visual-violin-panel"
      className="fixed bottom-[58px] left-0 right-0 z-35 bg-white/98 backdrop-blur-xs border-t border-[#D1D5DB] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] select-none px-3 sm:px-6 py-2.5"
    >
      <div className="max-w-[1180px] mx-auto">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
            <span className="font-semibold text-[#111827]">Violino</span>
            <span aria-hidden="true">·</span>
            <span>1ª Posição</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar Violino Visual"
            className="w-6 h-6 rounded hover:bg-gray-100 text-[#6B7280] hover:text-[#111827] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fingerboard Canvas matching Soundslice image_e7e2f047.png */}
        <div className="relative w-full h-[126px] sm:h-[136px] bg-white rounded-lg border border-[#E5E7EB] overflow-hidden px-2 sm:px-4 py-2">
          {/* Vertical Nut (Pestana) dark bar on left */}
          <div
            aria-hidden="true"
            style={{ left: '10%' }}
            className="absolute top-2 bottom-2 w-[6px] bg-[#6B7280] rounded-xs z-10"
          />

          {/* Subtle Vertical Finger Position Shading Strips (1º, 2º, 3º, 4º Dedo) */}
          {[2, 4, 5, 7].map((semi, idx) => {
            const leftPct = 10 + (semi / 7.6) * 84;
            return (
              <div
                key={`guide_strip_${semi}`}
                aria-hidden="true"
                style={{ left: `${leftPct}%` }}
                className="absolute top-0 bottom-0 -translate-x-1/2 w-7 sm:w-9 bg-[#F3F4F6]/80 border-x border-[#E5E7EB]/60 flex flex-col justify-end items-center pb-0.5 pointer-events-none"
              >
                <span className="text-[9px] font-mono text-[#9CA3AF]">
                  {idx + 1}º
                </span>
              </div>
            );
          })}

          {/* 4 Horizontal Violin Strings (Mi, Lá, Ré, Sol) */}
          <div className="relative z-20 h-full flex flex-col justify-between py-2">
            {VIOLIN_STRINGS.map((str) => {
              return (
                <div
                  key={str.id}
                  data-testid={`violin-string-${str.id}`}
                  className="relative flex items-center h-6"
                >
                  {/* Continuous Horizontal String Line */}
                  <div
                    aria-hidden="true"
                    style={{ height: `${str.thicknessPx}px` }}
                    className="w-full bg-[#9CA3AF]"
                  />

                  {/* Semitone Note Positions along this String */}
                  {SEMITONE_POSITIONS.map((semi) => {
                    const noteMidi = str.openMidi + semi;
                    const pitchClass = noteMidi % 12;
                    const solfege = SOLFEGE_NAMES_PT[pitchClass] ?? 'Dó';

                    const isPositionActive =
                      activeMidis.has(noteMidi) ||
                      activePositions.some(
                        (p) => p.stringId === str.id && p.semitonesFromNut === semi
                      );

                    const isReferenceNote =
                      semi === 0 || DIATONIC_PITCH_CLASSES.has(pitchClass);

                    if (!isReferenceNote && !isPositionActive) {
                      return null;
                    }

                    const leftPct =
                      semi === 0 ? 5.2 : 10 + (semi / 7.6) * 84;

                    return (
                      <button
                        key={`${str.id}_semi_${semi}`}
                        type="button"
                        data-testid={`violin-note-${str.id}-${semi}`}
                        data-active={isPositionActive ? 'true' : 'false'}
                        onClick={() => onPlayNote(midiToFrequency(noteMidi))}
                        style={{ left: `${leftPct}%` }}
                        title={`Corda ${str.label} · Nota ${solfege} (${
                          semi === 0 ? 'Corda solta 0' : `Semitom +${semi}`
                        })`}
                        className={`absolute -translate-x-1/2 w-6 h-6 sm:w-[26px] sm:h-[26px] rounded-full text-[10px] sm:text-[11px] font-bold flex items-center justify-center transition-all duration-100 cursor-pointer shadow-xs ${
                          isPositionActive
                            ? 'bg-[#F59E0B] text-white scale-125 ring-3 ring-amber-300 z-30'
                            : 'bg-[#4B5563] hover:bg-[#1F2937] text-white z-20'
                        }`}
                      >
                        {solfege}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
