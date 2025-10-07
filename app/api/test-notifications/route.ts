import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Testar se a tabela existe e buscar dados
        const { data: notifications, error } = await supabase
            .from('admin_notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar notificações:', error);
            return NextResponse.json({
                success: false,
                error: error.message,
                details: error
            });
        }

        return NextResponse.json({
            success: true,
            count: notifications?.length || 0,
            notifications: notifications || []
        });

    } catch (error) {
        console.error('Erro no teste:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
}

export async function POST() {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Criar uma notificação de teste
        const { data: notification, error } = await supabase
            .from('admin_notifications')
            .insert({
                subdomain: 'teste',
                action: 'test_notification',
                message: 'Esta é uma notificação de teste criada em ' + new Date().toLocaleString('pt-BR'),
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar notificação de teste:', error);
            return NextResponse.json({
                success: false,
                error: error.message,
                details: error
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Notificação de teste criada com sucesso',
            notification
        });

    } catch (error) {
        console.error('Erro ao criar notificação de teste:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
}
