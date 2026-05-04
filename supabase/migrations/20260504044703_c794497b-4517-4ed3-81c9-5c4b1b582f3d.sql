-- Create evolucoes table
CREATE TABLE public.evolucoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  data_sessao DATE NOT NULL DEFAULT CURRENT_DATE,
  queixa_principal TEXT DEFAULT '',
  observacoes TEXT DEFAULT '',
  conduta TEXT DEFAULT '',
  conteudo_livre TEXT DEFAULT '',
  transcricao_audio TEXT DEFAULT '',
  resumo_ia TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'rascunho',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evolucoes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own evolucoes"
ON public.evolucoes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evolucoes"
ON public.evolucoes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evolucoes"
ON public.evolucoes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own evolucoes"
ON public.evolucoes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_evolucoes_updated_at
BEFORE UPDATE ON public.evolucoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_evolucoes_paciente ON public.evolucoes(paciente_id);
CREATE INDEX idx_evolucoes_user ON public.evolucoes(user_id);