-- Script para verificar se o RLS está configurado corretamente
-- Execute este SQL no painel do Supabase para verificar

-- 1. Verificar se RLS está ativo na tabela pages
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'pages';

-- 2. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'pages';

-- 3. Verificar se o bucket logos existe
SELECT name, public, created_at 
FROM storage.buckets 
WHERE name = 'logos';

-- 4. Verificar políticas do storage
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 5. Testar inserção sem autenticação (deve falhar se RLS estiver ativo)
-- Descomente a linha abaixo para testar:
-- INSERT INTO pages (subdomain, config, user_id) VALUES ('teste', '{}', '00000000-0000-0000-0000-000000000000');

-- 6. Verificar se a função de trigger existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'update_updated_at_column';

-- 7. Verificar se o trigger está ativo
SELECT tgname, tgrelid::regclass, tgenabled 
FROM pg_trigger 
WHERE tgname = 'update_pages_updated_at';
