import { NextRequest, NextResponse } from 'next/server';
import { loadEnv, getEnv } from '@/lib/env-loader';

export async function GET(request: NextRequest) {
  try {
    loadEnv();
    
    const url = new URL(request.url);
    const origin = url.searchParams.get('origin') || '88010001';
    const destination = url.searchParams.get('destination') || '72110400';
    const weight = parseFloat(url.searchParams.get('weight') || '0.1');
    const width = parseFloat(url.searchParams.get('width') || '20');
    const height = parseFloat(url.searchParams.get('height') || '15');
    const length = parseFloat(url.searchParams.get('length') || '2');
    
    const useSandbox = getEnv('MELHOR_ENVIO_USE_SANDBOX') === 'true' || getEnv('MELHOR_ENVIO_SANDBOX') === 'true';
    const apiUrl = useSandbox 
      ? 'https://sandbox.melhorenvio.com.br/api/v2/me'
      : 'https://www.melhorenvio.com.br/api/v2/me';
    const token = getEnv('MELHOR_ENVIO_TOKEN');
    
    const requestBody = {
      from: {
        postal_code: origin.replace(/\D/g, ''),
      },
      to: {
        postal_code: destination.replace(/\D/g, ''),
      },
      products: [{
        id: 'product-0',
        width: Math.max(width, 1),
        height: Math.max(height, 1),
        length: Math.max(length, 1),
        weight: Math.max(weight, 0.1),
        insurance_value: 0,
        quantity: 1,
      }],
    };
    
    const testResults: Record<string, unknown> = {
      config: {
        useSandbox,
        apiUrl,
        hasToken: !!token,
        tokenLength: token?.length || 0,
      },
      request: {
        origin: origin.replace(/\D/g, ''),
        destination: destination.replace(/\D/g, ''),
        weight,
        dimensions: { width, height, length },
        requestBody,
      },
      results: {} as Record<string, unknown>,
    };
    
    // Testar /cart/calculate
    try {
      console.log('🧪 Testando /cart/calculate...');
      const cartResponse = await fetch(`${apiUrl}/cart/calculate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const cartData = await cartResponse.json();
      testResults.results['/cart/calculate'] = {
        status: cartResponse.status,
        statusText: cartResponse.statusText,
        ok: cartResponse.ok,
        data: cartData,
        isArray: Array.isArray(cartData),
        count: Array.isArray(cartData) ? cartData.length : 'N/A',
      };
    } catch (error) {
      testResults.results['/cart/calculate'] = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
    
    // Testar /shipments/calculate
    try {
      console.log('🧪 Testando /shipments/calculate...');
      const shipmentsResponse = await fetch(`${apiUrl}/shipments/calculate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const shipmentsData = await shipmentsResponse.json();
      testResults.results['/shipments/calculate'] = {
        status: shipmentsResponse.status,
        statusText: shipmentsResponse.statusText,
        ok: shipmentsResponse.ok,
        data: shipmentsData,
        isArray: Array.isArray(shipmentsData),
        count: Array.isArray(shipmentsData) ? shipmentsData.length : 'N/A',
      };
    } catch (error) {
      testResults.results['/shipments/calculate'] = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
    
    return NextResponse.json({
      success: true,
      ...testResults,
    });
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

