# Configuração do Cloudinary para Remoção de Fundo

## 1. Criar Conta no Cloudinary

1. Acesse [cloudinary.com](https://cloudinary.com)
2. Crie uma conta gratuita
3. No dashboard, anote suas credenciais:
   - Cloud Name
   - API Key
   - API Secret

## 2. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

## 3. Configurar na Vercel

1. Acesse o dashboard da Vercel
2. Vá para seu projeto
3. Clique em "Settings" > "Environment Variables"
4. Adicione as três variáveis:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## 4. Limites do Plano Gratuito

- **25 créditos por mês** (aproximadamente 25 remoções de fundo)
- **Rate limiting**: 2 remoções por usuário por dia
- **Cache inteligente**: Imagens já processadas são reutilizadas

## 5. Funcionalidades Implementadas

✅ Upload com remoção de fundo automática
✅ Validação de tipo de arquivo (JPG/PNG)
✅ Validação de tamanho (máx 5MB)
✅ Rate limiting por IP
✅ Cache inteligente com hash MD5
✅ Interface de preview
✅ Contador de usos restantes
✅ Tratamento de erros robusto

## 6. Como Usar

1. No dashboard, clique em "Remover Fundo"
2. Selecione uma imagem JPG ou PNG (máx 5MB)
3. Aguarde o processamento
4. Visualize o resultado no modal
5. Aceite ou cancele o resultado

## 7. Monitoramento

- Verifique o uso de créditos no dashboard do Cloudinary
- Monitore logs de erro na Vercel
- Acompanhe o rate limiting nos logs da aplicação
