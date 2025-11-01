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

    return NextResponse.json({ pages: data });
  } catch (err) {
return NextResponse.json({ error: 'Internal server error' 
}, { status: 500 });
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

    // Verificar se o request tem body
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    let body;
    try {
      body = await request.json();
    } catch (err) {
console.error('JSON parse error:', err);
      return NextResponse.json({ error: 'Invalid JSON in request body' 




}, { status: 400 });
    }
    
    const { subdomain, config, logo_url, thumbnail_url } = body;

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

    // Buscar o último pagamento confirmado do usuário para vincular
    let paymentId: string | null = null;
    const { data: lastPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', session.user.id)
      .in('status', ['CONFIRMED', 'RECEIVED', 'APPROVED'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastPayment) {
      paymentId = lastPayment.id;
    }

    // Criar nova página com payment_id vinculado
    const { data, error } = await supabase
      .from('pages')
      .insert({
        subdomain,
        config,
        logo_url,
        thumbnail_url,
        user_id: session.user.id,
        payment_id: paymentId, // Vincular com o pagamento
        production_status: 'pending' // Status inicial: aguardando aprovação
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
return NextResponse.json({ error: 'Internal server error' 
}, { status: 500 });
  }
}
