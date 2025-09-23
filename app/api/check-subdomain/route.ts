import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subdomain } = body;

    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain is required' }, { status: 400 });
    }

    // Verificar se o subdomínio já existe
    const { data, error } = await supabase
      .from('pages')
      .select('id')
      .eq('subdomain', subdomain)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Se encontrou dados, o subdomínio já existe
    const exists = !!data;

    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
