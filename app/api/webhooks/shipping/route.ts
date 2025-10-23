import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { updateShipmentStatus } from '@/lib/shipping';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar se é um webhook válido
    const { tracking_code, status, description, location, carrier } = body;
    
    if (!tracking_code || !status || !description) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 });
    }

    console.log('📦 Webhook de shipping recebido:', {
      tracking_code,
      status,
      description,
      location,
      carrier
    });

    // Atualizar status do envio
    await updateShipmentStatus(
      tracking_code,
      status,
      description,
      location
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao processar webhook de shipping:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

// Endpoint para teste manual
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const trackingCode = url.searchParams.get('tracking_code');
  const status = url.searchParams.get('status') || 'in_transit';
  const description = url.searchParams.get('description') || 'Pacote em trânsito';
  const location = url.searchParams.get('location') || 'Centro de distribuição';

  if (!trackingCode) {
    return NextResponse.json({ error: 'tracking_code é obrigatório' }, { status: 400 });
  }

  try {
    await updateShipmentStatus(trackingCode, status, description, location);
    return NextResponse.json({ 
      success: true, 
      message: 'Status atualizado com sucesso',
      data: { trackingCode, status, description, location }
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar status manual:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar status' },
      { status: 500 }
    );
  }
}
