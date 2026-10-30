import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampBpm,
  midiToFrequency,
  midiToNoteName,
  beatsToSeconds,
  secondsToBeats,
  formatTime,
  normalizeLoopRange,
  getLoopBeatBounds,
  formatLoopBeatRange,
  advanceBeatWithLoop,
  findActiveMeasureAtBeat,
  computePianoPartialFrequency,
  findNearestSampleMidi,
  midiToPedagogicalAnnotation,
  midiToViolinFingerboardPosition,
  formatRhythmCount,
  computeNextSpeedTrainingBpm,
  MSA_OFFICIAL_CLEFS,
  CCB_ORCHESTRA_INSTRUMENTS,
  resolveScoreXmlForClef,
  applyMusicXmlReimport,
  groupHymnsByNumber,
  extractMusicXmlMetadata,
  applyScoreMetadataUpdate,
  removeScoreClefXml,
} from './musicMath';
import { PresetScore } from '../types/music';

const sampleMeasures = [
  { measureNumber: 1, startBeatInScore: 0, durationBeats: 4 },
  { measureNumber: 2, startBeatInScore: 4, durationBeats: 4 },
  { measureNumber: 3, startBeatInScore: 8, durationBeats: 4 },
  { measureNumber: 4, startBeatInScore: 12, durationBeats: 4 },
  { measureNumber: 5, startBeatInScore: 16, durationBeats: 4 },
];

test('clampBpm enforces 30 to 240 BPM limits', () => {
  assert.equal(clampBpm(10), 30);
  assert.equal(clampBpm(300), 240);
  assert.equal(clampBpm(120.4), 120);
});

test('midiToFrequency and midiToNoteName compute standard concert pitch', () => {
  assert.equal(midiToFrequency(69), 440);
  assert.equal(midiToFrequency(60), 261.626);
  assert.equal(midiToNoteName(60), 'C4');
  assert.equal(midiToNoteName(69), 'A4');
});

test('beatsToSeconds and secondsToBeats convert accurately across BPMs', () => {
  assert.equal(beatsToSeconds(8, 120), 4);
  assert.equal(secondsToBeats(4, 120), 8);
  assert.equal(beatsToSeconds(4, 60), 4);
});

test('formatTime outputs tabular MM:SS and MM:SS.d strings', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(65.4), '01:05');
  assert.equal(formatTime(65.4, true), '01:05.4');
});

test('normalizeLoopRange orders and clamps measure numbers', () => {
  assert.deepEqual(normalizeLoopRange(5, 3, 8), { startMeasure: 3, endMeasure: 5 });
  assert.deepEqual(normalizeLoopRange(0, 99, 8), { startMeasure: 1, endMeasure: 8 });
});

test('advanceBeatWithLoop wraps seamlessly from end of measure 5 to start of measure 3', () => {
  const loop = { enabled: true, startMeasure: 3, endMeasure: 5 };
  const bounds = getLoopBeatBounds(loop, sampleMeasures, 20);
  assert.deepEqual(bounds, { startBeat: 8, endBeat: 20 });

  const step = advanceBeatWithLoop(19.8, 0.5, loop, sampleMeasures, 20);
  assert.equal(step.wrappedLoop, true);
  assert.equal(step.reachedEnd, false);
  assert.ok(Math.abs(step.nextBeat - 8.3) < 1e-6);
});

test('sub-measure beat loop starts on 3rd beat of Measure 1 and ends after 2nd beat of Measure 3', () => {
  const subLoop = {
    enabled: true,
    startMeasure: 1,
    endMeasure: 3,
    startBeat: 2.0,
    endBeat: 10.0,
  };
  const bounds = getLoopBeatBounds(subLoop, sampleMeasures, 20);
  assert.deepEqual(bounds, { startBeat: 2, endBeat: 10 });
  assert.equal(formatLoopBeatRange(subLoop, sampleMeasures, 20), 'C1.3–C3.2');

  const step = advanceBeatWithLoop(9.9, 0.3, subLoop, sampleMeasures, 20);
  assert.equal(step.wrappedLoop, true);
  assert.ok(Math.abs(step.nextBeat - 2.2) < 1e-6);
});

test('findActiveMeasureAtBeat identifies the right measure across boundaries', () => {
  assert.equal(findActiveMeasureAtBeat(sampleMeasures, 0)?.measureNumber, 1);
  assert.equal(findActiveMeasureAtBeat(sampleMeasures, 3.9)?.measureNumber, 1);
  assert.equal(findActiveMeasureAtBeat(sampleMeasures, 4.0)?.measureNumber, 2);
  assert.equal(findActiveMeasureAtBeat(sampleMeasures, 11.5)?.measureNumber, 3);
});

