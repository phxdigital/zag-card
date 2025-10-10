import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        
        // Verificar autenticação
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar APENAS o PDF desta notificação
        const { id: notificationId } = await params;
        const { data: notification, error } = await supabase
            .from('admin_notifications')
            .select('pdf_data')
            .eq('id', notificationId)
            .single();

        if (error || !notification) {
            return NextResponse.json(
                { success: false, error: 'Notificação não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            pdf_data: notification.pdf_data 
        });
    } catch {
console.error('Erro ao buscar PDF:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' 


},
            { status: 500 }
        );
    }
}

