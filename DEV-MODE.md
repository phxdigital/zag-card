# 🚀 Modo de Desenvolvimento - Zag NFC

## ✅ **Sistema Configurado para Teste Gratuito**

### **🎯 O que foi alterado:**

1. **Pagamento desabilitado** - Você pode criar páginas sem pagar
2. **Banner de desenvolvimento** - Indica que está em modo de teste
3. **Configuração flexível** - Fácil de ativar/desativar

### **📁 Arquivos Modificados:**

- `lib/config.ts` - Configurações do sistema
- `app/dashboard/page.tsx` - Dashboard principal

### **🔧 Como Funciona:**

#### **Modo de Desenvolvimento (Atual):**
```typescript
// lib/config.ts
export const config = {
  developmentMode: true,        // ✅ Ativo
  payment: {
    required: false,            // ✅ Pagamento não obrigatório
    stripeEnabled: false,       // ✅ Stripe desabilitado
  }
};
```

#### **Para Produção (Futuro):**
```typescript
// lib/config.ts
export const config = {
  developmentMode: false,       // ❌ Desativar
  payment: {
    required: true,             // ❌ Pagamento obrigatório
    stripeEnabled: true,        // ❌ Stripe ativo
  }
};
```

### **🎮 Como Testar Agora:**

#### **1. Acesse o Dashboard:**
```
http://localhost:3000/dashboard
```

#### **2. Você verá:**
- ✅ **Banner amarelo** indicando modo de desenvolvimento
- ✅ **Acesso completo** ao sistema
- ✅ **Criação de páginas** sem pagamento

#### **3. Teste as Funcionalidades:**
- ✅ Criar páginas NFC
- ✅ Editar páginas existentes
- ✅ Configurar logos e cores
- ✅ Adicionar botões sociais
- ✅ Testar preview em tempo real

### **📊 Limites em Desenvolvimento:**

- **Páginas por usuário:** 10 (configurável)
- **Botões personalizados:** 4
- **Botões sociais:** 5
- **Sem limite de tempo**

### **🔄 Para Alternar Modos:**

#### **Ativar Modo de Produção:**
```typescript
// lib/config.ts
developmentMode: false,
payment: {
  required: true,
  stripeEnabled: true,
}
```

#### **Voltar ao Modo de Desenvolvimento:**
```typescript
// lib/config.ts
developmentMode: true,
payment: {
  required: false,
  stripeEnabled: false,
}
```

### **🎯 Próximos Passos:**

1. **Teste todas as funcionalidades**
2. **Crie algumas páginas de exemplo**
3. **Teste a edição de páginas**
4. **Verifique o sistema de subdomínios**

### **⚠️ Importante:**

- **Este modo é apenas para desenvolvimento**
- **Em produção, configure o Stripe**
- **Ative as verificações de pagamento**
- **Configure os limites reais**

---

**Agora você pode testar o sistema completo sem pagar!** 🎉

**Acesse:** `http://localhost:3000/dashboard`
