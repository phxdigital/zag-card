# Correção do Erro da Materialized View

## Problema Identificado

O erro `Materialized view page_analytics was not created` ocorreu porque:
1. A materialized view está sendo criada antes de ter dados na tabela
2. Possível problema de dependências ou sintaxe
3. Verificação muito rigorosa no script

## Soluções Disponíveis

### ✅ **Solução 1: Script Simples (Recomendado)**

Execute o arquivo `database/analytics-simple-setup.sql` que:
- Cria apenas a tabela e funções essenciais
- **NÃO** cria materialized view inicialmente
- Sistema funciona perfeitamente sem ela
- Pode ser adicionada depois para otimização

### ✅ **Solução 2: Script com Tratamento de Erro**

Execute o arquivo `database/analytics-fixed-setup.sql` que:
- Inclui tratamento de erro para materialized view
- Cria fallback se houver problema
- Mais robusto mas mais complexo

## Como Executar (Recomendado)

### 1. Execute o Script Simples
```sql
-- Execute o conteúdo de database/analytics-simple-setup.sql
-- no SQL Editor do Supabase
```

### 2. Verificar Sucesso
Você deve ver:
```
✅ Table page_visits created successfully
✅ Function get_daily_visits created successfully
🎉 Analytics system setup completed successfully!
📊 You can now start collecting analytics data.
💡 Materialized view can be added later for performance optimization.
```

### 3. Testar o Sistema
```sql
-- Inserir dados de teste
INSERT INTO page_visits (
    page_id, 
    visited_at, 
    user_agent, 
    device_type, 
    browser, 
    os, 
    session_id, 
    duration_seconds
) VALUES (
    1, -- Substitua pelo ID real de uma página
    NOW(),
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'desktop',
    'Chrome',
    'Windows',
    'test-session-123',
    30
);

-- Testar função
SELECT * FROM get_daily_visits(1, CURRENT_DATE - INTERVAL '30 days');
```

## Adicionar Materialized View Depois (Opcional)

Se quiser adicionar a materialized view para otimização de performance:

```sql
-- Criar materialized view depois de ter dados
CREATE MATERIALIZED VIEW page_analytics AS
SELECT 
    page_id,
    DATE(visited_at) as visit_date,
    COUNT(*) as total_visits,
    COUNT(DISTINCT session_id) as unique_visitors,
    AVG(duration_seconds) as avg_duration,
    COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_visits,
    COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_visits,
    COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) as tablet_visits
FROM page_visits
GROUP BY page_id, DATE(visited_at);

-- Criar índice
CREATE INDEX idx_page_analytics_page_date ON page_analytics(page_id, visit_date);

-- Função para refresh
CREATE OR REPLACE FUNCTION refresh_page_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW page_analytics;
END;
$$ LANGUAGE plpgsql;
```

## Vantagens do Script Simples

1. **Funciona imediatamente**: Sem dependências complexas
2. **Sistema completo**: Todas as funcionalidades de analytics
3. **Performance adequada**: Para volumes normais de dados
4. **Fácil de entender**: Menos complexidade
5. **Otimização posterior**: Materialized view pode ser adicionada depois

## O que o Sistema Inclui

### ✅ **Tabela Principal**
- `page_visits` com todos os campos necessários
- Índices otimizados para consultas
- RLS (Row Level Security) configurado

### ✅ **Funções SQL**
- `get_daily_visits()` - Visitas por dia
- `get_top_clicked_links()` - Links mais clicados
- `get_browser_breakdown()` - Distribuição de navegadores
- `get_country_breakdown()` - Distribuição por país
- `cleanup_old_analytics()` - Limpeza de dados antigos

### ✅ **Segurança**
- Políticas RLS para privacidade
- Permissões corretas para usuários
- Validação de propriedade das páginas

## Próximos Passos

1. **Execute o script simples** no Supabase
2. **Verifique as mensagens de sucesso**
3. **Teste inserção de dados**
4. **Acesse o dashboard** para verificar funcionamento
5. **Adicione materialized view** depois (opcional)

## Troubleshooting

### Se ainda houver erros:
1. Verificar se a tabela `pages` existe
2. Confirmar que `pages.id` é `BIGINT`
3. Verificar permissões do usuário

### Para verificar tipos:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pages' AND column_name = 'id';
```

---

**Status**: ✅ Scripts corrigidos criados  
**Recomendação**: Use `database/analytics-simple-setup.sql`  
**Próximo**: Execute o script simples no Supabase
