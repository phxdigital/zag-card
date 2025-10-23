# Sistema de Analytics para Homepage

## Visão Geral

Sistema completo de analytics para rastrear a homepage, focado em análise de tráfego pago e tomada de decisões baseadas em dados.

## Funcionalidades Implementadas

### ✅ **1. Menu Lateral Atualizado**
- Adicionado botão "Analytics" no menu principal
- Adicionado "Homepage Analytics" para análise específica da homepage
- Navegação intuitiva entre diferentes tipos de analytics

### ✅ **2. Sistema de Tracking Avançado**
- **Script dedicado**: `public/homepage-tracking.js`
- **Rastreamento de UTM**: Parâmetros de campanhas pagas
- **Conversões**: Múltiplos objetivos de conversão
- **Funil de conversão**: Jornada completa do usuário
- **Tráfego pago**: Análise específica de campanhas pagas

### ✅ **3. Banco de Dados Especializado**
- **Tabela**: `homepage_visits` com campos específicos
- **Funções SQL**: Análises otimizadas para homepage
- **Segurança**: RLS apenas para administradores
- **Performance**: Índices otimizados

### ✅ **4. APIs Robustas**
- **Coleta**: `/api/analytics/homepage` - Recebe dados do tracking
- **Dados**: `/api/analytics/homepage/data` - Fornece analytics para dashboard
- **Rate limiting**: Proteção contra spam
- **Geolocalização**: Dados de localização por IP

### ✅ **5. Dashboard Completo**
- **Métricas principais**: Visitas, conversões, receita, tráfego pago
- **Gráficos interativos**: Performance diária, fontes de tráfego
- **Funil de conversão**: Visualização da jornada do usuário
- **Campanhas UTM**: Análise detalhada de campanhas pagas

## Estrutura do Sistema

### 📊 **Dados Coletados**

#### Automáticos
- **Sessão**: ID único, duração, páginas visualizadas
- **Dispositivo**: Tipo, navegador, sistema operacional
- **Localização**: País, cidade (via IP)
- **UTM Parameters**: Fonte, meio, campanha, conteúdo, termo
- **Tráfego**: Classificação automática (pago, orgânico, direto, social, referência)

#### Conversões
- **Objetivos**: Signup, compra, contato, download
- **Valor**: Valor monetário das conversões
- **Timing**: Timestamp das conversões
- **Funil**: Múltiplas etapas da jornada

#### Campanhas Pagas
- **UTM Campaign**: Nome da campanha
- **Ad Group**: Grupo de anúncios
- **Keyword**: Palavra-chave (se aplicável)
- **Landing Page**: Página de destino
- **Traffic Source**: Classificação automática

### 🎯 **Métricas Disponíveis**

#### Principais
- **Total de Visitas**: Número total de acessos
- **Visitantes Únicos**: Sessões únicas
- **Taxa de Conversão**: Percentual de conversões
- **Receita Total**: Valor total gerado
- **Duração Média**: Tempo médio na sessão
- **Tráfego Pago**: Percentual de tráfego pago

#### Detalhadas
- **Fontes de Tráfego**: Distribuição por origem
- **Performance UTM**: Análise de campanhas
- **Funil de Conversão**: Jornada do usuário
- **Performance Diária**: Tendências temporais
- **Geolocalização**: Distribuição geográfica

### 📈 **Visualizações**

#### Gráficos
- **Linha**: Performance diária (visitas, conversões, receita)
- **Pizza**: Fontes de tráfego
- **Barras**: Performance de campanhas UTM
- **Funil**: Etapas de conversão

#### Tabelas
- **Campanhas UTM**: Performance detalhada
- **Conversões**: Objetivos e valores
- **Tráfego**: Fontes e classificações

## Como Usar

### 1. **Configuração Inicial**

#### Executar Migration
```sql
-- Execute o arquivo database/homepage-analytics-setup.sql
-- no SQL Editor do Supabase
```

#### Injetar Script na Homepage
```html
<!-- Adicionar no layout principal da homepage -->
<script src="/homepage-tracking.js" defer></script>
```

### 2. **Rastreamento de Conversões**

