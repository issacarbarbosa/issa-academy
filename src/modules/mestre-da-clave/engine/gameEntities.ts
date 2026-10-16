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

export const POS_TO_FREQ: Record<number, number> = {
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

export const PROGRESSION_LIST = [
  { base: 'Dó', pos: -2 },
  { base: 'Ré', pos: -1 },
  { base: 'Mi', pos: 0 },
  { base: 'Fá', pos: 1 },
  { base: 'Sol', pos: 2 },
  { base: 'Lá', pos: 3 },
  { base: 'Si', pos: 4 },
  { base: 'Dó', pos: 5 },
  { base: 'Ré', pos: 6 },
  { base: 'Mi', pos: 7 },
  { base: 'Fá', pos: 8 },
  { base: 'Sol', pos: 9 },
  { base: 'Lá', pos: 10 },
] as const;

export class GameNote {
  x: number;
  baseName: string;
  pos: number;
  color: string;
  trueColor: string;
  marked: boolean;

  constructor(canvasWidth: number, currentLvl: number) {
    this.x = canvasWidth + 50;
    const unlockedCount = Math.min(currentLvl + 1, PROGRESSION_LIST.length);
    const availableNotes = PROGRESSION_LIST.slice(0, unlockedCount);
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

export const MUSICAL_KEYS = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'] as const;
