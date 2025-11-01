-- Script para inserir dados de teste na tabela homepage_visits

-- Inserir dados de exemplo para botões
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
  (NOW(), 'test-session-2', 'Mozilla/5.0', '127.0.0.1', 'button_click', 'btn-pricing', 'Ver Preços', 'button');

-- Inserir dados de exemplo para seções
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
  (NOW(), 'test-session-2', 'Mozilla/5.0', '127.0.0.1', 'section_time', 'cta', 60);

-- Verificar se os dados foram inseridos
SELECT 
  type,
  button_id,
  button_text,
  section_id,
  time_spent_seconds,
  COUNT(*) as count
FROM homepage_visits 
WHERE type IN ('button_click', 'section_time')
GROUP BY type, button_id, button_text, section_id, time_spent_seconds;
