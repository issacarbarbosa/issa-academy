/**
 * Vetores Oficiais SMuFL (Bravura) para Renderização de Claves Musicais em HTML5 Canvas.
 * Padrão oficial de notação musical (W3C Music Notation Community Group / Steinberg).
 * 
 * Cada coordenada é ancorada matematicamente no sistema de pauta diatônica:
 * - 1 lineGap = 362 unidades SMuFL (BRAVURA_STAFF_SPACE = 362)
 * - Clave de Sol (G-clef): Origem (0, 0) ancorada na 2ª Linha (y2 = staffCenterY + lineGap)
 * - Clave de Fá (F-clef): Origem (0, 0) ancorada na 4ª Linha (y4 = staffCenterY - lineGap)
 * - Clave de Dó (C-clef): Origem (0, 0) ancorada na 3ª Linha (y3 = staffCenterY)
 */

export type PathCommand =
  | ['m', number, number]
  | ['l', number, number]
  | ['b', number, number, number, number, number, number]
  | ['z'];

export const G_CLEF_COMMANDS: PathCommand[] = [["m",541,598],["b",539,615,541,616,550,625],["b",706,770,824,953,824,1174],["b",824,1299,789,1423,730,1509],["b",708,1541,671,1581,655,1581],["b",635,1581,590,1544,562,1512],["b",455,1394,420,1214,420,1064],["b",420,981,431,887,441,828],["b",444,811,445,808,428,793],["b",220,622,0,416,0,125],["b",0,-125,171,-363,524,-363],["b",557,-363,595,-360,624,-354],["b",639,-351,642,-350,645,-367],["b",662,-464,684,-589,684,-657],["b",684,-870,540,-896,455,-896],["b",377,-896,340,-873,340,-854],["b",340,-844,353,-840,386,-829],["b",431,-816,482,-778,482,-694],["b",482,-615,432,-547,344,-547],["b",248,-547,190,-624,190,-713],["b",190,-806,246,-948,464,-948],["b",560,-948,747,-904,747,-660],["b",747,-577,721,-441,706,-351],["b",703,-334,704,-336,724,-327],["b",870,-269,966,-147,966,16],["b",966,200,831,363,619,363],["b",582,363,582,363,577,389],["z"],["m",677,1358],["b",724,1358,763,1319,763,1240],["b",763,1080,626,950,513,851],["b",503,842,497,844,494,863],["b",488,900,485,949,485,995],["b",485,1220,589,1358,677,1358],["z"],["m",520,377],["b",524,350,524,351,498,343],["b",372,300,289,186,289,63],["b",289,-66,357,-158,455,-192],["b",467,-196,484,-200,494,-200],["b",505,-200,511,-193,511,-184],["b",511,-174,500,-170,490,-166],["b",429,-140,386,-78,386,-12],["b",386,71,442,132,530,157],["b",553,163,556,161,559,145],["l",631,-284],["b",634,-300,632,-300,611,-304],["b",588,-308,559,-311,530,-311],["b",278,-311,115,-171,115,29],["b",115,114,130,228,249,363],["b",336,459,402,513,469,567],["b",484,579,487,577,490,562],["z"],["m",619,148],["b",616,166,618,170,635,168],["b",752,158,848,60,848,-66],["b",848,-157,793,-230,713,-271],["b",696,-279,693,-279,690,-262],["z"]];

export const F_CLEF_COMMANDS: PathCommand[] = [["m",363,377],["b",112,377,0,194,0,56],["b",0,-59,60,-158,177,-158],["b",268,-158,330,-95,330,-6],["b",330,86,262,144,192,144],["b",153,144,138,134,120,134],["b",101,134,96,145,96,160],["b",96,217,183,323,330,323],["b",482,323,549,173,549,-53],["b",549,-455,350,-680,14,-871],["b",1,-878,-7,-886,-7,-897],["b",-7,-906,-1,-914,12,-914],["b",19,-914,27,-912,36,-907],["b",390,-734,765,-478,765,-40],["b",765,210,612,377,363,377],["z"],["m",906,259],["b",861,259,827,225,827,180],["b",827,135,861,101,906,101],["b",950,101,985,135,985,180],["b",985,225,950,259,906,259],["z"],["m",907,-102],["b",863,-102,829,-135,829,-180],["b",829,-225,863,-258,907,-258],["b",952,-258,985,-225,985,-180],["b",985,-135,952,-102,907,-102],["z"]];

