# 🚀 Instruções para Configurar Analytics da Homepage

## 📋 Passo a Passo

### 1. **Acesse o Supabase Dashboard**
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto `zag-card-app`

### 2. **Abra o SQL Editor**
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"New query"**

### 3. **Execute o Script Completo**
- Copie todo o conteúdo do arquivo `setup-homepage-analytics-complete.sql`
- Cole no editor SQL
- Clique em **"Run"** para executar

### 4. **Verifique os Resultados**
O script irá:
- ✅ Adicionar as colunas necessárias na tabela `homepage_visits`
- ✅ Inserir dados de teste para botões e seções
- ✅ Mostrar as colunas criadas
- ✅ Mostrar os dados inseridos

### 5. **Teste o Dashboard**
- Volte para: `http://localhost:3000/dashboard/analytics/homepage`
- Verifique se agora aparecem dados nas seções:
  - **Button Stats:** Deve mostrar botões como "Criar Conta", "Entrar", etc.
  - **Section Stats:** Deve mostrar seções como "hero", "features", etc.

### 6. **Teste o Tracking Real**
- Acesse: `http://localhost:3000/`
- Clique em botões e navegue entre seções
- Volte ao dashboard para ver dados reais sendo coletados

## 🔧 Se algo não funcionar:

1. **Verifique se o servidor está rodando:**
   ```bash
   npm run dev
   ```

2. **Verifique os logs do servidor** para erros

3. **Verifique se as colunas foram criadas** no Supabase:
   - Vá em **"Table Editor"**
   - Selecione a tabela `homepage_visits`
   - Verifique se as colunas `type`, `button_id`, `button_text`, `button_type`, `section_id`, `time_spent_seconds` existem

## 📊 Resultado Esperado:

Após executar o script, o dashboard deve mostrar:

### **Button Click Statistics:**
- Botão: "Criar Conta" | Tipo: button | Cliques: 2
- Botão: "Entrar" | Tipo: button | Cliques: 1
- Botão: "Ver Preços" | Tipo: button | Cliques: 1

### **Section Time Statistics:**
- Seção: hero | Tempo Total: 1m 15s | Visitas: 2 | Tempo Médio: 28s
- Seção: features | Tempo Total: 45s | Visitas: 1 | Tempo Médio: 45s
- Seção: cta | Tempo Total: 1m 0s | Visitas: 1 | Tempo Médio: 60s

---

**🎯 Execute o script SQL e me informe o resultado!**
