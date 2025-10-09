# 🚀 Quick Start - Admin Pages

## ⚡ Início Rápido (3 passos)

### 1️⃣ Executar SQL
```sql
-- Abra o Supabase SQL Editor e execute:
-- database/add-is-active-to-pages.sql
```

### 2️⃣ Configurar Email Admin
```typescript
// lib/auth-config.ts
export const ADMIN_EMAILS = [
    'seu-email@exemplo.com',  // 👈 Seu email aqui
];
```

### 3️⃣ Acessar Painel
```
http://localhost:3000/admin/pages
```

---

## 📋 O que foi implementado?

✅ **Página Admin**: `/admin/pages`
- Lista TODAS as páginas criadas por todos os usuários
- Busca por subdomínio, email ou nome do usuário
- Informações do usuário (nome e email)
- Status da página (Ativa/Inativa)
- Data de criação

✅ **API Admin**: `/api/admin/pages`
- `GET` - Lista todas as páginas (usa Service Role)
- `DELETE` - Remove uma página

✅ **Funcionalidades**:
- 🔍 Busca em tempo real
- 👁️ Visualizar página (abre em nova aba)
- ✏️ Editar qualquer página
- 🗑️ Remover página (com confirmação)
- 📊 Contador de páginas

---

## 🎯 Estrutura Implementada

```
/admin/pages
├── Interface de listagem (page.tsx)
├── Busca por subdomínio/usuário
├── Tabela responsiva
├── Botões de ação (Editar/Remover)
└── Links para visualização

/api/admin/pages
├── GET - Lista todas as páginas
└── DELETE - Remove uma página
```

---

## 🔑 Diferenças: User vs Admin

| Aspecto | `/dashboard/pages` | `/admin/pages` |
|---------|-------------------|----------------|
| **Visualiza** | Apenas suas páginas | **TODAS as páginas** |
| **Edita** | Apenas suas páginas | **Qualquer página** |
| **Remove** | Apenas suas páginas | **Qualquer página** |
| **Info Usuário** | Não exibe | **Nome e email** |
| **API** | `/api/pages` | `/api/admin/pages` |

---

## ✨ Exemplo de Tela

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Buscar por subdomínio ou usuário...             │
├─────────────────────────────────────────────────────┤
│ Total: 10 página(s) | Mostrando: 10                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ URL/Subdomínio │ Usuário       │ Status │ Criada   │ Ações      │
├────────────────┼───────────────┼────────┼──────────┼────────────┤
│ joao.zagnfc... │ João Silva    │ ● Ativa│ 01/01/24 │ ✏️ 🗑️     │
│                │ joao@mail.com │        │          │            │
├────────────────┼───────────────┼────────┼──────────┼────────────┤
│ maria.zagnfc...│ Maria Souza   │ ○ Inativa│02/01/24│ ✏️ 🗑️     │
│                │ maria@mail.com│        │          │            │
└────────────────┴───────────────┴────────┴──────────┴────────────┘
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| ❌ 401 Unauthorized | Faça login novamente |
| ❌ 403 Forbidden | Adicione seu email em `ADMIN_EMAILS` |
| ❌ Coluna não existe | Execute o SQL: `add-is-active-to-pages.sql` |
| ❌ Dados de usuário não aparecem | Configure `SUPABASE_SERVICE_ROLE_KEY` |
| ❌ Redireciona para /access-denied | Verifique `lib/auth-config.ts` |

---

## 📖 Documentação Completa

Ver: `ADMIN-PAGES-GUIDE.md`

---

**Status**: ✅ IMPLEMENTADO E FUNCIONAL

Data: Outubro 2024

