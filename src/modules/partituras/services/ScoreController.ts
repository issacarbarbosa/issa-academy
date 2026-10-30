import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import {
  MeasureBoundingBox,
  MsaClefType,
  MsaPhaseCategory,
  ScoreNote,
  ScoreSliceEvent,
} from '../types/music';
import {
  findActiveMeasureAtBeat,
  midiToFrequency,
  midiToNoteName,
  normalizeRhythmicMusicXmlToFirstSpace,
} from '../utils/musicMath';

// OSMD internal unit conversion: 1 OSMD unit = 10 pixels at zoom = 1.0
const OSMD_UNIT_TO_PX = 10;

export interface ScoreRenderOptions {
  zoom?: number;
  horizontalNotation?: boolean;
  isolatedRange?: { startMeasure: number; endMeasure: number } | null;
  msaPhase?: MsaPhaseCategory | null;
  msaClef?: MsaClefType;
}

export class ScoreController {
  private osmd: OpenSheetMusicDisplay | null = null;
  private container: HTMLElement | null = null;
  private zoom = 1.05;
  private horizontalNotation = false;
  private isolatedRange: { startMeasure: number; endMeasure: number } | null = null;
  private msaPhase: MsaPhaseCategory | null | undefined = undefined;
  private renderedMeasureNumbers: number[] = [];
  private fullScoreTotalMeasures = 0;

  private measures: MeasureBoundingBox[] = [];
  private slices: ScoreSliceEvent[] = [];
  private totalBeats = 0;
  private title = '';
  private composer = '';
  private noteSvgMap = new Map<string, SVGElement[]>();
  private activeHighlightedPaths = new Set<SVGElement>();
  private currentXml = '';

  public async init(container: HTMLElement): Promise<void> {
    this.container = container;
    container.innerHTML = '';
    this.osmd = new OpenSheetMusicDisplay(container, {
      autoResize: false,
      backend: 'svg',
      drawTitle: false,
      drawSubtitle: false,
      drawComposer: false,
      drawLyricist: false,
      drawPartNames: false,
      drawMeasureNumbers: false,
      coloringEnabled: false,
      followCursor: false,
    });
  }

