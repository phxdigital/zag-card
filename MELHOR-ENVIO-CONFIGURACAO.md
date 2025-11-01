# 🚚 CONFIGURAÇÃO COMPLETA - MELHOR ENVIO

## ✅ O QUE FOI IMPLEMENTADO

### 1. **Integração Completa com API do Melhor Envio**
- ✅ Cálculo de frete em tempo real usando API do Melhor Envio
- ✅ Criação de envios e geração de etiquetas
- ✅ Rastreamento de pacotes
- ✅ Suporte a múltiplas transportadoras via Melhor Envio

### 2. **Arquivos Criados/Atualizados**
- ✅ `lib/melhor-envio.ts` - Módulo completo de integração com Melhor Envio
- ✅ `lib/shipping.ts` - Atualizado para usar Melhor Envio como primeira opção
- ✅ `app/api/products/default/route.ts` - Busca produto padrão do banco
- ✅ `app/api/shipping/save/route.ts` - Salva endereço e cria envio
- ✅ `app/delivery/page.tsx` - Busca produto real do banco para calcular frete
- ✅ `app/components/ShippingOptions.tsx` - Passa produtos para cálculo

## 🔧 CONFIGURAÇÃO NECESSÁRIA

### 1. **Variáveis de Ambiente**

Adicione as seguintes variáveis no seu `.env.local` ou na Vercel:

```bash
# Token de acesso do Melhor Envio
MELHOR_ENVIO_TOKEN=seu_token_de_acesso_aqui

# Dados do remetente (obrigatório para criar envios)
SHIPPING_ORIGIN_NAME=Nome da Empresa ou Pessoa
SHIPPING_ORIGIN_PHONE=48999999999
SHIPPING_ORIGIN_EMAIL=contato@empresa.com.br
SHIPPING_ORIGIN_DOCUMENT=12345678000190  # CNPJ ou CPF (apenas números)
SHIPPING_ORIGIN_NUMBER=123
SHIPPING_ORIGIN_COMPLEMENT=Sala 101
```

### 2. **Como Obter o Token do Melhor Envio**

1. Acesse: https://melhorenvio.com.br/
2. Faça login na sua conta
3. Vá em **Configurações** → **Integrações** → **API**
4. Gere um novo token de acesso
5. Copie o token e cole na variável `MELHOR_ENVIO_TOKEN`

### 3. **Configurar Produto no Banco**

Certifique-se de que seu produto tem `weight` e `dimensions` cadastrados:

```sql
-- Exemplo: Atualizar produto padrão
UPDATE products 
SET 
  weight = 0.05,  -- 50 gramas
  dimensions = '{"length": 20, "width": 15, "height": 1}'::jsonb
WHERE slug = 'zag-card' OR name ILIKE '%zag%';
```

Se não houver produto no banco, o sistema usa valores padrão:
- Peso: 0.05 kg (50g)
- Dimensões: 20x15x1 cm

### 4. **CEP de Origem**

O CEP de origem é buscado da tabela `shipping_configs`:
- Se houver configuração ativa com `carrier = 'melhor_envio'`, usa esse CEP
- Caso contrário, usa o CEP padrão `88010001` (Florianópolis)

Para configurar um CEP de origem diferente:

```sql
-- Atualizar ou criar configuração do Melhor Envio
INSERT INTO shipping_configs (
  carrier, service_type, is_active, origin_postal_code,
  base_cost, cost_per_kg, min_cost, min_days, max_days
) VALUES (
  'melhor_envio', 'AUTO', true, '88010001',  -- Seu CEP aqui
  0, 0, 0, 1, 10
)
ON CONFLICT DO NOTHING;
```

## 🎯 COMO FUNCIONA

### Fluxo Completo:

1. **Checkout** → Usuário confirma pagamento
2. **Entrega** → Usuário preenche endereço completo
3. **Cálculo de Frete**:
   - Sistema busca produto do banco (peso/dimensões)
   - Chama API do Melhor Envio para calcular opções
   - Exibe opções de frete com preços reais
4. **Seleção** → Usuário escolhe opção de frete
5. **Confirmação**:
   - Salva endereço no banco (`shipping_addresses`)
   - Cria envio no Melhor Envio
   - Gera etiqueta de postagem
   - Salva informações no banco (`shipments` e `payments`)

### Dados Salvos:

- **`shipping_addresses`**: Endereço completo do destinatário
- **`shipments`**: Informações do envio (rastreio, transportadora, custo)
- **`payments.shipping_*`**: Campos atualizados com dados de entrega

## 📋 CHECKLIST DE CONFIGURAÇÃO

- [ ] Token do Melhor Envio configurado (`MELHOR_ENVIO_TOKEN`)
- [ ] Dados do remetente configurados (nome, telefone, email, documento)
- [ ] Endereço de origem configurado (CEP)
- [ ] Produto no banco com peso e dimensões
- [ ] Testar cálculo de frete (`/api/shipping/calculate`)
- [ ] Testar criação de envio (após confirmar entrega)

## 🧪 TESTAR A INTEGRAÇÃO

### 1. Testar Cálculo de Frete

```bash
# Via API
curl -X GET "http://localhost:3000/api/shipping/calculate?origin=88010001&destination=01310100&weight=0.05"
```

### 2. Testar Busca de Produto

```bash
# Via API
curl -X GET "http://localhost:3000/api/products/default"
```

### 3. Testar Fluxo Completo

1. Fazer um pagamento (checkout)
2. Ir para `/delivery`
3. Preencher endereço
4. Ver opções de frete calculadas pelo Melhor Envio
5. Selecionar uma opção
6. Confirmar entrega

## ⚠️ TROUBLESHOOTING

### Erro: "MELHOR_ENVIO_TOKEN não configurado"
- Verifique se a variável `MELHOR_ENVIO_TOKEN` está no `.env.local`
- Reinicie o servidor após adicionar variáveis

### Erro: "Endereço de origem não configurado"
- Configure as variáveis `SHIPPING_ORIGIN_*` no `.env.local`
- Verifique se o CEP de origem está correto

### Erro: "Nenhuma opção de frete disponível"
- Verifique se o CEP de destino é válido
- Verifique se o peso/dimensões do produto estão corretos
- Teste a API do Melhor Envio diretamente

### Erro: "Erro ao criar envio"
- Verifique se todos os dados do remetente estão corretos
- Verifique se o documento (CPF/CNPJ) está válido
- Verifique logs do servidor para mais detalhes

## 🔒 SEGURANÇA

- ✅ Token do Melhor Envio está em variáveis de ambiente (não commitado)
- ✅ Dados sensíveis (CPF/CNPJ) em variáveis de ambiente
- ✅ Validação de dados antes de criar envio
- ✅ Erros não expõem informações sensíveis

## 📚 DOCUMENTAÇÃO ADICIONAL

- [API Melhor Envio](https://docs.melhorenvio.com.br/)
- [Guia de Integração](https://docs.melhorenvio.com.br/api/v2/me/shipment/create)

