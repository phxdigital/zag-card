# 🔧 Fix - Admin Pages sem Service Role Key

## 🎯 Problema Identificado

Você estava recebendo o erro:
```
SUPABASE_SERVICE_ROLE_KEY: MISSING
Error: supabaseKey is required.
```

**Causa**: A API `/api/admin/pages` estava tentando usar Service Role Key, que não estava configurada no `.env.local`.

## ✅ Solução Implementada

Modificamos a abordagem para **NÃO DEPENDER** do Service Role Key, seguindo o mesmo padrão das outras APIs admin que já funcionam (como `/api/admin/notifications`).

### Como funciona agora:

1. **Políticas RLS Inteligentes** 
   - Admins podem ver/editar/deletar TODAS as páginas
   - Usuários normais só veem suas próprias páginas
   - Tudo controlado pelo Row Level Security do Supabase

2. **API Simples**
   - Usa `createRouteHandlerClient` (cliente normal)
   - Verifica se usuário é admin via tabela `user_roles`
   - RLS libera acesso automaticamente para admins

3. **Informações do Usuário**
   - Busca email do dono da página via tabela `user_roles`
   - Não precisa de `auth.admin.listUsers()` (que exige Service Role)

---

## 📋 Passos para Configurar

### 1️⃣ Executar SQL de Políticas RLS

Execute no Supabase SQL Editor:

```bash
# Arquivo: database/admin-pages-policies.sql
```

Este SQL cria políticas que permitem:
- ✅ Admins verem TODAS as páginas
- ✅ Admins editarem QUALQUER página
- ✅ Admins deletarem QUALQUER página
- ✅ Usuários normais continuam vendo apenas suas páginas

### 2️⃣ Executar SQL de Colunas Adicionais

Execute no Supabase SQL Editor:

```bash
# Arquivo: database/add-is-active-to-pages.sql
```

Este SQL adiciona colunas necessárias:
- `is_active` - Status ativo/inativo
- `title` - Título da página
- `subtitle` - Subtítulo
- `status` - Status (active/draft)

### 3️⃣ Garantir que você é Admin

Execute no Supabase SQL Editor:

```sql
-- Verificar se você tem role de admin
SELECT * FROM user_roles WHERE email = 'seu-email@exemplo.com';

-- Se não retornar nada ou role != 'admin', execute:
INSERT INTO user_roles (user_id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'seu-email@exemplo.com'
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

### 4️⃣ Verificar lib/auth-config.ts

Certifique-se de que seu email está na lista:

```typescript
export const ADMIN_EMAILS = [
    'seu-email@exemplo.com',  // 👈 Adicione aqui
];
```

### 5️⃣ Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

## 🔍 Como Verificar se Funcionou

### 1. Verifique os Logs do Terminal

Ao acessar `/admin/pages`, você deve ver:

```
👤 Admin acessando lista de páginas: seu-email@exemplo.com
📄 Total de páginas encontradas: X
✅ X páginas formatadas para admin
GET /api/admin/pages 200 in XXXms
```

### 2. Verifique o Console do Navegador

Não deve haver erros. A página deve carregar normalmente.

### 3. Teste as Funcionalidades

- ✅ Visualizar todas as páginas criadas
- ✅ Buscar por subdomínio/email
- ✅ Editar qualquer página
- ✅ Deletar qualquer página

---

## 🆚 Comparação: Antes vs Depois

| Aspecto | ❌ Antes (Com Service Role) | ✅ Depois (Sem Service Role) |
|---------|---------------------------|----------------------------|
| **Dependência** | Precisa de Service Role Key | Usa cliente normal |
| **Configuração** | Variável de ambiente obrigatória | Não precisa configurar nada |
| **Segurança** | Service Role bypass total RLS | RLS controlado e seguro |
| **Dados do Usuário** | `auth.admin.listUsers()` | Tabela `user_roles` |
| **Complexidade** | Mais complexo | Mais simples |
| **Padrão** | Diferente das outras APIs | Igual às outras APIs |

---

## 🗂️ Arquivos Modificados

### 1. `app/api/admin/pages/route.ts`
**Mudanças:**
- ❌ Removido: `import { createClient } from '@supabase/supabase-js'`
- ❌ Removido: Service Role Key check
- ❌ Removido: `createClient()` com Service Role
- ❌ Removido: `supabaseAdmin.auth.admin.listUsers()`
- ✅ Adicionado: Busca de email via `user_roles`
- ✅ Melhorado: Logs mais detalhados
- ✅ Melhorado: Mensagens de erro mais claras

### 2. `database/admin-pages-policies.sql` (NOVO)
Políticas RLS que permitem admin acessar tudo

### 3. `database/add-is-active-to-pages.sql` (NOVO)
Adiciona colunas necessárias à tabela pages

---

## 🐛 Troubleshooting

### ❌ Ainda recebo "Forbidden" (403)

**Solução:**
```sql
-- Verificar role no banco
SELECT email, role FROM user_roles WHERE email = 'seu-email@exemplo.com';

-- Se não for 'admin', atualizar:
UPDATE user_roles SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
```

### ❌ "Column does not exist: is_active"

**Solução:**
```bash
Execute: database/add-is-active-to-pages.sql
```

### ❌ Não vejo todas as páginas, só as minhas

**Solução:**
```bash
Execute: database/admin-pages-policies.sql
```

### ❌ user_email aparece como "N/A"

**Causa:** Usuário não tem registro na tabela `user_roles`

**Solução:**
```sql
-- Para criar automaticamente para todos os usuários:
INSERT INTO user_roles (user_id, email, role)
SELECT id, email, 'user'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;
```

---

## ✨ Vantagens da Nova Abordagem

1. ✅ **Sem Service Role Key** - Uma dependência a menos
2. ✅ **Mais Seguro** - RLS controlado, não bypass total
3. ✅ **Mais Simples** - Código mais limpo e fácil de manter
4. ✅ **Padrão Consistente** - Segue o mesmo padrão das outras APIs
5. ✅ **Menos Configuração** - Não precisa configurar env vars extras
6. ✅ **Melhor Performance** - Menos consultas ao auth.users

---

## 📊 Estrutura de Dados

### Tabela `pages`
```
id          | UUID
subdomain   | TEXT
user_id     | UUID (FK → auth.users)
is_active   | BOOLEAN
title       | TEXT
subtitle    | TEXT
status      | TEXT
created_at  | TIMESTAMP
updated_at  | TIMESTAMP
```

### Tabela `user_roles`
```
id          | UUID
user_id     | UUID (FK → auth.users)
email       | TEXT
role        | TEXT ('admin' | 'user')
created_at  | TIMESTAMP
updated_at  | TIMESTAMP
```

---

## 🎯 Próximos Passos

Após configurar tudo:

1. ✅ Acesse: `http://localhost:3000/admin/pages`
2. ✅ Verifique se lista TODAS as páginas
3. ✅ Teste a busca
4. ✅ Teste editar uma página
5. ✅ Teste deletar uma página

---

## 📞 Suporte

Se ainda tiver problemas:

1. Verifique os logs do terminal
2. Verifique o console do navegador (F12)
3. Execute os SQLs na ordem:
   - `database/user-roles.sql` (se ainda não executou)
   - `database/add-is-active-to-pages.sql`
   - `database/admin-pages-policies.sql`
4. Verifique se seu email está em `ADMIN_EMAILS` e na tabela `user_roles`

---

**Status**: ✅ CORRIGIDO - Não depende mais de Service Role Key!

Data: Outubro 2024

