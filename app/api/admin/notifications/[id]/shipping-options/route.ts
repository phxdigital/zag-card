import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { calculateMelhorEnvioShipping } from '@/lib/melhor-envio';
import { loadEnv, getEnv } from '@/lib/env-loader';

// Carregar variáveis de ambiente explicitamente na API route
loadEnv();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        
        // Verificar autenticação
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar a notificação para obter o page_id e subdomain
        const { data: notification, error: notificationError } = await supabase
            .from('admin_notifications')
            .select('page_id, subdomain')
            .eq('id', id)
            .single();

        if (notificationError || !notification) {
            return NextResponse.json(
                { success: false, error: 'Notificação não encontrada' },
                { status: 404 }
            );
        }

        // Buscar page_id e payment_id
        let pageId = notification.page_id;
        let paymentId: string | null = null;

        if (pageId) {
            const result = await supabase
                .from('pages')
                .select('payment_id')
                .eq('id', pageId)
                .single();
            
            if (result.data) {
                paymentId = result.data.payment_id;
            }
        } else if (notification.subdomain) {
            const result = await supabase
                .from('pages')
                .select('id, payment_id')
                .eq('subdomain', notification.subdomain)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            if (result.data) {
                pageId = result.data.id;
                paymentId = result.data.payment_id;
            }
        }

        // Buscar endereço de entrega - tentar por page_id primeiro, depois por payment_id
        let address = null;
        
        if (pageId) {
            const result = await supabase
                .from('shipping_addresses')
                .select('postal_code')
                .eq('page_id', pageId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            address = result.data;
        }

        // Se não encontrou por page_id, buscar por payment_id
        if (!address && paymentId) {
            const result = await supabase
                .from('shipping_addresses')
                .select('postal_code')
                .eq('payment_id', paymentId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            address = result.data;
        }

        if (!address) {
            return NextResponse.json(
                { success: false, error: 'Endereço de entrega não encontrado. O cliente precisa configurar a entrega primeiro.' },
                { status: 404 }
            );
        }

        // Buscar CEP de origem do banco ou usar padrão
        const { data: shippingConfig } = await supabase
            .from('shipping_configs')
            .select('origin_postal_code')
            .eq('carrier', 'melhor_envio')
            .eq('is_active', true)
            .limit(1)
            .single();

        const originCEP = shippingConfig?.origin_postal_code || '88010001';
        const destinationCEP = address.postal_code;

        // Verificar se o token está configurado antes de calcular
        const token = getEnv('MELHOR_ENVIO_TOKEN');
        if (!token) {
            console.error('❌ MELHOR_ENVIO_TOKEN não encontrado no contexto da API route');
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'MELHOR_ENVIO_TOKEN não configurado. Adicione MELHOR_ENVIO_TOKEN=seu_token no arquivo .env.local e reinicie o servidor.',
                    debug: {
                        has_token: !!process.env.MELHOR_ENVIO_TOKEN,
                        env_keys: Object.keys(process.env).filter(k => k.includes('MELHOR') || k.includes('ENVIO'))
                    }
                },
                { status: 500 }
            );
        }

        // Calcular opções de frete
        const shippingOptions = await calculateMelhorEnvioShipping(
            originCEP,
            destinationCEP,
            [{
                weight: 0.05,
                dimensions: { length: 20, width: 15, height: 1 },
                value: 0,
                quantity: 1
            }]
        );

        return NextResponse.json({ 
            success: true, 
            options: shippingOptions.map(option => ({
                id: option.id,
                name: option.name,
                company: option.company.name,
                price: parseFloat(option.price),
                delivery_time: option.delivery_time,
                delivery_range: option.delivery_range
            }))
        });

    } catch (err: unknown) {
        console.error('❌ Erro ao buscar opções de frete:', err);
        
        // Mensagem de erro mais detalhada
        let errorMessage = (err instanceof Error ? err.message : String(err)) || 'Erro interno do servidor';
        if (errorMessage.includes('MELHOR_ENVIO_TOKEN')) {
            errorMessage += '\n\nSoluções:\n1. Verifique se MELHOR_ENVIO_TOKEN está no arquivo .env.local\n2. Reinicie o servidor Next.js completamente\n3. Certifique-se de que não há espaços extras no valor do token\n4. Teste com: http://localhost:3000/api/debug/melhor-envio-token';
        }
        
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

