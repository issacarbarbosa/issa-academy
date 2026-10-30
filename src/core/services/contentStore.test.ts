import { describe, it, expect, beforeEach } from 'vitest';
import { contentStore, DEFAULT_SITE_CONFIG } from './contentStore';
import { MsaLesson } from '../../modules/aulas/types';
import { SimuladoQuestion } from '../../modules/simulado/questions/schema';

describe('ContentStore (Camada de Dados Unificada)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve retornar a configuração padrão do site quando não houver cache', async () => {
    const config = await contentStore.getSiteConfig();
    expect(config.heroTitle).toBe(DEFAULT_SITE_CONFIG.heroTitle);
    expect(config.gameConfig.baseSpeed).toBe(140);
  });

  it('deve salvar e recuperar configuração atualizada do site', async () => {
    const custom = {
      ...DEFAULT_SITE_CONFIG,
      heroTitle: 'Novo Título Customizado',
    };
    const saved = await contentStore.saveSiteConfig(custom);
    expect(saved).toBe(true);

    const reloaded = await contentStore.getSiteConfig();
    expect(reloaded.heroTitle).toBe('Novo Título Customizado');
  });

  it('deve recuperar a lista inicial de lições e filtrar por fase', async () => {
    const all = await contentStore.getLessons();
    expect(all.length).toBeGreaterThan(0);

    const fase1 = await contentStore.getLessons(1);
    expect(fase1.length).toBeGreaterThan(0);
    expect(fase1.every((l) => l.fase === 1)).toBe(true);
  });

  it('deve criar, atualizar e excluir uma lição', async () => {
    const newLesson: MsaLesson = {
      id: 'test_licao_99',
      periodo: 1,
      fase: 1,
      ordem: 99,
      topico: '1.99',
      titulo: 'Lição de Teste Unitário',
      resumo: 'Resumo da lição de teste',
      blocos: [],
      ativo: true,
    };

    await contentStore.saveLesson(newLesson);
    let lessons = await contentStore.getLessons(1);
    expect(lessons.some((l) => l.id === 'test_licao_99')).toBe(true);

    await contentStore.deleteLesson('test_licao_99');
    lessons = await contentStore.getLessons(1);
    expect(lessons.some((l) => l.id === 'test_licao_99')).toBe(false);
  });

  it('deve carregar as questões empacotadas do Simulado', async () => {
    const questions = await contentStore.getAllQuestions();
    expect(questions.length).toBeGreaterThanOrEqual(500);
  });

  it('deve salvar e atualizar uma questão no simulado', async () => {
    const testQ: SimuladoQuestion = {
      id: 'f01_q999',
      ativo: true,
      dificuldade: 'facil',
      pontos: 15,
      tipo: 'texto',
      pergunta: 'Pergunta de teste unitário?',
      imagemUrl: null,
      audioUrl: null,
      referencia: {
        livro: 'MSA',
        periodo: 1,
        fase: 1,
        item: '1.1 Teste',
        pagina: 9,
      },
      opcoes: [
        { texto: 'Correta', correta: true, feedback: 'Ok' },
        { texto: 'Incorreta 1', correta: false, feedback: 'Não' },
        { texto: 'Incorreta 2', correta: false, feedback: 'Não' },
        { texto: 'Incorreta 3', correta: false, feedback: 'Não' },
      ],
    };

    await contentStore.saveQuestion(testQ);
    const questions = await contentStore.getAllQuestions();
    const found = questions.find((q) => q.id === 'f01_q999');
    expect(found).toBeDefined();
    expect(found?.pergunta).toBe('Pergunta de teste unitário?');

    await contentStore.deleteQuestion('f01_q999');
    const updated = await contentStore.getAllQuestions();
    expect(updated.some((q) => q.id === 'f01_q999')).toBe(false);
  });

  it('deve registrar e atualizar feedbacks de alunos', async () => {
    await contentStore.submitFeedback({
      questionId: 'f01_q001',
      fase: 1,
      periodo: 1,
      reason: 'Erro de digitação',
      comment: 'Faltou um ponto final.',
    });

    const feedbacks = await contentStore.getFeedbacks();
    expect(feedbacks.length).toBeGreaterThan(0);
    expect(feedbacks[0].question_id).toBe('f01_q001');

    await contentStore.updateFeedbackStatus(feedbacks[0].id, 'resolvido', 'Corrigido na versão 1.2');
    const reloaded = await contentStore.getFeedbacks();
    expect(reloaded[0].status).toBe('resolvido');
    expect(reloaded[0].admin_notes).toBe('Corrigido na versão 1.2');
  });

  it('deve exportar backup completo do banco em formato JSON válido', async () => {
    const backupJson = await contentStore.exportFullBackupJson();
    expect(typeof backupJson).toBe('string');
    const parsed = JSON.parse(backupJson);
    expect(parsed.version).toBe('1.3.0');
    expect(parsed.siteConfig).toBeDefined();
    expect(parsed.lessons).toBeDefined();
    expect(parsed.questions).toBeDefined();
    expect(parsed.feedbacks).toBeDefined();
  });
});
