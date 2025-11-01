-- Adicionar coluna 'type' na tabela homepage_visits
ALTER TABLE homepage_visits 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'homepage_view';
