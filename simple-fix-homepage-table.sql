-- Script simples para adicionar todas as colunas necessárias
-- Execute este script completo no Supabase SQL Editor

-- Adicionar coluna 'type'
ALTER TABLE homepage_visits ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'homepage_view';

-- Adicionar colunas para botões
ALTER TABLE homepage_visits ADD COLUMN IF NOT EXISTS button_id TEXT;
ALTER TABLE homepage_visits ADD COLUMN IF NOT EXISTS button_text TEXT;
ALTER TABLE homepage_visits ADD COLUMN IF NOT EXISTS button_type TEXT;

-- Adicionar colunas para seções
ALTER TABLE homepage_visits ADD COLUMN IF NOT EXISTS section_id TEXT;
ALTER TABLE homepage_visits ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER;

-- Inserir dados de teste para botões
INSERT INTO homepage_visits (
  visited_at,
  session_id,
  user_agent,
  ip_address,
  device_type,
  browser,
  os,
  type,
  button_id,
  button_text,
  button_type
) VALUES 
  (NOW(), 'test-session-1', 'Mozilla/5.0', '127.0.0.1', 'desktop', 'Chrome', 'Windows', 'button_click', 'btn-signup', 'Criar Conta', 'button'),
  (NOW(), 'test-session-1', 'Mozilla/5.0', '127.0.0.1', 'desktop', 'Chrome', 'Windows', 'button_click', 'btn-login', 'Entrar', 'button'),
  (NOW(), 'test-session-2', 'Mozilla/5.0', '127.0.0.1', 'mobile', 'Safari', 'iOS', 'button_click', 'btn-signup', 'Criar Conta', 'button'),
  (NOW(), 'test-session-2', 'Mozilla/5.0', '127.0.0.1', 'desktop', 'Firefox', 'Windows', 'button_click', 'btn-pricing', 'Ver Preços', 'button'),
  (NOW(), 'test-session-3', 'Mozilla/5.0', '127.0.0.1', 'tablet', 'Safari', 'iOS', 'button_click', 'btn-contact', 'Contato', 'button');

-- Inserir dados de teste para seções
INSERT INTO homepage_visits (
  visited_at,
  session_id,
  user_agent,
  ip_address,
  device_type,
  browser,
  os,
  type,
  section_id,
  time_spent_seconds
) VALUES 
  (NOW(), 'test-session-1', 'Mozilla/5.0', '127.0.0.1', 'desktop', 'Chrome', 'Windows', 'section_time', 'hero', 30),
  (NOW(), 'test-session-1', 'Mozilla/5.0', '127.0.0.1', 'desktop', 'Chrome', 'Windows', 'section_time', 'features', 45),
  (NOW(), 'test-session-2', 'Mozilla/5.0', '127.0.0.1', 'mobile', 'Safari', 'iOS', 'section_time', 'hero', 25),
  (NOW(), 'test-session-2', 'Mozilla/5.0', '127.0.0.1', 'mobile', 'Safari', 'iOS', 'section_time', 'cta', 60),
  (NOW(), 'test-session-3', 'Mozilla/5.0', '127.0.0.1', 'tablet', 'Safari', 'iOS', 'section_time', 'header', 15),
  (NOW(), 'test-session-3', 'Mozilla/5.0', '127.0.0.1', 'tablet', 'Safari', 'iOS', 'section_time', 'footer', 20);

-- Verificar se tudo foi criado corretamente
SELECT 
  'Colunas criadas:' as status,
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'homepage_visits' 
AND column_name IN ('type', 'button_id', 'button_text', 'button_type', 'section_id', 'time_spent_seconds')
ORDER BY column_name;

-- Verificar dados inseridos
SELECT 
  'Dados de teste:' as status,
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