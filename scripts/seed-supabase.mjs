import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://pcwmafuykwqxoivedpbn.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const HEADERS = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates',
};

async function runSeed() {
  console.log('🚀 Iniciando Seed Inicial no Supabase via REST API...');

  // 1. Configuração do Site
  console.log('1. Sincronizando site_config...');
  const siteConfig = {
    id: 'global',
    hero_title: 'Aprenda Teoria Musical e o Método MSA de Forma Gamificada!',
    hero_subtitle: 'Treine a leitura de notas na pauta, faça simulados oficiais e acelere seu aprendizado.',
    fufu_welcome_text: 'Olá! Eu sou o Fufu, o mascote musical do canal @issacarbarbosa! Pronto para aprender teoria musical de um jeito divertido?',
    youtube_url: 'https://www.youtube.com/@issacarbarbosa',
    announcement_banner: null,
    game_config: {
      baseSpeed: 140,
      initialLives: 5,
      xpPerLevel: 10,
      maxLevel: 12,
    },
    home_cards: [],
    footer_text: 'Issa Academy • Mestre da Clave & Simulado MSA',
    updated_at: new Date().toISOString(),
  };

  const resCfg = await fetch(`${SUPABASE_URL}/rest/v1/site_config`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(siteConfig),
  });

  if (!resCfg.ok) {
    console.error('Erro ao subir site_config:', await resCfg.text());
  } else {
    console.log('✔ site_config sincronizado com sucesso!');
  }

  // 2. Lições MSA
  console.log('2. Sincronizando lições do MSA...');
  const lessonsFilePath = path.resolve(__dirname, '../src/modules/aulas/data/initialLessons.ts');
  const fileContent = fs.readFileSync(lessonsFilePath, 'utf-8');
  const jsonStr = fileContent
    .replace(/import.*?;/g, '')
    .replace(/export const INITIAL_MSA_LESSONS: MsaLesson\[\] = /, '')
    .trim()
    .replace(/;$/, '');

  let lessons = [];
  try {
    const fn = new Function(`return ${jsonStr}`);
    lessons = fn();
    console.log(`Lições encontradas: ${lessons.length}`);
  } catch (err) {
    console.error('Erro ao ler lições:', err.message);
  }

  if (lessons.length > 0) {
    const lessonsPayload = lessons.map((l) => ({
      id: l.id,
      periodo: l.periodo,
      fase: l.fase,
      ordem: l.ordem,
      topico: l.topico,
      titulo: l.titulo,
      resumo: l.resumo,
      youtube_video_id: l.youtubeVideoId || null,
      blocos: l.blocos || [],
      ativo: l.ativo !== false,
      updated_at: new Date().toISOString(),
    }));

    const resLess = await fetch(`${SUPABASE_URL}/rest/v1/msa_lessons`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(lessonsPayload),
    });

    if (!resLess.ok) {
      console.error('Erro ao subir lições:', await resLess.text());
    } else {
      console.log(`✔ ${lessons.length} lições sincronizadas com sucesso!`);
    }
  }

  // 3. Questões do Simulado (Fases 1 a 16)
  console.log('3. Sincronizando questões do Simulado (Fases 1 a 16)...');
  const questionsDir = path.resolve(__dirname, '../src/modules/simulado/questions');
  const files = fs.readdirSync(questionsDir).filter((f) => f.startsWith('q_f') && f.endsWith('.json'));

  let allQuestions = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(questionsDir, file), 'utf-8');
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        allQuestions.push(...parsed);
      }
    } catch (e) {
      console.error(`Erro ao parsear ${file}:`, e.message);
    }
  }

  console.log(`Total de questões lidas: ${allQuestions.length}`);

  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < allQuestions.length; i += batchSize) {
    const batch = allQuestions.slice(i, i + batchSize).map((q) => ({
      id: q.id,
      fase: q.referencia?.fase ?? 1,
      periodo: q.referencia?.periodo ?? 1,
      ativo: q.ativo !== false,
      dificuldade: q.dificuldade || 'facil',
      pontos: q.pontos || 10,
      tipo: q.tipo || 'texto',
      pergunta: q.pergunta,
      imagem_url: q.imagemUrl || null,
      audio_url: q.audioUrl || null,
      referencia: q.referencia || {},
      opcoes: q.opcoes || [],
      updated_at: new Date().toISOString(),
    }));

    const resBatch = await fetch(`${SUPABASE_URL}/rest/v1/simulado_questions`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(batch),
    });

    if (!resBatch.ok) {
      console.error(`\nErro no lote ${i} - ${i + batch.length}:`, await resBatch.text());
    } else {
      inserted += batch.length;
      process.stdout.write(`\rProgresso: ${inserted}/${allQuestions.length} questões inseridas...`);
    }
  }

  console.log('\n✔ Todas as questões foram sincronizadas com sucesso no Supabase!');
  console.log('🎉 Seed completo finalizado com sucesso!');
}

runSeed().catch((err) => {
  console.error('Falha geral no seed:', err);
  process.exit(1);
});