  /**
   * Transforms a MusicXML string when Focus Mode is active to isolate only [startMeasure, endMeasure].
   * No clef conversion is performed here: each clef loads its own dedicated MusicXML file.
   */
  private buildTransformedMusicXml(
    rawXml: string,
    isolatedRange: { startMeasure: number; endMeasure: number } | null
  ): { xmlToLoad: string; keptMeasureNumbers: number[]; totalOriginalMeasures: number } {
    const baseXml =
      this.msaPhase === 'ritmica'
        ? normalizeRhythmicMusicXmlToFirstSpace(rawXml)
        : rawXml;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(baseXml, 'application/xml');
      const parts = Array.from(doc.querySelectorAll('part'));
      if (parts.length === 0) {
        return { xmlToLoad: baseXml, keptMeasureNumbers: [], totalOriginalMeasures: 0 };
      }

      const firstPartMeasures = Array.from(parts[0].querySelectorAll(':scope > measure'));
      const totalOriginalMeasures = firstPartMeasures.length;

      if (!isolatedRange || totalOriginalMeasures === 0) {
        return {
          xmlToLoad: baseXml,
          keptMeasureNumbers: firstPartMeasures.map((_, idx) => idx + 1),
          totalOriginalMeasures,
        };
      }

      const startM = Math.max(1, Math.min(totalOriginalMeasures, Math.round(isolatedRange.startMeasure)));
      const endM = Math.max(startM, Math.min(totalOriginalMeasures, Math.round(isolatedRange.endMeasure)));
      const keptMeasureNumbers: number[] = [];
      for (let m = startM; m <= endM; m++) {
        keptMeasureNumbers.push(m);
      }

      for (const part of parts) {
        const partMeasures = Array.from(part.querySelectorAll(':scope > measure'));
        let latestDivisions: Element | null = null;
        let latestKey: Element | null = null;
        let latestTime: Element | null = null;
        let latestClef: Element | null = null;

        for (let i = 0; i < Math.min(startM, partMeasures.length); i++) {
          const mEl = partMeasures[i];
          const attrEl = mEl.querySelector('attributes');
          if (attrEl) {
            const div = attrEl.querySelector('divisions');
            const key = attrEl.querySelector('key');
            const time = attrEl.querySelector('time');
            const clef = attrEl.querySelector('clef');
            if (div) latestDivisions = div.cloneNode(true) as Element;
            if (key) latestKey = key.cloneNode(true) as Element;
            if (time) latestTime = time.cloneNode(true) as Element;
            if (clef) latestClef = clef.cloneNode(true) as Element;
          }
        }

        partMeasures.forEach((mEl, idx) => {
          const mNum = idx + 1;
          if (mNum < startM || mNum > endM) {
            part.removeChild(mEl);
          } else if (mNum === startM) {
            let attrEl = mEl.querySelector('attributes');
            if (!attrEl) {
              attrEl = doc.createElement('attributes');
              mEl.insertBefore(attrEl, mEl.firstChild);
            }
            if (!attrEl.querySelector('divisions') && latestDivisions) {
              attrEl.insertBefore(latestDivisions, attrEl.firstChild);
            }
            if (!attrEl.querySelector('key') && latestKey) {
              attrEl.appendChild(latestKey);
            }
            if (!attrEl.querySelector('time') && latestTime) {
              attrEl.appendChild(latestTime);
            }
            if (!attrEl.querySelector('clef') && latestClef) {
              attrEl.appendChild(latestClef);
            }
          }
        });
      }

      const serializer = new XMLSerializer();
      return {
        xmlToLoad: serializer.serializeToString(doc),
        keptMeasureNumbers,
        totalOriginalMeasures,
      };
    } catch {
      return { xmlToLoad: rawXml, keptMeasureNumbers: [], totalOriginalMeasures: 0 };
    }
  }

  public async loadScore(
    xml: string,
    customZoom?: number,
    options?: ScoreRenderOptions
  ): Promise<{
    measures: MeasureBoundingBox[];
    slices: ScoreSliceEvent[];
    totalBeats: number;
    title: string;
    composer: string;
    fullScoreTotalMeasures: number;
  }> {
    if (!this.osmd || !this.container) {
      throw new Error('ScoreController not initialized');
    }
    this.currentXml = xml;
    if (typeof customZoom === 'number') {
      this.zoom = customZoom;
    }
    if (options?.zoom !== undefined) {
      this.zoom = options.zoom;
    }
    if (options?.horizontalNotation !== undefined) {
      this.horizontalNotation = options.horizontalNotation;
    }
    if (options?.isolatedRange !== undefined) {
      this.isolatedRange = options.isolatedRange;
    }
    this.msaPhase = options?.msaPhase;

    return this.reloadAndRenderCurrentXml();
  }

  public async applyRenderOptions(options: ScoreRenderOptions): Promise<{
    measures: MeasureBoundingBox[];
    slices: ScoreSliceEvent[];
    totalBeats: number;
    fullScoreTotalMeasures: number;
  }> {
    if (options.zoom !== undefined) {
      this.zoom = Math.max(0.6, Math.min(1.8, Number(options.zoom.toFixed(2))));
    }
    if (options.horizontalNotation !== undefined) {
      this.horizontalNotation = options.horizontalNotation;
    }
    if (options.isolatedRange !== undefined) {
      this.isolatedRange = options.isolatedRange;
    }
    if (options.msaPhase !== undefined) {
      this.msaPhase = options.msaPhase;
    }
    const res = await this.reloadAndRenderCurrentXml();
    return {
      measures: res.measures,
      slices: res.slices,
      totalBeats: res.totalBeats,
      fullScoreTotalMeasures: res.fullScoreTotalMeasures,
    };
  }

  private async reloadAndRenderCurrentXml(): Promise<{
    measures: MeasureBoundingBox[];
    slices: ScoreSliceEvent[];
    totalBeats: number;
    title: string;
    composer: string;
    fullScoreTotalMeasures: number;
  }> {
    if (!this.osmd || !this.currentXml) {
      return {
        measures: this.measures,
        slices: this.slices,
        totalBeats: this.totalBeats,
        title: this.title,
        composer: this.composer,
        fullScoreTotalMeasures: this.fullScoreTotalMeasures,
      };
    }

    this.clearAllNoteHighlights();

    const { xmlToLoad, keptMeasureNumbers, totalOriginalMeasures } =
      this.buildTransformedMusicXml(this.currentXml, this.isolatedRange);

    this.renderedMeasureNumbers = keptMeasureNumbers;
    if (totalOriginalMeasures > 0) {
      this.fullScoreTotalMeasures = totalOriginalMeasures;
    }

    const rules = (this.osmd as any).EngravingRules || (this.osmd as any).rules;
    if (rules) {
      rules.RenderSingleHorizontalStaffline = Boolean(this.horizontalNotation);
      rules.RenderPartNames = false;
    }

    await this.osmd.load(xmlToLoad);
    this.osmd.Zoom = this.zoom;
    this.osmd.render();

    this.applyMsaSvgPostProcessing();
    this.extractScoreData();

    return {
      measures: this.measures,
      slices: this.slices,
      totalBeats: this.totalBeats,
      title: this.title,
      composer: this.composer,
      fullScoreTotalMeasures:
        this.fullScoreTotalMeasures || this.measures.length,
    };
  }

  /**
   * Post-processes the rendered OSMD SVG for MSA rhythmic lessons:
   * - If msaPhase === 'ritmica' (MSA Lessons 1..5): hides the clef and the 5 horizontal staff lines,
   *   leaving ONLY the time signature (4/4), vertical barlines (|), rhythmic figures, beams, and rests!
   */
  private applyMsaSvgPostProcessing(): void {
    if (!this.container || this.msaPhase !== 'ritmica') return;
    const svgEl = this.container.querySelector('svg');
    if (!svgEl) return;

    const clefGroups = svgEl.querySelectorAll('.vf-clef');
    clefGroups.forEach((g) => {
      (g as SVGElement).style.opacity = '0';
    });

    const allLinesAndPaths = svgEl.querySelectorAll('path, line');
    allLinesAndPaths.forEach((el) => {
      if (
        el.closest('.vf-stavenote') ||
        el.closest('.vf-beam') ||
        el.closest('.vf-timesig')
      ) {
        return;
      }
      const rect = el.getBoundingClientRect();
      // Horizontal staff lines have wide width (> 35px) and tiny height (<= 4px),
      // whereas vertical barlines have height > 14px and narrow width (<= 8px).
      if (rect.width > 35 && rect.height <= 4) {
        (el as SVGElement).style.opacity = '0';
      }
    });
  }

  public setZoom(newZoom: number): {
    measures: MeasureBoundingBox[];
    slices: ScoreSliceEvent[];
  } {
    if (!this.osmd || !this.currentXml) {
      return { measures: this.measures, slices: this.slices };
    }
    this.zoom = Math.max(0.6, Math.min(1.8, Number(newZoom.toFixed(2))));
    this.clearAllNoteHighlights();
    this.osmd.Zoom = this.zoom;
    this.osmd.render();
    this.applyMsaSvgPostProcessing();
    this.extractScoreData();
    return {
      measures: this.measures,
      slices: this.slices,
    };
  }

  public getZoom(): number {
    return this.zoom;
  }

  public getFullScoreTotalMeasures(): number {
    return this.fullScoreTotalMeasures || this.measures.length;
  }

  public recalculateLayout(): {
    measures: MeasureBoundingBox[];
    slices: ScoreSliceEvent[];
  } {
    if (!this.osmd || !this.currentXml) {
      return { measures: this.measures, slices: this.slices };
    }
    this.clearAllNoteHighlights();
    this.osmd.Zoom = this.zoom;
    this.osmd.render();
    this.applyMsaSvgPostProcessing();
    this.extractScoreData();
    return {
      measures: this.measures,
      slices: this.slices,
    };
  }

  public getMeasures(): MeasureBoundingBox[] {
    return this.measures;
  }

  public getSlices(): ScoreSliceEvent[] {
    return this.slices;
  }

  public getTotalBeats(): number {
    return this.totalBeats;
  }

  /**
   * Computes the exact MeasureBoundingBox and smooth Playhead cursor coordinates
   * for any given beat position in the score.
   */
  public getCursorAndMeasureGeometry(beat: number): {
    x: number;
    y: number;
    height: number;
    measureBox: MeasureBoundingBox | null;
  } {
    const activeMeasure = findActiveMeasureAtBeat(this.measures, beat);
    if (!activeMeasure) {
      return { x: 0, y: 0, height: 80, measureBox: null };
    }

    const beatInMeasure = Math.max(
      0,
      Math.min(activeMeasure.durationBeats, beat - activeMeasure.startBeatInScore)
    );

    const measureSlices = this.slices.filter(
      (s) => s.measureNumber === activeMeasure.measureNumber
    );

    let cursorX = activeMeasure.x + 12;

    if (measureSlices.length > 0) {
      let prevSlice: ScoreSliceEvent | null = null;
      let nextSlice: ScoreSliceEvent | null = null;

      for (let i = 0; i < measureSlices.length; i++) {
        const s = measureSlices[i];
        if (s.startBeatInMeasure <= beatInMeasure + 0.001) {
          prevSlice = s;
        }
        if (s.startBeatInMeasure > beatInMeasure + 0.001) {
          nextSlice = s;
          break;
        }
      }

      if (prevSlice && nextSlice) {
        const prevX =
          activeMeasure.x + prevSlice.relativeXInMeasure * activeMeasure.width;
        const nextX =
          activeMeasure.x + nextSlice.relativeXInMeasure * activeMeasure.width;
        const spanBeats = Math.max(
          0.05,
          nextSlice.startBeatInMeasure - prevSlice.startBeatInMeasure
        );
        const fraction = Math.max(
          0,
          Math.min(1, (beatInMeasure - prevSlice.startBeatInMeasure) / spanBeats)
        );
        cursorX = prevX + (nextX - prevX) * fraction;
      } else if (prevSlice && !nextSlice) {
        const prevX =
          activeMeasure.x + prevSlice.relativeXInMeasure * activeMeasure.width;
        const endX = activeMeasure.x + activeMeasure.width - 8;
        const spanBeats = Math.max(0.05, prevSlice.durationBeats);
        const fraction = Math.max(
          0,
          Math.min(1, (beatInMeasure - prevSlice.startBeatInMeasure) / spanBeats)
        );
        cursorX = prevX + (endX - prevX) * fraction;
      } else if (!prevSlice && nextSlice) {
        cursorX =
          activeMeasure.x + nextSlice.relativeXInMeasure * activeMeasure.width;
      }
    } else {
      const ratio =
        activeMeasure.durationBeats > 0
          ? beatInMeasure / activeMeasure.durationBeats
          : 0;
      cursorX = activeMeasure.x + ratio * activeMeasure.width;
    }

    return {
      x: cursorX,
      y: activeMeasure.y,
      height: activeMeasure.height,
      measureBox: activeMeasure,
    };
  }

  /**
   * Highlights the SVG noteheads (.vf-notehead path) corresponding to the active slice IDs,
   * and restores any previously highlighted noteheads to their original fill color.
   */
  public highlightSlices(
    sliceIds: string[],
    highlightColor = '#3B82F6'
  ): void {
    const nextPaths = new Set<SVGElement>();

    for (const sliceId of sliceIds) {
      const paths = this.noteSvgMap.get(sliceId);
      if (paths) {
        for (const p of paths) {
          nextPaths.add(p);
        }
      }
    }

    for (const oldPath of this.activeHighlightedPaths) {
      if (!nextPaths.has(oldPath)) {
        const origFill = oldPath.getAttribute('data-orig-fill') ?? '#000000';
        const origStroke = oldPath.getAttribute('data-orig-stroke') ?? '';
        oldPath.setAttribute('fill', origFill);
        oldPath.style.fill = origFill;
        if (origStroke) {
          oldPath.setAttribute('stroke', origStroke);
          oldPath.style.stroke = origStroke;
        } else {
          oldPath.removeAttribute('stroke');
          oldPath.style.removeProperty('stroke');
        }
        oldPath.style.removeProperty('filter');
        oldPath.classList.remove('active-notehead');
        oldPath.setAttribute('data-active-notehead', 'false');
      }
    }

    for (const newPath of nextPaths) {
      if (!newPath.hasAttribute('data-orig-fill')) {
        const currentFill =
          newPath.getAttribute('fill') ||
          newPath.style.fill ||
          '#000000';
        newPath.setAttribute('data-orig-fill', currentFill);
      }
      newPath.setAttribute('fill', highlightColor);
      newPath.style.setProperty('fill', highlightColor, 'important');
      newPath.style.setProperty('stroke', highlightColor, 'important');
      newPath.style.filter = `drop-shadow(0 0 6px ${highlightColor}99)`;
      newPath.classList.add('active-notehead');
      newPath.setAttribute('data-active-notehead', 'true');
    }

    this.activeHighlightedPaths = nextPaths;
  }

  public clearAllNoteHighlights(): void {
    for (const oldPath of this.activeHighlightedPaths) {
      const origFill = oldPath.getAttribute('data-orig-fill') ?? '#000000';
      oldPath.setAttribute('fill', origFill);
      oldPath.style.fill = origFill;
      oldPath.removeAttribute('stroke');
      oldPath.style.removeProperty('stroke');
      oldPath.style.removeProperty('filter');
      oldPath.classList.remove('active-notehead');
      oldPath.setAttribute('data-active-notehead', 'false');
    }
    this.activeHighlightedPaths.clear();
  }

  public findMeasureAtPoint(relX: number, relY: number): MeasureBoundingBox | null {
    for (const m of this.measures) {
      if (
        relX >= m.x - 4 &&
        relX <= m.x + m.width + 4 &&
        relY >= m.y - 14 &&
        relY <= m.y + m.height + 14
      ) {
        return m;
      }
    }
    return null;
  }

  public findClosestMeasureAtPoint(relX: number, relY: number): MeasureBoundingBox | null {
    const direct = this.findMeasureAtPoint(relX, relY);
    if (direct) return direct;
    if (this.measures.length === 0) return null;

    let bestSystemIndex = this.measures[0].systemIndex;
    let minVerticalDist = Infinity;

    for (const m of this.measures) {
      const top = m.y;
      const bottom = m.y + m.height;
      const vDist = relY < top ? top - relY : relY > bottom ? relY - bottom : 0;
      if (vDist < minVerticalDist) {
        minVerticalDist = vDist;
        bestSystemIndex = m.systemIndex;
      }
    }

    const systemMeasures = this.measures.filter(
      (m) => m.systemIndex === bestSystemIndex
    );
    let bestMeasure = systemMeasures[0] ?? this.measures[0];
    let minHorizontalDist = Infinity;

    for (const m of systemMeasures) {
      const left = m.x;
      const right = m.x + m.width;
      const hDist = relX < left ? left - relX : relX > right ? relX - right : 0;
      if (hDist < minHorizontalDist) {
        minHorizontalDist = hDist;
        bestMeasure = m;
      }
    }

    return bestMeasure;
  }

  public getLoopBoundaryGeometry(
    beat: number,
    role: 'start' | 'end'
  ): {
    x: number;
    y: number;
    height: number;
    measureBox: MeasureBoundingBox | null;
  } {
    if (this.measures.length === 0) {
      return { x: 0, y: 0, height: 80, measureBox: null };
    }

    const lookupBeat =
      role === 'end' ? Math.max(0, beat - 0.01) : Math.max(0, beat);
    const mBox =
      findActiveMeasureAtBeat(this.measures, lookupBeat) ??
      (role === 'end'
        ? this.measures[this.measures.length - 1]
        : this.measures[0]);

    const beatInMeasure = Math.max(0, beat - mBox.startBeatInScore);
    const measureSlices = this.slices.filter(
      (s) => s.measureNumber === mBox.measureNumber
    );

    if (role === 'start') {
      if (beatInMeasure <= 0.05) {
        const prevMeasure =
          mBox.measureIndex > 0 ? this.measures[mBox.measureIndex - 1] : null;
        const isFirstInSystem =
          !prevMeasure || prevMeasure.systemIndex !== mBox.systemIndex;

        if (isFirstInSystem && measureSlices.length > 0) {
          const firstSliceX =
            mBox.x + measureSlices[0].relativeXInMeasure * mBox.width;
          return {
            x: Math.max(mBox.x + 4, firstSliceX - 16),
            y: mBox.y,
            height: mBox.height,
            measureBox: mBox,
          };
        }
        return {
          x: mBox.x,
          y: mBox.y,
          height: mBox.height,
          measureBox: mBox,
        };
      }

      let targetSlice: ScoreSliceEvent | null = null;
      let minBeatDiff = Infinity;
      for (const s of measureSlices) {
        const diff = Math.abs(s.startBeatInMeasure - beatInMeasure);
        if (diff < minBeatDiff) {
          minBeatDiff = diff;
          targetSlice = s;
        }
      }

      if (targetSlice && minBeatDiff <= 0.35) {
        const sliceX = mBox.x + targetSlice.relativeXInMeasure * mBox.width;
        return {
          x: Math.max(mBox.x + 2, sliceX - 12),
          y: mBox.y,
          height: mBox.height,
          measureBox: mBox,
        };
      }

      const interp = this.getCursorAndMeasureGeometry(beat);
      return {
        x: Math.max(mBox.x + 2, interp.x - 10),
        y: mBox.y,
        height: mBox.height,
        measureBox: mBox,
      };
    } else {
      if (beatInMeasure >= mBox.durationBeats - 0.05) {
        return {
          x: mBox.x + mBox.width,
          y: mBox.y,
          height: mBox.height,
          measureBox: mBox,
        };
      }

      let prevSlice: ScoreSliceEvent | null = null;
      let nextSlice: ScoreSliceEvent | null = null;
      for (const s of measureSlices) {
        if (s.startBeatInMeasure < beatInMeasure - 0.02) {
          prevSlice = s;
        } else if (!nextSlice) {
          nextSlice = s;
        }
      }

      if (prevSlice && nextSlice) {
        const prevX = mBox.x + prevSlice.relativeXInMeasure * mBox.width;
        const nextX = mBox.x + nextSlice.relativeXInMeasure * mBox.width;
        return {
          x: (prevX + nextX) / 2,
          y: mBox.y,
          height: mBox.height,
          measureBox: mBox,
        };
      } else if (prevSlice) {
        const prevX = mBox.x + prevSlice.relativeXInMeasure * mBox.width;
        return {
          x: Math.min(mBox.x + mBox.width, prevX + 16),
          y: mBox.y,
          height: mBox.height,
          measureBox: mBox,
        };
      }

      const interp = this.getCursorAndMeasureGeometry(beat);
      return {
        x: Math.min(mBox.x + mBox.width, interp.x + 10),
        y: mBox.y,
        height: mBox.height,
        measureBox: mBox,
      };
    }
  }

  public getBeatAtPoint(
    relX: number,
    relY: number,
    role: 'start' | 'end' | 'seek'
  ): number {
    const mBox = this.findClosestMeasureAtPoint(relX, relY);
    if (!mBox) return 0;

    const measureSlices = this.slices.filter(
      (s) => s.measureNumber === mBox.measureNumber
    );

    const candidateLocalBeats = new Set<number>();

    if (role === 'start' || role === 'seek') {
      candidateLocalBeats.add(0);
      if (measureSlices.length > 0) {
        for (const s of measureSlices) {
          if (s.startBeatInMeasure <= mBox.durationBeats - 0.1) {
            candidateLocalBeats.add(Number(s.startBeatInMeasure.toFixed(3)));
          }
        }
      } else {
        for (let b = 0; b <= mBox.durationBeats - 0.5; b += 0.5) {
          candidateLocalBeats.add(Number(b.toFixed(3)));
        }
      }
    } else {
      candidateLocalBeats.add(mBox.durationBeats);
      if (measureSlices.length > 0) {
        for (const s of measureSlices) {
          const noteEnd = Math.min(
            mBox.durationBeats,
            s.startBeatInMeasure + s.durationBeats
          );
          if (noteEnd >= 0.25) {
            candidateLocalBeats.add(Number(noteEnd.toFixed(3)));
          }
        }
      } else {
        for (let b = 0.5; b <= mBox.durationBeats; b += 0.5) {
          candidateLocalBeats.add(Number(b.toFixed(3)));
        }
      }
    }

    const geomRole = role === 'end' ? 'end' : 'start';
    let bestBeat = mBox.startBeatInScore + (role === 'end' ? mBox.durationBeats : 0);
    let minPxDist = Infinity;

    for (const localB of candidateLocalBeats) {
      const scoreBeat = mBox.startBeatInScore + localB;
      const geom = this.getLoopBoundaryGeometry(scoreBeat, geomRole);
      const dist = Math.abs(geom.x - relX);
      if (dist < minPxDist) {
        minPxDist = dist;
        bestBeat = scoreBeat;
      }
    }

    return Number(bestBeat.toFixed(3));
  }

  private extractScoreData(): void {
    if (!this.osmd || !this.container) return;

    const sheet = (this.osmd as any).sheet;
    const graphic = (this.osmd as any).graphic;
    if (!sheet || !graphic) return;

    this.title = sheet.TitleString || 'Partitura Interativa';
    this.composer = sheet.ComposerString || '';

    const svgEl = this.container.querySelector('svg');
    let scaleX = 1;
    let scaleY = 1;
    let offsetLeft = 0;
    let offsetTop = 0;

    if (svgEl) {
      const containerRect = this.container.getBoundingClientRect();
      const svgRect = svgEl.getBoundingClientRect();
      offsetLeft = svgRect.left - containerRect.left;
      offsetTop = svgRect.top - containerRect.top;

      const attrWidth = parseFloat(svgEl.getAttribute('width') || '0');
      const attrHeight = parseFloat(svgEl.getAttribute('height') || '0');
      if (attrWidth > 0 && svgRect.width > 0) {
        scaleX = svgRect.width / attrWidth;
      }
      if (attrHeight > 0 && svgRect.height > 0) {
        scaleY = svgRect.height / attrHeight;
      }
    }

    const unitToPxX = OSMD_UNIT_TO_PX * this.zoom * scaleX;
    const unitToPxY = OSMD_UNIT_TO_PX * this.zoom * scaleY;

    const measureList: any[][] = graphic.MeasureList || graphic.measureList || [];
    const sourceMeasures: any[] = sheet.SourceMeasures || [];

    const extractedMeasures: MeasureBoundingBox[] = [];
    const extractedSlices: ScoreSliceEvent[] = [];
    this.noteSvgMap.clear();

    let runningScoreBeats = 0;

    for (let mIdx = 0; mIdx < measureList.length; mIdx++) {
      const staffMeasures = measureList[mIdx];
      if (!staffMeasures || staffMeasures.length === 0) continue;

      const sourceMeasure = sourceMeasures[mIdx];
      let beatsPerMeasure = 4;
      let beatType = 4;

      if (sourceMeasure?.ActiveTimeSignature) {
        beatsPerMeasure = sourceMeasure.ActiveTimeSignature.Numerator || 4;
        beatType = sourceMeasure.ActiveTimeSignature.Denominator || 4;
      }

      const measureDurationBeats = sourceMeasure?.Duration
        ? sourceMeasure.Duration.RealValue * 4
        : (beatsPerMeasure * 4) / beatType;

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      let systemIndex = 0;

      for (let sIdx = 0; sIdx < staffMeasures.length; sIdx++) {
        const gm = staffMeasures[sIdx];
        if (!gm || !gm.PositionAndShape) continue;

        const ps = gm.PositionAndShape;
        const absX = ps.AbsolutePosition?.x ?? 0;
        const absY = ps.AbsolutePosition?.y ?? 0;

        const left = absX + (ps.BorderLeft ?? 0);
        const right = absX + (ps.BorderRight ?? ps.Size?.width ?? 10);
        const top = absY + (ps.BorderTop ?? -1);
        const bottom = absY + (ps.BorderBottom ?? ps.Size?.height ?? 5);

        if (left < minX) minX = left;
        if (right > maxX) maxX = right;
        if (top < minY) minY = top;
        if (bottom > maxY) maxY = bottom;

        if (gm.ParentMusicSystem?.Id !== undefined) {
          systemIndex = gm.ParentMusicSystem.Id;
        }
      }

      const paddedMinY = minY - 2.8;
      const paddedMaxY = maxY + 1.1;

      const boxX = offsetLeft + minX * unitToPxX;
      const boxY = offsetTop + paddedMinY * unitToPxY;
      const boxWidth = Math.max(24, (maxX - minX) * unitToPxX);
      const boxHeight = Math.max(44, (paddedMaxY - paddedMinY) * unitToPxY);

      const measureNumber =
        this.renderedMeasureNumbers[mIdx] ??
        (typeof sourceMeasure?.MeasureNumber === 'number' && sourceMeasure.MeasureNumber > 0
          ? sourceMeasure.MeasureNumber
          : mIdx + 1);

      extractedMeasures.push({
        measureIndex: mIdx,
        measureNumber,
        startBeatInScore: runningScoreBeats,
        durationBeats: measureDurationBeats,
        beatsPerMeasure,
        beatType,
        x: boxX,
        y: boxY,
        width: boxWidth,
        height: boxHeight,
        systemIndex,
      });

      const sliceByBeatMap = new Map<string, {
        beatInMeasure: number;
        notes: ScoreNote[];
        svgPaths: SVGElement[];
        osmdRelX: number[];
      }>();

      for (let sIdx = 0; sIdx < staffMeasures.length; sIdx++) {
        const gm = staffMeasures[sIdx];
        if (!gm || !gm.staffEntries) continue;

        const gmAbsX = gm.PositionAndShape?.AbsolutePosition?.x ?? minX;
        const gmWidthUnits = Math.max(
          1,
          (gm.PositionAndShape?.BorderRight ?? gm.PositionAndShape?.Size?.width ?? 10) -
            (gm.PositionAndShape?.BorderLeft ?? 0)
        );

        for (let eIdx = 0; eIdx < gm.staffEntries.length; eIdx++) {
          const staffEntry = gm.staffEntries[eIdx];
          if (!staffEntry) continue;

          const relInMeasureReal =
            staffEntry.relInMeasureTimestamp?.RealValue ?? 0;
          const beatInMeasure = Number((relInMeasureReal * 4).toFixed(4));
          const key = `${mIdx}_${beatInMeasure.toFixed(3)}`;

          const entryAbsX =
            staffEntry.PositionAndShape?.AbsolutePosition?.x ??
            gmAbsX + (beatInMeasure / Math.max(1, measureDurationBeats)) * gmWidthUnits;
          const relXRatio = Math.max(
            0.06,
            Math.min(0.95, (entryAbsX - minX) / Math.max(0.1, maxX - minX))
          );

          if (!sliceByBeatMap.has(key)) {
            sliceByBeatMap.set(key, {
              beatInMeasure,
              notes: [],
              svgPaths: [],
              osmdRelX: [],
            });
          }
          const bucket = sliceByBeatMap.get(key)!;
          bucket.osmdRelX.push(relXRatio);

          const gveList: any[] = staffEntry.graphicalVoiceEntries || [];
          for (let vIdx = 0; vIdx < gveList.length; vIdx++) {
            const gve = gveList[vIdx];
            const gNotes: any[] = gve?.notes || [];
            for (let nIdx = 0; nIdx < gNotes.length; nIdx++) {
              const gNote = gNotes[nIdx];
              const sourceNote = gNote?.sourceNote;
              if (!sourceNote) continue;

              // Skip tied-continuation notes so only articulated written notes trigger
              if (sourceNote.NoteTie && sourceNote.NoteTie.StartNote && sourceNote.NoteTie.StartNote !== sourceNote) {
                continue;
              }

              const isRest = Boolean(sourceNote.isRest && sourceNote.isRest());
              const noteDurBeats = Number(
                ((sourceNote.Length?.RealValue ?? 0.25) * 4).toFixed(4)
              );

              let midi = 60;
              let pitchLabel = 'Pausa';

              if (!isRest && sourceNote.Pitch) {
                const halfTone = sourceNote.Pitch.getHalfTone
                  ? sourceNote.Pitch.getHalfTone()
                  : sourceNote.halfTone;
                if (typeof halfTone === 'number') {
                  midi = halfTone + 12;
                } else {
                  const fundamental = sourceNote.Pitch.FundamentalNote ?? 0;
                  const octave = sourceNote.Pitch.Octave ?? 4;
                  const alter = sourceNote.Pitch.AccidentalHalfTones ?? 0;
                  midi = (octave + 1) * 12 + fundamental + alter;
                }
                pitchLabel = midiToNoteName(midi);
              }

              const noteId = `note_${mIdx}_${sIdx}_${vIdx}_${eIdx}_${nIdx}`;
              bucket.notes.push({
                id: noteId,
                midi,
                frequency: isRest ? 0 : midiToFrequency(midi),
                pitchLabel,
                isRest,
                measureIndex: mIdx,
                measureNumber,
                startBeatInScore: runningScoreBeats + beatInMeasure,
                durationBeats: Math.max(0.125, noteDurBeats),
                startBeatInMeasure: beatInMeasure,
                staffIndex: sIdx,
                voiceIndex: vIdx,
                graphicalNoteRef: gNote,
              });

              const notePaths = this.extractSvgPathsFromGraphicalNote(gNote);
              for (const p of notePaths) {
                bucket.svgPaths.push(p);
              }
            }
          }
        }
      }

      const sortedMeasureSlices = Array.from(sliceByBeatMap.values()).sort(
        (a, b) => a.beatInMeasure - b.beatInMeasure
      );

      for (let i = 0; i < sortedMeasureSlices.length; i++) {
        const item = sortedMeasureSlices[i];
        const nextItem = sortedMeasureSlices[i + 1];
        const sliceId = `slice_${mIdx}_${i}`;

        const maxNoteDuration = item.notes.reduce(
          (acc, n) => Math.max(acc, n.durationBeats),
          0.5
        );
        const effectiveDuration = nextItem
          ? Math.max(0.125, nextItem.beatInMeasure - item.beatInMeasure)
          : Math.max(0.125, Math.min(maxNoteDuration, measureDurationBeats - item.beatInMeasure));

        const avgRelX =
          item.osmdRelX.length > 0
            ? item.osmdRelX.reduce((a, b) => a + b, 0) / item.osmdRelX.length
            : (item.beatInMeasure + 0.3) / Math.max(1, measureDurationBeats);

        extractedSlices.push({
          id: sliceId,
          measureIndex: mIdx,
          measureNumber,
          startBeatInScore: runningScoreBeats + item.beatInMeasure,
          durationBeats: effectiveDuration,
          startBeatInMeasure: item.beatInMeasure,
          notes: item.notes,
          relativeXInMeasure: avgRelX,
        });

        if (item.svgPaths.length > 0) {
          this.noteSvgMap.set(sliceId, item.svgPaths);
        }
      }

      runningScoreBeats += measureDurationBeats;
    }

    const systemBounds = new Map<number, { minY: number; maxBottom: number }>();
    for (const m of extractedMeasures) {
      const bottom = m.y + m.height;
      const current = systemBounds.get(m.systemIndex);
      if (!current) {
        systemBounds.set(m.systemIndex, { minY: m.y, maxBottom: bottom });
      } else {
        current.minY = Math.min(current.minY, m.y);
        current.maxBottom = Math.max(current.maxBottom, bottom);
      }
    }
    for (const m of extractedMeasures) {
      const sys = systemBounds.get(m.systemIndex);
      if (sys) {
        m.y = sys.minY;
        m.height = sys.maxBottom - sys.minY;
      }
    }

    this.measures = extractedMeasures;
    this.slices = extractedSlices;
    this.totalBeats = runningScoreBeats;

    if (svgEl) {
      this.bindFallbackSvgNoteheads(svgEl);
      this.refineSlicePositionsFromSvgNoteheads();
    }
  }

  private refineSlicePositionsFromSvgNoteheads(): void {
    if (!this.container) return;
    const containerRect = this.container.getBoundingClientRect();
    if (containerRect.width <= 0) return;

    for (const slice of this.slices) {
      const paths = this.noteSvgMap.get(slice.id);
      const mBox = this.measures[slice.measureIndex];
      if (!paths || paths.length === 0 || !mBox || mBox.width <= 0) continue;

      let sumCenterX = 0;
      let validCount = 0;
      for (const p of paths) {
        const rect = p.getBoundingClientRect();
        if (rect.width > 0) {
          sumCenterX += rect.left - containerRect.left + rect.width / 2;
          validCount++;
        }
      }
      if (validCount > 0) {
        const avgCenterX = sumCenterX / validCount;
        const exactRelX = (avgCenterX - mBox.x) / mBox.width;
        if (exactRelX >= 0.02 && exactRelX <= 0.98) {
          slice.relativeXInMeasure = exactRelX;
        }
      }
    }
  }

  private extractSvgPathsFromGraphicalNote(gNote: any): SVGElement[] {
    const results: SVGElement[] = [];
    try {
      let svgGroup: Element | null = null;
      if (typeof gNote.getSVGGElement === 'function') {
        svgGroup = gNote.getSVGGElement();
      } else if (gNote.vfnote && gNote.vfnote[0]?.attrs?.el) {
        svgGroup = gNote.vfnote[0].attrs.el;
      }

      if (svgGroup) {
        const noteheadPaths = svgGroup.querySelectorAll('.vf-notehead path');
        if (noteheadPaths.length > 0) {
          noteheadPaths.forEach((el) => results.push(el as SVGElement));
        } else {
          const allPaths = svgGroup.querySelectorAll('path');
          allPaths.forEach((el) => results.push(el as SVGElement));
        }
      }
    } catch {
      // Ignore if VexFlow internal structure differs
    }
    return results;
  }

  private bindFallbackSvgNoteheads(svgEl: SVGSVGElement): void {
    if (!this.container) return;
    const containerRect = this.container.getBoundingClientRect();
    const allNoteheads = Array.from(
      svgEl.querySelectorAll('.vf-notehead path')
    ) as SVGElement[];

    if (allNoteheads.length === 0) return;

    const noteheadsWithCoords = allNoteheads.map((nh) => {
      const rect = nh.getBoundingClientRect();
      return {
        el: nh,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      };
    });

    for (const mBox of this.measures) {
      const measureSlices = this.slices.filter(
        (s) => s.measureIndex === mBox.measureIndex && s.notes.some((n) => !n.isRest)
      );
      if (measureSlices.length === 0) continue;

      const measureNoteheads = noteheadsWithCoords
        .filter(
          (item) =>
            item.y >= mBox.y - 24 &&
            item.y <= mBox.y + mBox.height + 24 &&
            item.x >= mBox.x - 8 &&
            item.x <= mBox.x + mBox.width + 8
        )
        .sort((a, b) => a.x - b.x);

      for (let i = 0; i < measureSlices.length; i++) {
        const slice = measureSlices[i];
        const existing = this.noteSvgMap.get(slice.id);
        if (!existing || existing.length === 0) {
          if (measureNoteheads.length === measureSlices.length) {
            this.noteSvgMap.set(slice.id, [measureNoteheads[i].el]);
          } else if (measureNoteheads.length > 0) {
            const targetX = mBox.x + slice.relativeXInMeasure * mBox.width;
            let closest = measureNoteheads[0];
            let minDiff = Math.abs(closest.x - targetX);
            for (const candidate of measureNoteheads) {
              const diff = Math.abs(candidate.x - targetX);
              if (diff < minDiff) {
                minDiff = diff;
                closest = candidate;
              }
            }
            this.noteSvgMap.set(slice.id, [closest.el]);
          }
        }

        const boundPaths = this.noteSvgMap.get(slice.id) || [];
        for (const p of boundPaths) {
          p.setAttribute('data-slice-id', slice.id);
        }
      }
    }
  }
}
