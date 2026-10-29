import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MsaLesson } from '../../modules/aulas/types';
import { INITIAL_MSA_LESSONS } from '../../modules/aulas/data/initialLessons';
import { SimuladoQuestion } from '../../modules/simulado/questions/schema';

// Imports estáticos dos 16 bancos de questões para seed inicial e fallback offline
import q01 from '../../modules/simulado/questions/q_f01.json';
import q02 from '../../modules/simulado/questions/q_f02.json';
import q03 from '../../modules/simulado/questions/q_f03.json';
import q04 from '../../modules/simulado/questions/q_f04.json';
import q05 from '../../modules/simulado/questions/q_f05.json';
import q06 from '../../modules/simulado/questions/q_f06.json';
import q07 from '../../modules/simulado/questions/q_f07.json';
import q08 from '../../modules/simulado/questions/q_f08.json';
import q09 from '../../modules/simulado/questions/q_f09.json';
import q10 from '../../modules/simulado/questions/q_f10.json';
import q11 from '../../modules/simulado/questions/q_f11.json';
import q12 from '../../modules/simulado/questions/q_f12.json';
import q13 from '../../modules/simulado/questions/q_f13.json';
import q14 from '../../modules/simulado/questions/q_f14.json';
import q15 from '../../modules/simulado/questions/q_f15.json';
import q16 from '../../modules/simulado/questions/q_f16.json';

export interface GameConfig {
  baseSpeed: number;
  initialLives: number;
  xpPerLevel: number;
  maxLevel: number;
  clefDescriptions?: {
    sol?: string;
    fa?: string;
    do?: string;
  };
}

export interface AnnouncementBanner {
  enabled: boolean;
  text: string;
  linkUrl?: string;
  linkText?: string;
}

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  fufuWelcomeText: string;
  youtubeUrl: string;
  announcementBanner: AnnouncementBanner | null;
  gameConfig: GameConfig;
  footerText: string;
}

export interface QuestionFeedbackRecord {
  id: string;
  question_id: string;
  fase: number;
  periodo: number;
  reason: string;
  comment?: string;
  question_snapshot?: string;
  status: 'pendente' | 'em_analise' | 'resolvido';
  admin_notes?: string;
  user_agent?: string;
  created_at: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  heroTitle: 'Aprenda Teoria Musical e o Método MSA de Forma Gamificada!',
  heroSubtitle: 'Treine a leitura de notas na pauta, faça simulados oficiais e acelere seu aprendizado.',
  fufuWelcomeText: 'Olá! Eu sou o Fufu, o mascote musical do canal @issacarbarbosa! Pronto para aprender teoria musical de um jeito divertido?',
  youtubeUrl: 'https://www.youtube.com/@issacarbarbosa',
  announcementBanner: null,
  gameConfig: {
    baseSpeed: 140,
    initialLives: 5,
    xpPerLevel: 10,
    maxLevel: 12,
    clefDescriptions: {
      sol: 'Clave de Sol na 2ª Linha (Notas de Dó3 a Lá4)',
      fa: 'Clave de Fá na 4ª Linha (Notas de Mi1 a Dó3 Central)',
      do: 'Clave de Dó na 3ª Linha (Notas de Ré2 a Si3)',
    },
  },
  footerText: 'Issa Academy • Mestre da Clave & Simulado MSA',
};

// Chaves do LocalStorage
const STORAGE_KEYS = {
  SITE_CONFIG: 'issa_site_config_v2',
  LESSONS: 'issa_msa_lessons_v2',
  QUESTIONS: 'issa_simulado_questions_v2',
  FEEDBACKS: 'issa_question_feedbacks_v2',
};

// Carrega todas as questões estáticas empacotadas
export function getBundledQuestions(): SimuladoQuestion[] {
  const banks = [q01, q02, q03, q04, q05, q06, q07, q08, q09, q10, q11, q12, q13, q14, q15, q16];
  return banks.flat() as unknown as SimuladoQuestion[];
}

