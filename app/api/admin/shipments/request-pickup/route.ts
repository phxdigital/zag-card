import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { requestMelhorEnvioPickup } from '@/lib/melhor-envio';
import { loadEnv } from '@/lib/env-loader';

// Carregar variáveis de ambiente explicitamente
loadEnv();

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { shipmentIds, notificationId } = body;

    if (!shipmentIds || !Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs dos envios são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar shipments no banco para obter os IDs do Melhor Envio
    const { data: shipments, error: shipmentsError } = await supabase
      .from('shipments')
      .select('id, carrier, melhor_envio_id')
      .in('id', shipmentIds);

    if (shipmentsError) {
      return NextResponse.json(
        { error: 'Erro ao buscar envios' },
        { status: 500 }
      );
    }

    if (!shipments || shipments.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum envio encontrado' },
        { status: 404 }
      );
    }

    // Filtrar apenas envios do Melhor Envio que tenham melhor_envio_id
    const melhorEnvioShipments = shipments.filter(
      s => s.carrier === 'melhor_envio' && s.melhor_envio_id
    );

    if (melhorEnvioShipments.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum envio do Melhor Envio encontrado ou envios não têm ID do Melhor Envio' },
        { status: 400 }
      );
    }

    // Extrair IDs do Melhor Envio
    const melhorEnvioIds = melhorEnvioShipments
      .map(s => s.melhor_envio_id)
      .filter(id => id !== null && id !== undefined) as number[];

    if (melhorEnvioIds.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum ID válido do Melhor Envio encontrado' },
        { status: 400 }
      );
    }

    // Solicitar coleta no Melhor Envio
    const result = await requestMelhorEnvioPickup(melhorEnvioIds);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao solicitar coleta' },
        { status: 500 }
      );
    }

    // Atualizar status dos envios no banco (opcional - marcar como coleta solicitada)
    // Pode adicionar uma coluna pickup_requested na tabela shipments se necessário

    return NextResponse.json({
      success: true,
      message: result.message || 'Coleta solicitada com sucesso',
      shipmentsRequested: melhorEnvioIds.length
    });

  } catch (error) {
    console.error('❌ Erro ao solicitar coleta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

