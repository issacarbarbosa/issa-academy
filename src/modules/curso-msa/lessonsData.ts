export interface ComplementaryLink {
  label: string;
  url: string;
  type: 'pdf' | 'audio' | 'link' | 'drive';
}

export interface LessonDetail {
  videoUrl?: string;
  hasInteractiveSlideshow?: boolean;
  practiceLink?: {
    label: string;
    view: 'mestre_da_clave' | 'simulado_msa';
  };
  complementaryLinks?: ComplementaryLink[];
}

export const lessonsData: Record<string, LessonDetail> = {
  // FASE 1
  '1.1': {
    videoUrl: 'ALHIyHtGHQs',
    complementaryLinks: [
      {
        label: 'Apostila MSA - Introdução e Fase 1 (PDF)',
        url: 'https://drive.google.com/file/d/1_example_pdf_fase1/view?usp=sharing',
        type: 'pdf'
      },
      {
        label: 'Áudio de Apoio - Pulsação Constante 60 BPM (MP3)',
        url: 'https://drive.google.com/file/d/1_example_audio_60bpm/view?usp=sharing',
        type: 'audio'
      }
    ]
  },
  '1.2': {
    videoUrl: '54IZJmJrtXo'
  },
  '1.3': {
    videoUrl: '_ZjOGmL3UM4'
  },
  '1.4': {
    videoUrl: 'wx76vWI8bGA'
  },
  '1.5': {
    videoUrl: 'iEZgDyyC1e8'
  },
  '1.6': {
    videoUrl: 'Lcy6r__GOOY'
  },
  '1.e1_7': {
    videoUrl: 'qr0dp4ryV90'
  },
  '1.e8s': {
    videoUrl: 'CzCbSzkh9Y0'
  },
  '1.e8d': {
    videoUrl: 'OjYXGLw3NlE'
  },
  '1.e8f': {
    videoUrl: 'kaD7Qkuz7Cg'
  },
  '1.e9s': {
    videoUrl: 'xgGCuawxNvk'
  },
  '1.e9d': {
    videoUrl: 'oNLFuipETIs'
  },
  '1.e9f': {
    videoUrl: 'MmU-j95eYKQ'
  },

  // FASE 2
  '2.1': {
    videoUrl: 'EUBHo-1EEYI',
    complementaryLinks: [
      {
        label: 'Tabela de Figuras e Silêncios (PDF)',
        url: 'https://drive.google.com/file/d/1_example_figures_pdf/view?usp=sharing',
        type: 'pdf'
      }
    ]
  },
  '2.e1_3': {
    videoUrl: 'S2IvhjKIONI'
  },
  '2.e4_6': {
    videoUrl: 'SInJma4zXzE'
  },
  '2.2_2.3': {
    videoUrl: 'ALeGxsbs4Jk'
  },
  '2.4': {
    videoUrl: 'XauWxpDX9e0'
  },
  '2.5_2.6': {
    videoUrl: 'JMex6FU3mgY'
  },
  '2.e2_3': {
    videoUrl: 'vPb0D4gt2ns'
  },
  '2.e4_8': {
    videoUrl: '-B6CFYtHZeo'
  },
  '2.e9_10': {
    videoUrl: 'Wp4FSM8XQII'
  },
  '2.e11_13': {
    videoUrl: 'BLYNi9mFbn4'
  },

  // FASE 3
'3.1': {
  hasInteractiveSlideshow: true,
  complementaryLinks: [
    {
      label: 'Diagrama do Endecagrama Colorido (PDF)',
      url: 'https://drive.google.com/file/d/1_example_endecagrama_pdf/view?usp=sharing',
      type: 'pdf'
    }
  ]
},
'3.2': { },
'3.e1': { },
'3.3': { },
'3.4': { },
'3.5': { },
'3.l1_5': { }
};
