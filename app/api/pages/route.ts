import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar páginas do usuário
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subdomain, config, logo_url } = body;

    // Validar entrada
    if (!subdomain || !config) {
      return NextResponse.json({ error: 'Subdomain and config are required' }, { status: 400 });
    }

    // Verificar se o subdomínio já existe
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (existingPage) {
      return NextResponse.json({ error: 'Subdomain already exists' }, { status: 409 });
    }

    // Criar nova página
    const { data, error } = await supabase
      .from('pages')
      .insert({
        subdomain,
        config,
        logo_url,
        user_id: session.user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
