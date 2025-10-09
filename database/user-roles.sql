-- Sistema de Roles/Permissões para Zag NFC
-- Execute este SQL no painel do Supabase

-- 1. Criar tabela de roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'admin' ou 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- 3. Ativar Row Level Security (RLS)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança
-- Usuários podem ver apenas seu próprio role
CREATE POLICY "Usuários podem ver seu próprio role"
ON user_roles FOR SELECT
USING ( auth.uid() = user_id );

-- Apenas admins podem inserir novos roles (será feito via função)
CREATE POLICY "Apenas admins podem criar roles"
ON user_roles FOR INSERT
WITH CHECK ( false ); -- Bloqueado por padrão, usar função especial

-- Apenas admins podem atualizar roles (será feito via função)
CREATE POLICY "Apenas admins podem atualizar roles"
ON user_roles FOR UPDATE
USING ( false );

-- 5. Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE user_roles.user_id = $1 
        AND user_roles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para obter role do usuário
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM user_roles
    WHERE user_roles.user_id = $1;
    
    -- Se não encontrar role, retornar 'user' como padrão
    RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para criar/atualizar role de usuário (automática no primeiro login)
CREATE OR REPLACE FUNCTION upsert_user_role()
RETURNS TRIGGER AS $$
DECLARE
    admin_emails TEXT[] := ARRAY['andresavite@gmail.com']; -- Lista de emails de admin
    user_role TEXT;
BEGIN
    -- Determinar o role baseado no email
    IF NEW.email = ANY(admin_emails) THEN
        user_role := 'admin';
    ELSE
        user_role := 'user';
    END IF;

    -- Inserir ou atualizar o role
    INSERT INTO user_roles (user_id, email, role)
    VALUES (NEW.id, NEW.email, user_role)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar trigger para atualizar role automaticamente quando usuário faz login
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION upsert_user_role();

-- 9. Trigger para atualizar updated_at
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Inserir role de admin para o email específico (se o usuário já existir)
-- Substitua 'andresavite@gmail.com' pelo seu email
INSERT INTO user_roles (user_id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'andresavite@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'admin',
    updated_at = NOW();

-- 11. View para listar usuários com suas roles (útil para consultas)
CREATE OR REPLACE VIEW users_with_roles AS
SELECT 
    u.id,
    u.email,
    u.created_at as user_created_at,
    COALESCE(ur.role, 'user') as role,
    ur.created_at as role_created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id;

-- 12. Conceder permissões necessárias
GRANT SELECT ON users_with_roles TO authenticated;

-- VERIFICAÇÃO: Execute esta query para confirmar que tudo está funcionando
-- SELECT * FROM users_with_roles WHERE email = 'andresavite@gmail.com';
