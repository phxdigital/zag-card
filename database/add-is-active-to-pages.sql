-- Adicionar coluna is_active à tabela pages
-- Execute este SQL no painel do Supabase

-- 1. Adicionar coluna is_active se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'is_active'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Coluna is_active adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna is_active já existe!';
    END IF;
END $$;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_pages_is_active ON pages(is_active);

-- 3. Atualizar páginas existentes para is_active = true (se necessário)
UPDATE pages SET is_active = true WHERE is_active IS NULL;

-- 4. Adicionar colunas title e subtitle se não existirem (usadas no dashboard)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN title TEXT;
        RAISE NOTICE 'Coluna title adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna title já existe!';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'subtitle'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN subtitle TEXT;
        RAISE NOTICE 'Coluna subtitle adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna subtitle já existe!';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Coluna status adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna status já existe!';
    END IF;
END $$;

-- 5. Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pages'
AND table_schema = 'public'
ORDER BY ordinal_position;

