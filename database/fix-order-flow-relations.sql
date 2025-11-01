-- ============================================
-- CORREÇÃO E GARANTIA DE RELACIONAMENTOS DO FLUXO COMPLETO
-- ============================================
-- Este script garante que todos os dados do fluxo estejam corretamente relacionados:
-- 1. payments (pagamento) - identificador raiz do fluxo
-- 2. pages (design/landing page) - vinculado a payment_id
-- 3. admin_notifications (aprovação) - vinculado a page_id
-- 4. shipping_addresses (endereço) - vinculado a payment_id E page_id
-- 5. shipments (envio) - vinculado a payment_id
--
-- O payment_id será o identificador único do fluxo completo

-- ============================================
-- PARTE 1: CORRIGIR RELACIONAMENTOS EXISTENTES
-- ============================================

-- 1.1. Atualizar shipping_addresses que não têm page_id mas têm payment_id
-- Buscar page_id através do payment_id e vincular
UPDATE shipping_addresses sa
SET page_id = (
    SELECT p.id 
    FROM pages p 
    WHERE p.payment_id = sa.payment_id 
    ORDER BY p.created_at DESC 
    LIMIT 1
)
WHERE sa.page_id IS NULL 
  AND sa.payment_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM pages p WHERE p.payment_id = sa.payment_id
  );

-- 1.2. Atualizar admin_notifications que não têm page_id
-- Buscar page_id através do subdomain e vincular
UPDATE admin_notifications an
SET page_id = (
    SELECT p.id 
    FROM pages p 
    WHERE p.subdomain = an.subdomain 
    ORDER BY p.created_at DESC 
    LIMIT 1
)
WHERE an.page_id IS NULL 
  AND an.subdomain IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM pages p WHERE p.subdomain = an.subdomain
  );

-- 1.3. Garantir que todas as pages tenham production_status
UPDATE pages
SET production_status = COALESCE(production_status, 'pending')
WHERE production_status IS NULL;

-- ============================================
-- PARTE 2: ADICIONAR CAMPO page_id NA TABELA shipments
-- ============================================

-- 2.1. Adicionar page_id na tabela shipments se não existir
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
    
    -- Verificar se page_id já existe em shipments
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shipments' 
        AND column_name = 'page_id'
        AND table_schema = 'public'
    ) THEN
        -- Usar o tipo correto baseado no que foi encontrado
        IF page_id_type = 'uuid' THEN
            ALTER TABLE shipments ADD COLUMN page_id UUID REFERENCES pages(id) ON DELETE SET NULL;
        ELSIF page_id_type = 'bigint' OR page_id_type = 'integer' THEN
            ALTER TABLE shipments ADD COLUMN page_id BIGINT REFERENCES pages(id) ON DELETE SET NULL;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_shipments_page_id ON shipments(page_id);
    END IF;
END $$;

-- 2.2. Preencher page_id em shipments existentes
UPDATE shipments s
SET page_id = (
    SELECT p.id 
    FROM pages p 
    WHERE p.payment_id = s.payment_id 
    ORDER BY p.created_at DESC 
    LIMIT 1
)
WHERE s.page_id IS NULL 
  AND s.payment_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM pages p WHERE p.payment_id = s.payment_id
  );

-- ============================================
-- PARTE 3: MELHORAR VIEW DE FLUXO COMPLETO
-- ============================================

-- 3.1. Criar/Atualizar view unificada do fluxo usando payment_id como identificador principal
CREATE OR REPLACE VIEW complete_order_flow AS
SELECT 
    -- Identificador do fluxo (payment_id é o raiz)
    pay.id AS order_id,  -- payment_id como identificador único do fluxo
    pay.id AS payment_id,
    
    -- Dados do pagamento
    pay.plan_type,
    pay.amount,
    pay.status AS payment_status,
    pay.created_at AS payment_date,
    
    -- Dados do usuário
    u.id AS user_id,
    u.email AS user_email,
    prof.name AS user_name,
    
    -- Dados do design/landing page
    p.id AS page_id,
    p.subdomain,
    p.production_status,
    p.approved_at,
    p.production_started_at,
    p.tracking_code,
    p.created_at AS page_created_at,
    
    -- Dados de aprovação
    an.id AS notification_id,
    an.status AS approval_status,
    an.created_at AS notification_date,
    
    -- Dados de entrega
    sa.id AS shipping_address_id,
    sa.name AS shipping_name,
    sa.street,
    sa.number,
    sa.complement,
    sa.neighborhood,
    sa.city,
    sa.state,
    sa.postal_code,
    sa.phone AS shipping_phone,
    sa.email AS shipping_email,
    
    -- Dados do envio
    s.id AS shipment_id,
    s.carrier,
    s.service_type,
    s.tracking_code AS shipment_tracking_code,
    s.status AS shipment_status,
    s.shipped_at,
    s.shipping_cost,
    s.declared_value
    
FROM payments pay
LEFT JOIN auth.users u ON pay.user_id = u.id
LEFT JOIN profiles prof ON u.id = prof.id
LEFT JOIN pages p ON p.payment_id = pay.id
LEFT JOIN admin_notifications an ON an.page_id = p.id
LEFT JOIN shipping_addresses sa ON sa.payment_id = pay.id
LEFT JOIN shipments s ON s.payment_id = pay.id
ORDER BY pay.created_at DESC;

COMMENT ON VIEW complete_order_flow IS 'Visão completa do fluxo usando payment_id como identificador único do pedido';

-- ============================================
-- PARTE 4: FUNÇÃO HELPER PARA BUSCAR FLUXO POR payment_id
-- ============================================

CREATE OR REPLACE FUNCTION get_order_flow(p_payment_id UUID)
RETURNS TABLE (
    order_id UUID,
    payment_id UUID,
    payment_status TEXT,
    page_id UUID,
    subdomain TEXT,
    production_status TEXT,
    notification_id UUID,
    approval_status TEXT,
    shipping_address_id UUID,
    shipment_id UUID,
    tracking_code TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS order_id,
        p.id AS payment_id,
        p.status AS payment_status,
        pg.id AS page_id,
        pg.subdomain,
        pg.production_status,
        an.id AS notification_id,
        an.status AS approval_status,
        sa.id AS shipping_address_id,
        s.id AS shipment_id,
        s.tracking_code
    FROM payments p
    LEFT JOIN pages pg ON pg.payment_id = p.id
    LEFT JOIN admin_notifications an ON an.page_id = pg.id
    LEFT JOIN shipping_addresses sa ON sa.payment_id = p.id
    LEFT JOIN shipments s ON s.payment_id = p.id
    WHERE p.id = p_payment_id
    ORDER BY pg.created_at DESC NULLS LAST
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PARTE 5: ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices adicionais para melhorar performance das queries
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_payment_id ON shipping_addresses(payment_id);
CREATE INDEX IF NOT EXISTS idx_shipments_payment_id ON shipments(payment_id);
CREATE INDEX IF NOT EXISTS idx_pages_payment_id_status ON pages(payment_id, production_status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_subdomain ON admin_notifications(subdomain);

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Execute estas queries para verificar:
-- SELECT * FROM complete_order_flow WHERE payment_status = 'CONFIRMED' LIMIT 10;
-- SELECT * FROM get_order_flow('payment_id_aqui');
-- SELECT COUNT(*) as total, payment_status FROM complete_order_flow GROUP BY payment_status;

