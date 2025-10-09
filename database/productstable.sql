-- ============================================
-- SETUP COMPLETO - ZAG NFC E-COMMERCE
-- Execute este arquivo COMPLETO no Supabase SQL Editor
-- ============================================

-- ============================================
-- PARTE 1: SISTEMA DE ROLES/PERMISSÕES
-- ============================================

-- Criar tabela de roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio role" ON user_roles;
CREATE POLICY "Usuários podem ver seu próprio role"
ON user_roles FOR SELECT
USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Apenas admins podem criar roles" ON user_roles;
CREATE POLICY "Apenas admins podem criar roles"
ON user_roles FOR INSERT
WITH CHECK ( false );

DROP POLICY IF EXISTS "Apenas admins podem atualizar roles" ON user_roles;
CREATE POLICY "Apenas admins podem atualizar roles"
ON user_roles FOR UPDATE
USING ( false );

-- Funções
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_id = $1 AND user_roles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM user_roles WHERE user_roles.user_id = $1;
    RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION upsert_user_role()
RETURNS TRIGGER AS $$
DECLARE
    admin_emails TEXT[] := ARRAY['andresavite@gmail.com'];
    user_role TEXT;
BEGIN
    IF NEW.email = ANY(admin_emails) THEN
        user_role := 'admin';
    ELSE
        user_role := 'user';
    END IF;
    
    INSERT INTO user_roles (user_id, email, role)
    VALUES (NEW.id, NEW.email, user_role)
    ON CONFLICT (user_id) DO UPDATE SET 
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION upsert_user_role();

-- Inserir admin
INSERT INTO user_roles (user_id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'andresavite@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = NOW();

-- ============================================
-- PARTE 2: TABELA DE PERFIS
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- ============================================
-- PARTE 3: SISTEMA DE PRODUTOS
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_price DECIMAL(10, 2),
  category TEXT,
  tags TEXT[],
  features JSONB DEFAULT '[]'::jsonb,
  stock_quantity INTEGER DEFAULT 0,
  stock_status TEXT DEFAULT 'in_stock',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  requires_shipping BOOLEAN DEFAULT true,
  weight DECIMAL(10, 2),
  dimensions JSONB,
  shipping_time TEXT,
  asaas_product_id TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  meta_title TEXT,
  meta_description TEXT
);

CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES product_categories(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shipping_name TEXT,
  shipping_email TEXT,
  shipping_phone TEXT,
  shipping_address JSONB,
  payment_method TEXT,
  asaas_payment_id TEXT,
  asaas_customer_id TEXT,
  payment_link TEXT,
  pix_qr_code TEXT,
  pix_qr_code_image TEXT,
  tracking_code TEXT,
  shipping_carrier TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTE 4: SISTEMA DE PAGAMENTOS
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

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_asaas_payment_id ON payments(asaas_payment_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Produtos
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- Categorias
DROP POLICY IF EXISTS "Anyone can view active categories" ON product_categories;
CREATE POLICY "Anyone can view active categories" ON product_categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage categories" ON product_categories;
CREATE POLICY "Admins can manage categories" ON product_categories FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- Pedidos
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

DROP POLICY IF EXISTS "System can manage orders" ON orders;
CREATE POLICY "System can manage orders" ON orders FOR ALL USING (true);

-- Itens do pedido
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

DROP POLICY IF EXISTS "System can manage order items" ON order_items;
CREATE POLICY "System can manage order items" ON order_items FOR ALL USING (true);

-- Pagamentos
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert payments" ON payments;
CREATE POLICY "Service role can insert payments" ON payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update payments" ON payments;
CREATE POLICY "Service role can update payments" ON payments FOR UPDATE USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Categorias
INSERT INTO product_categories (name, slug, description, display_order) VALUES
  ('Cartões NFC', 'cartoes-nfc', 'Cartões de visita digital com tecnologia NFC', 1),
  ('Adesivos NFC', 'adesivos-nfc', 'Adesivos inteligentes com NFC', 2),
  ('Kits', 'kits', 'Kits completos para profissionais e empresas', 3)
ON CONFLICT (slug) DO NOTHING;

-- Produtos de exemplo
INSERT INTO products (
  name, slug, description, short_description, price, compare_price,
  category, features, stock_quantity, is_featured, requires_shipping, shipping_time
) VALUES (
  'Kit Para Mim',
  'kit-para-mim',
  'Perfeito para profissionais que querem modernizar seu networking.',
  'Kit individual para profissionais',
  89.00, 129.00, 'Kits',
  '["1 Cartão NFC Premium","Página web personalizada","QR Code integrado","Atualizações ilimitadas","Suporte por email"]'::jsonb,
  100, false, true, '5-7 dias úteis'
),
(
  'Kit Para Minha Equipe',
  'kit-para-equipe',
  'Ideal para equipes e pequenas empresas.',
  'Kit para equipes de 2-5 pessoas',
  387.00, 645.00, 'Kits',
  '["2 Cartões NFC Premium","3 Adesivos personalizados NFC","Páginas web personalizadas","QR Codes integrados","Atualizações ilimitadas","Integração PIX","Estatísticas de acessos","Suporte prioritário"]'::jsonb,
  50, true, true, '3-5 dias úteis'
),
(
  'Kit Para Meu Negócio',
  'kit-para-negocio',
  'Solução completa para empresas.',
  'Kit empresarial completo',
  928.00, 2062.00, 'Kits',
  '["8 Cartões NFC Premium","8 Adesivos personalizados NFC","8 Páginas web personalizadas","QR Codes integrados","Atualizações ilimitadas","Integração PIX","Analytics avançado","Suporte VIP 24/7","Gerente de conta dedicado"]'::jsonb,
  30, false, true, '2-3 dias úteis - Envio expresso'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- FIM DO SETUP
-- ============================================

-- Verificar se tudo foi criado
SELECT 'Setup completo! ✅' AS status;
SELECT COUNT(*) AS total_produtos FROM products;
SELECT COUNT(*) AS total_categorias FROM product_categories;
SELECT email, role FROM user_roles WHERE role = 'admin';

