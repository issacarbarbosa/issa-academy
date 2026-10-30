import { MsaClefType, PresetScore } from '../types/music';
import {
  applyMusicXmlReimport,
  applyScoreMetadataUpdate,
  removeScoreClefXml,
} from '../utils/musicMath';

export const HINO_131_XML = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC
    "-//Recordare//DTD MusicXML 3.1 Partwise//EN"
    "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>Hino 131 - Ó Senhor</work-title>
  </work>
  <identification>
    <creator type="composer">Hinário 5 CCB · Cordas</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Soprano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <!-- Measure 1: Re Mi Fa# Sol -->
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key>
          <fifths>1</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>F</step><alter>1</alter><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 2: Sol (half) Fa# (half) -->
    <measure number="2">
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>4</duration>
        <type>half</type>
      </note>
      <note>
        <pitch><step>F</step><alter>1</alter><octave>4</octave></pitch>
        <duration>4</duration>
        <type>half</type>
      </note>
    </measure>
    <!-- Measure 3: Re Re Mi Re -->
    <measure number="3">
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 4: Re (whole) -->
    <measure number="4">
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>8</duration>
        <type>whole</type>
      </note>
    </measure>
    <!-- Measure 5: Mi Fa# Sol Si -->
    <measure number="5">
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>F</step><alter>1</alter><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 6: Si (half) La (half) -->
    <measure number="6">
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>4</duration>
        <type>half</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>4</duration>
        <type>half</type>
      </note>
    </measure>
    <!-- Measure 7: La Mi Fa# Mi -->
    <measure number="7">
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>F</step><alter>1</alter><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 8: Re (half) Si (quarter) La (quarter) -->
    <measure number="8">
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>4</duration>
        <type>half</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 9: Sol (half) Fa# (half) -->
    <measure number="9">
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>4</duration>
        <type>half</type>
      </note>
      <note>
        <pitch><step>F</step><alter>1</alter><octave>4</octave></pitch>
        <duration>4</duration>
        <type>half</type>
      </note>
    </measure>
    <!-- Measure 10: Re Do Si La -->
    <measure number="10">
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 11: Sol (whole) -->
    <measure number="11">
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>8</duration>
        <type>whole</type>
      </note>
      <barline location="right">
        <bar-style>light-heavy</bar-style>
      </barline>
    </measure>
  </part>
