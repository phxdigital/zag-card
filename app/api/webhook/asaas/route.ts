import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { AsaasWebhook } from '@/types/asaas';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verificar token de webhook (opcional, mas recomendado)
    const webhookToken = request.headers.get('asaas-access-token');
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
    
    if (expectedToken && webhookToken !== expectedToken) {
      console.error('Token de webhook inválido');
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const webhook: AsaasWebhook = await request.json();
    
    console.log('Webhook recebido:', webhook.event, webhook.payment.id);

    // Atualizar status do pagamento no banco de dados
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('asaas_payment_id', webhook.payment.id)
      .single();

    if (!existingPayment) {
      console.log('Pagamento não encontrado no banco:', webhook.payment.id);
      return NextResponse.json({ success: true });
    }

    // Atualizar status
    await supabase
      .from('payments')
      .update({
        status: webhook.payment.status,
        updated_at: new Date().toISOString(),
      })
      .eq('asaas_payment_id', webhook.payment.id);

    // Se o pagamento foi confirmado/recebido, ativar plano do usuário
    if (webhook.event === 'PAYMENT_CONFIRMED' || webhook.event === 'PAYMENT_RECEIVED') {
      const planType = existingPayment.plan_type;
      let maxPages = 1;
      let features: string[] = [];

      // Definir limites baseado no plano
      switch (planType) {
        case 'para_mim':
          maxPages = 1;
          features = ['1_cartao_nfc', 'pagina_personalizada', 'qr_code', 'atualizacoes_ilimitadas'];
          break;
        case 'para_equipe':
          maxPages = 5;
          features = ['2_cartoes_nfc', '3_adesivos_nfc', 'pagina_personalizada', 'qr_codes', 'atualizacoes_ilimitadas', 'pix_integration', 'analytics'];
          break;
        case 'para_negocio':
          maxPages = 999; // "ilimitado"
          features = ['8_cartoes_nfc', '8_adesivos_nfc', '8_paginas', 'qr_codes', 'atualizacoes_ilimitadas', 'pix_integration', 'analytics_avancado', 'suporte_vip'];
          break;
      }

      // Atualizar perfil do usuário
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: planType,
          max_pages: maxPages,
          features: features,
          subscription_start: new Date().toISOString(),
          subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 ano
        })
        .eq('id', existingPayment.user_id);

      console.log(`✅ Plano ${planType} ativado para usuário ${existingPayment.user_id}`);
    }

    // Se o pagamento foi cancelado/estornado, desativar plano
    if (webhook.event === 'PAYMENT_REFUNDED') {
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'inactive',
        })
        .eq('id', existingPayment.user_id);

      console.log(`❌ Plano desativado para usuário ${existingPayment.user_id}`);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
console.error('Erro ao processar webhook:', err);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' 




},
      { status: 500 }
    );
  }
}

