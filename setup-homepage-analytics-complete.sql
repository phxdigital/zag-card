-- Script completo para configurar analytics da homepage
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna 'type' se não existir
ALTER TABLE homepage_visits 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'homepage_view';

-- 2. Adicionar colunas para tracking de botões
ALTER TABLE homepage_visits 
ADD COLUMN IF NOT EXISTS button_id TEXT,
ADD COLUMN IF NOT EXISTS button_text TEXT,
ADD COLUMN IF NOT EXISTS button_type TEXT;

-- 3. Adicionar colunas para tracking de seções
ALTER TABLE homepage_visits 
ADD COLUMN IF NOT EXISTS section_id TEXT,
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER;

-- 4. Inserir dados de teste para botões
INSERT INTO homepage_visits (
  visited_at,
  session_id,
  user_agent,
  ip_address,
  type,
  button_id,
  button_text,
  button_type
) VALUES 
  (NOW(), 'test-session-1', 'Mozilla/5.0', '127.0.0.1', 'button_click', 'btn-signup', 'Criar Conta', 'button'),
  (NOW(), 'test-session-1', 'Mozilla/5.0', '127.0.0.1', 'button_click', 'btn-login', 'Entrar', 'button'),
  (NOW(), 'test-session-2', 'Mozilla/5.0', '127.0.0.1', 'button_click', 'btn-signup', 'Criar Conta', 'button'),
  (NOW(), 'test-session-2', 'Mozilla/5.0', '127.0.0.1', 'button_click', 'btn-pricing', 'Ver Preços', 'button'),
  (NOW(), 'test-session-3', 'Mozilla/5.0', '127.0.0.1', 'button_click', 'btn-contact', 'Contato', 'button');

-- 5. Inserir dados de teste para seções
INSERT INTO homepage_visits (
  visited_at,
  session_id,
  user_agent,
  ip_address,
  type,
  section_id,
  time_spent_seconds
) VALUES 
  (NOW(), 'test-session-1', 'Mozilla/5.0', '127.0.0.1', 'section_time', 'hero', 30),
  (NOW(), 'test-session-1', 'Mozilla/5.0', '127.0.0.1', 'section_time', 'features', 45),
  (NOW(), 'test-session-2', 'Mozilla/5.0', '127.0.0.1', 'section_time', 'hero', 25),
  (NOW(), 'test-session-2', 'Mozilla/5.0', '127.0.0.1', 'section_time', 'cta', 60),
  (NOW(), 'test-session-3', 'Mozilla/5.0', '127.0.0.1', 'section_time', 'header', 15),
  (NOW(), 'test-session-3', 'Mozilla/5.0', '127.0.0.1', 'section_time', 'footer', 20);

-- 6. Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'homepage_visits' 
AND column_name IN ('type', 'button_id', 'button_text', 'button_type', 'section_id', 'time_spent_seconds')
ORDER BY column_name;

-- 7. Verificar se os dados de teste foram inseridos
SELECT 
  type,
  button_id,
  button_text,
  section_id,
  time_spent_seconds,
  COUNT(*) as count
FROM homepage_visits 
WHERE type IN ('button_click', 'section_time')
GROUP BY type, button_id, button_text, section_id, time_spent_seconds
ORDER BY type, count DESC;
