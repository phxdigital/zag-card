-- Adicionar colunas para analytics avançado
ALTER TABLE page_visits 
ADD COLUMN IF NOT EXISTS button_id TEXT,
ADD COLUMN IF NOT EXISTS button_text TEXT,
ADD COLUMN IF NOT EXISTS button_type TEXT,
ADD COLUMN IF NOT EXISTS section_id TEXT,
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER;
