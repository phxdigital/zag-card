# 🧪 Guia de Teste - Sistema Zag NFC

## ✅ Checklist de Verificação

### 1. Teste de Conexão com Supabase

```bash
# Instalar dependência de teste
npm install dotenv

# Executar teste de conexão
npm run test:connection
```

**Resultado esperado:**
- ✅ Tabela pages acessível
- ✅ Bucket logos encontrado/criado
- ✅ RLS ativo

### 2. Teste do Dashboard

```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

**Acesse:** `http://localhost:3000/dashboard`

**Teste:**
1. ✅ Login funciona
2. ✅ Upload de logo funciona
3. ✅ Personalização de cores funciona
4. ✅ Criação de botões funciona
5. ✅ Salvar e Publicar funciona

### 3. Teste de Subdomínio Local

**Configurar hosts local (opcional):**
```bash
# No arquivo C:\Windows\System32\drivers\etc\hosts
127.0.0.1 teste.localhost
```

**Acesse:** `http://teste.localhost:3000`

**Resultado esperado:**
- ✅ Página carrega com dados do subdomínio "teste"
- ✅ Cores e personalizações aplicadas
- ✅ Botões funcionam

### 4. Teste de Deploy

**Verificar:**
1. ✅ Build sem erros: `npm run build`
2. ✅ Deploy na Vercel funcionando
3. ✅ Domínio principal: `https://zagnfc.com.br`
4. ✅ Dashboard: `https://zagnfc.com.br/dashboard`

### 5. Teste de Subdomínio em Produção

**Criar página de teste:**
1. Acesse o dashboard
2. Crie uma página com subdomínio "teste"
3. Acesse: `https://teste.zagnfc.com.br`

**Resultado esperado:**
- ✅ Página carrega corretamente
- ✅ Personalizações aplicadas
- ✅ QR Code funciona

## 🐛 Troubleshooting

### Erro: "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### Erro: "Supabase connection failed"
- Verifique o arquivo `.env.local`
- Confirme as chaves do Supabase
- Verifique se o projeto está ativo

### Erro: "Table 'pages' doesn't exist"
- Execute o SQL do arquivo `database/schema.sql`
- Verifique se o RLS está ativado

### Erro: "Upload failed"
- Verifique se o bucket "logos" existe
- Confirme as políticas de storage
- Verifique o tamanho do arquivo (máx 5MB)

### Subdomínio não carrega
- Verifique se o DNS propagou (pode levar 24h)
- Confirme se o wildcard está configurado na Vercel
- Verifique os logs da Vercel

## 📊 Logs Importantes

### Vercel Logs
```bash
# Ver logs de deploy
vercel logs

# Ver logs em tempo real
vercel logs --follow
```

### Supabase Logs
- Acesse o painel do Supabase
- Vá para "Logs" > "API"
- Monitore queries e erros

## 🎯 Testes de Performance

### 1. Teste de Carga
- Crie múltiplas páginas
- Teste uploads simultâneos
- Verifique tempo de resposta

### 2. Teste de Segurança
- Tente acessar dados de outros usuários
- Teste upload de arquivos maliciosos
- Verifique autenticação

### 3. Teste de Responsividade
- Teste em diferentes dispositivos
- Verifique em diferentes navegadores
- Teste com conexões lentas

## 📝 Relatório de Teste

**Data:** ___________
**Versão:** ___________
**Ambiente:** Local / Produção

### ✅ Funcionalidades Testadas
- [ ] Login/Registro
- [ ] Upload de Logo
- [ ] Personalização de Cores
- [ ] Criação de Botões
- [ ] Salvar e Publicar
- [ ] Subdomínio Local
- [ ] Subdomínio Produção
- [ ] QR Code
- [ ] Responsividade

### 🐛 Problemas Encontrados
1. ________________
2. ________________
3. ________________

### 📈 Performance
- Tempo de carregamento: _____s
- Tempo de upload: _____s
- Tempo de salvamento: _____s

### 🔒 Segurança
- [ ] RLS funcionando
- [ ] Autenticação funcionando
- [ ] Upload seguro
- [ ] Dados isolados por usuário

## 🚀 Próximos Passos

1. Corrigir problemas encontrados
2. Otimizar performance
3. Implementar melhorias
4. Configurar monitoramento
5. Preparar para produção
