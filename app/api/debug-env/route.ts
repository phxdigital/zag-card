import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        ASAAS_API_KEY: process.env.ASAAS_API_KEY ? `${process.env.ASAAS_API_KEY.substring(0, 30)}...` : '❌ NÃO ENCONTRADA',
        ASAAS_API_KEY_EXISTS: !!process.env.ASAAS_API_KEY,
        ASAAS_ENVIRONMENT: process.env.ASAAS_ENVIRONMENT || 'não configurado',
        ASAAS_BASE_URL: process.env.ASAAS_BASE_URL || 'não configurado',
        ASAAS_WEBHOOK_TOKEN: process.env.ASAAS_WEBHOOK_TOKEN ? '✅ Configurado' : '❌ NÃO ENCONTRADO',
        NODE_ENV: process.env.NODE_ENV,
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('ASAAS')),
    });
}

