import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmQzNTEzODQ1LTI4ZTEtNDNjNi05NjhiLWRhODVhZDRiZTRjNzo6JGFhY2hfYWExMGQ5MzMtNjkzYy00YmJjLWI2NjItM2JkMGZlMWEyYzQy';
  const apiUrl = 'https://sandbox.asaas.com/api/v3';

  // Debug: verificar como a chave está sendo interpretada
  const keyInfo = {
    original: apiKey,
    length: apiKey.length,
    startsWith: apiKey.startsWith('$aact_hmlg_'),
    charCodes: apiKey.split('').slice(0, 20).map(c => c.charCodeAt(0)),
    firstChars: apiKey.substring(0, 30),
    lastChars: apiKey.substring(apiKey.length - 30)
  };

  try {
    const response = await fetch(`${apiUrl}/customers?limit=1`, {
      method: 'GET',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: data,
      keyInfo: keyInfo,
      apiUrl: apiUrl
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      keyInfo: keyInfo,
      apiUrl: apiUrl
    }, { status: 500 });
  }
}
