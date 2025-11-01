import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        
        // Verificar autenticação
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar notificações do Supabase
        const { data: notifications, error } = await supabase
            .from('admin_notifications')
            .select('id, subdomain, action, message, status, created_at, updated_at, page_id')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar notificações:', error);
            return NextResponse.json(
                { success: false, error: 'Erro ao buscar notificações' },
                { status: 500 }
            );
        }

        // Buscar production_status para cada notificação
        // Tentar por page_id primeiro, depois por subdomain
        const notificationsWithStatus = await Promise.all(
            (notifications || []).map(async (notification) => {
                let pageData = null;
                
                // Tentar buscar por page_id
                if (notification.page_id) {
                    const result = await supabase
                        .from('pages')
                        .select('production_status, payment_id')
                        .eq('id', notification.page_id)
                        .single();
                    
                    pageData = result.data;
                }
                
                // Se não encontrou por page_id, tentar por subdomain
                if (!pageData && notification.subdomain) {
                    const result = await supabase
                        .from('pages')
                        .select('production_status, payment_id, id')
                        .eq('subdomain', notification.subdomain)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();
                    
                    pageData = result.data;
                    
                    // Se encontrou por subdomain e não tem page_id, atualizar a notificação
                    if (pageData && !notification.page_id) {
                        await supabase
                            .from('admin_notifications')
                            .update({ page_id: pageData.id })
                            .eq('id', notification.id);
                        
                        notification.page_id = pageData.id;
                    }
                }
                
                return {
                    ...notification,
                    production_status: pageData?.production_status || null
                };
            })
        );

        return NextResponse.json({ 
            success: true, 
            notifications: notificationsWithStatus
        });
    } catch (err) {
console.error('Erro ao buscar notificações:', err);
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' 




},
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { subdomain, action, message, pdfData } = body;

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Salvar notificação no Supabase
        const { data: notification, error } = await supabase
            .from('admin_notifications')
            .insert({
                subdomain,
                action,
                message,
                pdf_data: pdfData,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar notificação:', error);
            return NextResponse.json(
                { success: false, error: 'Erro ao criar notificação' },
                { status: 500 }
            );
        }

        console.log('📋 Nova notificação criada:', {
            id: notification.id,
            subdomain,
            action,
            timestamp: notification.created_at
        });

        return NextResponse.json({ 
            success: true, 
            notification 
        });

    } catch (err) {
console.error('Erro ao criar notificação:', err);
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' 




},
            { status: 500 }
        );
    }
}
