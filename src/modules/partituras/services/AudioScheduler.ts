import {
  CountInCondition,
  LoopConfig,
  MeasureBoundingBox,
  MetronomeBeatMode,
  ScoreNote,
  ScoreSliceEvent,
  SpeedTrainingConfig,
  TimbreType,
} from '../types/music';
import {
  advanceBeatWithLoop,
  beatsToSeconds,
  clampBpm,
  computeNextSpeedTrainingBpm,
  computePianoPartialFrequency,
  findActiveMeasureAtBeat,
  findActiveSlicesAtBeat,
  findNearestSampleMidi,
  getLoopBeatBounds,
  midiToFrequency,
  secondsToBeats,
} from '../utils/musicMath';

export interface SchedulerFramePayload {
  currentBeat: number;
  elapsedSeconds: number;
  totalSeconds: number;
  currentMeasureNumber: number;
  currentBeatInMeasure: number;
  activeSliceIds: string[];
  activeNotes: ScoreNote[];
  isCountingIn: boolean;
  countInBeat: number | null;
  countInTotalBeats: number;
  isPlaying: boolean;
}

const SALAMANDER_SAMPLE_MAP: Record<number, string> = {
  33: 'A1.mp3',
  36: 'C2.mp3',
  39: 'Ds2.mp3',
  42: 'Fs2.mp3',
  45: 'A2.mp3',
  48: 'C3.mp3',
  51: 'Ds3.mp3',
  54: 'Fs3.mp3',
  57: 'A3.mp3',
  60: 'C4.mp3',
  63: 'Ds4.mp3',
  66: 'Fs4.mp3',
  69: 'A4.mp3',
  72: 'C5.mp3',
  75: 'Ds5.mp3',
  78: 'Fs5.mp3',
  81: 'A5.mp3',
  84: 'C6.mp3',
  96: 'C7.mp3',
};

const SALAMANDER_BASE_URL = 'https://tonejs.github.io/audio/salamander/';

const GRAND_PIANO_PARTIAL_WEIGHTS = [
  1.0, 0.72, 0.48, 0.33, 0.23, 0.16, 0.115, 0.085,
  0.062, 0.045, 0.032, 0.024, 0.017, 0.012, 0.008, 0.005,
];

export class AudioScheduler {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private reverbGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private bodyWarmthFilter: BiquadFilterNode | null = null;
  private presenceFilter: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  private pianoBuffers = new Map<number, AudioBuffer>();
  private samplesLoadingStarted = false;

  private isPlaying = false;
  private isCountingIn = false;
  private bpm = 65;
  private volume = 0.88;
  private isMuted = false;

  // Metronome & Count-in settings
  private metronomeEnabled = true;
  private metronomeBeatMode: MetronomeBeatMode = 'every-beat';
  private metronomeVolume = 0.75;

  private countInEnabled = false;
  private countInCondition: CountInCondition = 'always';
  private countInBars: 1 | 2 = 1;

  // Speed training settings
  private speedTraining: SpeedTrainingConfig = {
    enabled: false,
    initialBpm: 60,
    finalBpm: 100,
    incrementBpm: 5,
  };

  private timbre: TimbreType = 'acoustic-grand';
  /** If non-null, only notes whose staffIndex is in this set will sound (Multi-Voice Mixer) */
  private activeStaffIndices: Set<number> | null = null;

  private measures: MeasureBoundingBox[] = [];
  private slices: ScoreSliceEvent[] = [];
  private totalBeats = 32;
  private loop: LoopConfig = {
    enabled: false,
    startMeasure: 1,
    endMeasure: 4,
  };

  // Timing state anchored to AudioContext.currentTime
  private currentBeat = 0;
  private lastFrameAudioTime = 0;
  private countInRemainingBeats = 0;
  private countInTotalBeats = 4;
  private lastTriggeredMetronomeKey = '';
  private triggeredSliceKeys = new Set<string>();
  private loopIteration = 0;

  private rafId: number | null = null;
  private onFrameCallback: ((payload: SchedulerFramePayload) => void) | null = null;
  private onPlaybackStopCallback: (() => void) | null = null;
  private onBpmChangeCallback: ((newBpm: number) => void) | null = null;

  public setCallbacks(
    onFrame: (payload: SchedulerFramePayload) => void,
    onStop?: () => void,
    onBpmAutoChange?: (newBpm: number) => void
  ): void {
    this.onFrameCallback = onFrame;
    this.onPlaybackStopCallback = onStop ?? null;
    this.onBpmChangeCallback = onBpmAutoChange ?? null;
  }

