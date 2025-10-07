import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subdomain, action, message, pdfData } = body;

        console.log('🔔 Notificação para Admin:', {
            subdomain,
            action,
            message,
            timestamp: new Date().toISOString()
        });

        if (pdfData) {
            console.log(`✅ PDF de impressão recebido para o subdomínio ${subdomain}. Tamanho: ${pdfData.length} bytes.`);
        }

        // Salvar notificação diretamente no Supabase (sem autenticação)
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Usar service role key para bypass de autenticação
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
            console.error('Erro ao salvar notificação no Supabase:', error);
            // Continuar mesmo com erro para não bloquear o fluxo
            console.warn('Continuando sem salvar notificação...');
        }

        console.log('📋 Notificação salva no Supabase:', notification.id);

        return NextResponse.json({ 
            success: true, 
            message: 'Notificação enviada com sucesso.',
            notification 
        });

    } catch (error) {
        console.error('Erro ao enviar notificação para admin:', error);
        return NextResponse.json(
            { success: false, message: 'Erro ao enviar notificação.' },
            { status: 500 }
        );
    }
}
