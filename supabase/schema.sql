-- ==============================================================================
-- Issa Academy: Schema Oficial do Supabase (PostgreSQL + RLS)
-- Cole este script no SQL Editor do seu projeto Supabase para criar a estrutura completa.
-- ==============================================================================

-- 1. Tabela de Administradores Autorizados (Whitelist)
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Função auxiliar de verificação de administrador via JWT
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_whitelist
    WHERE LOWER(admin_whitelist.email) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- 5. Tabela de Feedbacks e Reportes de Questões dos Alunos
CREATE TABLE IF NOT EXISTS public.question_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL,
  fase INT,
  periodo INT,
  reason TEXT NOT NULL,
  comment TEXT,
  question_snapshot TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  admin_notes TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_question_id ON public.question_feedbacks(question_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON public.question_feedbacks(status);

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.msa_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulado_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_feedbacks ENABLE ROW LEVEL SECURITY;

-- 1. admin_whitelist: Apenas admins podem visualizar ou alterar a whitelist
CREATE POLICY "Admin pode ler whitelist"
  ON public.admin_whitelist FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 2. site_config: Público pode ler, apenas Admin pode editar
CREATE POLICY "Leitura pública site_config"
  ON public.site_config FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin pode modificar site_config"
  ON public.site_config FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. msa_lessons: Público pode ler lições ativas (ou todas se for admin)
CREATE POLICY "Leitura pública de lições"
  ON public.msa_lessons FOR SELECT
  TO public
  USING (ativo = true OR public.is_admin());

CREATE POLICY "Admin pode gerenciar lições"
  ON public.msa_lessons FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. simulado_questions: Público pode ler questões ativas (ou todas se for admin)
CREATE POLICY "Leitura pública de questões"
  ON public.simulado_questions FOR SELECT
  TO public
  USING (ativo = true OR public.is_admin());

CREATE POLICY "Admin pode gerenciar questões"
  ON public.simulado_questions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. question_feedbacks: Qualquer aluno pode enviar reporte; apenas Admin pode ver e atualizar
CREATE POLICY "Alunos podem enviar feedback"
  ON public.question_feedbacks FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin pode visualizar feedbacks"
  ON public.question_feedbacks FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin pode atualizar feedbacks"
  ON public.question_feedbacks FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin pode excluir feedbacks"
  ON public.question_feedbacks FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Comentário final instruindo a adicionar o e-mail de admin inicial
-- Exemplo: INSERT INTO public.admin_whitelist (email) VALUES ('seu-email@gmail.com');
