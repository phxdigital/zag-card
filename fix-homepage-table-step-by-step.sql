-- Script passo a passo para corrigir a tabela homepage_visits
-- Execute cada seção separadamente no Supabase SQL Editor

-- PASSO 1: Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'homepage_visits' 
ORDER BY column_name;

-- PASSO 2: Adicionar coluna 'type' se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'homepage_visits' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE homepage_visits ADD COLUMN type TEXT DEFAULT 'homepage_view';
    END IF;
END $$;

-- PASSO 3: Adicionar colunas para botões se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'homepage_visits' 
        AND column_name = 'button_id'
    ) THEN
        ALTER TABLE homepage_visits ADD COLUMN button_id TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'homepage_visits' 
        AND column_name = 'button_text'
    ) THEN
        ALTER TABLE homepage_visits ADD COLUMN button_text TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'homepage_visits' 
        AND column_name = 'button_type'
    ) THEN
        ALTER TABLE homepage_visits ADD COLUMN button_type TEXT;
    END IF;
END $$;

-- PASSO 4: Adicionar colunas para seções se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'homepage_visits' 
        AND column_name = 'section_id'
    ) THEN
        ALTER TABLE homepage_visits ADD COLUMN section_id TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'homepage_visits' 
        AND column_name = 'time_spent_seconds'
    ) THEN
        ALTER TABLE homepage_visits ADD COLUMN time_spent_seconds INTEGER;
    END IF;
END $$;

-- PASSO 5: Verificar se todas as colunas foram adicionadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'homepage_visits' 
AND column_name IN ('type', 'button_id', 'button_text', 'button_type', 'section_id', 'time_spent_seconds')
ORDER BY column_name;