export const C_CLEF_COMMANDS: PathCommand[] = [["m",331,694],["b",331,714,321,724,301,724],["l",300,724],["b",279,724,269,714,269,694],["l",269,-694],["b",269,-714,279,-724,300,-724],["l",301,-724],["b",321,-724,331,-714,331,-694],["l",331,-63],["b",331,-52,338,-53,344,-55],["b",382,-65,442,-102,472,-265],["b",477,-288,485,-301,500,-301],["b",516,-301,523,-287,530,-262],["b",549,-199,582,-128,684,-128],["b",778,-128,804,-220,804,-409],["b",804,-598,770,-683,651,-683],["b",631,-683,528,-674,528,-644],["b",528,-636,552,-628,567,-622],["b",596,-612,625,-583,625,-528],["b",625,-465,583,-429,527,-429],["b",465,-429,416,-471,416,-547],["b",416,-638,495,-729,667,-729],["b",903,-729,1007,-563,1007,-413],["b",1007,-215,897,-76,706,-76],["b",664,-76,636,-84,618,-89],["b",603,-94,589,-96,576,-88],["b",556,-75,524,-29,524,0],["b",524,29,556,75,576,88],["b",589,96,603,94,618,89],["b",636,84,664,76,706,76],["b",897,76,1007,215,1007,413],["b",1007,563,903,729,667,729],["b",495,729,416,638,416,547],["b",416,471,465,429,527,429],["b",583,429,625,465,625,528],["b",625,583,596,612,567,622],["b",552,628,528,636,528,644],["b",528,674,631,683,651,683],["b",770,683,804,598,804,409],["b",804,220,778,128,684,128],["b",582,128,549,199,530,262],["b",523,287,516,301,500,301],["b",485,301,477,288,472,265],["b",442,102,382,65,344,55],["b",338,53,331,52,331,63],["z"],["m",30,724],["b",10,724,0,714,0,694],["l",0,-694],["b",0,-714,10,-724,30,-724],["l",154,-724],["b",174,-724,184,-714,184,-694],["l",184,694],["b",184,714,174,724,154,724],["z"]];

/**
 * Renderiza um glifo vetorial Bravura no Canvas aplicando escala e inversão de eixo Y.
 * No SMuFL/OpenType, o eixo Y aponta para CIMA, enquanto no Canvas 2D aponta para BAIXO.
 */
export function drawBravuraGlyph(
  ctx: CanvasRenderingContext2D,
  cmds: PathCommand[],
  originX: number,
  originY: number,
  scale: number,
): void {
  ctx.beginPath();
  for (let i = 0; i < cmds.length; i++) {
    const cmd = cmds[i];
    switch (cmd[0]) {
      case 'm':
        ctx.moveTo(originX + cmd[1] * scale, originY - cmd[2] * scale);
        break;
      case 'l':
        ctx.lineTo(originX + cmd[1] * scale, originY - cmd[2] * scale);
        break;
      case 'b':
        ctx.bezierCurveTo(
          originX + cmd[1] * scale,
          originY - cmd[2] * scale,
          originX + cmd[3] * scale,
          originY - cmd[4] * scale,
          originX + cmd[5] * scale,
          originY - cmd[6] * scale,
        );
        break;
      case 'z':
        ctx.closePath();
        break;
    }
  }
  ctx.fill();
}

/**
 * Fator de escala oficial Bravura (SMuFL):
 * Na fonte Bravura em VexFlow, 1 staff space (distância entre duas linhas) equivale a 362 unidades.
 */
export const BRAVURA_STAFF_SPACE = 362;

/**
 * Desenha a Clave de Sol vetorial oficial Bravura na 2ª Linha.
 */
export function drawTrebleClefVector(
  ctx: CanvasRenderingContext2D,
  x: number,
  staffCenterY: number,
  lineGap: number,
): void {
  const scale = lineGap / BRAVURA_STAFF_SPACE;
  // 2ª Linha: staffCenterY + lineGap
  drawBravuraGlyph(ctx, G_CLEF_COMMANDS, x, staffCenterY + lineGap, scale);
}

/**
 * Desenha a Clave de Fá vetorial oficial Bravura na 4ª Linha:
 * - Olho espiral central cravado exatamente na 4ª linha (y = 0)
 * - Curva superior tangenciando suavemente a 5ª linha (y = +362)
 * - Cauda caligráfica descendo até o 1º espaço (acima da 1ª linha)
 * - Exatamente dois pontos posicionados no 4º espaço (+181) e 3º espaço (-181)
 */
export function drawBassClefVector(
  ctx: CanvasRenderingContext2D,
  x: number,
  staffCenterY: number,
  lineGap: number,
): void {
  const scale = lineGap / BRAVURA_STAFF_SPACE;
  // 4ª Linha: staffCenterY - lineGap
  drawBravuraGlyph(ctx, F_CLEF_COMMANDS, x, staffCenterY - lineGap, scale);
}

/**
 * Desenha a Clave de Dó vetorial oficial Bravura na 3ª Linha (Alto Clef):
 * - Haste dupla e traves limitadas cravadas entre a 5ª linha (+724) e 1ª linha (-724)
 * - Vértice central em seta convergindo exatamente sobre a 3ª linha (y = 0, Dó Central)
 * - Dois lóbulos clássicos perfeitamente simétricos contidos no pentagrama
 */
export function drawAltoClefVector(
  ctx: CanvasRenderingContext2D,
  x: number,
  staffCenterY: number,
  lineGap: number,
): void {
  const scale = lineGap / BRAVURA_STAFF_SPACE;
  // 3ª Linha: staffCenterY
  drawBravuraGlyph(ctx, C_CLEF_COMMANDS, x, staffCenterY, scale);
}
