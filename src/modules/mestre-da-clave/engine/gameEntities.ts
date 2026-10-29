export interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  speedY: number;
}

export class GameParticle {
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  lifeDecay: number;
  gravity: number;
  isStar: boolean;
  rotation: number;
  rotationSpeed: number;

  constructor(
    x: number,
    y: number,
    color: string,
    speedX?: number,
    speedY?: number,
    lifeDecay?: number,
    gravity = 350,
  ) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = Math.random() * 5 + 3.5;
    this.speedX = speedX !== undefined ? speedX : Math.random() * 300 - 150;
    this.speedY = speedY !== undefined ? speedY : Math.random() * -320 - 120;
    this.life = 1.0;
    this.lifeDecay = lifeDecay !== undefined ? lifeDecay : Math.random() * 0.45 + 0.45;
    this.gravity = gravity;
    this.isStar = Math.random() > 0.45;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 6;
  }

  update(dt: number) {
    this.x += this.speedX * dt;
    this.y += this.speedY * dt;
    this.speedY += this.gravity * dt;
    this.rotation += this.rotationSpeed * dt;
    this.life -= this.lifeDecay * dt;
  }
}

export const NOTE_COLORS: Record<string, string> = {
  'Dó': '#e74c3c',
  'Ré': '#e67e22',
  'Mi': '#f1c40f',
  'Fá': '#2ecc71',
  'Sol': '#3498db',
  'Lá': '#9b59b6',
  'Si': '#e84393',
};

export const NOTE_BORDER_COLORS: Record<string, string> = {
  'Dó': '#c0392b',
  'Ré': '#d35400',
  'Mi': '#f39c12',
  'Fá': '#27ae60',
  'Sol': '#2980b9',
  'Lá': '#8e44ad',
  'Si': '#c03676',
};

export const NOTE_DARK_COLORS: Record<string, string> = {
  'Dó': '#781005',
  'Ré': '#823c02',
  'Mi': '#8f7100',
  'Fá': '#11592c',
  'Sol': '#114a73',
  'Lá': '#4d2361',
  'Si': '#85104a',
};

export type ClefType = 'sol' | 'fa' | 'do';

export interface ProgressionStep {
  base: string;
  pos: number;
  label: string;
}

export interface ClefConfig {
  id: ClefType;
  name: string;
  subtitle: string;
  symbol: string;
  storageKey: string;
  progression: readonly ProgressionStep[];
  posToFreq: Record<number, number>;
}

// -------------------------------------------------------------
// PROGRESSÕES POR CLAVE (-2 a 10)
// -------------------------------------------------------------

export const PROGRESSION_LIST_SOL: readonly ProgressionStep[] = [
  { base: 'Dó', pos: -2, label: 'Dó Central (1ª Linha Suplementar Inferior)' },
  { base: 'Ré', pos: -1, label: 'Ré (Espaço Inferior à Pauta)' },
  { base: 'Mi', pos: 0, label: 'Mi (1ª Linha)' },
  { base: 'Fá', pos: 1, label: 'Fá (1º Espaço)' },
  { base: 'Sol', pos: 2, label: 'Sol (2ª Linha da Clave)' },
  { base: 'Lá', pos: 3, label: 'Lá (2º Espaço)' },
  { base: 'Si', pos: 4, label: 'Si (3ª Linha)' },
  { base: 'Dó', pos: 5, label: 'Dó Agudo (3º Espaço)' },
  { base: 'Ré', pos: 6, label: 'Ré Agudo (4ª Linha)' },
  { base: 'Mi', pos: 7, label: 'Mi Agudo (4º Espaço)' },
  { base: 'Fá', pos: 8, label: 'Fá Agudo (5ª Linha)' },
  { base: 'Sol', pos: 9, label: 'Sol Agudo (Espaço Superior)' },
  { base: 'Lá', pos: 10, label: 'Lá Agudo (1ª Linha Suplementar Superior)' },
] as const;

