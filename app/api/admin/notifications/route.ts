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

        // Buscar notificações do Supabase (SEM pdf_data para evitar timeout)
        const { data: notifications, error } = await supabase
            .from('admin_notifications')
            .select('id, subdomain, action, message, status, created_at, updated_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar notificações:', error);
            return NextResponse.json(
                { success: false, error: 'Erro ao buscar notificações' },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            notifications: notifications || []
        });
    } catch {
console.error('Erro ao buscar notificações:', error);
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

    } catch {
console.error('Erro ao criar notificação:', error);
        return NextResponse.json(
            { success: false, error: 'Erro interno do servidor' 




},
            { status: 500 }
        );
    }
}
