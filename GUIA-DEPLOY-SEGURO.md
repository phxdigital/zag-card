# 🚀 Guia de Deploy Seguro - Zag NFC
## Como fazer deploy sem afetar páginas de usuários ativos

---

## 📊 **Análise de Impacto**

### ✅ **O que está SEGURO (Não afeta usuários existentes):**

1. **Dados no Banco de Dados:**
   - ✅ Todos os dados salvos no campo `config` (JSONB) estão seguros
   - ✅ Os `customLinks` com ícones, cores e URLs permanecerão intactos
   - ✅ Logos e configurações de cores não serão alterados

2. **Ícones Compatíveis:**
   - ✅ Todos os ícones antigos continuam funcionando
   - ✅ Novos ícones adicionados: `pix`, `linkedin`, `user-plus`, `share`
   - ✅ Sistema tem fallback: se ícone não existir, mostra warning mas não quebra

### ⚠️ **O que PODE AFETAR usuários existentes:**

1. **Layout dos Botões Sociais:**
   - 🔴 Botões marcados com `isSocial: true` agora são renderizados de forma diferente
   - 🔴 Botões `user-plus` e `share` têm estilos especiais (pill e modal)
   - 🔴 Ordem e agrupamento dos botões mudou (sociais em cima, personalizados embaixo)

2. **Estilos Visuais:**
   - ⚠️ Tamanhos de botões podem mudar:
     - **Sociais**: Agora são redondos (w-12 h-12)
     - **Personalizados**: Retangulares (w-48 h-10)
   - ⚠️ Cores podem ser diferentes se não estiverem no banco

---

## 🛡️ **SOLUÇÕES PROPOSTAS**

### **Opção 1: Deploy Direto com Retro-compatibilidade (RECOMENDADO)**

Esta é a solução mais simples e segura. Adicione código de fallback para garantir compatibilidade:

#### Modificar `app/[subdomain]/page-client.tsx`:

```tsx
// Adicionar após a linha 283 (antes da renderização dos botões)

// RETROCOMPATIBILIDADE: Se o link não tem a propriedade isSocial definida,
// assumir comportamento antigo (botão personalizado retangular)
const enhanceLinksWithDefaults = (links: CustomLink[] | undefined): CustomLink[] => {
    if (!links) return [];
    
    return links.map(link => ({
        ...link,
        // Se isSocial não está definido, assumir false (comportamento antigo)
        isSocial: link.isSocial ?? false,
        // Garantir que todas as propriedades de estilo existam
        styleType: link.styleType || 'solid',
        bgColor1: link.bgColor1 || '#3B82F6',
        bgColor2: link.bgColor2 || '#3B82F6',
        textColor: link.textColor || '#ffffff'
    }));
};

// Usar dentro do componente:
const safeCustomLinks = enhanceLinksWithDefaults(config.customLinks);
```

**Vantagens:**
- ✅ 100% retrocompatível
- ✅ Páginas antigas mantêm aparência original
- ✅ Novas páginas usam novo layout
- ✅ Sem necessidade de migração de dados

---

### **Opção 2: Migração de Dados (Mais Trabalhoso)**

Se você quiser atualizar TODAS as páginas existentes para o novo formato:

#### Script de Migração SQL:

```sql
-- Este script atualiza todas as páginas existentes para adicionar
-- valores padrão nos campos que podem estar faltando

UPDATE pages
SET config = config || 
  jsonb_build_object(
    'landingPageLogoSize', COALESCE((config->>'landingPageLogoSize')::int, 96),
    'landingPageLogoShape', COALESCE(config->>'landingPageLogoShape', 'circle'),
    'landingFont', COALESCE(config->>'landingFont', 'Inter'),
    'landingPageTitleColor', COALESCE(config->>'landingPageTitleColor', '#1e293b'),
    'landingPageSubtitleColor', COALESCE(config->>'landingPageSubtitleColor', '#64748b')
  )
WHERE config IS NOT NULL;

-- Adicionar isSocial: false em todos os customLinks existentes
-- (se eles não tiverem essa propriedade)
UPDATE pages
SET config = jsonb_set(
  config,
  '{customLinks}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN link ? 'isSocial' THEN link
        ELSE link || '{"isSocial": false}'::jsonb
      END
    )
    FROM jsonb_array_elements(config->'customLinks') AS link
  ),
  true
)
WHERE config ? 'customLinks' 
  AND jsonb_array_length(config->'customLinks') > 0;
```

**Vantagens:**
- ✅ Todas as páginas ficam atualizadas
- ✅ Consistência total no banco de dados

**Desvantagens:**
- 🔴 Mais arriscado (sempre faça backup antes)
- 🔴 Pode mudar a aparência das páginas existentes

---

### **Opção 3: Versioning de Schema (Profissional)**

Adicione versionamento ao config para gerenciar mudanças:

```typescript
// Adicionar em types/global.d.ts
type PageConfig = {
    schemaVersion?: number; // Adicionar esta propriedade
    // ... resto das propriedades
}

// No page-client.tsx
const CURRENT_SCHEMA_VERSION = 2;

const migrateConfigIfNeeded = (config: PageConfig): PageConfig => {
    const version = config.schemaVersion || 1;
    
    if (version === 1) {
        // Migrar de v1 para v2
        return {
            ...config,
            schemaVersion: 2,
            customLinks: config.customLinks?.map(link => ({
                ...link,
                isSocial: link.isSocial ?? false
            }))
        };
    }
    
    return config;
};

// Usar no componente:
const migratedConfig = migrateConfigIfNeeded(config);
```