export const PROGRESSION_LIST_FA: readonly ProgressionStep[] = [
  { base: 'Mi', pos: -2, label: 'Mi Grave (1ª Linha Suplementar Inferior)' },
  { base: 'Fá', pos: -1, label: 'Fá Grave (Espaço Inferior à Pauta)' },
  { base: 'Sol', pos: 0, label: 'Sol (1ª Linha)' },
  { base: 'Lá', pos: 1, label: 'Lá (1º Espaço)' },
  { base: 'Si', pos: 2, label: 'Si (2ª Linha)' },
  { base: 'Dó', pos: 3, label: 'Dó (2º Espaço)' },
  { base: 'Ré', pos: 4, label: 'Ré (3ª Linha)' },
  { base: 'Mi', pos: 5, label: 'Mi (3º Espaço)' },
  { base: 'Fá', pos: 6, label: 'Fá (4ª Linha da Clave)' },
  { base: 'Sol', pos: 7, label: 'Sol (4º Espaço)' },
  { base: 'Lá', pos: 8, label: 'Lá (5ª Linha)' },
  { base: 'Si', pos: 9, label: 'Si (Espaço Superior)' },
  { base: 'Dó', pos: 10, label: 'Dó Central (1ª Linha Suplementar Superior)' },
] as const;

export const PROGRESSION_LIST_DO: readonly ProgressionStep[] = [
  { base: 'Ré', pos: -2, label: 'Ré Grave (1ª Linha Suplementar Inferior)' },
  { base: 'Mi', pos: -1, label: 'Mi Grave (Espaço Inferior à Pauta)' },
  { base: 'Fá', pos: 0, label: 'Fá (1ª Linha)' },
  { base: 'Sol', pos: 1, label: 'Sol (1º Espaço)' },
  { base: 'Lá', pos: 2, label: 'Lá (2ª Linha)' },
  { base: 'Si', pos: 3, label: 'Si (2º Espaço)' },
  { base: 'Dó', pos: 4, label: 'Dó Central (3ª Linha da Clave)' },
  { base: 'Ré', pos: 5, label: 'Ré (3º Espaço)' },
  { base: 'Mi', pos: 6, label: 'Mi (4ª Linha)' },
  { base: 'Fá', pos: 7, label: 'Fá (4º Espaço)' },
  { base: 'Sol', pos: 8, label: 'Sol (5ª Linha)' },
  { base: 'Lá', pos: 9, label: 'Lá (Espaço Superior)' },
  { base: 'Si', pos: 10, label: 'Si Agudo (1ª Linha Suplementar Superior)' },
] as const;

// Aliases para retrocompatibilidade
export const PROGRESSION_LIST = PROGRESSION_LIST_SOL;

// -------------------------------------------------------------
// MAPEAMENTOS DE FREQUÊNCIA (POS_TO_FREQ)
// -------------------------------------------------------------

export const POS_TO_FREQ_SOL: Record<number, number> = {
  [-3]: 246.94, // Si2
  [-2]: 261.63, // Dó3 (Central)
  [-1]: 293.66, // Ré3
  [0]: 329.63,  // Mi3
  [1]: 349.23,  // Fá3
  [2]: 392.00,  // Sol3
  [3]: 440.00,  // Lá3
  [4]: 493.88,  // Si3
  [5]: 523.25,  // Dó4
  [6]: 587.33,  // Ré4
  [7]: 659.25,  // Mi4
  [8]: 698.46,  // Fá4
  [9]: 783.99,  // Sol4
  [10]: 880.00, // Lá4
};

export const POS_TO_FREQ_FA: Record<number, number> = {
  [-3]: 73.42,  // Ré1
  [-2]: 82.41,  // Mi1
  [-1]: 87.31,  // Fá1
  [0]: 98.00,   // Sol1
  [1]: 110.00,  // Lá1
  [2]: 123.47,  // Si1
  [3]: 130.81,  // Dó2
  [4]: 146.83,  // Ré2
  [5]: 164.81,  // Mi2
  [6]: 174.61,  // Fá2
  [7]: 196.00,  // Sol2
  [8]: 220.00,  // Lá2
  [9]: 246.94,  // Si2
  [10]: 261.63, // Dó3 Central
};

