# Setup Limpo do Sistema de Analytics

## Problema Resolvido

O erro `function get_daily_visits(uuid, date) does not exist` ocorreu porque:
1. Havia referências antigas com `UUID` nas permissões GRANT
2. Possíveis conflitos com funções existentes
3. Ordem de execução incorreta

## Solução: Setup Limpo

Criei um script SQL completo que:
1. **Remove** todos os objetos existentes (limpa conflitos)
2. **Recria** tudo do zero com tipos corretos
3. **Verifica** se tudo foi criado corretamente

## Como Executar

### 1. Execute o Script Limpo
```sql
-- Execute o arquivo database/analytics-clean-setup.sql
-- no SQL Editor do Supabase
```

### 2. Verificar Execução
O script inclui verificação automática. Você deve ver:
```
NOTICE: Analytics system setup completed successfully!
```

### 3. Testar Manualmente (Opcional)
```sql
-- Verificar se a tabela foi criada
SELECT * FROM page_visits LIMIT 1;

-- Verificar se as funções existem
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE 'get_%' AND routine_schema = 'public';

-- Testar uma função
SELECT * FROM get_daily_visits(1, CURRENT_DATE - INTERVAL '30 days');
```

## O que o Script Faz

### 1. **Limpeza Completa**
- Remove todas as funções existentes (UUID e BIGINT)
- Remove materialized view
- Remove tabela page_visits
- Remove todas as políticas RLS

### 2. **Criação Correta**
- Tabela `page_visits` com `page_id BIGINT`
- Materialized view `page_analytics`
- Todas as funções com tipos corretos
- Índices para performance
- Políticas RLS para segurança

### 3. **Verificação Automática**
- Confirma que todos os objetos foram criados
- Mostra mensagem de sucesso
- Falha se algo não foi criado

## Estrutura Final

### Tabela: `page_visits`
```sql
CREATE TABLE page_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id BIGINT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    user_agent TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    browser TEXT NOT NULL,
    os TEXT NOT NULL,
    ip_address INET,
    country TEXT,
    city TEXT,
    session_id TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    clicked_links JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Funções Criadas
- `get_daily_visits(BIGINT, DATE)`
- `get_top_clicked_links(BIGINT, DATE, INTEGER)`
- `get_browser_breakdown(BIGINT, DATE)`
- `get_country_breakdown(BIGINT, DATE, INTEGER)`
- `refresh_page_analytics()`
- `cleanup_old_analytics()`

### Políticas RLS
- Usuários só veem dados de suas próprias páginas
- Sistema pode inserir dados de analytics
- Permissões corretas para funções

## Próximos Passos

1. **Executar script limpo** no Supabase
2. **Verificar mensagem de sucesso**
3. **Testar inserção** de dados de teste
4. **Acessar dashboard** para verificar funcionamento

## Troubleshooting

### Se ainda houver erros:
1. Verificar se a tabela `pages` existe
2. Confirmar que `pages.id` é do tipo `BIGINT`
3. Verificar permissões do usuário no Supabase

### Para verificar tipos:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pages' AND column_name = 'id';
```

### Para testar inserção:
```sql
-- Inserir dados de teste (substitua 1 pelo ID real de uma página)
INSERT INTO page_visits (
    page_id, visited_at, user_agent, device_type, browser, os, session_id
) VALUES (
    1, NOW(), 'Mozilla/5.0...', 'desktop', 'Chrome', 'Windows', 'test-123'
);
```

---

**Status**: ✅ Script limpo criado  
**Arquivo**: `database/analytics-clean-setup.sql`  
**Próximo**: Execute o script no Supabase SQL Editor
