import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Buscar notificações com PDF
        const { data: notifications, error } = await supabase
            .from('admin_notifications')
            .select('*')
            .not('pdf_data', 'is', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar notificações:', error);
            return NextResponse.json({
                success: false,
                error: error.message
            });
        }

        return NextResponse.json({
            success: true,
            count: notifications?.length || 0,
            notifications: notifications?.map(n => ({
                id: n.id,
                subdomain: n.subdomain,
                hasPdf: !!n.pdf_data,
                pdfSize: n.pdf_data ? n.pdf_data.length : 0,
                created_at: n.created_at
            })) || []
        });

    } catch (error) {
        console.error('Erro no teste PDF:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
}
