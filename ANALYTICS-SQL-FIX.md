# Correção do Schema SQL - Analytics

## Problema Identificado

O erro ocorreu porque a tabela `pages` usa `BIGINT` para o campo `id`, mas o schema original estava tentando criar uma foreign key com `UUID`.

## Correção Aplicada

### 1. Tabela `page_visits`
```sql
-- ANTES (incorreto)
page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,

-- DEPOIS (correto)
page_id BIGINT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
```

### 2. Funções SQL
Todas as funções foram atualizadas para usar `BIGINT` em vez de `UUID`:

```sql
-- Funções corrigidas:
- get_daily_visits(p_page_id BIGINT, p_start_date DATE)
- get_top_clicked_links(p_page_id BIGINT, p_start_date DATE, p_limit INTEGER)
- get_browser_breakdown(p_page_id BIGINT, p_start_date DATE)
- get_country_breakdown(p_page_id BIGINT, p_start_date DATE, p_limit INTEGER)
```

### 3. Injeção do Page ID
O script de tracking foi corrigido para injetar o ID como número:

```javascript
// ANTES (incorreto)
window.__PAGE_ID__ = '${pageId}';

// DEPOIS (correto)
window.__PAGE_ID__ = ${pageId};
```

## Como Executar

### 1. Limpar Schema Anterior (se necessário)
Se você já tentou executar o SQL anterior, pode ser necessário limpar:

```sql
-- Remover tabela se existir
DROP TABLE IF EXISTS page_visits CASCADE;
DROP MATERIALIZED VIEW IF EXISTS page_analytics CASCADE;

-- Remover funções se existirem
DROP FUNCTION IF EXISTS get_daily_visits(BIGINT, DATE);
DROP FUNCTION IF EXISTS get_top_clicked_links(BIGINT, DATE, INTEGER);
DROP FUNCTION IF EXISTS get_browser_breakdown(BIGINT, DATE);
DROP FUNCTION IF EXISTS get_country_breakdown(BIGINT, DATE, INTEGER);
DROP FUNCTION IF EXISTS refresh_page_analytics();
DROP FUNCTION IF EXISTS cleanup_old_analytics();
```

### 2. Executar Schema Corrigido
Execute o arquivo `database/create_analytics_tables.sql` no Supabase SQL Editor.

### 3. Verificar Criação
Confirme que os seguintes objetos foram criados:

```sql
-- Verificar tabela
SELECT * FROM page_visits LIMIT 1;

-- Verificar materialized view
SELECT * FROM page_analytics LIMIT 1;

-- Verificar funções
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE 'get_%' AND routine_schema = 'public';
```

## Teste de Funcionamento

### 1. Testar Inserção
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
```

### 2. Testar Funções
```sql
-- Testar função de visitas diárias
SELECT * FROM get_daily_visits(1, CURRENT_DATE - INTERVAL '30 days');

-- Testar função de links mais clicados
SELECT * FROM get_top_clicked_links(1, CURRENT_DATE - INTERVAL '30 days', 5);

-- Testar função de navegadores
SELECT * FROM get_browser_breakdown(1, CURRENT_DATE - INTERVAL '30 days');

-- Testar função de países
SELECT * FROM get_country_breakdown(1, CURRENT_DATE - INTERVAL '30 days', 10);
```

## Botão "Estatísticas" Adicionado

### Localização
O botão foi adicionado em `app/dashboard/pages/page.tsx` na seção de ações de cada página.

### Funcionalidade
- **Rota**: `/dashboard/analytics/${page.id}`
- **Estilo**: Botão azul com ícone de gráfico
- **Ação**: Redireciona para a página de analytics detalhada

### Visual
```jsx
<Link
  href={`/dashboard/analytics/${page.id}`}
  className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
>
  <BarChart3 className="h-4 w-4 mr-2" />
  Estatísticas
</Link>
```

## Próximos Passos

1. **Executar SQL corrigido** no Supabase
2. **Testar inserção** de dados de analytics
3. **Verificar botão** no dashboard de páginas
4. **Acessar analytics** de uma página específica
5. **Validar visualizações** e gráficos

## Troubleshooting

### Erro: "relation page_visits does not exist"
- Execute o SQL corrigido no Supabase
- Verifique se não há erros de sintaxe

### Erro: "function get_daily_visits does not exist"
- As funções podem não ter sido criadas
- Execute o SQL completo novamente

### Botão não aparece
- Verifique se o arquivo `app/dashboard/pages/page.tsx` foi salvo
- Confirme que o servidor foi reiniciado

### Analytics não carrega
- Verifique se o page_id está correto na URL
- Confirme que a página pertence ao usuário logado
- Verifique logs do console para erros

---

**Status**: ✅ Correções aplicadas  
**Arquivos modificados**: 
- `database/create_analytics_tables.sql`
- `app/[subdomain]/page.tsx`
- `app/dashboard/pages/page.tsx`
