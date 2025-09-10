import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Se o usuário não está logado e tenta acessar o dashboard, redireciona para login
  if (!session && pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Lógica de subdomínio
  const url = req.nextUrl;
  const host = req.headers.get('host');
  const subdomain = host?.split('.')[0];
  
  // Evitar reescrever para rotas de API, assets, etc.
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return res;
  }
  
  // Evitar reescrever para o domínio principal ou rotas base
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'meuzag.com'; // Adicione seu domínio principal no .env.local
  if (host === mainDomain || host === `www.${mainDomain}` || pathname !== '/') {
      return res;
  }

  if (subdomain && subdomain !== 'www') {
    url.pathname = `/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

