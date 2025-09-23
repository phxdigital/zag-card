import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = await params;
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar página (RLS garante que só o dono pode ver)
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id) // Dupla verificação de segurança
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Page not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = await params;
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { config, logo_url } = body;

    // Validar entrada
    if (!config) {
      return NextResponse.json({ error: 'Config is required' }, { status: 400 });
    }

    // Atualizar página (RLS garante que só o dono pode atualizar)
    const { data, error } = await supabase
      .from('pages')
      .update({
        config,
        logo_url
      })
      .eq('id', id)
      .eq('user_id', session.user.id) // Dupla verificação de segurança
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Page not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = await params;
    
    console.log('DELETE request for page ID:', id);
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Session exists:', !!session);
    
    if (!session) {
      console.log('No session found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User ID:', session.user.id);

    // Deletar página (RLS garante que só o dono pode deletar)
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id); // Dupla verificação de segurança

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Page deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