#### Adicionar Atributos de Conversão
```html
<!-- Exemplo: Botão de cadastro -->
<button data-conversion="signup">
  Criar Conta
</button>

<!-- Exemplo: Botão de compra -->
<button data-conversion="purchase" data-value="99.90">
  Comprar Agora
</button>

<!-- Exemplo: Botão de contato -->
<a href="/contato" data-conversion="contact">
  Entrar em Contato
</a>

<!-- Exemplo: Download -->
<a href="/download" data-conversion="download">
  Baixar PDF
</a>
```

### 3. **Acessar Dashboard**

#### Navegação
1. **Menu Lateral**: "Homepage Analytics"
2. **URL Direta**: `/dashboard/analytics/homepage`
3. **Permissões**: Apenas administradores

#### Filtros Disponíveis
- **Período**: 7 dias, 30 dias, 90 dias
- **Atualização**: Manual via botão "Atualizar"

### 4. **Análise de Campanhas Pagas**

#### UTM Parameters
```
https://zagnfc.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=black_friday&utm_content=banner&utm_term=nfc
```

#### Métricas Importantes
- **ROI**: Retorno sobre investimento
- **CPA**: Custo por aquisição
- **LTV**: Valor vitalício do cliente
- **Funil**: Taxa de conversão por etapa

## Casos de Uso

### 🎯 **Análise de Tráfego Pago**
- **Google Ads**: Performance por campanha
- **Facebook Ads**: ROI por anúncio
- **Email Marketing**: Taxa de conversão
- **Influencers**: Tráfego de referência

### 📊 **Tomada de Decisões**
- **Otimização**: Campanhas com melhor ROI
- **Budget**: Redistribuição de investimento
- **A/B Testing**: Testes de landing pages
- **Segmentação**: Públicos mais convertem

### 💰 **ROI e Performance**
- **Receita por Campanha**: Valor gerado
- **Custo por Conversão**: Eficiência
- **Funil de Conversão**: Pontos de melhoria
- **Tendências**: Crescimento ao longo do tempo

## Segurança e Privacidade

### 🔒 **Controle de Acesso**
- **RLS**: Apenas administradores podem ver dados
- **Autenticação**: Verificação de email admin
- **Rate Limiting**: Proteção contra spam
- **Anonimização**: IPs anonimizados após 90 dias

### 🛡️ **Dados Sensíveis**
- **Não coletamos**: Senhas, dados pessoais
- **Anonimizamos**: IPs após período determinado
- **Limitamos**: Retenção de dados desnecessários
- **Protegemos**: Dados de campanhas pagas

## Arquivos Criados

### 📁 **Backend**
- `database/homepage-analytics-setup.sql` - Schema do banco
- `app/api/analytics/homepage/route.ts` - API de coleta
- `app/api/analytics/homepage/data/route.ts` - API de dados

### 📁 **Frontend**
- `public/homepage-tracking.js` - Script de tracking
- `app/dashboard/analytics/homepage/page.tsx` - Dashboard
- `app/dashboard/layout.tsx` - Menu atualizado

### 📁 **Documentação**
- `HOMEPAGE-ANALYTICS-SYSTEM.md` - Este arquivo

## Próximos Passos

### 🚀 **Implementação**
1. **Executar migration** no Supabase
2. **Injetar script** na homepage
3. **Configurar conversões** com atributos
4. **Testar tracking** com campanhas reais
5. **Acessar dashboard** para análise

### 📈 **Otimizações Futuras**
- **Real-time**: Dados em tempo real
- **Alertas**: Notificações de performance
- **Integrações**: Google Analytics, Facebook Pixel
- **Exportação**: Relatórios em PDF/CSV
- **Machine Learning**: Predições de conversão

## Troubleshooting

### ❌ **Problemas Comuns**

#### Script não carrega
- Verificar se `/public/homepage-tracking.js` existe
- Confirmar injeção no layout da homepage

#### Dados não aparecem
- Verificar permissões de administrador
- Confirmar execução da migration
- Verificar logs da API

#### Conversões não rastreiam
- Adicionar atributos `data-conversion`
- Verificar se elementos são clicáveis
- Testar no console do navegador

### 🔧 **Debug**
```javascript
// No console do navegador
console.log(window.zagHomepageAnalytics);
console.log(window.zagHomepageAnalytics.getSessionId());
console.log(window.zagHomepageAnalytics.getConversionGoals());
```

---

**Status**: ✅ Sistema completo implementado  
**Versão**: 1.0.0  
**Data**: Dezembro 2024  
**Foco**: Análise de tráfego pago e tomada de decisões
