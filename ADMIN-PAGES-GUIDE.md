# 📋 Guia - Painel de Páginas Web (Admin)

## 🎯 Visão Geral

O painel `/admin/pages` permite aos administradores visualizar, gerenciar e monitorar **todas as páginas web** criadas pelos usuários no sistema.

---

## 🚀 Funcionalidades Implementadas

### ✅ 1. Listagem Completa de Páginas
- Visualiza **todas as páginas** criadas por todos os usuários
- Informações do usuário proprietário (nome e email)
- Status da página (Ativa/Inativa)
- Data de criação
- Link para visualizar a página online

### ✅ 2. Busca e Filtros
- 🔍 Busca por:
  - Subdomínio (ex: "joao")
  - Email do usuário
  - Nome do usuário
- Filtros em tempo real

### ✅ 3. Ações Administrativas
- 👁️ **Visualizar**: Abre a página em nova aba
- ✏️ **Editar**: Permite editar qualquer página
- 🗑️ **Remover**: Exclui permanentemente uma página (com confirmação)

### ✅ 4. Interface Responsiva
- Design moderno e limpo
- Tabela responsiva
- Indicadores visuais de status
- Ícones intuitivos

---

## 📁 Estrutura de Arquivos

```
app/
├── admin/
│   ├── pages/
│   │   └── page.tsx          # Interface principal do painel
│   └── layout.tsx             # Layout com sidebar e menu
│
api/
├── admin/
│   └── pages/
│       └── route.ts           # API para listar/deletar páginas (ADMIN)
└── pages/
    └── route.ts               # API para usuários normais

database/
└── add-is-active-to-pages.sql # Script SQL para adicionar campos necessários
```

---

## 🔧 Configuração Necessária

### 1️⃣ Executar SQL no Supabase

Execute o script SQL para adicionar campos necessários:

```bash
# Abra o arquivo e execute no painel SQL do Supabase
database/add-is-active-to-pages.sql
```

Este script adiciona:
- ✅ `is_active` - Status ativo/inativo da página
- ✅ `title` - Título da página
- ✅ `subtitle` - Subtítulo da página
- ✅ `status` - Status da página (active/draft)

### 2️⃣ Verificar Variáveis de Ambiente

Certifique-se de que está configurado:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key  # ⚠️ IMPORTANTE para admin
```

> ⚠️ A `SUPABASE_SERVICE_ROLE_KEY` é **essencial** para o admin acessar dados de todos os usuários, ignorando RLS.

### 3️⃣ Configurar Admin Email

Edite o arquivo `lib/auth-config.ts`:

```typescript
export const ADMIN_EMAILS = [
    'seu-email@exemplo.com',  // 👈 Adicione seu email aqui
];

