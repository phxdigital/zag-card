-- Schema do banco de dados para o projeto Zag NFC
-- Execute este SQL no painel do Supabase

-- 1. Criar tabela de páginas
CREATE TABLE IF NOT EXISTS pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subdomain TEXT UNIQUE NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    logo_url TEXT,
    thumbnail_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.1. Adicionar coluna logo_url se não existir (para tabelas já criadas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'logo_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN logo_url TEXT;
    END IF;
END $$;

-- 1.2. Adicionar coluna thumbnail_url se não existir (para tabelas já criadas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'thumbnail_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pages_subdomain ON pages(subdomain);
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);

-- 3. Ativar Row Level Security (RLS)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
-- Política para SELECT: usuários podem ver suas próprias páginas
CREATE POLICY "Usuários podem ver suas próprias páginas"
ON pages FOR SELECT
USING ( auth.uid() = user_id );

-- Política para INSERT: usuários podem criar suas próprias páginas
CREATE POLICY "Usuários podem criar suas próprias páginas"
ON pages FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- Política para UPDATE: usuários podem atualizar suas próprias páginas
CREATE POLICY "Usuários podem atualizar suas próprias páginas"
ON pages FOR UPDATE
USING ( auth.uid() = user_id );

-- Política para DELETE: usuários podem deletar suas próprias páginas
CREATE POLICY "Usuários podem deletar suas próprias páginas"
ON pages FOR DELETE
USING ( auth.uid() = user_id );

-- 5. Criar bucket para logos no Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Políticas de segurança para o Storage
-- Política para SELECT: todos podem ver logos (público)
CREATE POLICY "Logos são públicos para visualização"
ON storage.objects FOR SELECT
USING ( bucket_id = 'logos' );

-- Política para INSERT: usuários podem fazer upload para sua própria pasta
CREATE POLICY "Usuários podem fazer upload de seus próprios logos"
ON storage.objects FOR INSERT
WITH CHECK ( 
    bucket_id = 'logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text 
);

-- Política para UPDATE: usuários podem atualizar seus próprios logos
CREATE POLICY "Usuários podem atualizar seus próprios logos"
ON storage.objects FOR UPDATE
USING ( 
    bucket_id = 'logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text 
);

-- Política para DELETE: usuários podem deletar seus próprios logos
CREATE POLICY "Usuários podem deletar seus próprios logos"
ON storage.objects FOR DELETE
USING ( 
    bucket_id = 'logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text 
);

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger para atualizar updated_at
CREATE TRIGGER update_pages_updated_at 
    BEFORE UPDATE ON pages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