  public setScoreData(
    measures: MeasureBoundingBox[],
    slices: ScoreSliceEvent[],
    totalBeats: number,
    preserveBeatPosition = false
  ): void {
    this.measures = measures;
    this.slices = slices;
    this.totalBeats = Math.max(1, totalBeats);
    if (!preserveBeatPosition) {
      this.currentBeat = 0;
    } else {
      this.currentBeat = Math.max(0, Math.min(this.totalBeats - 0.01, this.currentBeat));
    }
    this.triggeredSliceKeys.clear();
    this.lastTriggeredMetronomeKey = '';
    this.emitFrame();
  }

  public setActiveStaffIndices(staffIndices: number[] | null): void {
    this.activeStaffIndices = staffIndices ? new Set(staffIndices) : null;
  }

  public setBpm(newBpm: number): void {
    const clamped = clampBpm(newBpm);
    if (this.bpm === clamped) return;
    this.bpm = clamped;
    this.emitFrame();
  }

  public getBpm(): number {
    return this.bpm;
  }

  public setSpeedTraining(config: SpeedTrainingConfig): void {
    this.speedTraining = { ...config };
    if (config.enabled) {
      this.setBpm(config.initialBpm);
      if (this.onBpmChangeCallback) {
        this.onBpmChangeCallback(clampBpm(config.initialBpm));
      }
    }
  }

  public setLoop(loop: LoopConfig): void {
    this.loop = { ...loop };
    if (this.loop.enabled && this.measures.length > 0) {
      const { startBeat, endBeat } = getLoopBeatBounds(
        this.loop,
        this.measures,
        this.totalBeats
      );
      if (this.currentBeat < startBeat || this.currentBeat >= endBeat) {
        this.currentBeat = startBeat;
        this.triggeredSliceKeys.clear();
      }
    }
    this.emitFrame();
  }

  public setMetronomeEnabled(enabled: boolean): void {
    this.metronomeEnabled = enabled;
  }

  public setMetronomeBeatMode(mode: MetronomeBeatMode): void {
    this.metronomeBeatMode = mode;
  }

  public setMetronomeVolume(vol: number): void {
    this.metronomeVolume = Math.max(0, Math.min(1, vol));
  }

  public setCountInEnabled(enabled: boolean): void {
    this.countInEnabled = enabled;
  }

  public setCountInCondition(condition: CountInCondition): void {
    this.countInCondition = condition;
  }

  public setCountInBars(bars: 1 | 2): void {
    this.countInBars = bars;
  }

  public setTimbre(_timbre: TimbreType): void {
    this.timbre = 'acoustic-grand';
  }

