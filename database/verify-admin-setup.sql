-- ✅ Script de Verificação - Setup de Admin Pages
-- Execute este SQL para verificar se tudo está configurado corretamente

-- 1. Verificar se a tabela user_roles existe
SELECT 
    'user_roles' as tabela,
    COUNT(*) as total_usuarios,
    SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins
FROM user_roles;

-- 2. Verificar se a tabela pages tem as colunas necessárias
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pages'
AND table_schema = 'public'
AND column_name IN ('id', 'subdomain', 'user_id', 'is_active', 'title', 'subtitle', 'status', 'created_at', 'updated_at')
ORDER BY column_name;

-- 3. Verificar políticas RLS da tabela pages
SELECT 
    policyname as nome_politica,
    cmd as comando,
    qual as condicao
FROM pg_policies
WHERE tablename = 'pages'
ORDER BY policyname;

-- 4. Verificar se RLS está ativado
SELECT 
    tablename,
    rowsecurity as rls_ativado
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('pages', 'user_roles');

-- 5. Listar admins cadastrados
SELECT 
    ur.email,
    ur.role,
    ur.created_at as role_criado_em,
    u.email_confirmed_at as email_confirmado_em
FROM user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;

-- 6. Verificar total de páginas no sistema
SELECT 
    COUNT(*) as total_paginas,
    SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as paginas_ativas,
    SUM(CASE WHEN NOT is_active THEN 1 ELSE 0 END) as paginas_inativas
FROM pages;

-- 7. Listar páginas com informações do usuário (top 10)
SELECT 
    p.subdomain,
    p.is_active,
    p.created_at,
    ur.email as usuario_email,
    ur.role as usuario_role
FROM pages p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
ORDER BY p.created_at DESC
LIMIT 10;

-- 8. Verificar se existem usuários sem role
SELECT 
    u.email,
    u.created_at as cadastrado_em,
    ur.role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role IS NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- ✅ CHECKLIST DE VERIFICAÇÃO:
-- 
-- [ ] user_roles existe e tem admins
-- [ ] pages tem colunas: is_active, title, subtitle, status
-- [ ] RLS está ativado em pages e user_roles
-- [ ] Existem políticas que permitem admin ver todas as páginas
-- [ ] Seu email está cadastrado como admin
-- [ ] Páginas aparecem na consulta #7
--
-- Se algum desses itens falhar, execute os scripts na ordem:
-- 1. database/user-roles.sql
-- 2. database/add-is-active-to-pages.sql
-- 3. database/admin-pages-policies.sql

