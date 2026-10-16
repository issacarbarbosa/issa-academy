import { describe, it, expect } from 'vitest';
import {
  GameNote,
  GameParticle,
  PROGRESSION_LIST,
  POS_TO_FREQ,
  NOTE_COLORS,
} from './gameEntities';

describe('MestreDaClave Game Entities & Engine', () => {
  it('should have a progression list with valid note names and positions', () => {
    expect(PROGRESSION_LIST.length).toBeGreaterThan(5);
    PROGRESSION_LIST.forEach((item) => {
      expect(typeof item.base).toBe('string');
      expect(typeof item.pos).toBe('number');
      expect(POS_TO_FREQ[item.pos]).toBeDefined();
      expect(POS_TO_FREQ[item.pos]).toBeGreaterThan(0);
      expect(NOTE_COLORS[item.base]).toBeDefined();
    });
  });

  it('should spawn GameNote with correct coordinates and valid progression note', () => {
    const noteLvl1 = new GameNote(800, 1);
    expect(noteLvl1.x).toBe(850);
    expect(['Dó', 'Ré']).toContain(noteLvl1.baseName);
    expect(noteLvl1.marked).toBe(false);
    expect(noteLvl1.color).toBeDefined();

    const noteLvl5 = new GameNote(800, 5);
    expect(noteLvl5.x).toBe(850);
    expect(noteLvl5.baseName).toBeDefined();
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
});
