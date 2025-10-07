import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // Autenticação apenas para rotas protegidas (desabilitada durante desenvolvimento)
  if (pathname.startsWith('/dashboard')) {
    // Durante desenvolvimento, permitir acesso direto ao dashboard
    // TODO: Reativar autenticação quando configurar Google/Meta OAuth
    console.log('Dashboard access allowed (auth disabled for development)');
    return res;
    
    // Código de autenticação comentado para desenvolvimento:
    /*
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
      return res;
    }
    */
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