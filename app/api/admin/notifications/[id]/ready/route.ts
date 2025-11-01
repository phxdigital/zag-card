import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PATCH(
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

        // Buscar a notificação para obter o page_id
        const { data: notification, error: notificationError } = await supabase
            .from('admin_notifications')
            .select('page_id, status')
            .eq('id', id)
            .single();

        if (notificationError || !notification) {
            console.error('Erro ao buscar notificação:', notificationError);
            return NextResponse.json(
                { success: false, error: 'Notificação não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se a notificação está aprovada
        if (notification.status !== 'approved') {
            return NextResponse.json(
                { success: false, error: 'Apenas pedidos aprovados podem ser marcados como prontos' },
                { status: 400 }
            );
        }

        if (!notification.page_id) {
            return NextResponse.json(
                { success: false, error: 'Notificação não está vinculada a uma página' },
                { status: 400 }
            );
        }

        // Atualizar production_status para "ready_to_ship"
        const { error: pageUpdateError } = await supabase
            .from('pages')
            .update({
                production_status: 'ready_to_ship'
            })
            .eq('id', notification.page_id);

        if (pageUpdateError) {
            console.error('❌ Erro ao atualizar status de produção:', pageUpdateError);
            return NextResponse.json(
                { success: false, error: 'Erro ao atualizar status de produção' },
                { status: 500 }
            );
        }

        console.log(`✅ Pedido ${id} marcado como pronto (ready_to_ship) na página ${notification.page_id}`);

        return NextResponse.json({ 
            success: true, 
            message: 'Pedido marcado como pronto para envio'
        });

    } catch (err) {
        console.error('Erro ao marcar pedido como pronto:', err);
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

