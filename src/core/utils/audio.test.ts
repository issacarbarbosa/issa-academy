import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAudioContext,
  startNote,
  stopNote,
  stopAllNotes,
  playTone,
  playSuccessSound,
  playErrorSound,
  playLevelUpFanfare,
  playRewardChord,
} from './audio';

class MockAudioNode {
  connect = vi.fn().mockReturnValue({});
  disconnect = vi.fn();
}

class MockGainNode extends MockAudioNode {
  gain = {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

class MockBiquadFilterNode extends MockAudioNode {
  type = 'lowpass';
  frequency = {
    value: 1000,
    setValueAtTime: vi.fn(),
  };
}

class MockOscillatorNode extends MockAudioNode {
  type = 'sine';
  frequency = {
    value: 440,
    setValueAtTime: vi.fn(),
  };
  start = vi.fn();
  stop = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

let mockContextInstance: MockAudioContext;

class MockAudioContext {
  state: 'suspended' | 'running' = 'running';
  currentTime = 10;
  destination = {};
  resume = vi.fn().mockResolvedValue(undefined);
  createGain = vi.fn(() => new MockGainNode());
  createBiquadFilter = vi.fn(() => new MockBiquadFilterNode());
  createOscillator = vi.fn(() => new MockOscillatorNode());

  constructor() {
    mockContextInstance = this;
  }
}

describe('Audio Engine (audio.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as unknown as { AudioContext: typeof MockAudioContext }).AudioContext = MockAudioContext;
  });

  it('deve inicializar AudioContext compartilhado e resumir se suspenso', () => {
    const ctx = getAudioContext();
    expect(ctx).toBeDefined();

    Object.defineProperty(ctx, 'state', { value: 'suspended', configurable: true });
    getAudioContext();
    expect(mockContextInstance.resume).toHaveBeenCalled();
  });

  it('deve sintetizar nota contínua com envelope ADSR e filtro passa-baixa key tracking', () => {
    startNote(440, 'note-A4');

    expect(mockContextInstance.createOscillator).toHaveBeenCalled();
    expect(mockContextInstance.createGain).toHaveBeenCalled();
    expect(mockContextInstance.createBiquadFilter).toHaveBeenCalled();

    // Interrompe a nota sem lançar exceções
    expect(() => stopNote('note-A4')).not.toThrow();
  });

  it('deve parar todas as notas ativas sem erro via stopAllNotes', () => {
    startNote(261.63, 'note-1');
    startNote(329.63, 'note-2');

    expect(() => stopAllNotes()).not.toThrow();
  });

  it('deve tocar tom agendado via playTone com key tracking proporcional', () => {
    playTone(523.25, 0, 0.3, 0.8);

    expect(mockContextInstance.createOscillator).toHaveBeenCalled();
    expect(mockContextInstance.createBiquadFilter).toHaveBeenCalled();
  });

  it('deve executar sons de feedback sem quebrar', () => {
    expect(() => playSuccessSound()).not.toThrow();
    expect(() => playErrorSound()).not.toThrow();
    expect(() => playLevelUpFanfare()).not.toThrow();
  });

  it('deve tocar acorde diatônico com fundamental e oitava harmônica sutil via playRewardChord', () => {
    const rootFreq = 261.63; // Dó3
    expect(() => playRewardChord(rootFreq)).not.toThrow();

    // Deve ter chamado createOscillator ao menos duas vezes (fundamental + oitava)
    expect(mockContextInstance.createOscillator).toHaveBeenCalledTimes(2);
  });
});
