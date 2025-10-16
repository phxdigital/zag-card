-- Configuração do bucket para imagens processadas pelo remove.bg
-- Execute este SQL no Supabase SQL Editor

-- Criar bucket para imagens processadas
INSERT INTO storage.buckets (id, name, public)
VALUES ('processed-images', 'processed-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir uploads autenticados
CREATE POLICY "Allow authenticated uploads to processed-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'processed-images' AND 
  auth.role() = 'authenticated'
);

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access to processed-images" ON storage.objects
FOR SELECT USING (bucket_id = 'processed-images');

-- Política para permitir atualizações (upsert)
CREATE POLICY "Allow authenticated updates to processed-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'processed-images' AND 
  auth.role() = 'authenticated'
);

-- Política para permitir exclusões
CREATE POLICY "Allow authenticated deletes to processed-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'processed-images' AND 
  auth.role() = 'authenticated'
);
