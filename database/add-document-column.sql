-- ============================================
-- ADICIONAR COLUNA DOCUMENT (CPF/CNPJ) NA TABELA shipping_addresses
-- ============================================
-- Execute este SQL no painel do Supabase para adicionar
-- a coluna document (CPF/CNPJ) na tabela shipping_addresses

-- Adicionar coluna document se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_addresses' 
    AND column_name = 'document'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE shipping_addresses ADD COLUMN document TEXT;
    
    COMMENT ON COLUMN shipping_addresses.document IS 'CPF/CNPJ do destinatário (apenas números, sem formatação)';
    
    RAISE NOTICE '✅ Coluna document adicionada com sucesso na tabela shipping_addresses!';
  ELSE
    RAISE NOTICE '⚠️ Coluna document já existe na tabela shipping_addresses.';
  END IF;
END $$;

