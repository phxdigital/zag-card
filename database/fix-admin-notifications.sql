-- Corrigir políticas RLS para admin_notifications
-- Primeiro, remover políticas existentes
DROP POLICY IF EXISTS "Authenticated users can view notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Authenticated users can update notifications" ON admin_notifications;

-- Criar políticas mais permissivas para desenvolvimento
CREATE POLICY "Allow all operations for authenticated users" ON admin_notifications
    FOR ALL USING (auth.role() = 'authenticated');

-- Alternativamente, se ainda não funcionar, desabilitar RLS temporariamente
-- ALTER TABLE admin_notifications DISABLE ROW LEVEL SECURITY;
