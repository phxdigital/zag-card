# Configuração do Sistema de Analytics

## Pré-requisitos

1. **Banco de Dados Supabase** configurado
2. **Next.js 15** com App Router
3. **Dependências instaladas**: `recharts`, `date-fns`

## Passo 1: Executar Migration do Banco

Execute o arquivo SQL no Supabase:

```sql
-- Execute o conteúdo de database/create_analytics_tables.sql
-- no SQL Editor do Supabase
```

Isso criará:
- Tabela `page_visits`
- Materialized view `page_analytics`
- Funções SQL para agregações
- Políticas RLS para segurança
- Índices para performance

## Passo 2: Verificar Arquivos Criados

Confirme que os seguintes arquivos foram criados:

```
public/
  └── tracking.js                    ✅ Script de tracking

app/api/analytics/
  ├── track/route.ts                 ✅ API de coleta
  └── [pageId]/route.ts              ✅ API de estatísticas

app/dashboard/analytics/
  ├── page.tsx                       ✅ Dashboard principal
  └── [pageId]/page.tsx               ✅ Página detalhada

app/[subdomain]/
  └── page.tsx                       ✅ Modificado para injetar script

types/
  └── analytics.ts                   ✅ Tipos TypeScript

database/
  └── create_analytics_tables.sql    ✅ Migration SQL
```

## Passo 3: Testar o Sistema

### Teste Manual

1. **Iniciar o servidor**:
   ```bash
   npm run dev
   ```

2. **Acessar uma página NFC**:
   ```
   http://localhost:3000/empresa-teste
   ```

3. **Verificar no console do navegador**:
   ```javascript
   console.log(window.__PAGE_ID__); // Deve mostrar o ID da página
   console.log(window.zagAnalytics); // Deve mostrar o objeto de analytics
   ```

4. **Verificar no dashboard**:
   ```
   http://localhost:3000/dashboard/analytics
   ```

### Teste Automatizado

Execute o script de teste:

```bash
node scripts/test-analytics.js
```

## Passo 4: Configurar Tracking de Links

Para rastrear cliques em links, adicione o atributo `data-track`:

```html
<!-- Exemplo de link rastreado -->
<a href="https://instagram.com/user" data-track="instagram">
  Instagram
</a>

<button data-track="whatsapp-button">
  WhatsApp
</button>
```

## Passo 5: Verificar Funcionamento

### 1. Dados sendo coletados
- Acesse uma página NFC
- Navegue pela página
- Clique em links com `data-track`
- Verifique no Supabase se os dados foram salvos

### 2. Dashboard funcionando
- Acesse `/dashboard/analytics`
- Verifique se as páginas aparecem
- Clique em "View Details" para ver gráficos
- Teste os filtros de período

### 3. APIs respondendo
- Teste: `GET /api/analytics/track` (health check)
- Teste: `POST /api/analytics/track` (coleta)
- Teste: `GET /api/analytics/[pageId]` (estatísticas)

## Troubleshooting

### Problema: Script não carrega
**Solução**: Verificar se `/public/tracking.js` existe e se a injeção está correta em `app/[subdomain]/page.tsx`

### Problema: Dados não aparecem no dashboard
**Solução**: 
1. Verificar RLS policies no Supabase
2. Confirmar que o usuário está logado
3. Verificar logs da API

### Problema: Gráficos não renderizam
**Solução**:
1. Verificar se `recharts` está instalado
2. Verificar console para erros JavaScript
3. Confirmar dados válidos da API

### Problema: Rate limiting
**Solução**: Aguardar 1 hora ou ajustar limites em `app/api/analytics/track/route.ts`

## Monitoramento

### Logs importantes
- Console do navegador: erros de tracking
- Logs do servidor: erros de API
- Supabase: logs de queries

### Métricas a acompanhar
- Taxa de sucesso do tracking
- Tempo de resposta das APIs
- Uso de recursos do banco

## Próximos Passos

1. **Configurar cleanup automático** (opcional):
   ```sql
   -- No Supabase, configurar cron jobs para:
   -- - Refresh materialized view diariamente
   -- - Cleanup de dados antigos semanalmente
   ```

2. **Monitorar performance**:
   - Acompanhar tempo de resposta
   - Verificar uso de memória
   - Monitorar queries do banco

3. **Personalizar visualizações**:
   - Adicionar novos gráficos
   - Customizar cores e estilos
   - Implementar exportação de dados

## Suporte

Para problemas:
1. Verificar logs do console
2. Testar APIs individualmente
3. Validar dados no Supabase
4. Consultar documentação do Recharts

---

**Status**: ✅ Sistema implementado e pronto para uso  
**Versão**: 1.0.0  
**Data**: Dezembro 2024
