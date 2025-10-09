import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_EMAILS } from './lib/auth-config';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Verificar se as variáveis de ambiente estão configuradas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured, skipping auth middleware');
    return res;
  }
  
  const supabase = createMiddlewareClient({ req, res });

  const { pathname } = req.nextUrl;

  // Ignorar rotas que não precisam de middleware
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.') || // arquivos estáticos
    pathname === '/favicon.ico'
  ) {
    return res;
  }

  // Proteção especial para rota /admin (SEMPRE ATIVA)
  if (pathname.startsWith('/admin')) {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Se não estiver logado, redirecionar para login
      if (!session) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        return NextResponse.redirect(redirectUrl);
      }

      // Se estiver logado mas não for admin, redirecionar para acesso negado
      const isAdmin = ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '');
      if (!isAdmin) {
        console.warn('Tentativa de acesso não autorizado ao /admin:', session.user.email);
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/access-denied';
        return NextResponse.redirect(redirectUrl);
      }

      // Se for admin, permitir acesso
      return res;
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Autenticação para dashboard
  if (pathname.startsWith('/dashboard')) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Lógica de subdomínio apenas para requests específicos
  const host = req.headers.get('host');
  const subdomain = host?.split('.')[0];
  
  // Verificar se é um subdomínio válido (não www, não domínio principal)
  const mainDomains = ['localhost', 'meuzag.com', 'zag-card.vercel.app'];
  const isMainDomain = mainDomains.some(domain => 
    host === domain || 
    host === `www.${domain}` || 
    host?.endsWith('.vercel.app') // Inclui todos os deploys do Vercel
  ) || host === 'zagnfc.com.br' || host === 'www.zagnfc.com.br';
  
  // Permitir acesso à home page principal
  if (pathname === '/' && (host === 'localhost:3001' || host === 'localhost:3000' || isMainDomain)) {
    return res;
  }
  
  // Se for subdomínio e estiver na raiz, reescrever para a rota do subdomínio
  if (subdomain && subdomain !== 'www' && !isMainDomain && pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = `/${subdomain}`;
    return NextResponse.rewrite(url);
  }
  
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ],
};