**Vantagens:**
- ✅ Controle total sobre mudanças
- ✅ Fácil adicionar novas versões no futuro
- ✅ Migrações automáticas e transparentes

---

## 📋 **CHECKLIST DE DEPLOY**

### Antes do Deploy:

- [ ] **1. Fazer backup do banco de dados**
  ```bash
  # No Supabase, vá em Database > Backups > Create Backup
  ```

- [ ] **2. Testar em ambiente de desenvolvimento**
  ```bash
  npm run dev
  # Testar com subdomínio de usuário real (se possível)
  ```

- [ ] **3. Verificar se todos os ícones estão mapeados**
  - Abrir `app/[subdomain]/page-client.tsx`
  - Confirmar que o objeto `icons` tem todos os ícones usados

- [ ] **4. Adicionar código de retrocompatibilidade** (Opção 1)

### Durante o Deploy:

- [ ] **5. Deploy no Vercel**
  ```bash
  git add .
  git commit -m "feat: adicionar retrocompatibilidade para ícones e estilos"
  git push origin main
  ```

- [ ] **6. Monitorar logs de erro**
  - Abrir Vercel Dashboard
  - Ir em Logs em tempo real
  - Procurar por erros de renderização

### Após o Deploy:

- [ ] **7. Testar página de usuário existente**
  - Abrir uma página de usuário que já estava ativa
  - Verificar se ícones aparecem corretamente
  - Verificar se cores e estilos estão corretos

- [ ] **8. Testar criação de nova página**
  - Criar uma página nova do zero
  - Verificar se novos recursos funcionam (PIX, LinkedIn, Compartilhar)

- [ ] **9. Verificar console do navegador**
  - Abrir F12 nas páginas dos usuários
  - Procurar por warnings: "Icon not found"
  - Se houver, adicionar ícones faltantes

---

## 🔧 **IMPLEMENTAÇÃO RÁPIDA (Opção 1 - Recomendada)**

Vou criar os arquivos necessários para você:

### 1. Adicionar helper de compatibilidade

```typescript
// lib/page-compatibility.ts
import { CustomLink } from '@/app/[subdomain]/page-client';

/**
 * Garante retrocompatibilidade com páginas antigas
 * Adiciona valores padrão para propriedades que podem estar faltando
 */
export function ensureBackwardCompatibility(links: CustomLink[] | undefined): CustomLink[] {
    if (!links) return [];
    
    return links.map(link => ({
        ...link,
        // Se isSocial não existe, assumir false (comportamento antigo)
        isSocial: link.isSocial ?? false,
        // Garantir propriedades de estilo
        styleType: link.styleType || 'solid',
        bgColor1: link.bgColor1 || '#3B82F6',
        bgColor2: link.bgColor2 || '#3B82F6',
        textColor: link.textColor || '#ffffff',
        icon: link.icon || null
    }));
}

/**
 * Detecta se uma página foi criada antes da atualização
 */
export function isLegacyPage(config: any): boolean {
    // Páginas antigas não têm a propriedade isSocial em nenhum link
    if (!config.customLinks || config.customLinks.length === 0) return false;
    
    return config.customLinks.every((link: any) => 
        link.isSocial === undefined
    );
}
```

### 2. Usar no page-client.tsx

Adicionar no início da função `PageClient`:

```typescript
export default function PageClient({ config, logoUrl }: PageClientProps) {
    const [showShareModal, setShowShareModal] = useState(false);
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

    // ADICIONAR ESTA LINHA:
    const safeCustomLinks = ensureBackwardCompatibility(config.customLinks);
    
    // Substituir todas as referências de config.customLinks por safeCustomLinks
    // ...
```

---

## 🎯 **MINHA RECOMENDAÇÃO FINAL**

**Para o seu caso específico, recomendo:**

1. ✅ **Implementar Opção 1** (Retrocompatibilidade com código)
2. ✅ **NÃO fazer migração de dados** ainda
3. ✅ **Adicionar monitoramento** de warnings no console
4. ✅ **Avisar usuários** sobre novas funcionalidades (email marketing)

**Por quê?**
- Minimiza riscos
- Não requer alteração no banco de dados
- Páginas antigas mantêm aparência original
- Novas páginas usam recursos novos
- Fácil de reverter se necessário

---

## 🆘 **PLANO DE CONTINGÊNCIA**

Se algo der errado após o deploy:

### Reverter Deploy:
```bash
# No Vercel
1. Ir em Deployments
2. Encontrar deploy anterior (estável)
3. Clicar em "..." > "Promote to Production"
```

### Ou via Git:
```bash
git revert HEAD
git push origin main
```

---

## 📞 **SUPORTE**

Se precisar de ajuda:
1. Verificar logs no Vercel Dashboard
2. Testar localmente com `npm run dev`
3. Verificar console do navegador (F12)
4. Backup sempre disponível no Supabase

---

**Última atualização:** 2025-10-09
**Versão do Sistema:** 2.0
**Versão Anterior:** 1.0

