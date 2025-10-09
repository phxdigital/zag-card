# 🚀 COMO EXECUTAR O SQL COMPLETO

## ❌ PROBLEMA
Você recebeu erro: `relation "user_roles" does not exist`

## ✅ SOLUÇÃO
Execute o **arquivo unificado** que cria tudo na ordem correta!

---

## 📋 PASSO A PASSO

### 1. Abrir Supabase
```
1. Acesse: https://supabase.com
2. Selecione seu projeto
3. Vá em: SQL Editor (ícone de código SQL)
```

### 2. Nova Query
```
Clique em: "+ New query"
```

### 3. Copiar SQL Completo
```
Abra o arquivo: database/setup-completo.sql
Copie TODO o conteúdo (Ctrl+A → Ctrl+C)
```

### 4. Colar e Executar
```
1. Cole no SQL Editor do Supabase (Ctrl+V)
2. Clique em "Run" (ou Ctrl+Enter)
3. Aguarde a execução (pode levar alguns segundos)
```

### 5. Verificar Sucesso
Se tudo der certo, você verá:
```sql
status: "Setup completo! ✅"
total_produtos: 3
total_categorias: 3
email: andresavite@gmail.com | role: admin
```

---

## ✅ O QUE SERÁ CRIADO

### Tabelas:
- ✅ `user_roles` - Sistema de permissões
- ✅ `profiles` - Perfis de usuários
- ✅ `products` - Catálogo de produtos
- ✅ `product_categories` - Categorias
- ✅ `orders` - Pedidos
- ✅ `order_items` - Itens dos pedidos
- ✅ `coupons` - Cupons de desconto
- ✅ `payments` - Histórico de pagamentos

### Dados Pré-cadastrados:
- ✅ 3 Categorias (Kits, Cartões NFC, Adesivos NFC)
- ✅ 3 Produtos (Kit Para Mim, Para Equipe, Para Negócio)
- ✅ Seu usuário como ADMIN

### Configurações:
- ✅ RLS (segurança) ativo
- ✅ Índices de performance
- ✅ Triggers automáticos
- ✅ Políticas de acesso

---

## 🧪 TESTAR SE FUNCIONOU

Após executar o SQL, teste no SQL Editor:

```sql
-- Ver produtos
SELECT name, price, stock_quantity, is_active FROM products;

-- Ver categorias
SELECT name, slug FROM product_categories;

-- Ver seu role de admin
SELECT email, role FROM user_roles WHERE email = 'andresavite@gmail.com';
```

---

## 🎯 PRÓXIMO PASSO

Depois de executar o SQL com sucesso:

```
1. Acesse: http://localhost:3000/admin/products
2. Veja os 3 produtos pré-cadastrados
3. Clique em "Novo Produto" para adicionar mais
```

---

## ⚠️ SE DER ERRO

### Erro: "permission denied"
**Solução:** Certifique-se de estar usando a chave correta do Supabase

### Erro: "duplicate key value"
**Solução:** Já foi executado antes! Está tudo OK ✅

### Erro: outro
**Solução:** 
1. Copie a mensagem de erro
2. Me envie para eu ajudar
3. Ou execute os arquivos separadamente na ordem:
   - `database/user-roles.sql`
   - `database/payments.sql`
   - `database/products.sql`

---

## 📁 ARQUIVO UNIFICADO

**Local:** `database/setup-completo.sql`

**Conteúdo:**
- Sistema de roles/permissões
- Tabela de perfis
- Sistema de produtos completo
- Sistema de pagamentos
- Dados iniciais

**Total:** ~400 linhas de SQL
**Tempo:** ~5-10 segundos para executar

---

## ✅ CHECKLIST

- [ ] Abri o Supabase
- [ ] Abri SQL Editor
- [ ] Copiei o arquivo setup-completo.sql
- [ ] Colei no editor
- [ ] Cliquei em "Run"
- [ ] Vi a mensagem de sucesso
- [ ] Testei as queries de verificação
- [ ] Acessei /admin/products
- [ ] Vi os 3 produtos

---

## 🎉 SUCESSO!

Agora você tem:
- ✅ Banco de dados completo
- ✅ Sistema de produtos funcionando
- ✅ Painel admin pronto
- ✅ 3 produtos de exemplo
- ✅ Você como administrador

**Bora vender! 🛒**

