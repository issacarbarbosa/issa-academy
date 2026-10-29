export type LessonBlockType = 'text' | 'fufu_tip' | 'msa_rule' | 'image' | 'audio';

export interface LessonBlock {
  id: string;
  type: LessonBlockType;
  title?: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface MsaLesson {
  id: string;
  periodo: 1 | 2 | 3 | 4;
  fase: number; // 1 a 16
  ordem: number;
  topico: string; // ex.: "1.1", "1.2"
  titulo: string;
  resumo: string;
  youtubeVideoId?: string;
  blocos: LessonBlock[];
  ativo: boolean;
  updatedAt?: string;
}

export interface PhaseInfo {
  fase: number;
  periodo: 1 | 2 | 3 | 4;
  titulo: string;
  descricao: string;
  totalLicoes: number;
}