test('computePianoPartialFrequency models real piano string stiffness inharmonicity', () => {
  const f1 = computePianoPartialFrequency(440, 1, 0.0004);
  const f2 = computePianoPartialFrequency(440, 2, 0.0004);
  assert.ok(f1 > 440 && f1 < 441);
  assert.ok(f2 > 880.5 && f2 < 882);
});

test('findNearestSampleMidi selects closest multi-sample and computes exact pitch playbackRate', () => {
  const samples = [48, 54, 60, 66, 72];
  const resExact = findNearestSampleMidi(60, samples);
  assert.equal(resExact.sampleMidi, 60);
  assert.equal(resExact.playbackRate, 1);

  const resUp2 = findNearestSampleMidi(62, samples);
  assert.equal(resUp2.sampleMidi, 60);
  assert.ok(Math.abs(resUp2.playbackRate - Math.pow(2, 2 / 12)) < 1e-5);
});

test('midiToPedagogicalAnnotation outputs Portuguese accented solfege (Dó, Ré, Mi, Fá♯, Sol, Lá, Si) and colored fingerings', () => {
  assert.deepEqual(midiToPedagogicalAnnotation(62), {
    solfege: 'Ré',
    finger: '0',
    color: '#2563EB',
    circled: false,
  });
  assert.deepEqual(midiToPedagogicalAnnotation(64), {
    solfege: 'Mi',
    finger: '1',
    color: '#2563EB',
    circled: false,
  });
  assert.deepEqual(midiToPedagogicalAnnotation(65), {
    solfege: 'Fá',
    finger: '2',
    color: '#2563EB',
    circled: false,
  });
  assert.deepEqual(midiToPedagogicalAnnotation(66), {
    solfege: 'Fá♯',
    finger: '2',
    color: '#2563EB',
    circled: false,
  });
  assert.deepEqual(midiToPedagogicalAnnotation(67), {
    solfege: 'Sol',
    finger: '3',
    color: '#2563EB',
    circled: false,
  });
  assert.deepEqual(midiToPedagogicalAnnotation(69), {
    solfege: 'Lá',
    finger: '0',
    color: '#DC2626',
    circled: false,
  });
  assert.deepEqual(midiToPedagogicalAnnotation(71), {
    solfege: 'Si',
    finger: '1',
    color: '#DC2626',
    circled: false,
  });
  assert.deepEqual(midiToPedagogicalAnnotation(72), {
    solfege: 'Dó',
    finger: '2',
    color: '#DC2626',
    circled: true,
  });
});

test('midiToViolinFingerboardPosition maps MIDI notes to Sol, Ré, Lá, Mi strings and fingers', () => {
  const openD = midiToViolinFingerboardPosition(62);
  assert.equal(openD.stringNamePt, 'Ré');
  assert.equal(openD.finger, 0);
  assert.equal(openD.semitonesFromNut, 0);
  assert.equal(openD.solfege, 'Ré');

  const fSharp4 = midiToViolinFingerboardPosition(66);
  assert.equal(fSharp4.stringNamePt, 'Ré');
  assert.equal(fSharp4.finger, 2);
  assert.equal(fSharp4.semitonesFromNut, 4);
  assert.equal(fSharp4.solfege, 'Fá♯');

  const b4OnA = midiToViolinFingerboardPosition(71);
  assert.equal(b4OnA.stringNamePt, 'Lá');
  assert.equal(b4OnA.finger, 1);
  assert.equal(b4OnA.semitonesFromNut, 2);
  assert.equal(b4OnA.solfege, 'Si');
});

test('formatRhythmCount and computeNextSpeedTrainingBpm work as expected', () => {
  assert.equal(formatRhythmCount(0), '1');
  assert.equal(formatRhythmCount(0.5), '+');
  assert.equal(formatRhythmCount(1.0), '2');
  assert.equal(formatRhythmCount(2.5), '+');

  assert.equal(
    computeNextSpeedTrainingBpm(70, {
      enabled: true,
      initialBpm: 70,
      finalBpm: 100,
      incrementBpm: 10,
    }),
    80
  );
  assert.equal(
    computeNextSpeedTrainingBpm(95, {
      enabled: true,
      initialBpm: 70,
      finalBpm: 100,
      incrementBpm: 10,
    }),
    100
  );
});

