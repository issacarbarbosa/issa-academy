export interface CourseItem {
  id: string;
  title: string;
  page?: string;
  completed?: boolean;
}

export interface MsaPhase {
  number: number;
  title: string;
  description: string;
  items: CourseItem[];
  unlocked: boolean;
}

export const msaPhasesManifest: MsaPhase[] = [
  {
    number: 1,
    title: 'Música e Som',
    description: 'As propriedades do som, os elementos da música, pauta, claves e os primeiros exercícios de leitura.',
    unlocked: true,
    items: [
      { id: '1.1', title: '1.1 - Música e som', page: '09' },
      { id: '1.2', title: '1.2 - Elementos da música', page: '09' },
      { id: '1.3', title: '1.3 - Propriedades do som', page: '10' },
      { id: '1.4', title: '1.4 - Notas musicais', page: '11' },
      { id: '1.5', title: '1.5 - Pentagrama (pauta musical)', page: '12' },
      { id: '1.6', title: '1.6 - Claves', page: '13' },
      { id: '1.e1_7', title: 'Exercícios 1 ao 7', page: '14' },
      { id: '1.e8s', title: 'Exercício 8 - Clave de Sol', page: '15' },
      { id: '1.e8d', title: 'Exercício 8 - Clave de Dó', page: '15' },
      { id: '1.e8f', title: 'Exercício 8 - Clave de Fá', page: '15' },
      { id: '1.e9s', title: 'Exercício 9 - Clave de Sol', page: '16' },
      { id: '1.e9d', title: 'Exercício 9 - Clave de Dó', page: '16' },
      { id: '1.e9f', title: 'Exercício 9 - Clave de Fá', page: '16' }
    ]
  },
  {
    number: 2,
    title: 'Figuras e Ritmo',
    description: 'As figuras musicais, compasso simples, pulsação, barras e exercícios rítmicos.',
    unlocked: true,
    items: [
      { id: '2.1', title: '2.1 - Figuras musicais', page: '17' },
      { id: '2.e1_3', title: 'Exercícios 1 ao 3', page: '19' },
      { id: '2.e4_6', title: 'Exercícios 4 ao 6', page: '19' },
      { id: '2.2_2.3', title: '2.2 e 2.3 - Compasso, Barras simples, dupla e final', page: '21' },
      { id: '2.4', title: '2.4 - Fórmula de compasso em 4 e Exercício 1', page: '21' },
      { id: '2.5_2.6', title: '2.5 e 2.6 - Ritmo, pulsação e Exercícios 1', page: '22' },
      { id: '2.e2_3', title: 'Exercícios 2 ao 3', page: '24' },
      { id: '2.e4_8', title: 'Exercícios 4 ao 8', page: '24' },
      { id: '2.e9_10', title: 'Exercícios 9 ao 10', page: '25' },
      { id: '2.e11_13', title: 'Exercícios 11 ao 13', page: '26' },
    ]
  },
  {
    number: 3,
    title: 'O Endecagrama',
    description: 'A união das pautas, a pauta de 11 linhas, movimentos de solfejo em 4 tempos e metrônomo.',
    unlocked: true,
    items: [
      { id: '3.1', title: '3.1 - Endecagrama', page: '27' },
      { id: '3.2', title: '3.2 - Leitura rítmica, leitura métrica e solfejo', page: '27' },
      { id: '3.e1', title: 'Exercícios', page: '28' },
      { id: '3.3', title: '3.3 - Movimentos de condução para solfejo', page: '28' },
      { id: '3.4', title: '3.4 - Movimento de solfejo em 4', page: '30' },
      { id: '3.5', title: '3.5 - Metrônomo', page: '31' },
      { id: '3.l1_5', title: 'Lições 1 a 5', page: '32' }
    ]
  },
  {
    number: 4,
    title: 'Ligadura, Ponto e Compassos de 2 e 3',
    description: 'Fundamentos de ligadura, ponto de aumento, intervalos, compassos binários e ternários com solfejo.',
    unlocked: false,
    items: [
      { id: '4.1', title: '4.1 - Ligadura', page: '34' },
      { id: '4.2', title: '4.2 - Ponto de aumento', page: '35' },
      { id: '4.3', title: '4.3 - Intervalo', page: '35' },
      { id: '4.4', title: '4.4 - Fórmula de compasso em 3', page: '36' },
      { id: '4.e1', title: 'Exercícios', page: '36' },
      { id: '4.5', title: '4.5 - Movimento de solfejo em 3', page: '37' },
      { id: '4.l6_16', title: 'Lições 6 a 16', page: '37' },
      { id: '4.6', title: '4.6 - Fórmula de compasso em 2', page: '40' },
      { id: '4.e2', title: 'Exercícios', page: '40' },
      { id: '4.7', title: '4.7 - Movimento de solfejo em 2', page: '41' },
      { id: '4.l17_29', title: 'Lições 17 a 29', page: '41' }
    ]
  },
  {
    number: 5,
    title: 'Tercinas, Fermata e Compasso em 6',
    description: 'Estudo de tercinas, fermatas, compasso composto de 6 tempos e movimentos de condução.',
    unlocked: false,
    items: [
      { id: '5.1', title: '5.1 - Tercinas', page: '44' },
      { id: '5.l30_34', title: 'Lições 30 a 34', page: '45' },
      { id: '5.2', title: '5.2 - Fermata', page: '46' },
      { id: '5.l35_37', title: 'Lições 35 a 37', page: '47' },
      { id: '5.3', title: '5.3 - Fórmula de compasso em 6', page: '48' },
      { id: '5.4', title: '5.4 - Movimento de solfejo em 6', page: '48' },
      { id: '5.l38_39', title: 'Lições 38 a 39', page: '49' },
      { id: '5.5', title: '5.5 - Movimento alternativo para solfejo em 6', page: '50' },
      { id: '5.l40_42', title: 'Lições 40 a 42', page: '50' }
    ]
  },
  {
    number: 6,
    title: 'Tons, Semitons e Escalas Maiores',
    description: 'Teoria de tons e semitons, acidentes (sustenido e bemol) e escalas maiores com sustenidos e bemóis.',
    unlocked: false,
    items: [
      { id: '6.1', title: '6.1 - Tom e semitom', page: '52' },
      { id: '6.2', title: '6.2 - Acidentes - sustenido e bemol', page: '52' },
      { id: '6.3', title: '6.3 - Escalas', page: '55' },
      { id: '6.4', title: '6.4 - Escalas diatônicas', page: '56' },
      { id: '6.5', title: '6.5 - Escalas maiores', page: '56' },
      { id: '6.6', title: '6.6 - Escalas maiores com sustenidos', page: '57' },
      { id: '6.e1', title: 'Exercícios', page: '59' },
      { id: '6.7', title: '6.7 - Escalas maiores com bemóis', page: '61' },
      { id: '6.e2', title: 'Exercícios', page: '63' }
    ]
  },
  {
    number: 7,
    title: 'Armadura de Clave e Compassos em 9 e 12',
    description: 'Armadura de clave e estudo detalhado dos compassos compostos de 9 e 12 tempos com solfejo.',
    unlocked: false,
    items: [
      { id: '7.1', title: '7.1 - Armadura de clave', page: '65' },
      { id: '7.2', title: '7.2 - Fórmula de compasso em 9', page: '68' },
      { id: '7.3', title: '7.3 - Movimento de solfejo em 9', page: '68' },
      { id: '7.l43_44', title: 'Lições 43 a 44', page: '69' },
      { id: '7.4', title: '7.4 - Movimento alternativo para solfejo em 9', page: '70' },
      { id: '7.l45_47', title: 'Lições 45 a 47', page: '70' },
      { id: '7.5', title: '7.5 - Fórmula de compasso em 12', page: '72' },
      { id: '7.6', title: '7.6 - Movimento de solfejo em 12', page: '72' },
      { id: '7.l48', title: 'Lição 48', page: '73' },
      { id: '7.7', title: '7.7 - Movimento alternativo para solfejo em 12', page: '73' },
      { id: '7.l49_61', title: 'Lições 49 a 61', page: '74' }
    ]
  },
  {
    number: 8,
    title: 'Tonalidades e Acidentes Ocorrentes',
    description: 'Estudo de tonalidades, acidentes ocorrentes e de precaução com lições práticas.',
    unlocked: false,
    items: [
      { id: '8.1', title: '8.1 - Tonalidade', page: '80' },
      { id: '8.e1', title: 'Exercícios', page: '80' },
      { id: '8.2', title: '8.2 - Acidentes ocorrentes e de precaução', page: '82' },
      { id: '8.l62_66', title: 'Lições 62 a 66', page: '84' }
    ]
  },
  {
    number: 9,
    title: 'Barra de Compasso e Repetição',
    description: 'Uso das barras de repetição e compassos alternativos com lições práticas.',
    unlocked: false,
    items: [
      { id: '9.1', title: '9.1 - Barra de compasso - repetição', page: '86' },
      { id: '9.l67_71', title: 'Lições 67 a 71', page: '88' }
    ]
  },
  {
    number: 10,
    title: 'Dinâmica e Intensidade',
    description: 'Instruções de dinâmica musical, intensidade do som e lições de aplicação.',
    unlocked: false,
    items: [
      { id: '10.1', title: '10.1 - Dinâmica', page: '93' },
      { id: '10.l72_76', title: 'Lições 72 a 76', page: '94' }
    ]
  },
  {
    number: 11,
    title: 'Acento Métrico e Compassos',
    description: 'Lógica do acento métrico, compassos simples, compostos e alternados com lições.',
    unlocked: false,
    items: [
      { id: '11.1', title: '11.1 - Acento métrico', page: '100' },
      { id: '11.2', title: '11.2 - Compasso simples', page: '101' },
      { id: '11.3', title: '11.3 - Compasso composto', page: '102' },
      { id: '11.4', title: '11.4 - Compassos alternados', page: '105' },
      { id: '11.l77_81', title: 'Lições 77 a 81', page: '106' }
    ]
  },
  {
    number: 12,
    title: 'Síncopa e Contratempo',
    description: 'Ritmos deslocados: síncopa e contratempo com leitura rítmica avançada.',
    unlocked: false,
    items: [
      { id: '12.1', title: '12.1 - Síncopa', page: '111' },
      { id: '12.2', title: '12.2 - Contratempo', page: '112' },
      { id: '12.l82_89', title: 'Lições 82 a 89', page: '113' }
    ]
  },
  {
    number: 13,
    title: 'Ritmos Iniciais',
    description: 'Classificação e execução de ritmos iniciais (tético, anacrúsico e acéfalo).',
    unlocked: false,
    items: [
      { id: '13.1', title: '13.1 - Ritmos iniciais', page: '118' },
      { id: '13.l90_95', title: 'Lições 90 a 95', page: '122' }
    ]
  },
  {
    number: 14,
    title: 'Notas Pontuadas e Subdivisão',
    description: 'Estudo das notas pontuadas e as diferenças de subdivisão rítmica no solfejo.',
    unlocked: false,
    items: [
      { id: '14.1', title: '14.1 - Notas pontuadas - diferenças na subdivisão', page: '126' },
      { id: '14.l96_105', title: 'Lições 96 a 105', page: '128' }
    ]
  },
  {
    number: 15,
    title: 'Andamentos e Modificações',
    description: 'Classificação dos andamentos, metrônomo, poco rallentando e desvios de andamento.',
    unlocked: false,
    items: [
      { id: '15.1', title: '15.1 - Andamento', page: '130' },
      { id: '15.2', title: '15.2 - Modificação de andamento - poco rallentando', page: '131' },
      { id: '15.3', title: '15.3 - Modificação indevida de andamento', page: '132' },
      { id: '15.l106_107', title: 'Lições 106 a 107', page: '133' }
    ]
  },
  {
    number: 16,
    title: 'Fraseologia e Interpretação',
    description: 'Frases, semifrases, indicações de expressão e técnicas de interpretação musical.',
    unlocked: false,
    items: [
      { id: '16.1', title: '16.1 - Frases e semifrases', page: '136' },
      { id: '16.2', title: '16.2 - Interpretação musical', page: '137' },
      { id: '16.3', title: '16.3 - Indicações interpretativas', page: '138' },
      { id: '16.l108_113', title: 'Lições 108 a 113', page: '139' }
    ]
  }
];

export function getMsaPhases(completedItems: string[]): MsaPhase[] {
  return msaPhasesManifest.map((phase) => ({
    ...phase,
    items: phase.items.map((item) => ({
      ...item,
      completed: completedItems.includes(item.id),
    })),
  }));
}
