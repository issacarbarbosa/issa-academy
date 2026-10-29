-- ==============================================================================
-- Issa Academy: Schema Oficial do Supabase (PostgreSQL + RLS Hardened)
-- Versão 2.0: Blindagem Completa com RLS Estrito, Search Path Fixo e Anti-DoS
-- ==============================================================================

-- 1. Tabela de Administradores Autorizados (Whitelist)
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Função auxiliar de verificação de administrador via JWT (Search Path Fixo e Imutável)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_whitelist
    WHERE LOWER(email) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
  );
END;
$$;

-- Restringe execução da função apenas a usuários autenticados (remove acesso de 'anon')
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. Tabela de Configurações Globais do Site e Módulos
CREATE TABLE IF NOT EXISTS public.site_config (
  id TEXT PRIMARY KEY DEFAULT 'global',
  hero_title TEXT NOT NULL DEFAULT 'Aprenda Teoria Musical e o Método MSA de Forma Gamificada!',
  hero_subtitle TEXT NOT NULL DEFAULT 'Treine a leitura de notas na pauta, faça simulados oficiais e acelere seu aprendizado.',
  fufu_welcome_text TEXT NOT NULL DEFAULT 'Olá! Eu sou o Fufu, o mascote musical do canal @issacarbarbosa! Pronto para aprender teoria musical de um jeito divertido?',
  youtube_url TEXT NOT NULL DEFAULT 'https://www.youtube.com/@issacarbarbosa',
  announcement_banner JSONB DEFAULT NULL,
  game_config JSONB NOT NULL DEFAULT '{
    "baseSpeed": 140,
    "initialLives": 5,
    "xpPerLevel": 10,
    "maxLevel": 12
  }'::jsonb,
  home_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  footer_text TEXT NOT NULL DEFAULT 'Issa Academy • Mestre da Clave & Simulado MSA',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de Lições / Aulas do MSA (Fases 1 a 16)