test('MSA_OFFICIAL_CLEFS defines strictly the 3 official CCB clefs (Sol 2ª linha, Dó 3ª linha, Fá 4ª linha) with universal glyphs', () => {
  assert.equal(MSA_OFFICIAL_CLEFS.length, 3);
  assert.deepEqual(
    MSA_OFFICIAL_CLEFS.map((c) => c.value),
    ['sol', 'do', 'fa']
  );
  assert.deepEqual(
    MSA_OFFICIAL_CLEFS.map((c) => c.shortLabel),
    ['𝄞 Sol', '𝄡 Dó', '𝄢 Fá']
  );
  assert.equal(MSA_OFFICIAL_CLEFS[0].staffLineLabel, '2ª linha');
  assert.equal(MSA_OFFICIAL_CLEFS[1].staffLineLabel, '3ª linha');
  assert.equal(MSA_OFFICIAL_CLEFS[2].staffLineLabel, '4ª linha');
});

test('resolveScoreXmlForClef and applyMusicXmlReimport fetch and replace the MusicXML per clef or score', () => {
  const mockSolfejoLesson: PresetScore = {
    id: 'msa-licao-019',
    title: 'MSA Lição 19',
    composer: 'MSA CCB',
    difficulty: 'Solfejo · 2/4',
    defaultBpm: 100,
    timeSignature: '2/4',
    keySignature: 'Dó Maior',
    description: 'Lição de solfejo nas 3 claves',
    collection: 'msa',
    number: 19,
    msaPhase: 'solfejo',
    xml: '<xml-sol-default/>',
    xmlByClef: {
      sol: '<xml-clave-sol/>',
      do: '<xml-clave-do/>',
      fa: '<xml-clave-fa/>',
    },
  };

  assert.equal(resolveScoreXmlForClef(mockSolfejoLesson, 'sol'), '<xml-clave-sol/>');
  assert.equal(resolveScoreXmlForClef(mockSolfejoLesson, 'do'), '<xml-clave-do/>');
  assert.equal(resolveScoreXmlForClef(mockSolfejoLesson, 'fa'), '<xml-clave-fa/>');

  const updatedCatalog = applyMusicXmlReimport(
    [mockSolfejoLesson],
    'msa-licao-019',
    '<xml-clave-do-atualizado/>',
    'do',
    '2026-10-28T00:00:00Z'
  );
  assert.equal(resolveScoreXmlForClef(updatedCatalog[0], 'do'), '<xml-clave-do-atualizado/>');
  assert.equal(resolveScoreXmlForClef(updatedCatalog[0], 'sol'), '<xml-clave-sol/>');
  assert.equal(updatedCatalog[0].hasAdminOverride, true);

  // Rhythmic lesson normalization to 1st space (F4) on import and lookup
  const mockRhythmicLesson: PresetScore = {
    id: 'msa-licao-001',
    title: 'MSA Lição 1',
    composer: 'MSA CCB',
    difficulty: '4/4',
    defaultBpm: 60,
    timeSignature: '4/4',
    keySignature: 'Sem Clave',
    description: '',
    collection: 'msa',
    number: 1,
    msaPhase: 'ritmica',
    xml: '<score-partwise><part id="P1"><measure number="1"><attributes><clef><sign>percussion</sign></clef><staff-details><staff-lines>1</staff-lines></staff-details></attributes><note><unpitched><display-step>B</display-step><display-octave>4</display-octave></unpitched><duration>4</duration><type>quarter</type><stem>down</stem></note></measure></part></score-partwise>',
  };

  const resolvedRhythmic = resolveScoreXmlForClef(mockRhythmicLesson, 'sol');
  assert.ok(resolvedRhythmic.includes('<pitch><step>F</step><octave>4</octave></pitch>'));
  assert.ok(resolvedRhythmic.includes('<clef><sign>G</sign><line>2</line></clef>'));
  assert.ok(resolvedRhythmic.includes('<stem>up</stem>'));
  assert.ok(!resolvedRhythmic.includes('<unpitched>'));
  assert.ok(!resolvedRhythmic.includes('<staff-details>'));
});

