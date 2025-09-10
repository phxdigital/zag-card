import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
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

  // Autenticação apenas para rotas protegidas
  if (pathname.startsWith('/dashboard')) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
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
  );
  
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