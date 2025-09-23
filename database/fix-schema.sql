-- Script para corrigir o schema da tabela pages
-- Execute este SQL no painel do Supabase

-- 1. Adicionar a coluna logo_url se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'logo_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN logo_url TEXT;
        RAISE NOTICE 'Coluna logo_url adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna logo_url já existe';
    END IF;
END $$;

-- 2. Verificar se todas as colunas necessárias existem
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'pages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se o RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'pages';

-- 4. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'pages';

-- 5. Criar bucket logos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Verificar se o bucket foi criado
SELECT name, public, created_at 
FROM storage.buckets 
WHERE name = 'logos';
