import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        
        // Verificar autenticação
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verificar se é admin
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

        if (roleData?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        console.log('👤 Admin acessando lista de páginas:', session.user.email);

        // Buscar TODAS as páginas (RLS permite admin ver todas)
        const { data: pagesData, error } = await supabase
            .from('pages')
            .select('id, subdomain, user_id, created_at, updated_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao buscar páginas:', error);
            return NextResponse.json({ error: 'Erro ao buscar páginas: ' + error.message }, { status: 500 });
        }

        console.log(`📄 Total de páginas encontradas: ${pagesData?.length || 0}`);

        // Para cada página, buscar informações básicas do usuário
        // Como não temos Service Role, vamos buscar os dados disponíveis
        interface PageData {
            id: string;
            subdomain: string;
            user_id: string;
            created_at: string;
            updated_at: string;
        }
        
        const formattedPages = await Promise.all(
            (pagesData || []).map(async (page: PageData) => {
                // Tentar buscar informações do perfil do usuário (se existir tabela de perfis)
                // Caso contrário, usaremos apenas o que temos
                let userEmail = 'Usuário';
                let userName = 'N/A';

                // Buscar na tabela user_roles para pegar o email
                const { data: userRole } = await supabase
                    .from('user_roles')
                    .select('email')
                    .eq('user_id', page.user_id)
                    .single();

                if (userRole) {
                    userEmail = userRole.email;
                    userName = userRole.email.split('@')[0]; // Nome baseado no email
                }

                return {
                    id: page.id,
                    subdomain: page.subdomain,
                    user_id: page.user_id,
                    created_at: page.created_at,
                    updated_at: page.updated_at,
                    is_active: true, // Padrão: todas ativas
                    user_email: userEmail,
                    user_name: userName,
                };
            })
        );

        console.log(`✅ ${formattedPages.length} páginas formatadas para admin`);

        return NextResponse.json({
            success: true,
            pages: formattedPages
        });

    } catch (error) {
        console.error('❌ Erro ao buscar páginas:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : 'Desconhecido') },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        
        // Verificar autenticação
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verificar se é admin
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

        if (roleData?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { pageId } = await request.json();

        console.log(`🗑️ Admin ${session.user.email} tentando deletar página:`, pageId);

        // Deletar página (RLS permite admin deletar qualquer página)
        const { error } = await supabase
            .from('pages')
            .delete()
            .eq('id', pageId);

        if (error) {
            console.error('❌ Erro ao deletar página:', error);
            return NextResponse.json({ error: 'Erro ao deletar página: ' + error.message }, { status: 500 });
        }

        console.log(`✅ Página ${pageId} deletada com sucesso pelo admin`);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('❌ Erro ao deletar página:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : 'Desconhecido') },
            { status: 500 }
        );
    }
}

