import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createShipment, ShippingAddress, ShippingOption } from '@/lib/shipping';
import { loadEnv } from '@/lib/env-loader';

// Carregar variáveis de ambiente explicitamente
loadEnv();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, shippingOption, product } = body;

    if (!address || !shippingOption) {
      return NextResponse.json(
        { error: 'Endereço e opção de envio são obrigatórios' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuração do Supabase não encontrada' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar payment_id do body ou sessionStorage
    // O payment_id deve vir do contexto do pagamento (já criado no checkout)
    const paymentId = body.paymentId;
    
    // Se não veio no body, tentar buscar do último pagamento do usuário
    // (em produção, sempre deve vir do contexto do pagamento)
    if (!paymentId) {
      // Buscar último pagamento confirmado do usuário autenticado
      // Por enquanto, vamos criar um registro temporário se necessário
      // Em produção, sempre deve haver um payment_id válido
      return NextResponse.json(
        { error: 'ID do pagamento não fornecido. É necessário ter um pagamento confirmado.' },
        { status: 400 }
      );
    }

    // Buscar pagamento
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, user_id, amount')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    // Buscar page_id vinculado ao payment_id (o design do cliente)
    // Pode haver múltiplas páginas, pegar a mais recente
    const { data: pageData } = await supabase
      .from('pages')
      .select('id')
      .eq('payment_id', paymentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const pageId = pageData?.id || null;

    // Preparar dados do envio
    const shipmentData = {
      payment_id: payment.id,
      address: address as ShippingAddress,
      carrier: shippingOption.carrier || 'melhor_envio',
      service_type: shippingOption.melhor_envio_service?.toString() || shippingOption.service_type,
      weight: product?.weight || 0.05,
      dimensions: product?.dimensions || { length: 20, width: 15, height: 1 },
      declared_value: payment.amount || 0,
      expected_cost: shippingOption.cost || 0, // Passar custo esperado para usar em envio mock
    };

    // Criar envio (isso vai criar no Melhor Envio se carrier for 'melhor_envio')
    const shipmentResult = await createShipment(shipmentData);

    if (!shipmentResult.success) {
      return NextResponse.json(
        { error: shipmentResult.error || 'Erro ao criar envio' },
        { status: 500 }
      );
    }

    // Atualizar shipping_address com page_id (se encontrado)
    // Buscar o shipping_address criado pelo createShipment
    const { data: shippingAddressData } = await supabase
      .from('shipping_addresses')
      .select('id')
      .eq('payment_id', paymentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (shippingAddressData) {
      // Vincular shipping_address com page_id se existir
      if (pageId) {
        await supabase
          .from('shipping_addresses')
          .update({ page_id: pageId })
          .eq('id', shippingAddressData.id);

        // Atualizar production_status para 'ready_to_ship' se houver tracking_code
        if (shipmentResult.tracking_code) {
          await supabase
            .from('pages')
            .update({ 
              production_status: 'ready_to_ship',
              tracking_code: shipmentResult.tracking_code
            })
            .eq('id', pageId);
        } else {
          // Se não houver tracking_code ainda, apenas atualizar status
          await supabase
            .from('pages')
            .update({ 
              production_status: 'ready_to_ship'
            })
            .eq('id', pageId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      shipment: {
        tracking_code: shipmentResult.tracking_code,
        carrier: shippingOption.carrier,
        service_type: shippingOption.service_type,
      },
      page_id: pageId // Retornar page_id para uso no frontend
    });

  } catch (error) {
    console.error('❌ Erro ao salvar envio:', error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('❌ Mensagem do erro:', error.message);
      console.error('❌ Stack trace:', error.stack);
    }

    return NextResponse.json(
      { 
        error: 'Erro ao salvar envio',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        // Adicionar mais detalhes para debug
        ...(error instanceof Error && error.message ? { 
          errorType: error.constructor.name,
          errorMessage: error.message 
        } : {})
      },
      { status: 500 }
    );
  }
}

