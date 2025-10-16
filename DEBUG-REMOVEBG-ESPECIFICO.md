# 🔍 Debug Específico do Remove.bg

## 🎯 **Problema Identificado:**
O problema **só acontece quando utiliza o remover fundo** - não com uploads normais do usuário.

## 🔧 **Logs Adicionados:**

### **1. Logs do Remove.bg:**
```typescript
console.log('🔍 REMOVEBG - URL recebida:', url);
console.log('🔍 REMOVEBG - Tipo:', url.startsWith('data:') ? 'Data URL' : 'URL Externa');
console.log('🔍 REMOVEBG - Tamanho:', url.length);
```

### **2. Logs do Preview da Frente:**
```typescript
console.log('🔍 FRENTE-PREVIEW - Dimensões:', {
    // ... dimensões existentes ...
    isRemoveBg: (processedLogoUrl || logoDataUrl)?.includes('supabase') || (processedLogoUrl || logoDataUrl)?.includes('remove.bg'),
    urlType: img.src.startsWith('data:') ? 'Data URL' : 'URL Externa'
});
```

### **3. Logs da Função convertUrlToDataUrl:**
```typescript
console.log('🔍 CONVERTER - URL de entrada:', url);
console.log('🔍 CONVERTER - Tipo:', url.startsWith('data:') ? 'Data URL' : 'URL Externa');
console.log('🔍 CONVERTER - Blob type:', blob.type);
console.log('🔍 CONVERTER - Blob size:', blob.size);
console.log('🔍 CONVERTER - Usando FileReader para PNG');
console.log('🔍 CONVERTER - Data URL gerada (PNG):', result.substring(0, 100) + '...');
```

## 🧪 **Como Testar:**

### **1. Teste com Upload Normal:**
- Faça upload de uma imagem
- **NÃO** clique em "Remover Fundo"
- Vá para a segunda etapa
- Verifique se a frente está nítida

### **2. Teste com Remove.bg:**
- Faça upload de uma imagem
- **CLIQUE** em "Remover Fundo"
- Vá para a segunda etapa
- **Compare** os logs com o teste anterior

## 🔍 **O que Procurar nos Logs:**

### **Diferenças entre Upload Normal vs Remove.bg:**

1. **URL Type:**
   - Upload normal: `Data URL`
   - Remove.bg: `URL Externa` → `Data URL` (conversão)

2. **Dimensões:**
   - Upload normal: `naturalWidth/Height` normais
   - Remove.bg: `naturalWidth/Height` pequenos?

3. **Processamento:**
   - Upload normal: Direto
   - Remove.bg: Passa por `convertUrlToDataUrl`

## 🎯 **Hipóteses a Testar:**

1. **Conversão está comprimindo a imagem**
2. **Canvas está redimensionando incorretamente**
3. **FileReader está perdendo qualidade**
4. **URL do Supabase está sendo otimizada pelo Next.js**

---

**🔍 Execute o teste e compare os logs para identificar exatamente onde está o problema!**
