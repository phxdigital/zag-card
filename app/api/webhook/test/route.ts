import { NextRequest, NextResponse } from 'next/server';

/**
 * Rota de teste para verificar se webhooks estão funcionando
 * Acesse: https://zagnfc.com.br/api/webhook/test
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint está funcionando!',
    timestamp: new Date().toISOString(),
    url: request.url,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'POST recebido com sucesso!',
      timestamp: new Date().toISOString(),
      receivedData: body,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar POST',
    });
  }
}