export const POS_TO_FREQ_DO: Record<number, number> = {
  [-3]: 130.81, // Dó2
  [-2]: 146.83, // Ré2
  [-1]: 164.81, // Mi2
  [0]: 174.61,  // Fá2
  [1]: 196.00,  // Sol2
  [2]: 220.00,  // Lá2
  [3]: 246.94,  // Si2
  [4]: 261.63,  // Dó3 Central
  [5]: 293.66,  // Ré3
  [6]: 329.63,  // Mi3
  [7]: 349.23,  // Fá3
  [8]: 392.00,  // Sol3
  [9]: 440.00,  // Lá3
  [10]: 493.88, // Si3
};

// Alias para retrocompatibilidade
export const POS_TO_FREQ = POS_TO_FREQ_SOL;

export const CLEF_CONFIGS: Record<ClefType, ClefConfig> = {
  sol: {
    id: 'sol',
    name: 'Clave de Sol',
    subtitle: '2ª Linha • Sons Agudos',
    symbol: '𝄞',
    storageKey: 'mestreClave_record',
    progression: PROGRESSION_LIST_SOL,
    posToFreq: POS_TO_FREQ_SOL,
  },
  fa: {
    id: 'fa',
    name: 'Clave de Fá',
    subtitle: '4ª Linha • Sons Graves',
    symbol: '𝄢',
    storageKey: 'mestreClave_record_fa',
    progression: PROGRESSION_LIST_FA,
    posToFreq: POS_TO_FREQ_FA,
  },
  do: {
    id: 'do',
    name: 'Clave de Dó',
    subtitle: '3ª Linha • Sons Médios',
    symbol: '𝄡',
    storageKey: 'mestreClave_record_do',
    progression: PROGRESSION_LIST_DO,
    posToFreq: POS_TO_FREQ_DO,
  },
};

export function getNewlyUnlockedNote(targetLevel: number, clef: ClefType = 'sol'): ProgressionStep | null {
  const config = CLEF_CONFIGS[clef] || CLEF_CONFIGS.sol;
  if (targetLevel < 2 || targetLevel >= config.progression.length) {
    return null;
  }
  return config.progression[targetLevel] ?? null;
}

export class GameNote {
  x: number;
  baseName: string;
  pos: number;
  color: string;
  trueColor: string;
  marked: boolean;

  constructor(canvasWidth: number, currentLvl: number, clef: ClefType = 'sol') {
    this.x = canvasWidth + 50;
    const config = CLEF_CONFIGS[clef] || CLEF_CONFIGS.sol;
    const unlockedCount = Math.min(currentLvl + 1, config.progression.length);
    const availableNotes = config.progression.slice(0, unlockedCount);
    const pick = availableNotes[Math.floor(Math.random() * availableNotes.length)];
    this.baseName = pick.base;
    this.pos = pick.pos;
    this.color = NOTE_COLORS[this.baseName] || '#3498db';
    this.trueColor = NOTE_COLORS[this.baseName] || '#3498db';
    this.marked = false;
  }
}

export function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

export {
  drawTrebleClefVector,
  drawBassClefVector,
  drawAltoClefVector,
} from './clefVectors';

import {
  drawTrebleClefVector,
  drawBassClefVector,
  drawAltoClefVector,
} from './clefVectors';

/**
 * Renderizador visual de Claves no Canvas com suporte oficial SMuFL/Bravura para Sol, Fá (4ª L) e Dó (3ª L).
 * Renderização 100% vetorial independente de fontes instaladas no sistema operacional.
 */
export function drawClefOnStaff(
  ctx: CanvasRenderingContext2D,
  clef: ClefType,
  staffCenterY: number,
  lineGap: number,
) {
  ctx.save();
  ctx.fillStyle = '#1e293b';

  const clefX = 26;
  if (clef === 'sol') {
    drawTrebleClefVector(ctx, clefX, staffCenterY, lineGap);
  } else if (clef === 'fa') {
    drawBassClefVector(ctx, clefX, staffCenterY, lineGap);
  } else {
    drawAltoClefVector(ctx, clefX, staffCenterY, lineGap);
  }

  ctx.restore();
}

export const MUSICAL_KEYS = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'] as const;
