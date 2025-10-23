# Sistema de Analytics - ZAG NFC

## Visão Geral

O sistema de analytics foi implementado para rastrear visitas e interações nas páginas NFC dos usuários. Ele coleta dados de forma automática e apresenta visualizações detalhadas no dashboard.

## Arquitetura

### 1. Coleta de Dados (Client-side)
- **Script de Tracking**: `/public/tracking.js`
  - Coleta automática de dados de visita
  - Rastreamento de cliques em links
  - Detecção de dispositivo e navegador
  - Envio via `navigator.sendBeacon()` para garantir entrega

### 2. Backend (API Routes)
- **Coleta**: `/app/api/analytics/track/route.ts`
  - Recebe dados do script de tracking
  - Geolocalização por IP
  - Rate limiting para evitar spam
  - Armazenamento no Supabase

- **Estatísticas**: `/app/api/analytics/[pageId]/route.ts`
  - Fornece dados agregados para dashboard
  - Validação de propriedade da página
  - Filtros por período (7d, 30d, 90d)

### 3. Banco de Dados
- **Tabela Principal**: `page_visits`
  - Armazena todas as visitas com detalhes
  - Índices otimizados para consultas
  - RLS (Row Level Security) para privacidade

- **Materialized View**: `page_analytics`
  - Agregações diárias para performance
  - Atualização automática

- **Funções SQL**:
  - `get_daily_visits()`: Visitas por dia
  - `get_top_clicked_links()`: Links mais clicados
  - `get_browser_breakdown()`: Distribuição de navegadores
  - `get_country_breakdown()`: Distribuição por país

### 4. Dashboard
- **Página Principal**: `/app/dashboard/analytics/page.tsx`
  - Visão geral de todas as páginas
  - Métricas consolidadas
  - Links para páginas detalhadas

- **Página Detalhada**: `/app/dashboard/analytics/[pageId]/page.tsx`
  - Gráficos interativos (Recharts)
  - Filtros por período
  - Tabelas de dados detalhados

## Dados Coletados

### Automáticos
- ID da página
- Timestamp da visita
- Referrer (página de origem)
- User Agent completo
- Tipo de dispositivo (mobile/tablet/desktop)
- Navegador detectado
- Sistema operacional
- Duração da sessão
- Session ID único
- Parâmetros UTM (utm_source, utm_medium, utm_campaign)
- IP e geolocalização (país/cidade)

### Interações
- Cliques em links com atributo `data-track`
- Tempo de permanência na página
- Heartbeat a cada 30 segundos

## Configuração

### 1. Executar Migration
```sql
-- Execute o arquivo database/create_analytics_tables.sql no Supabase
```

### 2. Configurar RLS
As políticas de segurança já estão incluídas no migration.

### 3. Injeção Automática
O script é injetado automaticamente em todas as páginas NFC via `app/[subdomain]/page.tsx`.

## Uso

### Para Usuários
1. Acesse `/dashboard/analytics` para ver overview
2. Clique em "View Details" para análise detalhada
3. Use filtros de período (7d, 30d, 90d)
4. Visualize gráficos e métricas

### Para Desenvolvedores
```typescript
// Adicionar tracking a links customizados
<a href="https://instagram.com/user" data-track="instagram">
  Instagram
</a>

// Acessar dados via API
const response = await fetch(`/api/analytics/${pageId}?period=30d`);
const data = await response.json();
```

## Métricas Disponíveis

### Básicas
- **Total de Visitas**: Número total de acessos
- **Visitantes Únicos**: Número de sessões únicas
- **Duração Média**: Tempo médio na página
- **Tráfego Mobile**: Percentual de dispositivos móveis

### Detalhadas
- **Distribuição de Dispositivos**: Mobile/Desktop/Tablet
- **Navegadores**: Chrome, Firefox, Safari, etc.
- **Países**: Origem geográfica dos visitantes
- **Links Mais Clicados**: Interações com conteúdo
- **Visitas ao Longo do Tempo**: Tendências temporais

## Gráficos e Visualizações

### 1. Gráfico de Linha
- Visitas ao longo do tempo
- Comparação entre total e únicos
- Período configurável

### 2. Gráfico de Pizza
- Distribuição de dispositivos
- Percentuais visuais
- Cores diferenciadas

### 3. Gráfico de Barras
- Top navegadores
- Top países
- Comparação quantitativa

### 4. Tabelas
- Links mais clicados
- Taxa de cliques
- Dados ordenados

## Segurança e Privacidade

### Dados Coletados
- ✅ Apenas dados necessários para analytics
- ✅ Sem informações pessoais identificáveis
- ✅ IPs anonimizados após 90 dias
- ✅ User agents truncados após 30 dias

### RLS (Row Level Security)
- Usuários só veem dados de suas próprias páginas
- Políticas automáticas no Supabase
- Validação dupla (frontend + backend)

### Rate Limiting
- 100 requests por IP por hora
- Proteção contra spam
- Logs de erro sem exposição de dados

## Performance

### Otimizações
- **Materialized Views**: Agregações pré-calculadas
- **Índices**: Consultas otimizadas por page_id e data
- **Caching**: Dados em memória quando possível
- **Lazy Loading**: Gráficos carregados sob demanda

### Escalabilidade
- **Rate Limiting**: Proteção contra sobrecarga
- **Batch Processing**: Múltiplas inserções otimizadas
- **Cleanup Automático**: Dados antigos removidos
- **Geolocation Async**: Não bloqueia resposta

## Monitoramento

### Logs
- Erros de tracking registrados
- Falhas de geolocalização
- Problemas de rate limiting

### Métricas de Sistema
- Taxa de sucesso do tracking
- Tempo de resposta das APIs
- Uso de recursos do banco

## Troubleshooting

### Problemas Comuns

1. **Script não carrega**
   - Verificar se `/public/tracking.js` existe
   - Confirmar injeção em `app/[subdomain]/page.tsx`

2. **Dados não aparecem**
   - Verificar RLS policies
   - Confirmar page_id correto
   - Verificar logs da API

3. **Gráficos não renderizam**
   - Verificar se Recharts está instalado
   - Confirmar dados válidos da API
   - Verificar console para erros

### Debug
```javascript
// No console do navegador
console.log(window.zagAnalytics);
console.log(window.__PAGE_ID__);
```

## Próximos Passos

### Melhorias Planejadas
- [ ] Exportação de relatórios (PDF/CSV)
- [ ] Notificações de marcos (mil visitas)
- [ ] Analytics em tempo real
- [ ] A/B testing integrado
- [ ] Funnel analysis
- [ ] Cohort analysis

### Integrações
- [ ] Google Analytics
- [ ] Facebook Pixel
- [ ] Hotjar
- [ ] Mixpanel

## Suporte

Para problemas ou dúvidas:
1. Verificar logs do console
2. Testar APIs individualmente
3. Validar dados no Supabase
4. Consultar documentação do Recharts

---

**Versão**: 1.0.0  
**Última Atualização**: Dezembro 2024  
**Autor**: Sistema ZAG NFC