test('groupHymnsByNumber groups multiple editions of the same hymn cleanly and CCB_ORCHESTRA_INSTRUMENTS is complete', () => {
  const families = new Set(CCB_ORCHESTRA_INSTRUMENTS.map((i) => i.family));
  assert.ok(families.has('Teclados'));
  assert.ok(families.has('Cordas'));
  assert.ok(families.has('Madeiras'));
  assert.ok(families.has('Metais'));

  const mockHymns: PresetScore[] = [
    {
      id: 'hino-015-sib',
      title: 'Hino 15 - Ó alma que choras (Si♭)',
      composer: 'Philip Paul Bliss',
      difficulty: '12/8',
      defaultBpm: 112,
      timeSignature: '12/8',
      keySignature: 'Sol Menor',
      description: '',
      collection: 'hinario5',
      number: 15,
      edition: 'sib',
      xml: '<sib/>',
    },
    {
      id: 'hino-015-cordas',
      title: 'Hino 15 - Ó alma que choras (Cordas)',
      composer: 'Philip Paul Bliss',
      difficulty: '12/8',
      defaultBpm: 112,
      timeSignature: '12/8',
      keySignature: 'Sol Menor',
      description: '',
      collection: 'hinario5',
      number: 15,
      edition: 'cordas',
      xml: '<cordas/>',
    },
  ];

  const grouped = groupHymnsByNumber(mockHymns);
  assert.equal(grouped.length, 1);
  assert.equal(grouped[0].hymnNumber, 15);
  assert.equal(grouped[0].baseTitle, 'Hino 15 - Ó alma que choras');
  assert.deepEqual(
    grouped[0].editions.map((e) => e.edition),
    ['cordas', 'sib']
  );
});

test('extractMusicXmlMetadata auto-detects title, time signature, BPM, clef, collection, and number from MusicXML and filename', () => {
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA — Lição 23</work-title></work>
  <part id="P1">
    <measure number="1">
      <attributes>
        <time><beats>3</beats><beat-type>4</beat-type></time>
        <clef><sign>C</sign><line>3</line></clef>
      </attributes>
      <direction>
        <direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>88</per-minute></metronome></direction-type>
      </direction>
    </measure>
  </part>
</score-partwise>`;

  const meta = extractMusicXmlMetadata(sampleXml, 'licao-23-do.musicxml');
  assert.equal(meta.title, 'MSA — Lição 23');
  assert.equal(meta.timeSignature, '3/4');
  assert.equal(meta.defaultBpm, 88);
  assert.equal(meta.detectedClef, 'do');
  assert.equal(meta.detectedNumber, 23);
  assert.equal(meta.detectedCollection, 'msa');
  assert.equal(meta.isRhythmicUnpitched, false);

  const hymnMeta = extractMusicXmlMetadata(
    '<score-partwise><movement-title>Hino 45</movement-title><sound tempo="112"/></score-partwise>',
    'hino_45_cordas.xml'
  );
  assert.equal(hymnMeta.title, 'Hino 45');
  assert.equal(hymnMeta.defaultBpm, 112);
  assert.equal(hymnMeta.detectedCollection, 'hinario5');
  assert.equal(hymnMeta.detectedNumber, 45);
});

test('applyScoreMetadataUpdate and removeScoreClefXml update score metadata and clef XML safely', () => {
  const mockCatalog: PresetScore[] = [
    {
      id: 'msa-licao-019',
      title: 'MSA — Lição 19',
      composer: 'MSA CCB',
      difficulty: 'MSA · 2/4',
      defaultBpm: 100,
      tempoLabel: '♩ = 100',
      timeSignature: '2/4',
      keySignature: '3 Claves',
      description: 'Original',
      collection: 'msa',
      number: 19,
      msaPhase: 'solfejo',
      defaultClef: 'sol',
      xml: '<sol/>',
      xmlByClef: {
        sol: '<sol/>',
        do: '<do/>',
        fa: '<fa/>',
      },
    },
  ];

  const updatedMeta = applyScoreMetadataUpdate(
    mockCatalog,
    'msa-licao-019',
    {
      title: 'MSA — Lição 19 (Revisada)',
      defaultBpm: 92,
      timeSignature: '3/4',
      number: 25,
    },
    '2026-10-29T00:00:00Z'
  );

  assert.equal(updatedMeta[0].title, 'MSA — Lição 19 (Revisada)');
  assert.equal(updatedMeta[0].defaultBpm, 92);
  assert.equal(updatedMeta[0].tempoLabel, '♩ = 92');
  assert.equal(updatedMeta[0].timeSignature, '3/4');
  assert.equal(updatedMeta[0].difficulty, 'MSA · 3/4');
  assert.equal(updatedMeta[0].number, 25);
  assert.equal(updatedMeta[0].hasAdminOverride, true);

  const afterRemoveSol = removeScoreClefXml(updatedMeta, 'msa-licao-019', 'sol');
  assert.equal(afterRemoveSol[0].xmlByClef?.sol, undefined);
  assert.equal(afterRemoveSol[0].defaultClef, 'do');
  assert.equal(afterRemoveSol[0].xml, '<do/>');
});

