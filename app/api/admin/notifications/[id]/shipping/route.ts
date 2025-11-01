import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

        // Buscar a notificação para obter o page_id e buscar payment_id
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
            // Buscar payment_id através do page_id
            const { data: pageData } = await supabase
                .from('pages')
                .select('payment_id, tracking_code, production_status')
                .eq('id', pageId)
                .single();
            
            if (pageData) {
                paymentId = pageData.payment_id;
            }
        } else if (notification.subdomain) {
            // Buscar page_id pelo subdomain
            const { data: pageData } = await supabase
                .from('pages')
                .select('id, payment_id, tracking_code, production_status')
                .eq('subdomain', notification.subdomain)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (pageData) {
                pageId = pageData.id;
                paymentId = pageData.payment_id;
            }
        }

        // Buscar endereço de entrega - tentar por page_id primeiro, depois por payment_id
        let address = null;
        
        if (pageId) {
            const result = await supabase
                .from('shipping_addresses')
                .select('*')
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
                .select('*')
                .eq('payment_id', paymentId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            address = result.data;
            
            // Se encontrou por payment_id e temos pageId, vincular
            if (address && pageId) {
                await supabase
                    .from('shipping_addresses')
                    .update({ page_id: pageId })
                    .eq('id', address.id);
            }
        }

        // Buscar informações de envio da página
        let pageData = null;
        if (pageId) {
            const result = await supabase
                .from('pages')
                .select('tracking_code, production_status')
                .eq('id', pageId)
                .single();
            
            pageData = result.data;
        }

        // Buscar informações de envio na tabela shipments
        let shipment = null;
        
        // Tentar buscar por tracking_code
        if (pageData?.tracking_code) {
            const result = await supabase
                .from('shipments')
                .select('*')
                .eq('tracking_code', pageData.tracking_code)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            shipment = result.data;
        }
        
        // Se não encontrou por tracking_code, buscar por payment_id
        if (!shipment && paymentId) {
            const result = await supabase
                .from('shipments')
                .select('*')
                .eq('payment_id', paymentId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            shipment = result.data;
        }

        // Preparar dados do shipment incluindo melhor_envio_id se existir
        let shipmentData = null;
        if (shipment) {
            shipmentData = {
                id: shipment.id,
                carrier: shipment.carrier,
                tracking_code: shipment.tracking_code,
                status: shipment.status,
                label_url: shipment.label_url,
                // Tentar extrair melhor_envio_id de service_type se for numérico
                melhor_envio_id: shipment.service_type && !isNaN(Number(shipment.service_type)) 
                    ? Number(shipment.service_type) 
                    : shipment.melhor_envio_id || shipment.shipment_id || null
            };
        }

        return NextResponse.json({ 
            success: true, 
            shipment: shipmentData,
            shipping: shipment || null,
            address: address || null,
            tracking_code: pageData?.tracking_code || shipment?.tracking_code || null,
            production_status: pageData?.production_status || null,
            payment_id: paymentId || null,
            page_id: pageId || null
        });

    } catch (err) {
        console.error('Erro ao buscar informações de envio:', err);
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

