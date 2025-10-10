import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { status } = body as { status: string };
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/').filter(Boolean);
        const id = pathParts[pathParts.length - 1];

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

        return NextResponse.json({ 
            success: true, 
            notification 
        });

    } catch {
console.error('Erro ao atualizar notificação:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' 


},
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/').filter(Boolean);
        const id = pathParts[pathParts.length - 1];

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

    } catch {
console.error('Erro ao excluir notificação:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' 


},
            { status: 500 }
        );
    }
}
