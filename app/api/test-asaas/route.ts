import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Carregar env manualmente
import '../../../env-loader';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const env = searchParams.get('env') || process.env.ASAAS_ENVIRONMENT || 'sandbox';
        
        const apiKey = process.env.ASAAS_API_KEY;
        const apiUrl = process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3';

        // 1. Verificar variáveis de ambiente
        const checks = {
            ASAAS_API_KEY: !!apiKey,
            ASAAS_WEBHOOK_TOKEN: !!process.env.ASAAS_WEBHOOK_TOKEN,
            NEXT_PUBLIC_ASAAS_LINK_PARA_MIM: !!process.env.NEXT_PUBLIC_ASAAS_LINK_PARA_MIM,
            NEXT_PUBLIC_ASAAS_LINK_PARA_EQUIPE: !!process.env.NEXT_PUBLIC_ASAAS_LINK_PARA_EQUIPE,
            NEXT_PUBLIC_ASAAS_LINK_PARA_NEGOCIO: !!process.env.NEXT_PUBLIC_ASAAS_LINK_PARA_NEGOCIO,
        };

        if (!apiKey) {
            return NextResponse.json({
                success: false,
                error: 'ASAAS_API_KEY não configurada',
                environment: env,
                checks
            }, { status: 500 });
        }

        // 2. Testar conexão com a API do Asaas
        const response = await fetch(`${apiUrl}/customers?limit=1`, {
            method: 'GET',
            headers: {
                'access_token': apiKey,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: 'Erro ao conectar com Asaas API',
                statusCode: response.status,
                asaasResponse: data,
                checks
            }, { status: response.status });
        }

        // 3. Verificar informações da conta
        const accountResponse = await fetch(`${apiUrl}/myAccount`, {
            method: 'GET',
            headers: {
                'access_token': apiKey,
                'Content-Type': 'application/json',
            },
        });

        const accountData = await accountResponse.json();

        return NextResponse.json({
            success: true,
            message: env === 'sandbox' 
                ? '✅ Integração com Asaas SANDBOX funcionando!' 
                : '✅ Integração com Asaas PRODUÇÃO funcionando!',
            environment: env === 'sandbox' ? '🧪 SANDBOX (Teste)' : '🚀 PRODUÇÃO',
            checks,
            account: {
                name: accountData.name || 'N/A',
                email: accountData.email || 'N/A',
                apiVersion: accountData.apiVersion || 'N/A',
            },
            info: {
                totalCustomers: data.totalCount || 0,
                apiUrl,
                webhookConfigured: !!process.env.ASAAS_WEBHOOK_TOKEN,
                directLinksConfigured: env === 'sandbox' 
                    ? false
                    : (!!process.env.NEXT_PUBLIC_ASAAS_LINK_PARA_MIM &&
                       !!process.env.NEXT_PUBLIC_ASAAS_LINK_PARA_EQUIPE &&
                       !!process.env.NEXT_PUBLIC_ASAAS_LINK_PARA_NEGOCIO)
            }
        });

    } catch {
        console.error('Erro ao testar Asaas:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro interno ao testar integração',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}

