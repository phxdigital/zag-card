# 🔐 Guia de Configuração: Sistema de Controle de Acesso Admin

## ✅ Sistema Implementado com Sucesso!

O sistema de controle de acesso para administradores foi implementado e está funcionando. Apenas o email `andresavite@gmail.com` tem acesso ao painel administrativo.

---

## 📋 O Que Foi Implementado

### 1. **Tabela de Roles no Banco de Dados** ✅
**Arquivo:** `database/user-roles.sql`

Cria:
- Tabela `user_roles` para armazenar permissões
- Funções automáticas para atribuir roles
- Trigger que detecta emails de admin automaticamente
- View `users_with_roles` para consultas

### 2. **Configuração de Admins** ✅
**Arquivo:** `lib/auth-config.ts`

Define:
- Lista de emails com permissão de administrador
- Funções helper para verificar se email é admin
- Tipos TypeScript para roles

### 3. **Funções Helper de Autenticação** ✅
**Arquivo:** `lib/auth-helpers.ts`

Fornece:
- `isAdmin()` - Verifica se usuário atual é admin (client)
- `isAdminServer()` - Verifica se usuário atual é admin (server)
- `getUserRole()` - Retorna o role do usuário atual

### 4. **Página de Acesso Negado** ✅
**Arquivo:** `app/access-denied/page.tsx`

Exibe:
- Mensagem clara de acesso negado
- Botões para voltar ao dashboard
- Design consistente com o resto da aplicação

### 5. **Layout Admin Protegido** ✅
**Arquivo:** `app/admin/layout.tsx`

Proteção:
- Verifica se usuário está autenticado
- Verifica se usuário é admin
- Redireciona não-admins para página de acesso negado
- Exibe badge "Administrador" no header

### 6. **Middleware de Proteção** ✅
**Arquivo:** `middleware.ts`

Implementa:
- Verificação de autenticação para rota `/admin`
- Verificação de permissão de admin
- Redirecionamento automático de usuários não autorizados
- Logs de tentativas de acesso não autorizado

### 7. **Página de Login Melhorada** ✅
**Arquivo:** `app/login/page.tsx`

Melhorias:
- Detecta email já cadastrado
- Exibe aviso amarelo para confirmar email após cadastro
- Mensagens de erro mais claras
- Validação de email duplicado

### 8. **Página de Conta do Usuário** ✅
**Arquivo:** `app/dashboard/account/page.tsx`

Funcionalidades:
- Carrega dados reais do usuário logado
- Exibe badge de admin quando aplicável
- Permite atualizar nome
- Permite alterar senha
- Mostra método de login (Email/Google)
- Mostra data de cadastro e último login

---

## 🚀 Como Usar

### Para Adicionar Mais Administradores

1. **Abra o arquivo:** `lib/auth-config.ts`

2. **Adicione o email à lista:**
```typescript
export const ADMIN_EMAILS = [
    'andresavite@gmail.com',
    'novo-admin@example.com', // Adicione aqui
    // Mais emails se necessário
];
```

3. **Salve o arquivo** - A mudança será aplicada imediatamente!

4. **(Opcional) Execute no Supabase SQL Editor:**
```sql
-- Para atualizar roles de usuários já existentes
INSERT INTO user_roles (user_id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'novo-admin@example.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'admin',
    updated_at = NOW();
```

---

## 🔍 Fluxo de Proteção

### Quando Usuário Tenta Acessar `/admin`:

```
1. Middleware verifica autenticação
   ├─ Não autenticado? → Redireciona para /login
   └─ Autenticado? → Continua

2. Middleware verifica permissão
   ├─ Não é admin? → Redireciona para /access-denied
   └─ É admin? → Permite acesso

3. AdminLayout verifica novamente (dupla segurança)
   ├─ Não autenticado? → Redireciona para /login
   ├─ Não é admin? → Redireciona para /access-denied
   └─ É admin? → Renderiza painel
```

---

## 📊 Estrutura de Segurança

### Camadas de Proteção:

| Camada | Localização | Função |
|--------|-------------|---------|
| **1. Middleware** | `middleware.ts` | Primeira linha de defesa, bloqueia antes do componente carregar |
| **2. Layout** | `app/admin/layout.tsx` | Segunda verificação, garante que componente só renderiza para admin |
| **3. Configuração** | `lib/auth-config.ts` | Lista centralizada de admins, fácil de manter |
| **4. Banco de Dados** | `database/user-roles.sql` | Persistência de roles, trigger automático |

---

## 🎯 Testar o Sistema

### Teste 1: Acesso com Admin
1. Faça login com `andresavite@gmail.com`
2. Acesse `/admin`
3. ✅ Deve ver o painel administrativo
4. ✅ Deve ver badge "Administrador" no header

### Teste 2: Acesso sem Admin
1. Faça login com outro email (não admin)
2. Tente acessar `/admin`
3. ✅ Deve ser redirecionado para `/access-denied`
4. ✅ Log deve aparecer no console do servidor

### Teste 3: Acesso sem Login
1. Faça logout
2. Tente acessar `/admin` diretamente
3. ✅ Deve ser redirecionado para `/login`

---

## 📝 Configurar Banco de Dados

### Passo 1: Execute o SQL no Supabase

1. Acesse **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Clique em **+ New Query**
4. Cole o conteúdo de `database/user-roles.sql`
5. Clique em **Run** ou pressione `Ctrl+Enter`

### Passo 2: Verificar Instalação

