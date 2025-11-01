-- Script para corrigir a tabela homepage_visits e adicionar colunas necessárias

-- Adicionar coluna 'type' se não existir
ALTER TABLE homepage_visits 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'homepage_view';

-- Adicionar colunas para tracking de botões se não existirem
ALTER TABLE homepage_visits 
ADD COLUMN IF NOT EXISTS button_id TEXT,
ADD COLUMN IF NOT EXISTS button_text TEXT,
ADD COLUMN IF NOT EXISTS button_type TEXT;

-- Adicionar colunas para tracking de seções se não existirem
ALTER TABLE homepage_visits 
ADD COLUMN IF NOT EXISTS section_id TEXT,
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'homepage_visits' 
AND column_name IN ('type', 'button_id', 'button_text', 'button_type', 'section_id', 'time_spent_seconds')
ORDER BY column_name;
