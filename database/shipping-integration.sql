-- INTEGRAÇÃO DE SHIPPING - ESTRUTURA COMPLETA
-- ============================================
-- Execute este SQL no painel do Supabase para implementar
-- a integração com plataformas de envio

-- ============================================
-- PARTE 1: EXPANDIR TABELA PAYMENTS
-- ============================================

-- Adicionar campos de shipping à tabela payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tracking_code TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS shipping_carrier TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS shipping_service TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS estimated_delivery DATE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'pending';

-- Comentários para documentação
COMMENT ON COLUMN payments.shipping_address IS 'Endereço completo de entrega em formato JSON';
COMMENT ON COLUMN payments.tracking_code IS 'Código de rastreamento da transportadora';
COMMENT ON COLUMN payments.shipping_carrier IS 'Transportadora utilizada (correios, jadlog, etc)';
COMMENT ON COLUMN payments.shipping_service IS 'Tipo de serviço (PAC, SEDEX, etc)';
COMMENT ON COLUMN payments.shipping_cost IS 'Custo do frete';
COMMENT ON COLUMN payments.shipped_at IS 'Data e hora do envio';
COMMENT ON COLUMN payments.delivered_at IS 'Data e hora da entrega';
COMMENT ON COLUMN payments.estimated_delivery IS 'Data estimada de entrega';
COMMENT ON COLUMN payments.shipping_status IS 'Status do envio: pending, shipped, in_transit, delivered, returned';

-- ============================================
-- PARTE 2: TABELA DE ENDEREÇOS DE ENTREGA
-- ============================================

