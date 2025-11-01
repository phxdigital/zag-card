import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body as { status: string };

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        
        // Verificar autenticação
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Atualizar notificação no Supabase
        const { data: notification, error } = await supabase
            .from('admin_notifications')
            .update({ 
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar notificação:', error);
            return NextResponse.json(
                { success: false, error: 'Erro ao atualizar notificação' },
                { status: 500 }
            );
        }

        if (!notification) {
            return NextResponse.json(
                { success: false, error: 'Notificação não encontrada' },
                { status: 404 }
            );
        }

        console.log(`📝 Notificação ${id} atualizada para status: ${status}`);

        // Se aprovado, atualizar production_status na tabela pages para "in_production"
        if (status === 'approved' && notification.page_id) {
            const { error: pageUpdateError } = await supabase
                .from('pages')
                .update({
                    production_status: 'in_production',
                    approved_at: new Date().toISOString(),
                    production_started_at: new Date().toISOString()
                })
                .eq('id', notification.page_id);

            if (pageUpdateError) {
                console.error('❌ Erro ao atualizar status de produção:', pageUpdateError);
            } else {
                console.log(`✅ Status de produção atualizado para "in_production" na página ${notification.page_id}`);
            }
        }

        return NextResponse.json({ 
            success: true, 
            notification 
        });

    } catch (err) {
console.error('Erro ao atualizar notificação:', err);
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' 




},
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        // Excluir notificação do Supabase
        const { error } = await supabase
            .from('admin_notifications')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir notificação:', error);
            return NextResponse.json(
                { success: false, error: 'Erro ao excluir notificação' },
                { status: 500 }
            );
        }

        console.log(`🗑️ Notificação ${id} excluída com sucesso`);

        return NextResponse.json({ 
            success: true, 
            message: 'Notificação excluída com sucesso' 
        });

    } catch (err) {
console.error('Erro ao excluir notificação:', err);
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' 




},
            { status: 500 }
        );
    }
}