Execute esta query para verificar:

```sql
-- Verificar se a tabela foi criada
SELECT * FROM user_roles;

-- Verificar se o admin foi configurado
SELECT * FROM users_with_roles WHERE email = 'andresavite@gmail.com';

-- Verificar funções
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%admin%';
```

### Passo 3: Resultado Esperado

```
| email                  | role  |
|------------------------|-------|
| andresavite@gmail.com  | admin |
```

Se o usuário ainda não existe, o trigger criará o role automaticamente no primeiro login.

---

## 🔄 Como Funciona Automaticamente

### Quando um Usuário Faz Cadastro/Login:

1. **Usuário cria conta** (via email ou OAuth)
2. **Trigger automático dispara** (`on_auth_user_created`)
3. **Sistema verifica** se email está na lista de admins
4. **Role é atribuído automaticamente:**
   - Se email está em `ADMIN_EMAILS` → role = 'admin'
   - Se não → role = 'user'
5. **Registro criado** na tabela `user_roles`

**Resultado:** Admins são configurados automaticamente, sem intervenção manual!

---

## 🛡️ Segurança

### Boas Práticas Implementadas:

✅ **Múltiplas camadas** de verificação (middleware + layout)  
✅ **Logs de tentativas** de acesso não autorizado  
✅ **Lista centralizada** de admins (fácil manutenção)  
✅ **Verificação server-side** (não pode ser burlada pelo client)  
✅ **Triggers automáticos** (menos chance de erro humano)  
✅ **RLS (Row Level Security)** no Supabase  
✅ **Mensagens de erro** sem expor informações sensíveis  

### O Que NÃO Fazer:

❌ Não confie apenas em verificações client-side  
❌ Não exponha lista de admins publicamente  
❌ Não use roles hardcoded em múltiplos lugares  
❌ Não permita que usuários mudem seu próprio role  
❌ Não esqueça de verificar em APIs (adicionar verificação em rotas `/api/admin/*`)

---

## 🔧 Manutenção

### Adicionar Admin:
```typescript
// lib/auth-config.ts
export const ADMIN_EMAILS = [
    'andresavite@gmail.com',
    'novo@example.com', // Adicione aqui
];
```

### Remover Admin:
```typescript
// lib/auth-config.ts
export const ADMIN_EMAILS = [
    'andresavite@gmail.com',
    // 'removido@example.com', // Comente ou delete
];
```

### Ver Todos os Admins:
```sql
SELECT email, created_at 
FROM user_roles 
WHERE role = 'admin' 
ORDER BY created_at DESC;
```

### Ver Tentativas de Acesso:
Verifique os logs do servidor (console) para ver tentativas de acesso não autorizado.

---

## 📞 Troubleshooting

### Problema: Admin não consegue acessar `/admin`

**Solução:**
1. Verifique se email está em `ADMIN_EMAILS`
2. Faça logout e login novamente
3. Execute no Supabase:
```sql
SELECT * FROM user_roles WHERE email = 'seu@email.com';
```
4. Se role não for 'admin', execute:
```sql
UPDATE user_roles SET role = 'admin' WHERE email = 'seu@email.com';
```

### Problema: Usuário normal consegue acessar `/admin`

**Solução:**
1. Verifique se middleware está ativo
2. Limpe cache do navegador
3. Reinicie servidor de desenvolvimento
4. Verifique arquivo `middleware.ts` não tem erros

### Problema: Erro ao executar SQL

**Solução:**
1. Execute comandos um por um
2. Verifique se função `update_updated_at_column()` existe
3. Se não existir, execute primeiro o `schema.sql` base

---

## 📚 Arquivos Relacionados

```
Sistema de Admin
├── database/
│   ├── user-roles.sql          # Schema e triggers
│   └── schema.sql              # Schema base
├── lib/
│   ├── auth-config.ts          # Lista de admins
│   └── auth-helpers.ts         # Funções helper
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Layout protegido
│   │   └── page.tsx            # Painel admin
│   ├── access-denied/
│   │   └── page.tsx            # Página de erro
│   ├── dashboard/account/
│   │   └── page.tsx            # Conta do usuário
│   └── login/
│       └── page.tsx            # Login melhorado
└── middleware.ts               # Proteção de rotas
```

---

## ✨ Recursos Adicionais

### Verificar Role Programaticamente:

```typescript
import { getUserRole } from '@/lib/auth-helpers';

const role = await getUserRole();
if (role === 'admin') {
    // Mostrar funcionalidades admin
}
```

### Verificar se É Admin:

```typescript
import { isAdmin } from '@/lib/auth-helpers';

const userIsAdmin = await isAdmin();
if (userIsAdmin) {
    // Permitir ação administrativa
}
```

### Usar em Server Component:

```typescript
import { isAdminServer } from '@/lib/auth-helpers';

export default async function ServerPage() {
    const userIsAdmin = await isAdminServer();
    
    if (!userIsAdmin) {
        redirect('/access-denied');
    }
    
    return <div>Admin Content</div>;
}
```

---

## 🎉 Pronto!

Seu sistema de controle de acesso está **100% funcional**!

**Principais Benefícios:**
- ✅ Seguro e robusto
- ✅ Fácil de manter
- ✅ Automático (triggers)
- ✅ Múltiplas camadas de proteção
- ✅ Bem documentado

**Email Admin Configurado:**
- 📧 `andresavite@gmail.com`

Para adicionar mais admins, basta editar `lib/auth-config.ts`!