</score-partwise>`;

/**
 * Hino 15 - Ó alma que choras (Philip Paul Bliss)
 * Edição: Hinário de Cordas (Violino Soprano/Contralto, Viola em Dó 3ª linha, Violoncelo em Fá)
 * Conforme imagem anexada image_847d6dff.png
 */
export const HINO_015_CORDAS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>Hino 15 - Ó alma que choras (Cordas)</work-title></work>
  <identification><creator type="composer">Philip Paul Bliss</creator></identification>
  <part-list>
    <score-part id="P1"><part-name>Soprano (Clave de Sol)</part-name></score-part>
    <score-part id="P2"><part-name>Tenor (Clave de Dó)</part-name></score-part>
    <score-part id="P3"><part-name>Baixo (Clave de Fá)</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>-2</fifths></key>
        <time><beats>12</beats><beat-type>8</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>Ó</text></lyric></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>al-</text></lyric></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>ma</text></lyric></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>que</text></lyric></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>cho-</text></lyric></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>ras</text></lyric></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><alter>1</alter><octave>4</octave></pitch><duration>2</duration><type>quarter</type><accidental>sharp</accidental><lyric number="1"><text>com</text></lyric></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>gran-</text></lyric></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>de</text></lyric></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>a-</text></lyric></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>mar-</text></lyric></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>gor,</text></lyric></note>
    </measure>
    <measure number="3">
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>Se</text></lyric></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>que-</text></lyric></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>res</text></lyric></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>a-</text></lyric></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>lí-</text></lyric></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>vio,</text></lyric></note>
    </measure>
    <measure number="4">
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>re-</text></lyric></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>cor-</text></lyric></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>re</text></lyric></note>
      <note><pitch><step>F</step><alter>1</alter><octave>4</octave></pitch><duration>1</duration><type>eighth</type><accidental>sharp</accidental><lyric number="1"><text>ao</text></lyric></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>6</duration><type>half</type><dot/><lyric number="1"><text>Senhor.</text></lyric></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>-2</fifths></key>
        <time><beats>12</beats><beat-type>8</beat-type></time>
        <clef><sign>C</sign><line>3</line></clef>
      </attributes>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>F</step><alter>1</alter><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/><accidental>sharp</accidental></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
    </measure>
    <measure number="3">
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>F</step><alter>1</alter><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/><accidental>sharp</accidental></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
    </measure>
    <measure number="4">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P3">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>-2</fifths></key>
        <time><beats>12</beats><beat-type>8</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
    </measure>
    <measure number="3">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
    </measure>
    <measure number="4">
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

/**
 * Hino 15 - Ó alma que choras (Edição Órgão Eletrônico: Mão Direita, Mão Esquerda e Pedaleira)
 * Conforme imagem anexada image_fc4f5393.png
 */
export const HINO_015_ORGAO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>Hino 15 - Ó alma que choras (Órgão)</work-title></work>
  <identification><creator type="composer">Philip Paul Bliss</creator></identification>
  <part-list>
    <score-part id="P1"><part-name>Mão Direita</part-name></score-part>
    <score-part id="P2"><part-name>Mão Esquerda</part-name></score-part>
    <score-part id="P3"><part-name>Pedaleira</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>-2</fifths></key>
        <time><beats>12</beats><beat-type>8</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>Ó</text></lyric></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>al-</text></lyric></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>ma</text></lyric></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>que</text></lyric></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>cho-</text></lyric></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>ras</text></lyric></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><alter>1</alter><octave>4</octave></pitch><duration>2</duration><type>quarter</type><accidental>sharp</accidental><lyric number="1"><text>com</text></lyric></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>gran-</text></lyric></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>de</text></lyric></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>a-</text></lyric></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>mar-</text></lyric></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>gor,</text></lyric></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>-2</fifths></key>
        <time><beats>12</beats><beat-type>8</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P3">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>-2</fifths></key>
        <time><beats>12</beats><beat-type>8</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>6</duration><type>half</type><dot/></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>2</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

/**
 * Hino 15 - Ó alma que choras (Edição Hinário em Dó / Cantado — 2 Pentagramas: Soprano/Contralto + Tenor/Baixo)
 * Conforme imagem anexada image_0845e0a0.png
 */
export const HINO_015_DO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>Hino 15 - Ó alma que choras (Dó)</work-title></work>
  <identification><creator type="composer">Philip Paul Bliss</creator></identification>
  <part-list>
    <score-part id="P1"><part-name>Soprano / Contralto</part-name></score-part>
    <score-part id="P2"><part-name>Tenor / Baixo</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>-2</fifths></key>
        <time><beats>12</beats><beat-type>8</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>Ó</text></lyric></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>al-</text></lyric></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>ma</text></lyric></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>que</text></lyric></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>cho-</text></lyric></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>ras</text></lyric></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><alter>1</alter><octave>4</octave></pitch><duration>2</duration><type>quarter</type><accidental>sharp</accidental><lyric number="1"><text>com</text></lyric></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>gran-</text></lyric></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type><lyric number="1"><text>de</text></lyric></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>1</duration><type>eighth</type><lyric number="1"><text>a-</text></lyric></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>mar-</text></lyric></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/><lyric number="1"><text>gor,</text></lyric></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>-2</fifths></key>
        <time><beats>12</beats><beat-type>8</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>F</step><alter>1</alter><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/><accidental>sharp</accidental></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

/**
 * Hino 15 - Edição em Si bemol (Trompete, Clarinete, Sax Soprano/Tenor)
 */
export const HINO_015_SIB_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>Hino 15 - Ó alma que choras (Si♭)</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Soprano / Tenor (Si♭)</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>12</beats><beat-type>8</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><alter>1</alter><octave>4</octave></pitch><duration>2</duration><type>quarter</type><accidental>sharp</accidental></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

// ============================================================================
// MSA LIÇÕES 1 A 5 — LEITURA RÍTMICA (Sem Clave e Sem Pentagrama)
// Conforme imagens Li__o_1_77aa327d.png a Li__o_5_5c6c517e.png
// ============================================================================

export const MSA_LICAO_01_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 1 — Leitura Rítmica</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>MSA Rítmica</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>16</duration><type>whole</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
    </measure>
    <measure number="5">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="6">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_02_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 2 — Leitura Rítmica com Pausas</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>MSA Rítmica</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><rest/><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><rest/><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
    </measure>
    <measure number="5">
      <note><rest/><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><rest/><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_03_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 3 — Leitura Rítmica com Semicolcheias</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>MSA Rítmica</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><rest/><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><rest/><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>16th</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>16th</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>16th</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>16th</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><rest/><duration>8</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_04_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 4 — Leitura Rítmica Sincopada</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>MSA Rítmica</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><rest/><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>16</duration><type>whole</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_05_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 5 — Leitura Rítmica Combinada</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>MSA Rítmica</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><rest/><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

// ============================================================================
// MSA LIÇÕES DE SOLFEJO (NAS 3 CLAVES OFICIAIS: SOL, DÓ E FÁ)
// Ao selecionar uma Clave ('sol' | 'do' | 'fa'), o sistema busca o MusicXML referente.
// ============================================================================

export const MSA_LICAO_19_SOL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 19 — Solfejo (Clave de Sol)</work-title></work>
  <part-list><score-part id="P1"><part-name>Clave de Sol</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>2</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="5">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="6">
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="7">
      <note><pitch><step>G</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="8">
      <note><pitch><step>F</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="9">
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="10">
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="11">
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
    </measure>
    <measure number="12">
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_19_DO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 19 — Solfejo (Clave de Dó)</work-title></work>
  <part-list><score-part id="P1"><part-name>Clave de Dó</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>2</beats><beat-type>4</beat-type></time>
        <clef><sign>C</sign><line>3</line></clef>
      </attributes>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="5">
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="6">
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="7">
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="8">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="9">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="10">
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="11">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>2</duration><type>eighth</type></note>
    </measure>
    <measure number="12">
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>8</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_19_FA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 19 — Solfejo (Clave de Fá)</work-title></work>
  <part-list><score-part id="P1"><part-name>Clave de Fá</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>2</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>E</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>A</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="5">
      <note><pitch><step>B</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="6">
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="7">
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="8">
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="9">
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="10">
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="11">
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>2</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>eighth</type></note>
    </measure>
    <measure number="12">
      <note><pitch><step>E</step><octave>2</octave></pitch><duration>8</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_20_SOL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 20 — Intervalos (Clave de Sol)</work-title></work>
  <part-list><score-part id="P1"><part-name>Clave de Sol</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>6</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_20_DO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 20 — Intervalos (Clave de Dó)</work-title></work>
  <part-list><score-part id="P1"><part-name>Clave de Dó</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>C</sign><line>3</line></clef>
      </attributes>
      <note><pitch><step>B</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>8</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_20_FA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 20 — Intervalos (Clave de Fá)</work-title></work>
  <part-list><score-part id="P1"><part-name>Clave de Fá</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>B</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>A</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>8</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_21_SOL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 21 — Solfejo e Pausas (Clave de Sol)</work-title></work>
  <part-list><score-part id="P1"><part-name>Clave de Sol</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>8</duration><type>half</type></note>
      <note><rest/><duration>8</duration><type>half</type></note>
    </measure>
    <measure number="3">
      <note><rest/><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><rest/><duration>4</duration><type>quarter</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_21_DO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 21 — Solfejo e Pausas (Clave de Dó)</work-title></work>
  <part-list><score-part id="P1"><part-name>Clave de Dó</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>C</sign><line>3</line></clef>
      </attributes>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><rest/><duration>8</duration><type>half</type></note>
    </measure>
    <measure number="3">
      <note><rest/><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><rest/><duration>4</duration><type>quarter</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_21_FA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 21 — Solfejo e Pausas (Clave de Fá)</work-title></work>
  <part-list><score-part id="P1"><part-name>Clave de Fá</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>E</step><octave>2</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>F</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>8</duration><type>half</type></note>
      <note><rest/><duration>8</duration><type>half</type></note>
    </measure>
    <measure number="3">
      <note><rest/><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>B</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><rest/><duration>4</duration><type>quarter</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_22_SOL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 22 — Solfejo P. Bona (Clave de Sol)</work-title></work>
  <part-list><score-part id="P1"><part-name>Clave de Sol</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><rest/><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>8</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_22_DO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 22 — Solfejo P. Bona (Clave de Dó)</work-title></work>
  <part-list><score-part id="P1"><part-name>Clave de Dó</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>C</sign><line>3</line></clef>
      </attributes>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><rest/><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>8</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const MSA_LICAO_22_FA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>MSA Lição 22 — Solfejo P. Bona (Clave de Fá)</work-title></work>
  <part-list><score-part id="P1"><part-name>Clave de Fá</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>B</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><rest/><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>8</duration><type>half</type></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>8</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

export const PRESET_SCORES: PresetScore[] = [
  // ==========================================================================
  // HINÁRIO 5 CCB (Múltiplas Edições: Cordas, Órgão, Dó, Si♭)
  // ==========================================================================
  {
    id: 'hino-131',
    title: 'Hino 131 - Ó Senhor',
    composer: 'Hinário 5 CCB · Cordas',
    difficulty: 'Cordas · 4/4',
    defaultBpm: 65,
    maxBpm: 80,
    tempoLabel: '♩ = 65 - 80',
    timeSignature: '4/4',
    keySignature: 'Sol Maior',
    description: 'Hino 131 com solfejo acentuado (Dó, Ré, Mi, Fá♯, Sol, Lá, Si).',
    collection: 'hinario5',
    number: 131,
    edition: 'cordas',
    defaultTimbre: 'acoustic-grand',
    voices: [{ id: 'v-soprano', label: 'Soprano (Clave de Sol)', staffIndex: 0 }],
    xml: HINO_131_XML,
  },
  {
    id: 'hino-015-cordas',
    title: 'Hino 15 - Ó alma que choras (Cordas)',
    composer: 'Philip Paul Bliss · Hinário de Cordas',
    difficulty: 'Cordas · 12/8',
    defaultBpm: 112,
    maxBpm: 132,
    tempoLabel: '♪ = 108 - 132',
    timeSignature: '12/8',
    keySignature: 'Sol Menor',
    description: 'Edição Hinário de Cordas com 3 pautas: Soprano (Clave de Sol), Tenor (Clave de Dó) e Baixo (Clave de Fá).',
    collection: 'hinario5',
    number: 15,
    edition: 'cordas',
    defaultTimbre: 'acoustic-grand',
    voices: [
      { id: 'v-soprano', label: 'Soprano (Clave de Sol)', staffIndex: 0 },
      { id: 'v-tenor', label: 'Tenor (Clave de Dó)', staffIndex: 1 },
      { id: 'v-baixo', label: 'Baixo (Clave de Fá)', staffIndex: 2 },
    ],
    xml: HINO_015_CORDAS_XML,
  },
  {
    id: 'hino-015-orgao',
    title: 'Hino 15 - Ó alma que choras (Órgão)',
    composer: 'Philip Paul Bliss · Hinário do Órgão',
    difficulty: 'Órgão · 12/8',
    defaultBpm: 112,
    maxBpm: 132,
    tempoLabel: '♪ = 108 - 132',
    timeSignature: '12/8',
    keySignature: 'Sol Menor',
    description: 'Edição com 3 sistemas independentes: Mão Direita, Mão Esquerda e Pedaleira.',
    collection: 'hinario5',
    number: 15,
    edition: 'orgao',
    defaultTimbre: 'acoustic-grand',
    voices: [
      { id: 'v-md', label: 'Mão Direita (Soprano/Contralto)', staffIndex: 0 },
      { id: 'v-me', label: 'Mão Esquerda (Tenor)', staffIndex: 1 },
      { id: 'v-ped', label: 'Pedaleira (Baixo)', staffIndex: 2 },
    ],
    xml: HINO_015_ORGAO_XML,
  },
  {
    id: 'hino-015-do',
    title: 'Hino 15 - Ó alma que choras (Dó)',
    composer: 'Philip Paul Bliss · Hinário em Dó',
    difficulty: 'Hinário em Dó · 12/8',
    defaultBpm: 112,
    maxBpm: 132,
    tempoLabel: '♪ = 108 - 132',
    timeSignature: '12/8',
    keySignature: 'Sol Menor',
    description: 'Edição em Dó com pauta dupla (Clave de Sol e Clave de Fá) e letra para estudo de vozes.',
    collection: 'hinario5',
    number: 15,
    edition: 'do',
    defaultTimbre: 'acoustic-grand',
    voices: [
      { id: 'v-sup', label: 'Soprano / Contralto (Clave de Sol)', staffIndex: 0 },
      { id: 'v-inf', label: 'Tenor / Baixo (Clave de Fá)', staffIndex: 1 },
    ],
    xml: HINO_015_DO_XML,
  },
  {
    id: 'hino-015-sib',
    title: 'Hino 15 - Ó alma que choras (Si♭)',
    composer: 'Philip Paul Bliss · Hinário em Si♭',
    difficulty: 'Hinário em Si♭ · 12/8',
    defaultBpm: 112,
    maxBpm: 132,
    tempoLabel: '♪ = 108 - 132',
    timeSignature: '12/8',
    keySignature: 'Lá Menor (Transposto Si♭)',
    description: 'Edição transposta em Si bemol.',
    collection: 'hinario5',
    number: 15,
    edition: 'sib',
    defaultTimbre: 'acoustic-grand',
    voices: [{ id: 'v-sib', label: 'Voz Principal em Si♭', staffIndex: 0 }],
    xml: HINO_015_SIB_XML,
  },

  // ==========================================================================
  // MSA — MÉTODO SIMPLIFICADO DE APRENDIZAGEM MUSICAL (Listadas em sequência)
  // ==========================================================================
  {
    id: 'msa-licao-001',
    title: 'MSA — Lição 1',
    composer: 'MSA CCB · Fase 2',
    difficulty: 'MSA · 4/4',
    defaultBpm: 60,
    tempoLabel: '♩ = 60',
    timeSignature: '4/4',
    keySignature: 'Sem Clave',
    description: 'Figuras de semínima, mínima, semibreve e colcheias em compasso quaternário.',
    collection: 'msa',
    number: 1,
    msaPhase: 'ritmica',
    defaultTimbre: 'acoustic-grand',
    xml: MSA_LICAO_01_XML,
  },
  {
    id: 'msa-licao-002',
    title: 'MSA — Lição 2',
    composer: 'MSA CCB · Fase 2',
    difficulty: 'MSA · 4/4',
    defaultBpm: 60,
    tempoLabel: '♩ = 60',
    timeSignature: '4/4',
    keySignature: 'Sem Clave',
    description: 'Estudo com pausas de colcheia e semínima em compasso quaternário.',
    collection: 'msa',
    number: 2,
    msaPhase: 'ritmica',
    defaultTimbre: 'acoustic-grand',
    xml: MSA_LICAO_02_XML,
  },
  {
    id: 'msa-licao-003',
    title: 'MSA — Lição 3',
    composer: 'MSA CCB · Fase 3',
    difficulty: 'MSA · 4/4',
    defaultBpm: 60,
    tempoLabel: '♩ = 60',
    timeSignature: '4/4',
    keySignature: 'Sem Clave',
    description: 'Subdivisões em colcheias, semicolcheias e pausas em compasso quaternário.',
    collection: 'msa',
    number: 3,
    msaPhase: 'ritmica',
    defaultTimbre: 'acoustic-grand',
    xml: MSA_LICAO_03_XML,
  },
  {
    id: 'msa-licao-004',
    title: 'MSA — Lição 4',
    composer: 'MSA CCB · Fase 3',
    difficulty: 'MSA · 4/4',
    defaultBpm: 60,
    tempoLabel: '♩ = 60',
    timeSignature: '4/4',
    keySignature: 'Sem Clave',
    description: 'Combinação de mínimas, semínimas, colcheias e pausas no tempo e contratempo.',
    collection: 'msa',
    number: 4,
    msaPhase: 'ritmica',
    defaultTimbre: 'acoustic-grand',
    xml: MSA_LICAO_04_XML,
  },
  {
    id: 'msa-licao-005',
    title: 'MSA — Lição 5',
    composer: 'MSA CCB · Fase 3',
    difficulty: 'MSA · 4/4',
    defaultBpm: 60,
    tempoLabel: '♩ = 60',
    timeSignature: '4/4',
    keySignature: 'Sem Clave',
    description: 'Agrupamentos de colcheias e semicolcheias para firmeza de pulsação.',
    collection: 'msa',
    number: 5,
    msaPhase: 'ritmica',
    defaultTimbre: 'acoustic-grand',
    xml: MSA_LICAO_05_XML,
  },
  {
    id: 'msa-licao-019',
    title: 'MSA — Lição 19',
    composer: 'MSA CCB · P. Bona',
    difficulty: 'MSA · 2/4',
    defaultBpm: 100,
    maxBpm: 144,
    tempoLabel: '♩ = 100 - 144',
    timeSignature: '2/4',
    keySignature: '3 Claves (Sol, Dó, Fá)',
    description: 'Disponível nas 3 claves oficiais utilizadas no hinário (Clave de Sol, Clave de Dó e Clave de Fá).',
    collection: 'msa',
    number: 19,
    msaPhase: 'solfejo',
    defaultClef: 'sol',
    defaultTimbre: 'acoustic-grand',
    xml: MSA_LICAO_19_SOL_XML,
    xmlByClef: {
      sol: MSA_LICAO_19_SOL_XML,
      do: MSA_LICAO_19_DO_XML,
      fa: MSA_LICAO_19_FA_XML,
    },
  },
  {
    id: 'msa-licao-020',
    title: 'MSA — Lição 20',
    composer: 'MSA CCB · P. Bona',
    difficulty: 'MSA · 4/4',
    defaultBpm: 76,
    maxBpm: 100,
    tempoLabel: '♩ = 60 - 100',
    timeSignature: '4/4',
    keySignature: '3 Claves (Sol, Dó, Fá)',
    description: 'Estudo de intervalos disponível em Clave de Sol, Clave de Dó e Clave de Fá.',
    collection: 'msa',
    number: 20,
    msaPhase: 'solfejo',
    defaultClef: 'sol',
    defaultTimbre: 'acoustic-grand',
    xml: MSA_LICAO_20_SOL_XML,
    xmlByClef: {
      sol: MSA_LICAO_20_SOL_XML,
      do: MSA_LICAO_20_DO_XML,
      fa: MSA_LICAO_20_FA_XML,
    },
  },
  {
    id: 'msa-licao-021',
    title: 'MSA — Lição 21',
    composer: 'MSA CCB · P. Bona',
    difficulty: 'MSA · 4/4',
    defaultBpm: 80,
    maxBpm: 100,
    tempoLabel: '♩ = 60 - 100',
    timeSignature: '4/4',
    keySignature: '3 Claves (Sol, Dó, Fá)',
    description: 'Estudo com mínimas, semínimas e pausas disponível em Clave de Sol, Clave de Dó e Clave de Fá.',
    collection: 'msa',
    number: 21,
    msaPhase: 'solfejo',
    defaultClef: 'sol',
    defaultTimbre: 'acoustic-grand',
    xml: MSA_LICAO_21_SOL_XML,
    xmlByClef: {
      sol: MSA_LICAO_21_SOL_XML,
      do: MSA_LICAO_21_DO_XML,
      fa: MSA_LICAO_21_FA_XML,
    },
  },
  {
    id: 'msa-licao-022',
    title: 'MSA — Lição 22',
    composer: 'MSA CCB · P. Bona',
    difficulty: 'MSA · 4/4',
    defaultBpm: 84,
    maxBpm: 100,
    tempoLabel: '♩ = 60 - 100',
    timeSignature: '4/4',
    keySignature: '3 Claves (Sol, Dó, Fá)',
    description: 'Exercício progressivo disponível em Clave de Sol, Clave de Dó e Clave de Fá.',
    collection: 'msa',
    number: 22,
    msaPhase: 'solfejo',
    defaultClef: 'sol',
    defaultTimbre: 'acoustic-grand',
    xml: MSA_LICAO_22_SOL_XML,
    xmlByClef: {
      sol: MSA_LICAO_22_SOL_XML,
      do: MSA_LICAO_22_DO_XML,
      fa: MSA_LICAO_22_FA_XML,
    },
  },
];

const CATALOG_STORAGE_KEY = 'slicescore_catalog_v2';
const HIDDEN_PRESETS_STORAGE_KEY = 'slicescore_hidden_presets_v1';

export function loadHiddenPresetIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HIDDEN_PRESETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function persistHiddenPresetIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HIDDEN_PRESETS_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // Ignore storage errors
  }
}

function mergeSavedScoresWithPresets(savedList: PresetScore[], hiddenIds: string[] = []): PresetScore[] {
  const hiddenSet = new Set(hiddenIds);
  const savedMap = new Map<string, PresetScore>();
  for (const item of savedList) {
    if (item && typeof item.id === 'string') {
      savedMap.set(item.id, item);
    }
  }

  const mergedPresets = PRESET_SCORES.filter((preset) => !hiddenSet.has(preset.id)).map((preset) => {
    const override = savedMap.get(preset.id);
    if (!override) return preset;
    savedMap.delete(preset.id);
    return {
      ...preset,
      ...override,
      defaultTimbre: 'acoustic-grand' as const,
      voices: preset.voices ?? override.voices,
      xmlByClef: override.xmlByClef
        ? override.xmlByClef
        : preset.xmlByClef,
      hasAdminOverride: true,
    };
  });

  const customAdditions = Array.from(savedMap.values())
    .filter((c) => !hiddenSet.has(c.id))
    .map((c) => ({
      ...c,
      defaultTimbre: 'acoustic-grand' as const,
    }));
  return [...mergedPresets, ...customAdditions];
}

/**
 * Carrega o catálogo completo combinando os itens padrão (PRESET_SCORES)
 * com eventuais substituições de MusicXML (overrides do administrador), novas importações e exclusões salvas no localStorage.
 */
export function loadCatalogFromStorage(): PresetScore[] {
  if (typeof window === 'undefined') return PRESET_SCORES;
  const hiddenIds = loadHiddenPresetIds();
  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return mergeSavedScoresWithPresets([], hiddenIds);
    const savedList: PresetScore[] = JSON.parse(raw);
    if (!Array.isArray(savedList)) return mergeSavedScoresWithPresets([], hiddenIds);
    return mergeSavedScoresWithPresets(savedList, hiddenIds);
  } catch {
    return mergeSavedScoresWithPresets([], hiddenIds);
  }
}

/**
 * Sincroniza o catálogo de partituras customizadas com o Supabase (quando configurado)
 * mantendo cache local em localStorage.
 */
export async function fetchCatalogFromSupabase(): Promise<PresetScore[] | null> {
  try {
    if (
      typeof window !== 'undefined' &&
      window.localStorage.getItem('issa_musicxml_cloud_enabled') !== 'true'
    ) {
      return null;
    }
    const { supabase, isSupabaseConfigured } = await import(
      '../../../core/services/supabaseClient'
    );
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('musicxml_scores')
      .select('id, payload');
    if (error || !data || data.length === 0) return null;
    const cloudList: PresetScore[] = data
      .map((row: { id: string; payload: PresetScore }) => row.payload)
      .filter(Boolean);
    if (cloudList.length === 0) return null;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(cloudList));
    }
    return mergeSavedScoresWithPresets(cloudList, loadHiddenPresetIds());
  } catch {
    return null;
  }
}

async function syncScoreRecordToSupabase(score: PresetScore | null, deleteId?: string): Promise<void> {
  try {
    if (
      typeof window !== 'undefined' &&
      window.localStorage.getItem('issa_musicxml_cloud_enabled') !== 'true'
    ) {
      return;
    }
    const { supabase, isSupabaseConfigured } = await import(
      '../../../core/services/supabaseClient'
    );
    if (!isSupabaseConfigured || !supabase) return;
    if (deleteId) {
      await supabase.from('musicxml_scores').delete().eq('id', deleteId);
      return;
    }
    if (score) {
      await supabase.from('musicxml_scores').upsert({
        id: score.id,
        payload: score,
        updated_at: new Date().toISOString(),
      });
    }
  } catch {
    // Fallback silencioso para localStorage
  }
}

export function persistCatalogToStorage(catalog: PresetScore[]): void {
  if (typeof window === 'undefined') return;
  try {
    const toPersist = catalog.filter(
      (item) => item.isCustomCreated || item.hasAdminOverride
    );
    window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(toPersist));
  } catch {
    // Ignore storage quota errors
  }
}

export function reimportScoreMusicXmlInStorage(
  currentCatalog: PresetScore[],
  scoreId: string,
  newXml: string,
  targetClef?: MsaClefType
): PresetScore[] {
  const updated = applyMusicXmlReimport(
    currentCatalog,
    scoreId,
    newXml,
    targetClef
  );
  persistCatalogToStorage(updated);
  const changed = updated.find((s) => s.id === scoreId) ?? null;
  void syncScoreRecordToSupabase(changed);
  return updated;
}

export function addImportedScoreToStorage(
  currentCatalog: PresetScore[],
  newScore: PresetScore
): PresetScore[] {
  // Se este ID estava oculto na lista de presets, reativa-o
  const hiddenIds = loadHiddenPresetIds().filter((id) => id !== newScore.id);
  persistHiddenPresetIds(hiddenIds);

  const enriched: PresetScore = {
    ...newScore,
    isCustomCreated: true,
    hasAdminOverride: true,
    updatedAt: new Date().toISOString(),
  };
  const filtered = currentCatalog.filter((s) => s.id !== newScore.id);
  const updated = [...filtered, enriched];
  persistCatalogToStorage(updated);
  void syncScoreRecordToSupabase(enriched);
  return updated;
}

export function restoreDefaultScoreInStorage(
  currentCatalog: PresetScore[],
  scoreId: string
): PresetScore[] {
  const original = PRESET_SCORES.find((p) => p.id === scoreId);
  const updated = original
    ? currentCatalog.map((item) => (item.id === scoreId ? { ...original } : item))
    : currentCatalog.filter((item) => item.id !== scoreId);
  persistCatalogToStorage(updated);
  void syncScoreRecordToSupabase(null, scoreId);
  return updated;
}

/**
 * Exclui qualquer partitura ou hino do catálogo (incluindo itens de fábrica, que ficam marcados em hiddenPresetIds
 * e podem ser restaurados quando o administrador desejar).
 */
export function deleteScoreFromStorage(
  currentCatalog: PresetScore[],
  scoreId: string
): PresetScore[] {
  const isFactoryPreset = PRESET_SCORES.some((p) => p.id === scoreId);
  if (isFactoryPreset) {
    const hidden = loadHiddenPresetIds();
    if (!hidden.includes(scoreId)) {
      persistHiddenPresetIds([...hidden, scoreId]);
    }
  }
  const updated = currentCatalog.filter((s) => s.id !== scoreId);
  persistCatalogToStorage(updated);
  void syncScoreRecordToSupabase(null, scoreId);
  return updated;
}

/**
 * Restaura todas as partituras de fábrica que haviam sido ocultadas/excluídas pelo administrador.
 */
export function restoreHiddenFactoryScoresInStorage(): PresetScore[] {
  persistHiddenPresetIds([]);
  return loadCatalogFromStorage();
}

/**
 * Atualiza metadados (título, número, BPM, compasso, edição/modalidade) de uma partitura no catálogo.
 */
export function updateScoreMetadataInStorage(
  currentCatalog: PresetScore[],
  scoreId: string,
  updates: {
    title?: string;
    number?: number;
    defaultBpm?: number;
    timeSignature?: string;
    msaPhase?: 'ritmica' | 'solfejo';
    edition?: PresetScore['edition'];
    composer?: string;
    description?: string;
  }
): PresetScore[] {
  const updated = applyScoreMetadataUpdate(currentCatalog, scoreId, updates);
  persistCatalogToStorage(updated);
  const changed = updated.find((s) => s.id === scoreId) ?? null;
  void syncScoreRecordToSupabase(changed);
  return updated;
}

/**
 * Remove o MusicXML de uma clave específica ('sol' | 'do' | 'fa') de uma lição de Solfejo do MSA.
 */
export function removeScoreClefInStorage(
  currentCatalog: PresetScore[],
  scoreId: string,
  clefToRemove: MsaClefType
): PresetScore[] {
  const updated = removeScoreClefXml(currentCatalog, scoreId, clefToRemove);
  persistCatalogToStorage(updated);
  const changed = updated.find((s) => s.id === scoreId) ?? null;
  void syncScoreRecordToSupabase(changed);
  return updated;
}

/**
 * Exporta (faz download local) do arquivo .musicxml de uma partitura ou clave específica.
 */
export function downloadScoreMusicXmlFile(
  score: PresetScore,
  clef?: MsaClefType
): void {
  if (typeof window === 'undefined') return;
  const xmlContent =
    clef && score.xmlByClef?.[clef] ? score.xmlByClef[clef]! : score.xml;
  if (!xmlContent) return;
  const blob = new Blob([xmlContent], { type: 'application/vnd.recordare.musicxml+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const suffix = clef ? `-${clef}` : '';
  a.download = `${score.id}${suffix}.musicxml`;
  a.click();
  URL.revokeObjectURL(url);
}



