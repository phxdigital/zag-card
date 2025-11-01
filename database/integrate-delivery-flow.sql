-- ============================================
-- INTEGRAÇÃO COMPLETA: PAGAMENTO → DESIGN → APROVAÇÃO → ENTREGA
-- ============================================
-- Este script integra o fluxo completo de produção e entrega:
-- 1. Pagamento (payments)
-- 2. Design criado pelo cliente (pages)
-- 3. Aprovação do admin (admin_notifications)
-- 4. Entrega do produto físico (shipping_addresses)

-- ============================================
-- PARTE 1: ADICIONAR RELACIONAMENTOS NAS TABELAS
-- ============================================

-- 1.1. Adicionar payment_id na tabela pages
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'payment_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN payment_id UUID REFERENCES payments(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_pages_payment_id ON pages(payment_id);
    END IF;
END $$;

-- 1.2. Adicionar page_id na tabela admin_notifications
-- Primeiro verificar o tipo real da coluna id na tabela pages
DO $$ 
DECLARE
    page_id_type TEXT;
BEGIN
    -- Verificar tipo da coluna id na tabela pages
    SELECT data_type INTO page_id_type
    FROM information_schema.columns 
    WHERE table_name = 'pages' 
    AND column_name = 'id'
    AND table_schema = 'public';
    
    -- Verificar se page_id já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_notifications' 
        AND column_name = 'page_id'
        AND table_schema = 'public'
    ) THEN
        -- Usar o tipo correto baseado no que foi encontrado
        IF page_id_type = 'uuid' THEN
            ALTER TABLE admin_notifications ADD COLUMN page_id UUID REFERENCES pages(id) ON DELETE CASCADE;
        ELSIF page_id_type = 'bigint' OR page_id_type = 'integer' THEN
            ALTER TABLE admin_notifications ADD COLUMN page_id BIGINT REFERENCES pages(id) ON DELETE CASCADE;
        ELSE
            RAISE EXCEPTION 'Tipo de coluna id na tabela pages não reconhecido: %', page_id_type;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_admin_notifications_page_id ON admin_notifications(page_id);
    END IF;
END $$;

-- 1.3. Adicionar page_id na tabela shipping_addresses
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shipping_addresses' 
        AND column_name = 'page_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE shipping_addresses ADD COLUMN page_id UUID REFERENCES pages(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_shipping_addresses_page_id ON shipping_addresses(page_id);
    END IF;
END $$;

-- ============================================
-- PARTE 2: ADICIONAR STATUS DE PRODUÇÃO
-- ============================================

-- 2.1. Adicionar production_status na tabela pages
-- Status possíveis:
-- 'pending' - Design criado, aguardando aprovação
-- 'approved' - Aprovado pelo admin, pronto para produção
-- 'in_production' - Em produção (cartão sendo fabricado)
-- 'ready_to_ship' - Pronto para envio (endereço coletado)
-- 'shipped' - Enviado (com tracking_code)
-- 'delivered' - Entregue ao cliente
-- 'cancelled' - Cancelado
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'production_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN production_status TEXT DEFAULT 'pending' 
            CHECK (production_status IN ('pending', 'approved', 'in_production', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'));
        CREATE INDEX IF NOT EXISTS idx_pages_production_status ON pages(production_status);
    END IF;
END $$;

-- 2.2. Adicionar campos de produção
DO $$ 
BEGIN
    -- Data de aprovação
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'approved_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Data de início da produção
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'production_started_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN production_started_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Tracking code do envio
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'tracking_code'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN tracking_code TEXT;
        CREATE INDEX IF NOT EXISTS idx_pages_tracking_code ON pages(tracking_code);
    END IF;
END $$;

-- ============================================
-- PARTE 3: COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON COLUMN pages.payment_id IS 'Relaciona o design com o pagamento que o liberou';
COMMENT ON COLUMN pages.production_status IS 'Status do fluxo de produção: pending, approved, in_production, ready_to_ship, shipped, delivered';
COMMENT ON COLUMN pages.approved_at IS 'Data/hora da aprovação pelo admin';
COMMENT ON COLUMN pages.production_started_at IS 'Data/hora do início da produção';
COMMENT ON COLUMN pages.tracking_code IS 'Código de rastreamento do envio';
COMMENT ON COLUMN admin_notifications.page_id IS 'Relaciona a notificação com o design específico';
COMMENT ON COLUMN shipping_addresses.page_id IS 'Relaciona o endereço de entrega com o design específico';

-- ============================================
-- PARTE 4: VIEWS ÚTEIS PARA ADMIN
-- ============================================

-- View para ver o fluxo completo: Pagamento → Design → Aprovação → Entrega
CREATE OR REPLACE VIEW order_flow_view AS
SELECT 
    p.id AS page_id,
    p.subdomain,
    p.production_status,
    p.approved_at,
    p.production_started_at,
    p.tracking_code,
    
    -- Dados do pagamento
    pay.id AS payment_id,
    pay.plan_type,
    pay.amount,
    pay.status AS payment_status,
    pay.created_at AS payment_date,
    
    -- Dados do usuário
    u.email AS user_email,
    prof.name AS user_name,
    
    -- Dados de aprovação
    an.id AS notification_id,
    an.status AS approval_status,
    an.created_at AS notification_date,
    
    -- Dados de entrega
    sa.id AS shipping_address_id,
    sa.name AS shipping_name,
    sa.street,
    sa.number,
    sa.city,
    sa.state,
    sa.postal_code,
    
    -- Dados do envio
    s.id AS shipment_id,
    s.carrier,
    s.tracking_code AS shipment_tracking,
    s.status AS shipment_status
    
FROM pages p
LEFT JOIN payments pay ON p.payment_id = pay.id
LEFT JOIN auth.users u ON pay.user_id = u.id
LEFT JOIN profiles prof ON u.id = prof.id
LEFT JOIN admin_notifications an ON p.id = an.page_id
LEFT JOIN shipping_addresses sa ON p.id = sa.page_id
LEFT JOIN shipments s ON pay.id = s.payment_id
ORDER BY p.created_at DESC;

COMMENT ON VIEW order_flow_view IS 'Visão completa do fluxo: Pagamento → Design → Aprovação → Entrega';

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Execute estas queries para verificar se tudo foi criado corretamente:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pages' AND column_name IN ('payment_id', 'production_status', 'approved_at', 'tracking_code');
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'admin_notifications' AND column_name = 'page_id';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'shipping_addresses' AND column_name = 'page_id';
-- SELECT * FROM order_flow_view LIMIT 5;

