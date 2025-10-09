import { NextResponse } from 'next/server';

/**
 * Verifica status da configuração do webhook
 * Acesse: https://zagnfc.com.br/api/webhook/status
 */
export async function GET() {
  const asaasApiKey = process.env.ASAAS_API_KEY;
  const asaasWebhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
  const asaasApiUrl = process.env.ASAAS_API_URL;

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    configuration: {
      asaasApiKey: asaasApiKey ? `${asaasApiKey.substring(0, 20)}...` : '❌ NÃO CONFIGURADA',
      asaasWebhookToken: asaasWebhookToken ? '✅ Configurado' : '❌ NÃO CONFIGURADO',
      asaasApiUrl: asaasApiUrl || '❌ NÃO CONFIGURADA',
      webhookUrl: 'https://zagnfc.com.br/api/webhook/asaas',
    },
    ready: !!(asaasApiKey && asaasWebhookToken && asaasApiUrl),
  });
}