  public setVolume(vol: number, muted = false): void {
    this.volume = Math.max(0, Math.min(1, vol));
    this.isMuted = muted;
    if (this.masterGain && this.audioCtx) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.audioCtx.currentTime, 0.015);
    }
  }

  public seekToBeat(beat: number): void {
    const clamped = Math.max(0, Math.min(this.totalBeats - 0.01, beat));
    this.currentBeat = clamped;
    this.isCountingIn = false;
    this.countInRemainingBeats = 0;
    this.triggeredSliceKeys.clear();
    this.lastTriggeredMetronomeKey = '';
    if (this.audioCtx) {
      this.lastFrameAudioTime = this.audioCtx.currentTime;
    }
    this.emitFrame();
  }

  public seekToMeasure(measureNumber: number): void {
    const m = this.measures.find((item) => item.measureNumber === measureNumber);
    if (m) {
      this.seekToBeat(m.startBeatInScore);
    }
  }

  private shouldTriggerCountInOnStart(): boolean {
    if (!this.countInEnabled) return false;
    if (this.countInCondition === 'always') return true;
    if (this.countInCondition === 'start-only') {
      return this.currentBeat < 0.25;
    }
    if (this.countInCondition === 'loop-only') {
      return this.loop.enabled;
    }
    return true;
  }

  public async start(): Promise<void> {
    if (this.isPlaying) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {
        // Ignore autoplay restrictions in headless environments
      }
    }

    const { startBeat, endBeat } = getLoopBeatBounds(
      this.loop,
      this.measures,
      this.totalBeats
    );
    if (this.currentBeat >= endBeat - 0.05) {
      this.currentBeat = startBeat;
    } else if (this.loop.enabled && this.currentBeat < startBeat) {
      this.currentBeat = startBeat;
    }

    this.triggeredSliceKeys.clear();
    this.lastTriggeredMetronomeKey = '';
    this.lastFrameAudioTime = this.audioCtx.currentTime;

    const activeMeasure =
      findActiveMeasureAtBeat(this.measures, this.currentBeat) ?? this.measures[0];
    const beatsInActiveMeasure = activeMeasure?.beatsPerMeasure ?? 4;

    if (this.shouldTriggerCountInOnStart()) {
      this.isCountingIn = true;
      const totalCountBeats = beatsInActiveMeasure * this.countInBars;
      this.countInTotalBeats = totalCountBeats;
      this.countInRemainingBeats = totalCountBeats;
    } else {
      this.isCountingIn = false;
      this.countInRemainingBeats = 0;
    }

    this.isPlaying = true;

    if (!this.isCountingIn) {
      this.scheduleAudioAtBeat(this.currentBeat);
    } else {
      this.triggerMetronomeClick(true);
      this.lastTriggeredMetronomeKey = `countin_1`;
    }

    this.emitFrame();
    this.tick();
  }

  public pause(): void {
    this.isPlaying = false;
    this.isCountingIn = false;
    this.countInRemainingBeats = 0;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.emitFrame();
  }

  public restart(): void {
    const { startBeat } = getLoopBeatBounds(
      this.loop,
      this.measures,
      this.totalBeats
    );
    this.pause();
    this.currentBeat = this.loop.enabled ? startBeat : 0;
    if (this.speedTraining.enabled) {
      this.bpm = clampBpm(this.speedTraining.initialBpm);
      if (this.onBpmChangeCallback) {
        this.onBpmChangeCallback(this.bpm);
      }
    }
    this.triggeredSliceKeys.clear();
    this.lastTriggeredMetronomeKey = '';
    this.emitFrame();
  }

  /**
   * Auditions a single note using the Didactic Concert Grand Piano.
   */
  public playPreviewNote(frequency: number, durationSeconds = 0.65): void {
    this.ensureAudioContext();
    if (!this.audioCtx || frequency <= 0) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    const approximateMidi = Math.round(69 + 12 * Math.log2(frequency / 440));
    this.synthesizeNote(
      approximateMidi,
      frequency,
      this.audioCtx.currentTime,
      durationSeconds,
      0.84
    );
  }

  private ensureAudioContext(): void {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      const now = this.audioCtx.currentTime;

      // Studio Soundboard EQ: Warm Spruce Body (240 Hz) + Singing Didactic Presence (2150 Hz)
      this.bodyWarmthFilter = this.audioCtx.createBiquadFilter();
      this.bodyWarmthFilter.type = 'peaking';
      this.bodyWarmthFilter.frequency.setValueAtTime(240, now);
      this.bodyWarmthFilter.Q.setValueAtTime(1.1, now);
      this.bodyWarmthFilter.gain.setValueAtTime(2.4, now);

      this.presenceFilter = this.audioCtx.createBiquadFilter();
      this.presenceFilter.type = 'peaking';
      this.presenceFilter.frequency.setValueAtTime(2150, now);
      this.presenceFilter.Q.setValueAtTime(1.35, now);
      this.presenceFilter.gain.setValueAtTime(1.8, now);

      this.compressor = this.audioCtx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-15, now);
      this.compressor.knee.setValueAtTime(16, now);
      this.compressor.ratio.setValueAtTime(2.8, now);
      this.compressor.attack.setValueAtTime(0.005, now);
      this.compressor.release.setValueAtTime(0.24, now);

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;

      this.dryGain = this.audioCtx.createGain();
      this.dryGain.gain.value = 0.88;

      this.reverbGain = this.audioCtx.createGain();
      this.reverbGain.gain.value = 0.2;

      this.convolver = this.audioCtx.createConvolver();
      this.convolver.buffer = this.createConcertHallImpulse(1.35, 3.1);

      this.dryGain.connect(this.bodyWarmthFilter);
      this.convolver.connect(this.reverbGain);
      this.reverbGain.connect(this.bodyWarmthFilter);
      this.bodyWarmthFilter.connect(this.presenceFilter);
      this.presenceFilter.connect(this.compressor);
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);

      this.buildPhysicalGrandPianoSampleBank();
      this.loadSalamanderGrandPianoSamples();
    }
  }

  private createConcertHallImpulse(
    durationSeconds: number,
    decayRate: number
  ): AudioBuffer {
    const ctx = this.audioCtx!;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * durationSeconds);
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const earlyBoost = t < 0.032 ? 1.3 * Math.cos(t * 220) : 1.0;
        const white = Math.random() * 2 - 1;
        lp = lp * 0.78 + white * 0.22;
        data[i] = lp * earlyBoost * Math.exp(-t * decayRate);
      }
    }
    return impulse;
  }

  private buildPhysicalGrandPianoSampleBank(): void {
    if (!this.audioCtx) return;
    // Pre-build a dense physical-modeling bank for immediate zero-latency response
    const coreSampleMidis = [36, 42, 48, 54, 57, 60, 63, 66, 69, 72, 75, 78, 84];

    for (const midi of coreSampleMidis) {
      if (!this.pianoBuffers.has(midi)) {
        const buffer = this.synthesizeGrandPianoKeyBuffer(midi);
        this.pianoBuffers.set(midi, buffer);
      }
    }
  }

  /**
   * High-definition stereo physical model of a Concert Grand Piano key:
   * - Register-aware unison string coupling (copper-wound bass, bichord mid-bass, trichord treble)
   * - Dual-stage soundboard bridge decay (fast initial bloom + long singing sustain)
   * - Warm wooden soundboard & felt hammer attack transient
   */
  private synthesizeGrandPianoKeyBuffer(midi: number): AudioBuffer {
    const ctx = this.audioCtx!;
    const sampleRate = ctx.sampleRate;
    const duration = 3.4;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(2, length, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const f0 = midiToFrequency(midi);
    const inharmonicityB =
      0.00022 + Math.max(0, (midi - 45) / 48) * 0.00042;
    const baseDecayRate = 1.15 + Math.max(0, (midi - 42) / 36) * 1.25;

    // Unison string detuning (Weinreich coupled piano strings)
    const stringDetunes =
      midi < 42
        ? [1.0, 1.0, 1.0]
        : [1.0, Math.pow(2, -1.15 / 1200), Math.pow(2, 1.25 / 1200)];

    const numPartials = GRAND_PIANO_PARTIAL_WEIGHTS.length;
    const partialFreqs: number[] = [];
    const partialAmps: number[] = [];
    const partialDecays: number[] = [];

    for (let p = 1; p <= numPartials; p++) {
      const pf = computePianoPartialFrequency(f0, p, inharmonicityB);
      if (pf >= sampleRate * 0.44) break;
      partialFreqs.push(pf);
      const registerTilt = Math.pow(p, midi < 54 ? -0.22 : -0.34);
      partialAmps.push(GRAND_PIANO_PARTIAL_WEIGHTS[p - 1] * registerTilt);
      partialDecays.push(baseDecayRate * (1 + (p - 1) * 0.48));
    }

    const activePartials = partialFreqs.length;
    const twoPiOverSr = (2 * Math.PI) / sampleRate;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const attackEnv = t < 0.0032 ? t / 0.0032 : 1.0;

      // Dual-stage soundboard envelope: 30% fast initial bridge transfer + 70% long singing sustain
      const dualStageScale = 0.3 * Math.exp(-t * 4.8) + 0.7;

      let sampleSumL = 0;
      let sampleSumR = 0;

      for (let p = 0; p < activePartials; p++) {
        const pf = partialFreqs[p];
        const amp = partialAmps[p] * Math.exp(-t * partialDecays[p]) * dualStageScale;
        if (amp < 0.00012) continue;

        const baseAngle = pf * i * twoPiOverSr;
        const s1 = Math.sin(baseAngle * stringDetunes[0]);
        const s2 = Math.sin(baseAngle * stringDetunes[1] + 0.28);
        const s3 = Math.sin(baseAngle * stringDetunes[2] + 0.65);

        sampleSumL += amp * (s1 * 0.46 + s2 * 0.37 + s3 * 0.17);
        sampleSumR += amp * (s1 * 0.46 + s2 * 0.17 + s3 * 0.37);
      }

      // Felt hammer & spruce soundboard knock on note onset (0..18ms)
      if (t < 0.018) {
        const hammerEnv = Math.sin((t / 0.018) * Math.PI) * Math.exp(-t * 175);
        const knock =
          (Math.sin(2 * Math.PI * (f0 * 3.0) * t) * 0.58 +
            Math.sin(2 * Math.PI * 185 * t) * 0.42) *
          hammerEnv *
          0.2;
        sampleSumL += knock;
        sampleSumR += knock;
      }

      left[i] = sampleSumL * attackEnv * 0.4;
      right[i] = sampleSumR * attackEnv * 0.4;
    }

    return buffer;
  }

  private loadSalamanderGrandPianoSamples(): void {
    if (this.samplesLoadingStarted || !this.audioCtx) return;
    this.samplesLoadingStarted = true;

    const entries = Object.entries(SALAMANDER_SAMPLE_MAP);
    entries.forEach(async ([midiStr, fileName]) => {
      const midi = Number(midiStr);
      try {
        const response = await fetch(`${SALAMANDER_BASE_URL}${fileName}`);
        if (!response.ok) return;
        const arrayBuffer = await response.arrayBuffer();
        if (!this.audioCtx) return;
        const decoded = await this.audioCtx.decodeAudioData(arrayBuffer);
        this.pianoBuffers.set(midi, decoded);
      } catch {
        // Keep physical-modeling Grand Piano buffer if offline or blocked
      }
    });
  }

  private tick = (): void => {
    if (!this.isPlaying || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const deltaSeconds = Math.max(0, Math.min(0.1, now - this.lastFrameAudioTime));
    this.lastFrameAudioTime = now;

    const deltaBeats = secondsToBeats(deltaSeconds, this.bpm);

    if (this.isCountingIn) {
      this.countInRemainingBeats -= deltaBeats;
      if (this.countInRemainingBeats <= 0) {
        const overshootBeats = Math.abs(this.countInRemainingBeats);
        this.isCountingIn = false;
        this.countInRemainingBeats = 0;
        this.lastTriggeredMetronomeKey = '';
        this.scheduleAudioAtBeat(this.currentBeat);
        this.currentBeat += overshootBeats;
      } else {
        const elapsedCountBeats =
          this.countInTotalBeats - this.countInRemainingBeats;
        const currentCountBeatNumber = Math.min(
          this.countInTotalBeats,
          Math.floor(elapsedCountBeats) + 1
        );
        const key = `countin_${currentCountBeatNumber}`;
        if (this.lastTriggeredMetronomeKey !== key) {
          this.lastTriggeredMetronomeKey = key;
          const activeMeasure =
            findActiveMeasureAtBeat(this.measures, this.currentBeat) ?? this.measures[0];
          const bPerMeasure = activeMeasure?.beatsPerMeasure ?? 4;
          const isBarDownbeat = (currentCountBeatNumber - 1) % bPerMeasure === 0;
          this.triggerMetronomeClick(isBarDownbeat);
        }
        this.emitFrame();
        this.rafId = requestAnimationFrame(this.tick);
        return;
      }
    }

    const prevBeat = this.currentBeat;
    const step = advanceBeatWithLoop(
      prevBeat,
      deltaBeats,
      this.loop,
      this.measures,
      this.totalBeats
    );

    if (step.wrappedLoop) {
      this.loopIteration += 1;
      this.triggeredSliceKeys.clear();
      this.lastTriggeredMetronomeKey = '';

      if (this.speedTraining.enabled) {
        const nextBpm = computeNextSpeedTrainingBpm(this.bpm, this.speedTraining);
        if (nextBpm !== this.bpm) {
          this.bpm = nextBpm;
          if (this.onBpmChangeCallback) {
            this.onBpmChangeCallback(nextBpm);
          }
        }
      }
    }

    this.currentBeat = step.nextBeat;

    if (step.reachedEnd) {
      this.isPlaying = false;
      this.emitFrame();
      if (this.onPlaybackStopCallback) {
        this.onPlaybackStopCallback();
      }
      return;
    }

    this.scheduleAudioAtBeat(this.currentBeat);
    this.emitFrame();

    this.rafId = requestAnimationFrame(this.tick);
  };

  /**
   * Schedules ONLY the written notes in the score (filtered by activeStaffIndices if Multi-Voice Mixer is active)
   * and optional metronome clicks. Zero unwritten chords or extra accompaniment bass notes are ever added.
   */
  private scheduleAudioAtBeat(beat: number): void {
    const activeMeasure = findActiveMeasureAtBeat(this.measures, beat);
    if (activeMeasure && this.metronomeEnabled) {
      const beatInMeasure = Math.max(0, beat - activeMeasure.startBeatInScore);
      const stepUnit = this.metronomeBeatMode === 'eighth' ? 0.5 : 1.0;
      const stepIndex = Math.floor(beatInMeasure / stepUnit);
      const integerBeat = Math.floor(beatInMeasure) + 1;
      const metroKey = `${this.loopIteration}_m${activeMeasure.measureNumber}_s${stepIndex}`;

      const shouldClick =
        this.metronomeBeatMode === 'first-beat'
          ? integerBeat === 1 && stepIndex === 0
          : true;

      if (
        shouldClick &&
        this.lastTriggeredMetronomeKey !== metroKey &&
        beatInMeasure - stepIndex * stepUnit < 0.3
      ) {
        this.lastTriggeredMetronomeKey = metroKey;
        this.triggerMetronomeClick(integerBeat === 1 && stepIndex === 0);
      }
    }

    const activeSlices = findActiveSlicesAtBeat(this.slices, beat);
    for (const slice of activeSlices) {
      const sliceKey = `${this.loopIteration}_${slice.id}`;
      if (!this.triggeredSliceKeys.has(sliceKey)) {
        this.triggeredSliceKeys.add(sliceKey);
        const isDownbeatSlice = slice.startBeatInMeasure < 0.05;
        const velocity = isDownbeatSlice ? 0.88 : 0.78;

        for (const note of slice.notes) {
          if (
            this.activeStaffIndices &&
            !this.activeStaffIndices.has(note.staffIndex)
          ) {
            continue;
          }
          if (!note.isRest && note.frequency > 0) {
            const noteDurSeconds = beatsToSeconds(note.durationBeats, this.bpm);
            const now = this.audioCtx?.currentTime ?? 0;

            this.synthesizeNote(
              note.midi,
              note.frequency,
              now,
              Math.max(0.16, noteDurSeconds * 0.98),
              velocity
            );
          }
        }
      }
    }
  }

  public triggerMetronomeClick(isStrongBeat: boolean): void {
    this.ensureAudioContext();
    if (!this.audioCtx || !this.masterGain || this.metronomeVolume <= 0.01) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const clickGain = this.audioCtx.createGain();

    osc.type = isStrongBeat ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isStrongBeat ? 1200 : 800, now);

    const peakGain = (isStrongBeat ? 0.42 : 0.25) * this.metronomeVolume;
    clickGain.gain.setValueAtTime(0.001, now);
    clickGain.gain.linearRampToValueAtTime(peakGain, now + 0.003);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(clickGain);
    clickGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  /**
   * Plays every note across all MSA lessons and Hymns using the Didactic Concert Grand Piano:
   * 1. Multi-sampled Stereo Concert Grand Piano (Yamaha C5 / Salamander + Physical Modeling core)
   * 2. Articulate Felt-Hammer Onset Layer so the student perceives the exact rhythmic attack
   * 3. Warm Harmonic Sustain Layer calibrated to the written note duration + silky felt-damper release
   */
  private synthesizeNote(
    midi: number,
    frequency: number,
    startTime: number,
    durationSeconds: number,
    velocity = 0.84
  ): void {
    if (!this.audioCtx || !this.dryGain) return;

    const availableMidis = Array.from(this.pianoBuffers.keys());
    if (availableMidis.length === 0) return;

    const { sampleMidi, playbackRate } = findNearestSampleMidi(
      midi,
      availableMidis
    );
    const buffer = this.pianoBuffers.get(sampleMidi);
    if (!buffer) return;

    const now = Math.max(this.audioCtx.currentTime, startTime);

    // 1. Primary Stereo Concert Grand Piano Sample / Physical Model Source
    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(playbackRate, now);

    // Dynamic velocity-sensitive low-pass filter for natural hammer brightness bloom
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    const initialCutoff = Math.min(9500, 4400 + velocity * 3800);
    filter.frequency.setValueAtTime(initialCutoff, now);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(1100, initialCutoff * 0.42),
      now + Math.max(0.45, durationSeconds)
    );

    const noteGain = this.audioCtx.createGain();
    const peakGain = 0.9 * velocity;
    const damperReleaseTime = 0.19;

    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(peakGain, now + 0.0035);
    noteGain.gain.setValueAtTime(peakGain * 0.92, now + durationSeconds * 0.88);
    noteGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + durationSeconds + damperReleaseTime
    );

    source.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.dryGain);
    if (this.convolver) {
      noteGain.connect(this.convolver);
    }

    source.start(now);
    source.stop(now + durationSeconds + damperReleaseTime + 0.05);

    // 2. Didactic Hammer-Felt Articulation + Warm Fundamental Sustain Reference
    // Ensures crystal-clear attack onset for rhythmic precision and steady pitch core for solfege/intonation study
    const fundamentalOsc = this.audioCtx.createOscillator();
    const harmonicOsc = this.audioCtx.createOscillator();
    const didacticFilter = this.audioCtx.createBiquadFilter();
    const didacticGain = this.audioCtx.createGain();

    fundamentalOsc.type = 'triangle';
    fundamentalOsc.frequency.setValueAtTime(frequency, now);

    harmonicOsc.type = 'sine';
    harmonicOsc.frequency.setValueAtTime(frequency * 2, now);
    harmonicOsc.detune.setValueAtTime(1.2, now);

    didacticFilter.type = 'lowpass';
    didacticFilter.frequency.setValueAtTime(Math.min(4800, frequency * 5.5), now);
    didacticFilter.frequency.exponentialRampToValueAtTime(
      Math.max(600, frequency * 2.4),
      now + Math.min(0.18, durationSeconds * 0.6)
    );

    const attackPeak = 0.16 * velocity;
    const steadySustain = 0.085 * velocity;
    didacticGain.gain.setValueAtTime(0.0001, now);
    didacticGain.gain.linearRampToValueAtTime(attackPeak, now + 0.004);
    didacticGain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, steadySustain),
      now + Math.min(0.09, durationSeconds * 0.35)
    );
    didacticGain.gain.setValueAtTime(
      steadySustain,
      now + Math.max(0.09, durationSeconds * 0.9)
    );
    didacticGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + durationSeconds + damperReleaseTime
    );

    const harmonicGain = this.audioCtx.createGain();
    harmonicGain.gain.setValueAtTime(0.35, now);

    fundamentalOsc.connect(didacticFilter);
    harmonicOsc.connect(harmonicGain);
    harmonicGain.connect(didacticFilter);
    didacticFilter.connect(didacticGain);
    didacticGain.connect(this.dryGain);
    if (this.convolver) {
      didacticGain.connect(this.convolver);
    }

    fundamentalOsc.start(now);
    harmonicOsc.start(now);
    fundamentalOsc.stop(now + durationSeconds + damperReleaseTime + 0.04);
    harmonicOsc.stop(now + durationSeconds + damperReleaseTime + 0.04);
  }

  private emitFrame(): void {
    if (!this.onFrameCallback) return;

    const activeMeasure = findActiveMeasureAtBeat(
      this.measures,
      this.currentBeat
    );
    const currentMeasureNumber = activeMeasure?.measureNumber ?? 1;
    const beatInMeasure = activeMeasure
      ? Math.max(0, this.currentBeat - activeMeasure.startBeatInScore)
      : 0;
    const currentBeatInMeasure = Math.min(
      activeMeasure?.beatsPerMeasure ?? 4,
      Math.floor(beatInMeasure) + 1
    );

    const currentSlicesAtBeat = findActiveSlicesAtBeat(
      this.slices,
      this.currentBeat
    );
    const activeSlices =
      !this.isPlaying || this.isCountingIn ? [] : currentSlicesAtBeat;
    const activeSliceIds = activeSlices.map((s) => s.id);
    const activeNotes = currentSlicesAtBeat
      .flatMap((s) => s.notes)
      .filter((n) => !this.activeStaffIndices || this.activeStaffIndices.has(n.staffIndex));

    let countInBeat: number | null = null;
    if (this.isCountingIn) {
      const elapsedCountBeats =
        this.countInTotalBeats - this.countInRemainingBeats;
      countInBeat = Math.min(
        this.countInTotalBeats,
        Math.max(1, Math.floor(elapsedCountBeats) + 1)
      );
    }

    this.onFrameCallback({
      currentBeat: this.currentBeat,
      elapsedSeconds: beatsToSeconds(this.currentBeat, this.bpm),
      totalSeconds: beatsToSeconds(this.totalBeats, this.bpm),
      currentMeasureNumber,
      currentBeatInMeasure,
      activeSliceIds,
      activeNotes,
      isCountingIn: this.isCountingIn,
      countInBeat,
      countInTotalBeats: this.countInTotalBeats,
      isPlaying: this.isPlaying,
    });
  }
}
