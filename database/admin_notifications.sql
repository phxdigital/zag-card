-- Tabela para armazenar notificações administrativas
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subdomain TEXT NOT NULL,
    action TEXT NOT NULL,
    message TEXT NOT NULL,
    pdf_data TEXT, -- Base64 do PDF
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON admin_notifications(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_subdomain ON admin_notifications(subdomain);

-- RLS (Row Level Security) - apenas usuários autenticados podem acessar
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Política: apenas usuários autenticados podem ver as notificações
CREATE POLICY "Authenticated users can view notifications" ON admin_notifications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política: apenas usuários autenticados podem inserir notificações
CREATE POLICY "Authenticated users can insert notifications" ON admin_notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política: apenas usuários autenticados podem atualizar notificações
CREATE POLICY "Authenticated users can update notifications" ON admin_notifications
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_admin_notifications_updated_at 
    BEFORE UPDATE ON admin_notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
