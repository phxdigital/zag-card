# 🚨 Correção Rápida - Erro de Schema

## Problema Identificado
- ❌ Coluna `logo_url` não existe na tabela `pages`
- ❌ Erro de cookies no Next.js 15

## ✅ Solução

### 1. Execute este SQL no Supabase

Acesse o painel do Supabase → SQL Editor e execute:

```sql
-- Adicionar coluna logo_url se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pages' 
        AND column_name = 'logo_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pages ADD COLUMN logo_url TEXT;
        RAISE NOTICE 'Coluna logo_url adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna logo_url já existe';
    END IF;
END $$;
```

### 2. Criar Bucket de Logos

No painel do Supabase:
1. Vá para **Storage**
2. Clique em **"New bucket"**
3. Nome: `logos`
4. Marque como **público**
5. Clique em **"Create bucket"**

### 3. Verificar se Funcionou

Execute este SQL para verificar:

```sql
-- Verificar colunas da tabela pages
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'pages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar bucket logos
SELECT name, public, created_at 
FROM storage.buckets 
WHERE name = 'logos';
```

### 4. Testar o Sistema

1. **Reinicie o servidor:**
   ```bash
   # Pare o servidor (Ctrl+C) e reinicie
   npm run dev
   ```

2. **Teste o dashboard:**
   - Acesse: `http://localhost:3000/dashboard`
   - Faça login
   - Tente salvar uma página

3. **Verifique os logs:**
   - Os erros de cookies devem ter parado
   - O salvamento deve funcionar

## 🔍 Verificação Final

### ✅ Checklist:
- [ ] Coluna `logo_url` existe na tabela `pages`
- [ ] Bucket `logos` criado e público
- [ ] Servidor reiniciado
- [ ] Dashboard carrega sem erros
- [ ] Salvamento funciona

### 🐛 Se ainda houver problemas:

1. **Verifique os logs do terminal** - devem estar limpos
2. **Verifique o console do navegador** - F12 → Console
3. **Verifique os logs do Supabase** - Painel → Logs

## 📞 Próximos Passos

Após corrigir:
1. Teste upload de logo
2. Teste criação de subdomínio
3. Teste acesso ao subdomínio
4. Prepare para deploy

---

**Tempo estimado:** 5 minutos
**Dificuldade:** Fácil
