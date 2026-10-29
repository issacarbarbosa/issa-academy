import { describe, it, expect } from 'vitest';
import {
  GameNote,
  GameParticle,
  PROGRESSION_LIST,
  PROGRESSION_LIST_SOL,
  PROGRESSION_LIST_FA,
  PROGRESSION_LIST_DO,
  POS_TO_FREQ,
  POS_TO_FREQ_SOL,
  POS_TO_FREQ_FA,
  POS_TO_FREQ_DO,
  CLEF_CONFIGS,
  NOTE_COLORS,
  getNewlyUnlockedNote,
  drawClefOnStaff,
  drawTrebleClefVector,
  drawBassClefVector,
  drawAltoClefVector,
  type ClefType,
} from './gameEntities';

describe('MestreDaClave Game Entities & Engine', () => {
  it('should have a progression list with valid note names and positions for all 3 clefs', () => {
    const clefProgressionPairs: Array<{
      clef: ClefType;
      progression: typeof PROGRESSION_LIST_SOL;
      freqs: Record<number, number>;
    }> = [
      { clef: 'sol', progression: PROGRESSION_LIST_SOL, freqs: POS_TO_FREQ_SOL },
      { clef: 'fa', progression: PROGRESSION_LIST_FA, freqs: POS_TO_FREQ_FA },
      { clef: 'do', progression: PROGRESSION_LIST_DO, freqs: POS_TO_FREQ_DO },
    ];

    clefProgressionPairs.forEach(({ clef, progression, freqs }) => {
      expect(progression.length, `${clef} progression should have 13 notes`).toBe(13);
      progression.forEach((item) => {
        expect(typeof item.base).toBe('string');
        expect(typeof item.pos).toBe('number');
        expect(freqs[item.pos], `Frequency for ${clef} pos ${item.pos} should exist`).toBeDefined();
        expect(freqs[item.pos]).toBeGreaterThan(0);
        expect(NOTE_COLORS[item.base], `Color for ${item.base} should exist`).toBeDefined();
      });
    });

    // Retrocompatibilidade
    expect(PROGRESSION_LIST).toBe(PROGRESSION_LIST_SOL);
    expect(POS_TO_FREQ).toBe(POS_TO_FREQ_SOL);
  });

  it('should have correct CLEF_CONFIGS metadata and storage keys', () => {
    expect(CLEF_CONFIGS.sol.storageKey).toBe('mestreClave_record');
    expect(CLEF_CONFIGS.fa.storageKey).toBe('mestreClave_record_fa');
    expect(CLEF_CONFIGS.do.storageKey).toBe('mestreClave_record_do');

    expect(CLEF_CONFIGS.sol.symbol).toBe('𝄞');
    expect(CLEF_CONFIGS.fa.symbol).toBe('𝄢');
    expect(CLEF_CONFIGS.do.symbol).toBe('𝄡');
  });

  it('should spawn GameNote with correct coordinates and valid progression note for all clefs', () => {
    const clefs: ClefType[] = ['sol', 'fa', 'do'];

    clefs.forEach((clef) => {
      const config = CLEF_CONFIGS[clef];
      const initialNotes = [config.progression[0].base, config.progression[1].base];

      const noteLvl1 = new GameNote(800, 1, clef);
      expect(noteLvl1.x).toBe(850);
      expect(initialNotes).toContain(noteLvl1.baseName);
      expect(noteLvl1.marked).toBe(false);
      expect(noteLvl1.color).toBeDefined();

      const noteLvl5 = new GameNote(800, 5, clef);
      expect(noteLvl5.x).toBe(850);
      expect(noteLvl5.baseName).toBeDefined();
      const allowedBasesLvl5 = config.progression.slice(0, 6).map((p) => p.base);
      expect(allowedBasesLvl5).toContain(noteLvl5.baseName);
    });
  });

  it('should update GameParticle position and decrease life with gravity', () => {
    const particle = new GameParticle(100, 100, '#ff0000', 50, -100, 0.5, 300);
    expect(particle.x).toBe(100);
    expect(particle.y).toBe(100);
    expect(particle.life).toBe(1.0);

    particle.update(0.1); // dt = 0.1s
    expect(particle.x).toBeCloseTo(105, 1);
    expect(particle.y).toBeCloseTo(90, 1); // 100 + (-100 * 0.1)
    expect(particle.speedY).toBeCloseTo(-70, 1); // -100 + (300 * 0.1)
    expect(particle.life).toBeCloseTo(0.95, 2);
  });

  it('should accurately return newly unlocked note for Sol without off-by-one errors', () => {
    // Level 1 starts with Dó and Ré; Level 2 unlocks Mi (pos 0)
    const lvl2Note = getNewlyUnlockedNote(2, 'sol');
    expect(lvl2Note).not.toBeNull();
    expect(lvl2Note?.base).toBe('Mi');
    expect(lvl2Note?.pos).toBe(0);
    expect(lvl2Note?.label).toContain('Mi');

    // Level 3 unlocks Fá (pos 1)
    const lvl3Note = getNewlyUnlockedNote(3, 'sol');
    expect(lvl3Note?.base).toBe('Fá');
    expect(lvl3Note?.pos).toBe(1);

    // Level 8 unlocks Ré Agudo (pos 6)
    const lvl8Note = getNewlyUnlockedNote(8, 'sol');
    expect(lvl8Note?.base).toBe('Ré');
    expect(lvl8Note?.pos).toBe(6);
    expect(lvl8Note?.label).toContain('Ré Agudo');

    // Level 12 unlocks Lá Agudo (pos 10, the 13th note)
    const lvl12Note = getNewlyUnlockedNote(12, 'sol');
    expect(lvl12Note?.base).toBe('Lá');
    expect(lvl12Note?.pos).toBe(10);
    expect(lvl12Note?.label).toContain('Lá Agudo');

    // Level 13+ (all 13 notes already unlocked)
    expect(getNewlyUnlockedNote(13, 'sol')).toBeNull();
    expect(getNewlyUnlockedNote(1, 'sol')).toBeNull();
  });

  it('should accurately return newly unlocked note for Clave de Fá and Clave de Dó', () => {
    // Clave de Fá: Level 1 has Mi (-2) and Fá (-1). Level 2 unlocks Sol (pos 0)
    const faLvl2 = getNewlyUnlockedNote(2, 'fa');
    expect(faLvl2?.base).toBe('Sol');
    expect(faLvl2?.pos).toBe(0);
    expect(faLvl2?.label).toContain('Sol');

    // Clave de Fá: Level 8 unlocks Fá na 4ª linha (pos 6)
    const faLvl8 = getNewlyUnlockedNote(8, 'fa');
    expect(faLvl8?.base).toBe('Fá');
    expect(faLvl8?.pos).toBe(6);
    expect(faLvl8?.label).toContain('4ª Linha');

    // Clave de Fá: Level 12 unlocks Dó Central (pos 10)
    const faLvl12 = getNewlyUnlockedNote(12, 'fa');
    expect(faLvl12?.base).toBe('Dó');
    expect(faLvl12?.pos).toBe(10);
    expect(faLvl12?.label).toContain('Dó Central');

    // Clave de Dó: Level 1 has Ré (-2) and Mi (-1). Level 2 unlocks Fá (pos 0)
    const doLvl2 = getNewlyUnlockedNote(2, 'do');
    expect(doLvl2?.base).toBe('Fá');
    expect(doLvl2?.pos).toBe(0);

    // Clave de Dó: Level 6 unlocks Dó Central (pos 4, 3ª linha)
    const doLvl6 = getNewlyUnlockedNote(6, 'do');
    expect(doLvl6?.base).toBe('Dó');
    expect(doLvl6?.pos).toBe(4);
    expect(doLvl6?.label).toContain('3ª Linha');

    // Clave de Dó: Level 12 unlocks Si Agudo (pos 10)
    const doLvl12 = getNewlyUnlockedNote(12, 'do');
    expect(doLvl12?.base).toBe('Si');
    expect(doLvl12?.pos).toBe(10);
  });

  it('should render all 3 clefs via drawClefOnStaff and vector functions without errors', () => {
    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      bezierCurveTo: () => {},
      arc: () => {},
      ellipse: () => {},
      fillRect: () => {},
      fill: () => {},
      fillText: () => {},
      fillStyle: '',
      strokeStyle: '',
      textAlign: '',
      textBaseline: '',
      font: '',
    } as unknown as CanvasRenderingContext2D;

    expect(() => drawClefOnStaff(mockCtx, 'sol', 200, 20)).not.toThrow();
    expect(() => drawClefOnStaff(mockCtx, 'fa', 200, 20)).not.toThrow();
    expect(() => drawClefOnStaff(mockCtx, 'do', 200, 20)).not.toThrow();

    expect(() => drawTrebleClefVector(mockCtx, 30, 200, 20)).not.toThrow();
    expect(() => drawBassClefVector(mockCtx, 30, 200, 20)).not.toThrow();
    expect(() => drawAltoClefVector(mockCtx, 30, 200, 20)).not.toThrow();
  });
});
