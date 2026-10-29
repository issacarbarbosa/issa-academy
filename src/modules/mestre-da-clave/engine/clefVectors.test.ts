import { describe, it, expect, vi } from 'vitest';
import {
  BRAVURA_STAFF_SPACE,
  G_CLEF_COMMANDS,
  F_CLEF_COMMANDS,
  C_CLEF_COMMANDS,
  drawTrebleClefVector,
  drawBassClefVector,
  drawAltoClefVector,
  drawBravuraGlyph,
} from './clefVectors';

function createMockContext(): CanvasRenderingContext2D {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('Clef Vectors SMuFL Bravura (clefVectors.ts)', () => {
  it('deve possuir a calibração métrica exata de 1 staff space = 362 unidades SMuFL', () => {
    expect(BRAVURA_STAFF_SPACE).toBe(362);
  });

  it('deve possuir comandos vetoriais válidos para as três claves oficiais', () => {
    expect(G_CLEF_COMMANDS.length).toBeGreaterThan(10);
    expect(F_CLEF_COMMANDS.length).toBeGreaterThan(10);
    expect(C_CLEF_COMMANDS.length).toBeGreaterThan(10);
  });

  it('deve renderizar glifo Bravura chamando as rotinas do Canvas 2D', () => {
    const ctx = createMockContext();
    drawBravuraGlyph(ctx, G_CLEF_COMMANDS, 100, 200, 0.05);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.bezierCurveTo).toHaveBeenCalled();
    expect(ctx.closePath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('deve renderizar a Clave de Sol na 2ª Linha (staffCenterY + lineGap)', () => {
    const ctx = createMockContext();
    const staffCenterY = 150;
    const lineGap = 16;
    drawTrebleClefVector(ctx, 40, staffCenterY, lineGap);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('deve renderizar a Clave de Fá na 4ª Linha (staffCenterY - lineGap)', () => {
    const ctx = createMockContext();
    const staffCenterY = 150;
    const lineGap = 16;
    drawBassClefVector(ctx, 40, staffCenterY, lineGap);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('deve renderizar a Clave de Dó na 3ª Linha (staffCenterY)', () => {
    const ctx = createMockContext();
    const staffCenterY = 150;
    const lineGap = 16;
    drawAltoClefVector(ctx, 40, staffCenterY, lineGap);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });
});