CREATE TABLE IF NOT EXISTS public.msa_lessons (
  id TEXT PRIMARY KEY,
  periodo INT NOT NULL CHECK (periodo BETWEEN 1 AND 4),
  fase INT NOT NULL CHECK (fase BETWEEN 1 AND 16),
  ordem INT NOT NULL DEFAULT 1,
  topico TEXT NOT NULL,
  titulo TEXT NOT NULL,
  resumo TEXT NOT NULL,
  youtube_video_id TEXT,
  blocos JSONB NOT NULL DEFAULT '[]'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_msa_lessons_fase ON public.msa_lessons(fase, ordem);
CREATE INDEX IF NOT EXISTS idx_msa_lessons_periodo ON public.msa_lessons(periodo);

-- 4. Tabela de Questões do Simulado MSA (552+ Questões)
CREATE TABLE IF NOT EXISTS public.simulado_questions (
  id TEXT PRIMARY KEY,
  fase INT NOT NULL CHECK (fase BETWEEN 1 AND 16),
  periodo INT NOT NULL CHECK (periodo BETWEEN 1 AND 4),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  dificuldade TEXT NOT NULL DEFAULT 'facil',
  pontos INT NOT NULL DEFAULT 10,
  tipo TEXT NOT NULL DEFAULT 'texto',
  pergunta TEXT NOT NULL,
  imagem_url TEXT,
  audio_url TEXT,
  referencia JSONB NOT NULL,
  opcoes JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_simulado_questions_fase ON public.simulado_questions(fase);
CREATE INDEX IF NOT EXISTS idx_simulado_questions_periodo ON public.simulado_questions(periodo);
CREATE INDEX IF NOT EXISTS idx_simulado_questions_ativo ON public.simulado_questions(ativo);

-- 5. Tabela de Feedbacks e Reportes de Questões dos Alunos (Com Constraints Anti-Flood)
CREATE TABLE IF NOT EXISTS public.question_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id VARCHAR(80) NOT NULL,
  fase INT,
  periodo INT,
  reason VARCHAR(120) NOT NULL,
  comment VARCHAR(1000),
  question_snapshot VARCHAR(2000),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'resolvido')),
  admin_notes TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_question_id ON public.question_feedbacks(question_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON public.question_feedbacks(status);

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
-- Políticas explícitas para evitar sobreposição permissiva (Zero Performance Warnings)
-- ==============================================================================

ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.msa_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulado_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_feedbacks ENABLE ROW LEVEL SECURITY;

-- 1. admin_whitelist: Apenas admins autenticados podem visualizar a whitelist
DROP POLICY IF EXISTS "Admin pode ler whitelist" ON public.admin_whitelist;
CREATE POLICY "Admin pode ler whitelist"
  ON public.admin_whitelist FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 2. site_config: Público pode ler; apenas admin autenticado pode modificar
DROP POLICY IF EXISTS "Leitura pública site_config" ON public.site_config;
CREATE POLICY "Leitura pública site_config"
  ON public.site_config FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admin pode modificar site_config" ON public.site_config;
CREATE POLICY "Admin pode inserir site_config"
  ON public.site_config FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin pode atualizar site_config"
  ON public.site_config FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. msa_lessons: Leitura pública eficiente (sem sobreposição permissiva)
DROP POLICY IF EXISTS "Leitura pública de lições" ON public.msa_lessons;
CREATE POLICY "Leitura pública de lições"
  ON public.msa_lessons FOR SELECT
  TO public
  USING (ativo = true OR (auth.role() = 'authenticated' AND public.is_admin()));

DROP POLICY IF EXISTS "Admin pode gerenciar lições" ON public.msa_lessons;
CREATE POLICY "Admin pode inserir lições"
  ON public.msa_lessons FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin pode atualizar lições"
  ON public.msa_lessons FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin pode excluir lições"
  ON public.msa_lessons FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4. simulado_questions: Leitura pública eficiente
DROP POLICY IF EXISTS "Leitura pública de questões" ON public.simulado_questions;
CREATE POLICY "Leitura pública de questões"
  ON public.simulado_questions FOR SELECT
  TO public
  USING (ativo = true OR (auth.role() = 'authenticated' AND public.is_admin()));

DROP POLICY IF EXISTS "Admin pode gerenciar questões" ON public.simulado_questions;
CREATE POLICY "Admin pode inserir questões"
  ON public.simulado_questions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin pode atualizar questões"
  ON public.simulado_questions FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin pode excluir questões"
  ON public.simulado_questions FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 5. question_feedbacks: Alunos enviam feedback com validação estrita anti-flood
DROP POLICY IF EXISTS "Alunos podem enviar feedback" ON public.question_feedbacks;
DROP POLICY IF EXISTS "Insercao publica de feedbacks" ON public.question_feedbacks;
CREATE POLICY "Alunos podem enviar feedback"
  ON public.question_feedbacks FOR INSERT
  TO public
  WITH CHECK (
    status = 'pendente'
    AND admin_notes IS NULL
    AND char_length(question_id) BETWEEN 1 AND 80
    AND char_length(reason) BETWEEN 1 AND 120
    AND (comment IS NULL OR char_length(comment) <= 1000)
    AND (question_snapshot IS NULL OR char_length(question_snapshot) <= 2000)
  );

DROP POLICY IF EXISTS "Admin pode visualizar feedbacks" ON public.question_feedbacks;
CREATE POLICY "Admin pode visualizar feedbacks"
  ON public.question_feedbacks FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin pode atualizar feedbacks" ON public.question_feedbacks;
CREATE POLICY "Admin pode atualizar feedbacks"
  ON public.question_feedbacks FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin pode excluir feedbacks" ON public.question_feedbacks;
CREATE POLICY "Admin pode excluir feedbacks"
  ON public.question_feedbacks FOR DELETE
  TO authenticated
  USING (public.is_admin());