export function isAdminEmail(email: string | undefined): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
}
```

---

## 🎨 Como Usar o Painel

### 1️⃣ Acessar o Painel
```
http://localhost:3000/admin/pages
```

### 2️⃣ Visualizar Páginas
- A tabela mostra todas as páginas criadas
- Cada linha tem informações completas do usuário e página

### 3️⃣ Buscar Páginas
```
🔍 Digite no campo de busca:
- "joao" → encontra subdomínio "joao"
- "user@email.com" → encontra páginas desse usuário
- "João Silva" → encontra páginas desse nome
```

### 4️⃣ Gerenciar Páginas

#### Visualizar Página
1. Clique no link do subdomínio
2. Ou clique no ícone 🌐 (ExternalLink)
3. A página abre em nova aba

#### Editar Página
1. Clique no botão ✏️ (Editar)
2. Você será redirecionado para a página de edição
3. Faça as alterações necessárias

#### Remover Página
1. Clique no botão 🗑️ (Remover)
2. Confirme a exclusão no popup
3. A página será **permanentemente excluída**

---

## 🔐 Segurança

### Controle de Acesso
- ✅ Apenas emails cadastrados em `ADMIN_EMAILS` têm acesso
- ✅ Verificação no frontend (React)
- ✅ Verificação no backend (API)
- ✅ Middleware protege rotas `/admin/*`

### RLS (Row Level Security)
- ✅ Admin usa **Service Role Key** para bypassar RLS
- ✅ Usuários normais só veem suas próprias páginas
- ✅ APIs separadas (`/api/pages` vs `/api/admin/pages`)

---

## 📊 Dados Exibidos na Tabela

| Campo | Descrição | Origem |
|-------|-----------|--------|
| URL / Subdomínio | Link clicável para a página | `pages.subdomain` |
| Usuário | Nome e email do proprietário | `auth.users` via Service Role |
| Status | Ativa / Inativa | `pages.is_active` |
| Criada em | Data de criação | `pages.created_at` |
| Ações | Editar e Remover | Botões de ação |

---

## 🔄 API Endpoints

### GET `/api/admin/pages`
Retorna todas as páginas do sistema (apenas admin)

**Response:**
```json
{
  "success": true,
  "pages": [
    {
      "id": "uuid",
      "subdomain": "joao",
      "user_id": "uuid",
      "user_email": "joao@email.com",
      "user_name": "João Silva",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-02T00:00:00Z"
    }
  ]
}
```

### DELETE `/api/admin/pages`
Remove uma página (apenas admin)

**Request:**
```json
{
  "pageId": "uuid-da-pagina"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## 🎯 Diferenças: User vs Admin

| Recurso | Usuário Normal | Admin |
|---------|---------------|-------|
| **Rota** | `/dashboard/pages` | `/admin/pages` |
| **API** | `/api/pages` | `/api/admin/pages` |
| **Visualização** | Apenas suas páginas | **Todas as páginas** |
| **Edição** | Apenas suas páginas | **Qualquer página** |
| **Remoção** | Apenas suas páginas | **Qualquer página** |
| **Info do Usuário** | Não exibe | **Exibe nome e email** |

---

## 🐛 Solução de Problemas

### ❌ Erro 401 (Unauthorized)
**Causa:** Usuário não está autenticado
**Solução:** Faça login novamente

### ❌ Erro 403 (Forbidden)
**Causa:** Email não está em `ADMIN_EMAILS`
**Solução:** Adicione seu email em `lib/auth-config.ts`

### ❌ Coluna "is_active" não existe
**Causa:** SQL não foi executado
**Solução:** Execute `database/add-is-active-to-pages.sql` no Supabase

### ❌ Não carrega dados de usuários
**Causa:** `SUPABASE_SERVICE_ROLE_KEY` não configurada
**Solução:** Adicione a variável no `.env.local`

### ❌ Página redireciona para /access-denied
**Causa:** Middleware bloqueou acesso
**Solução:** Verifique se email está em `ADMIN_EMAILS`

---

## 📝 Exemplo de Fluxo de Uso

```
1. Admin faz login
   ↓
2. Acessa http://localhost:3000/admin
   ↓
3. Clica em "Páginas Web" no menu lateral
   ↓
4. Visualiza lista de TODAS as páginas
   ↓
5. Busca por "joao"
   ↓
6. Encontra página "joao.zagnfc.com.br"
   ↓
7. Clica para visualizar a página
   ↓
8. Volta e clica em "Editar"
   ↓
9. Faz alterações necessárias
   ↓
10. Salva mudanças
```

---

## ✨ Melhorias Futuras (Sugestões)

- [ ] Filtro por status (Ativa/Inativa)
- [ ] Filtro por data de criação
- [ ] Exportar lista em CSV/Excel
- [ ] Estatísticas de uso por usuário
- [ ] Gráfico de páginas criadas por período
- [ ] Ativar/Desativar páginas em massa
- [ ] Preview da página sem sair do admin
- [ ] Histórico de alterações
- [ ] Notificações para admin quando nova página é criada

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do servidor (terminal)
3. Confirme que todas as variáveis de ambiente estão configuradas
4. Execute novamente o script SQL se necessário

---

## ✅ Checklist de Implementação

- [x] Interface de listagem criada
- [x] API de admin criada
- [x] Busca funcional
- [x] Edição de páginas
- [x] Remoção de páginas
- [x] Controle de acesso (admin only)
- [x] Layout responsivo
- [x] Ícones e indicadores visuais
- [x] Confirmação de exclusão
- [x] Dados de usuário (nome e email)
- [x] Status ativo/inativo
- [x] Link para visualização
- [x] Documentação completa

---

**🎉 Painel de Páginas Web totalmente funcional!**

Data de criação: Outubro 2024
Versão: 1.0