CREATE TABLE IF NOT EXISTS shipping_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  
  -- Dados pessoais
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Endereço completo
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'BR',
  
  -- Dados adicionais
  reference TEXT,
  instructions TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_payment_id ON shipping_addresses(payment_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_postal_code ON shipping_addresses(postal_code);

-- ============================================
-- PARTE 3: TABELA DE ENVIOS
-- ============================================

CREATE TABLE IF NOT EXISTS shipments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  
  -- Dados da transportadora
  carrier TEXT NOT NULL,
  service_type TEXT NOT NULL,
  tracking_code TEXT UNIQUE,
  
  -- Status e datas
  status TEXT DEFAULT 'created',
  estimated_delivery DATE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Custos
  shipping_cost DECIMAL(10,2),
  declared_value DECIMAL(10,2),
  
  -- Dados do pacote
  weight DECIMAL(10,3),
  dimensions JSONB, -- {length, width, height}
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_shipments_payment_id ON shipments(payment_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_code ON shipments(tracking_code);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_carrier ON shipments(carrier);

-- ============================================
-- PARTE 4: TABELA DE EVENTOS DE RASTREAMENTO
-- ============================================

CREATE TABLE IF NOT EXISTS tracking_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  
  -- Dados do evento
  status TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  
  -- Data e hora
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_date ON tracking_events(event_date);

-- ============================================
-- PARTE 5: TABELA DE CONFIGURAÇÕES DE FRETE
-- ============================================

CREATE TABLE IF NOT EXISTS shipping_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Configurações da transportadora
  carrier TEXT NOT NULL,
  service_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Configurações de preço
  base_cost DECIMAL(10,2),
  cost_per_kg DECIMAL(10,2),
  min_cost DECIMAL(10,2),
  max_cost DECIMAL(10,2),
  
  -- Configurações de prazo
  min_days INTEGER,
  max_days INTEGER,
  
  -- Configurações de região
  origin_postal_code TEXT,
  allowed_states TEXT[],
  excluded_states TEXT[],
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_shipping_configs_carrier ON shipping_configs(carrier);
CREATE INDEX IF NOT EXISTS idx_shipping_configs_active ON shipping_configs(is_active);

-- ============================================
-- PARTE 6: RLS (ROW LEVEL SECURITY)
-- ============================================

-- Ativar RLS nas novas tabelas
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_configs ENABLE ROW LEVEL SECURITY;

-- Políticas para shipping_addresses
CREATE POLICY "Users can view own shipping addresses"
  ON shipping_addresses FOR SELECT
  USING (
    payment_id IN (
      SELECT id FROM payments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage shipping addresses"
  ON shipping_addresses FOR ALL
  USING (true);

-- Políticas para shipments
CREATE POLICY "Users can view own shipments"
  ON shipments FOR SELECT
  USING (
    payment_id IN (
      SELECT id FROM payments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage shipments"
  ON shipments FOR ALL
  USING (true);

-- Políticas para tracking_events
CREATE POLICY "Users can view own tracking events"
  ON tracking_events FOR SELECT
  USING (
    shipment_id IN (
      SELECT s.id FROM shipments s
      JOIN payments p ON s.payment_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage tracking events"
  ON tracking_events FOR ALL
  USING (true);

-- Políticas para shipping_configs (apenas admin)
CREATE POLICY "Admins can manage shipping configs"
  ON shipping_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PARTE 7: TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_configs_updated_at
  BEFORE UPDATE ON shipping_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PARTE 8: DADOS INICIAIS
-- ============================================

-- Inserir configurações padrão dos Correios
INSERT INTO shipping_configs (
  carrier, service_type, is_active, base_cost, cost_per_kg, 
  min_days, max_days, origin_postal_code
) VALUES 
  ('correios', 'PAC', true, 15.00, 5.00, 3, 8, '88010001'),
  ('correios', 'SEDEX', true, 25.00, 8.00, 1, 3, '88010001'),
  ('correios', 'SEDEX_10', true, 35.00, 10.00, 1, 2, '88010001'),
  ('melhor_envio', 'PAC', true, 12.00, 4.50, 3, 7, '88010001'),
  ('melhor_envio', 'SEDEX', true, 22.00, 7.50, 1, 3, '88010001'),
  ('jadlog', 'PACKAGE', true, 18.00, 6.00, 2, 5, '88010001'),
  ('total_express', 'EXPRESS', true, 20.00, 7.00, 1, 2, '88010001')
ON CONFLICT DO NOTHING;

-- ============================================
-- PARTE 9: FUNÇÕES ÚTEIS
-- ============================================

-- Função para calcular frete
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
  p_weight DECIMAL,
  p_dimensions JSONB,
  p_origin_postal_code TEXT,
  p_destination_postal_code TEXT
)
RETURNS TABLE (
  carrier TEXT,
  service_type TEXT,
  cost DECIMAL,
  estimated_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.carrier,
    sc.service_type,
    GREATEST(
      sc.base_cost + (p_weight * sc.cost_per_kg),
      sc.min_cost
    ) as cost,
    sc.min_days as estimated_days
  FROM shipping_configs sc
  WHERE sc.is_active = true
    AND sc.origin_postal_code = p_origin_postal_code
  ORDER BY cost ASC;
END;
$$ LANGUAGE plpgsql;

-- Função para obter status de envio
CREATE OR REPLACE FUNCTION get_shipment_status(p_payment_id UUID)
RETURNS TABLE (
  tracking_code TEXT,
  status TEXT,
  carrier TEXT,
  estimated_delivery DATE,
  last_event TEXT,
  last_event_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.tracking_code,
    s.status,
    s.carrier,
    s.estimated_delivery,
    te.description as last_event,
    te.event_date as last_event_date
  FROM shipments s
  LEFT JOIN tracking_events te ON s.id = te.shipment_id
  WHERE s.payment_id = p_payment_id
  ORDER BY te.event_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PARTE 10: VIEWS ÚTEIS
-- ============================================

-- View para relatório de envios
CREATE OR REPLACE VIEW shipping_report AS
SELECT 
  p.id as payment_id,
  p.asaas_payment_id,
  p.plan_type,
  p.amount,
  p.status as payment_status,
  sa.name as customer_name,
  sa.city,
  sa.state,
  sa.postal_code,
  s.tracking_code,
  s.carrier,
  s.service_type,
  s.status as shipping_status,
  s.shipped_at,
  s.delivered_at,
  s.estimated_delivery,
  s.shipping_cost
FROM payments p
LEFT JOIN shipping_addresses sa ON p.id = sa.payment_id
LEFT JOIN shipments s ON p.id = s.payment_id;

-- ============================================
-- PARTE 11: VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('shipping_addresses', 'shipments', 'tracking_events', 'shipping_configs');
  
  IF table_count = 4 THEN
    RAISE NOTICE '✅ Todas as tabelas de shipping foram criadas com sucesso!';
  ELSE
    RAISE NOTICE '❌ Algumas tabelas não foram criadas. Verifique os erros acima.';
  END IF;
END $$;

-- Verificar se os campos foram adicionados à tabela payments
DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'payments'
    AND table_schema = 'public'
    AND column_name IN ('shipping_address', 'tracking_code', 'shipping_carrier', 'shipping_status');
  
  IF column_count = 4 THEN
    RAISE NOTICE '✅ Todos os campos de shipping foram adicionados à tabela payments!';
  ELSE
    RAISE NOTICE '❌ Alguns campos não foram adicionados. Verifique os erros acima.';
  END IF;
END $$;

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================

COMMENT ON TABLE shipping_addresses IS 'Endereços de entrega dos pedidos';
COMMENT ON TABLE shipments IS 'Informações de envio e rastreamento';
COMMENT ON TABLE tracking_events IS 'Histórico de eventos de rastreamento';
COMMENT ON TABLE shipping_configs IS 'Configurações de frete por transportadora';

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================

/*
APÓS EXECUTAR ESTE SQL:

1. Verifique se todas as tabelas foram criadas:
   SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%shipping%';

2. Teste a função de cálculo de frete:
   SELECT * FROM calculate_shipping_cost(1.5, '{"length": 20, "width": 15, "height": 5}', '88010001', '01310100');

3. Verifique as configurações de frete:
   SELECT * FROM shipping_configs;

4. Teste a view de relatório:
   SELECT * FROM shipping_report LIMIT 5;
*/
