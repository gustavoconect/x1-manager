-- CORREÇÃO PARA TABELA PLAYERS EXISTENTE
-- Rode isso no SQL Editor do Supabase para adicionar as colunas que faltam

ALTER TABLE public.players ADD COLUMN IF NOT EXISTS wins integer DEFAULT 0;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS losses integer DEFAULT 0;

-- Opcional: Garantir que history é JSONB
ALTER TABLE public.players ALTER COLUMN history TYPE jsonb USING history::jsonb;
ALTER TABLE public.players ALTER COLUMN history SET DEFAULT '[]'::jsonb;
