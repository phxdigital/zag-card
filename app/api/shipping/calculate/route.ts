import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping } from '@/lib/shipping';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, weight, dimensions, products } = body;

    console.log('📦 Recebida requisição de cálculo de frete:', {
      origin,
      destination,
      weight,
      dimensions,
      productsCount: products?.length || 0
    });

    if (!origin || !destination || !weight) {
      console.error('❌ Parâmetros faltando:', { origin, destination, weight });
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: origin, destination, weight' },
        { status: 400 }
      );
    }

    console.log('🔄 Chamando calculateShipping...');
    const options = await calculateShipping(
      origin,
      destination,
      weight,
      dimensions || { length: 20, width: 15, height: 5 },
      products
    );

    console.log('✅ Opções calculadas:', options.length, options);

    if (options.length === 0) {
      console.warn('⚠️ Nenhuma opção de frete encontrada');
      return NextResponse.json({ 
        success: false, 
        error: 'Nenhuma opção de frete disponível para este endereço',
        options: [],
        count: 0
      });
    }

    return NextResponse.json({ 
      success: true, 
      options,
      count: options.length
    });
  } catch (error: unknown) {
    console.error('❌ Erro ao calcular frete:', error);
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao calcular frete',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

// Endpoint para teste
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.searchParams.get('origin') || '88010001';
  const destination = url.searchParams.get('destination') || '01310100';
  const weight = parseFloat(url.searchParams.get('weight') || '1.0');

  try {
    const options = await calculateShipping(
      origin,
      destination,
      weight,
      { length: 20, width: 15, height: 5 }
    );

    return NextResponse.json({ 
      success: true, 
      options,
      test: {
        origin,
        destination,
        weight,
        dimensions: { length: 20, width: 15, height: 5 }
      }
    });
  } catch (error) {
    console.error('❌ Erro no teste de frete:', error);
    return NextResponse.json(
      { error: 'Erro ao testar frete' },
      { status: 500 }
    );
  }
}
