# Configuração do Sistema Zag NFC

Este guia te ajudará a configurar o sistema completo de subdomínios dinâmicos com segurança.

## 1. Configuração do Supabase

### 1.1 Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização e dê um nome ao projeto
5. Defina uma senha segura para o banco de dados
6. Escolha uma região próxima ao Brasil

### 1.2 Configurar Banco de Dados
1. No painel do Supabase, vá para "SQL Editor"
2. Copie e cole o conteúdo do arquivo `database/schema.sql`
3. Execute o SQL para criar as tabelas e políticas de segurança

### 1.3 Configurar Storage
1. Vá para "Storage" no painel do Supabase
2. O bucket "logos" deve ter sido criado automaticamente
3. Se não foi criado, crie manualmente com o nome "logos" e marque como público

### 1.4 Obter Chaves de API
1. Vá para "Settings" > "API"
2. Copie as seguintes chaves:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - `service_role` (SUPABASE_SERVICE_ROLE_KEY)

## 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

## 3. Configuração do DNS

### 3.1 No Provedor de Domínio
Acesse o painel de controle do seu provedor de domínio (Hostinger, GoDaddy, Registro.br, etc.) e configure:

**Registro A (Domínio principal):**
- Tipo: A
- Nome: @
- Valor: 76.76.21.21

**Registro CNAME (Wildcard para subdomínios):**
- Tipo: CNAME
- Nome: *
- Valor: cname.vercel-dns.com

### 3.2 Verificação
Após configurar o DNS, aguarde até 24 horas para a propagação. Você pode verificar com:
```bash
nslookup zagnfc.com.br
nslookup teste.zagnfc.com.br
```

## 4. Configuração da Vercel

### 4.1 Deploy do Projeto
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente na Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 4.2 Configurar Domínios
1. No dashboard da Vercel, vá para "Settings" > "Domains"
2. Adicione os domínios:
   - `zagnfc.com.br`
   - `*.zagnfc.com.br` (wildcard)

### 4.3 Verificar SSL
A Vercel automaticamente gerará certificados SSL para todos os subdomínios.

## 5. Testando o Sistema

### 5.1 Teste Local
```bash
npm run dev
```
Acesse `http://localhost:3000` e teste o dashboard.

### 5.2 Teste de Subdomínio
1. Crie uma página no dashboard
2. Use um subdomínio como "teste"
3. Acesse `https://teste.zagnfc.com.br`
4. Verifique se a página carrega corretamente

## 6. Segurança Implementada

### 6.1 Row Level Security (RLS)
- Usuários só podem ver/editar suas próprias páginas
- Políticas implementadas no banco de dados

### 6.2 Autenticação
- Middleware protege rotas do dashboard
- Verificação de sessão em todas as APIs

### 6.3 Validação de Entrada
- Validação de tipos de arquivo para uploads
- Limite de tamanho de arquivo (5MB)
- Sanitização de subdomínios

### 6.4 Storage Seguro
- Logos organizados por usuário
- Políticas de acesso restritivas

## 7. Monitoramento

### 7.1 Logs da Vercel
Monitore os logs de deploy e runtime na Vercel.

### 7.2 Logs do Supabase
Acompanhe as consultas e erros no painel do Supabase.

### 7.3 Métricas
- Use o Analytics da Vercel para monitorar tráfego
- Configure alertas para erros críticos

## 8. Manutenção

### 8.1 Backup
- O Supabase faz backup automático
- Configure backups adicionais se necessário

### 8.2 Atualizações
- Mantenha as dependências atualizadas
- Teste em ambiente de desenvolvimento antes de fazer deploy

### 8.3 Limpeza
- Monitore o uso do storage
- Implemente limpeza de arquivos não utilizados se necessário

## 9. Troubleshooting

### 9.1 Subdomínio não carrega
- Verifique se o DNS está propagado
- Confirme se o domínio está configurado na Vercel
- Verifique os logs da Vercel

### 9.2 Erro de autenticação
- Verifique se as chaves do Supabase estão corretas
- Confirme se o RLS está ativado
- Verifique se as políticas estão corretas

### 9.3 Upload de logo falha
- Verifique se o bucket "logos" existe
- Confirme as políticas de storage
- Verifique o tamanho e tipo do arquivo

## 10. Próximos Passos

1. Implementar analytics de uso
2. Adicionar mais tipos de botões
3. Implementar templates pré-definidos
4. Adicionar sistema de pagamento
5. Implementar API para integrações
