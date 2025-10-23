import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping } from '@/lib/shipping';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, weight, dimensions } = body;

    if (!origin || !destination || !weight) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: origin, destination, weight' },
        { status: 400 }
      );
    }

    const options = await calculateShipping(
      origin,
      destination,
      weight,
      dimensions || { length: 20, width: 15, height: 5 }
    );

    return NextResponse.json({ success: true, options });
  } catch (error) {
    console.error('❌ Erro ao calcular frete:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular frete' },
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
