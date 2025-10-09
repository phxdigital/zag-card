-- Políticas RLS para Admins visualizarem TODAS as páginas
-- Execute este SQL no painel do Supabase

-- 1. Remover políticas antigas de SELECT (se necessário)
DROP POLICY IF EXISTS "Usuários podem ver suas próprias páginas" ON pages;
DROP POLICY IF EXISTS "Admins podem ver todas as páginas" ON pages;

-- 2. Recriar política para usuários normais verem apenas suas páginas
CREATE POLICY "Usuários podem ver suas próprias páginas"
ON pages FOR SELECT
USING ( 
    auth.uid() = user_id 
    OR 
    -- OU se for admin, pode ver TODAS as páginas
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- 3. Política para DELETE - Admins podem deletar qualquer página
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias páginas" ON pages;
DROP POLICY IF EXISTS "Admins podem deletar qualquer página" ON pages;

CREATE POLICY "Usuários e admins podem deletar páginas"
ON pages FOR DELETE
USING ( 
    auth.uid() = user_id 
    OR 
    -- OU se for admin, pode deletar QUALQUER página
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- 4. Política para UPDATE - Admins podem editar qualquer página
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias páginas" ON pages;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer página" ON pages;

CREATE POLICY "Usuários e admins podem atualizar páginas"
ON pages FOR UPDATE
USING ( 
    auth.uid() = user_id 
    OR 
    -- OU se for admin, pode editar QUALQUER página
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- 5. VERIFICAÇÃO: Testar se as políticas estão funcionando
-- Execute como admin para ver se retorna TODAS as páginas:
-- SELECT id, subdomain, user_id, created_at FROM pages;

-- IMPORTANTE:
-- ✅ Certifique-se de que você tem um registro na tabela user_roles com role='admin'
-- ✅ Execute o SQL user-roles.sql primeiro se ainda não tiver

