import { NextResponse } from 'next/server';

// Carregar env manualmente
require('../../../env-loader');

export async function GET() {
    const key = process.env.ASAAS_API_KEY;
    
    return NextResponse.json({
        value: key,
        length: key?.length || 0,
        type: typeof key,
        firstChar: key ? key.charAt(0) : 'N/A',
        first10: key ? key.substring(0, 10) : 'N/A',
        rawDump: JSON.stringify(key),
    });
}


