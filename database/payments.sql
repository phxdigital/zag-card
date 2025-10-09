-- ============================================
-- PARTE 1: Criar tabela profiles se não existir
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  cpf_cnpj TEXT,
  phone TEXT,
  mobile_phone TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_plan TEXT,
  max_pages INTEGER DEFAULT 1,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuários podem atualizar seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Política: Sistema pode inserir perfis
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- ============================================
-- PARTE 2: Tabela de pagamentos
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asaas_payment_id TEXT NOT NULL UNIQUE,
  asaas_customer_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('para_mim', 'para_equipe', 'para_negocio')),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL,
  billing_type TEXT NOT NULL DEFAULT 'PIX',
  due_date DATE NOT NULL,
  description TEXT,
  pix_qr_code TEXT,
  pix_qr_code_image TEXT,
  pix_expiration TIMESTAMP,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_asaas_payment_id ON payments(asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- RLS (Row Level Security)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios pagamentos
CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Apenas sistema pode inserir pagamentos (via service_role)
CREATE POLICY "Service role can insert payments"
  ON payments
  FOR INSERT
  WITH CHECK (true);

-- Política: Apenas sistema pode atualizar pagamentos
CREATE POLICY "Service role can update payments"
  ON payments
  FOR UPDATE
  USING (true);

-- ============================================
-- PARTE 3: Criar perfis para usuários existentes
-- ============================================

-- Inserir perfis para usuários que já existem mas não têm perfil
INSERT INTO profiles (id, email, name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1))
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.users.id)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE profiles IS 'Perfis de usuários com informações de assinatura';
COMMENT ON TABLE payments IS 'Armazena informações de pagamentos via Asaas';
COMMENT ON COLUMN payments.plan_type IS 'Tipo de plano: para_mim, para_equipe, para_negocio';
COMMENT ON COLUMN payments.status IS 'Status do pagamento no Asaas: PENDING, RECEIVED, CONFIRMED, etc.';

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Execute estas queries para verificar se tudo foi criado corretamente:
-- SELECT * FROM profiles LIMIT 5;
-- SELECT * FROM payments LIMIT 5;
-- 
-- Verificar se seu perfil existe:
-- SELECT * FROM profiles WHERE email = 'seu-email@exemplo.com';