/**
 * Camada de Dados Unificada do Issa Academy (Supabase + LocalStorage Fallback)
 */
class ContentStore {
  // ==================== CONFIGURAÇÃO DO SITE ====================

  async getSiteConfig(): Promise<SiteConfig> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('site_config')
          .select('*')
          .eq('id', 'global')
          .single();

        if (data && !error) {
          const cloudConfig: SiteConfig = {
            heroTitle: data.hero_title || DEFAULT_SITE_CONFIG.heroTitle,
            heroSubtitle: data.hero_subtitle || DEFAULT_SITE_CONFIG.heroSubtitle,
            fufuWelcomeText: data.fufu_welcome_text || DEFAULT_SITE_CONFIG.fufuWelcomeText,
            youtubeUrl: data.youtube_url || DEFAULT_SITE_CONFIG.youtubeUrl,
            announcementBanner: data.announcement_banner || null,
            gameConfig: data.game_config || DEFAULT_SITE_CONFIG.gameConfig,
            footerText: data.footer_text || DEFAULT_SITE_CONFIG.footerText,
          };
          localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(cloudConfig));
          return cloudConfig;
        }
      } catch {
        // Fallback para cache local em caso de erro de rede
      }
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEYS.SITE_CONFIG);
      if (cached) return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(cached) };
    } catch {
      // Ignora erro de JSON
    }

    return DEFAULT_SITE_CONFIG;
  }

  async saveSiteConfig(config: SiteConfig): Promise<boolean> {
    localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(config));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('site_config').upsert({
          id: 'global',
          hero_title: config.heroTitle,
          hero_subtitle: config.heroSubtitle,
          fufu_welcome_text: config.fufuWelcomeText,
          youtube_url: config.youtubeUrl,
          announcement_banner: config.announcementBanner,
          game_config: config.gameConfig,
          footer_text: config.footerText,
          updated_at: new Date().toISOString(),
        });
        return !error;
      } catch {
        return false;
      }
    }

    return true;
  }

  // ==================== LIÇÕES / AULAS DO MSA ====================

  async getLessons(fase?: number, periodo?: number): Promise<MsaLesson[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('msa_lessons').select('*').order('ordem', { ascending: true });
        if (fase) query = query.eq('fase', fase);
        if (periodo) query = query.eq('periodo', periodo);

        const { data, error } = await query;
        if (data && !error && data.length > 0) {
          const lessons: MsaLesson[] = data.map((d) => ({
            id: d.id,
            periodo: d.periodo as 1 | 2 | 3 | 4,
            fase: d.fase,
            ordem: d.ordem,
            topico: d.topico,
            titulo: d.titulo,
            resumo: d.resumo,
            youtubeVideoId: d.youtube_video_id || undefined,
            blocos: Array.isArray(d.blocos) ? d.blocos : [],
            ativo: d.ativo !== false,
            updatedAt: d.updated_at,
          }));
          return lessons;
        }
      } catch {
        // Fallback
      }
    }

    // Cache local / Initial Lessons
    let allLessons: MsaLesson[] = INITIAL_MSA_LESSONS;
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.LESSONS);
      if (cached) {
        allLessons = JSON.parse(cached);
      } else {
        localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(INITIAL_MSA_LESSONS));
      }
    } catch {
      allLessons = INITIAL_MSA_LESSONS;
    }

    return allLessons.filter((l) => {
      if (fase && l.fase !== fase) return false;
      if (periodo && l.periodo !== periodo) return false;
      return true;
    });
  }

  async saveLesson(lesson: MsaLesson): Promise<boolean> {
    const lessons = await this.getLessons();
    const existingIdx = lessons.findIndex((l) => l.id === lesson.id);

    const updatedLesson = {
      ...lesson,
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      lessons[existingIdx] = updatedLesson;
    } else {
      lessons.push(updatedLesson);
    }

    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('msa_lessons').upsert({
          id: updatedLesson.id,
          periodo: updatedLesson.periodo,
          fase: updatedLesson.fase,
          ordem: updatedLesson.ordem,
          topico: updatedLesson.topico,
          titulo: updatedLesson.titulo,
          resumo: updatedLesson.resumo,
          youtube_video_id: updatedLesson.youtubeVideoId || null,
          blocos: updatedLesson.blocos,
          ativo: updatedLesson.ativo,
          updated_at: updatedLesson.updatedAt,
        });
        return !error;
      } catch {
        return false;
      }
    }

    return true;
  }

  async deleteLesson(lessonId: string): Promise<boolean> {
    const lessons = await this.getLessons();
    const filtered = lessons.filter((l) => l.id !== lessonId);
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(filtered));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('msa_lessons').delete().eq('id', lessonId);
        return !error;
      } catch {
        return false;
      }
    }

    return true;
  }

  // ==================== QUESTÕES DO SIMULADO ====================

  async getAllQuestions(): Promise<SimuladoQuestion[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('simulado_questions')
          .select('*')
          .order('fase', { ascending: true });

        if (data && !error && data.length > 0) {
          const mapped: SimuladoQuestion[] = data.map((d) => ({
            id: d.id,
            ativo: d.ativo !== false,
            dificuldade: d.dificuldade || 'facil',
            pontos: d.pontos || 10,
            tipo: 'texto',
            pergunta: d.pergunta,
            imagemUrl: d.imagem_url || null,
            audioUrl: d.audio_url || null,
            referencia: d.referencia,
            opcoes: d.opcoes,
          }));
          localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(mapped));
          return mapped;
        }
      } catch {
        // Fallback
      }
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignora erro
    }

    const initial = getBundledQuestions();
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(initial));
    } catch {
      // Ignora erro de cota local
    }
    return initial;
  }

  async saveQuestion(question: SimuladoQuestion): Promise<boolean> {
    const all = await this.getAllQuestions();
    const idx = all.findIndex((q) => q.id === question.id);

    if (idx >= 0) {
      all[idx] = question;
    } else {
      all.push(question);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(all));
    } catch {
      // Ignora erro de cota
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('simulado_questions').upsert({
          id: question.id,
          fase: question.referencia?.fase ?? 1,
          periodo: question.referencia?.periodo ?? 1,
          ativo: question.ativo !== false,
          dificuldade: question.dificuldade,
          pontos: question.pontos,
          tipo: question.tipo,
          pergunta: question.pergunta,
          imagem_url: question.imagemUrl || null,
          audio_url: question.audioUrl || null,
          referencia: question.referencia,
          opcoes: question.opcoes,
          updated_at: new Date().toISOString(),
        });
        return !error;
      } catch {
        return false;
      }
    }

    return true;
  }

  async deleteQuestion(questionId: string): Promise<boolean> {
    const all = await this.getAllQuestions();
    const filtered = all.filter((q) => q.id !== questionId);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(filtered));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('simulado_questions').delete().eq('id', questionId);
        return !error;
      } catch {
        return false;
      }
    }

    return true;
  }

  // ==================== CENTRAL DE FEEDBACKS ====================

  async submitFeedback(data: {
    questionId: string;
    fase: number;
    periodo: number;
    reason: string;
    comment?: string;
    questionSnapshot?: string;
  }): Promise<boolean> {
    const record: QuestionFeedbackRecord = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `fb_${Date.now()}`,
      question_id: data.questionId,
      fase: data.fase,
      periodo: data.periodo,
      reason: data.reason,
      comment: data.comment,
      question_snapshot: data.questionSnapshot,
      status: 'pendente',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      created_at: new Date().toISOString(),
    };

    // Salva localmente
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
      const list: QuestionFeedbackRecord[] = cached ? JSON.parse(cached) : [];
      list.unshift(record);
      localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(list.slice(0, 100)));
    } catch {
      // Ignora
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('question_feedbacks').insert({
          question_id: record.question_id,
          fase: record.fase,
          periodo: record.periodo,
          reason: record.reason,
          comment: record.comment || null,
          question_snapshot: record.question_snapshot || null,
          status: record.status,
          user_agent: record.user_agent || null,
        });
        return !error;
      } catch {
        return false;
      }
    }

    return true;
  }

  async getFeedbacks(): Promise<QuestionFeedbackRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('question_feedbacks')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error) {
          localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(data));
          return data as QuestionFeedbackRecord[];
        }
      } catch {
        // Fallback
      }
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
      if (cached) return JSON.parse(cached);
    } catch {
      // Ignora
    }

    return [];
  }

  async updateFeedbackStatus(
    id: string,
    status: 'pendente' | 'em_analise' | 'resolvido',
    adminNotes?: string,
  ): Promise<boolean> {
    const list = await this.getFeedbacks();
    const item = list.find((f) => f.id === id);
    if (item) {
      item.status = status;
      if (adminNotes !== undefined) item.admin_notes = adminNotes;
      localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(list));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const updatePayload: { status: string; admin_notes?: string } = { status };
        if (adminNotes !== undefined) updatePayload.admin_notes = adminNotes;
        const { error } = await supabase.from('question_feedbacks').update(updatePayload).eq('id', id);
        return !error;
      } catch {
        return false;
      }
    }

    return true;
  }

  // ==================== SEED INICIAL & BACKUP ====================

  async seedInitialDataToSupabase(): Promise<{
    success: boolean;
    questionsCount: number;
    lessonsCount: number;
    error?: string;
  }> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        questionsCount: 0,
        lessonsCount: 0,
        error: 'Supabase ainda não configurado no .env.',
      };
    }

    try {
      // 1. Sincroniza Site Config
      const currentConfig = await this.getSiteConfig();
      await this.saveSiteConfig(currentConfig);

      // 2. Sincroniza Lições
      const lessons = await this.getLessons();
      const lessonsPayload = lessons.map((l) => ({
        id: l.id,
        periodo: l.periodo,
        fase: l.fase,
        ordem: l.ordem,
        topico: l.topico,
        titulo: l.titulo,
        resumo: l.resumo,
        youtube_video_id: l.youtubeVideoId || null,
        blocos: l.blocos,
        ativo: l.ativo !== false,
      }));

      const { error: lessonsError } = await supabase
        .from('msa_lessons')
        .upsert(lessonsPayload, { onConflict: 'id' });

      if (lessonsError) throw new Error(`Erro ao subir lições: ${lessonsError.message}`);

      // 3. Sincroniza 552 Questões em Lotes de 50
      const questions = await this.getAllQuestions();
      const batchSize = 50;
      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize).map((q) => ({
          id: q.id,
          fase: q.referencia?.fase ?? 1,
          periodo: q.referencia?.periodo ?? 1,
          ativo: q.ativo !== false,
          dificuldade: q.dificuldade,
          pontos: q.pontos,
          tipo: q.tipo,
          pergunta: q.pergunta,
          imagem_url: q.imagemUrl || null,
          audio_url: q.audioUrl || null,
          referencia: q.referencia,
          opcoes: q.opcoes,
        }));

        const { error: qError } = await supabase
          .from('simulado_questions')
          .upsert(batch, { onConflict: 'id' });

        if (qError) throw new Error(`Erro no lote de questões (${i}): ${qError.message}`);
      }

      return {
        success: true,
        questionsCount: questions.length,
        lessonsCount: lessons.length,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        questionsCount: 0,
        lessonsCount: 0,
        error: message,
      };
    }
  }

  async exportFullBackupJson(): Promise<string> {
    const [config, lessons, questions, feedbacks] = await Promise.all([
      this.getSiteConfig(),
      this.getLessons(),
      this.getAllQuestions(),
      this.getFeedbacks(),
    ]);

    const backup = {
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      siteConfig: config,
      lessons,
      questions,
      feedbacks,
    };

    return JSON.stringify(backup, null, 2);
  }
}

export const contentStore = new ContentStore();
