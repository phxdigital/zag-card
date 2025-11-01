import { NextResponse } from 'next/server';
import { loadEnv, getEnv } from '@/lib/env-loader';

export async function GET() {
  try {
    // Carregar env explicitamente
    loadEnv();
    
    const token = getEnv('MELHOR_ENVIO_TOKEN');
    
    return NextResponse.json({
      has_token: !!token,
      token_length: token?.length || 0,
      token_preview: token ? `${token.substring(0, 10)}...${token.substring(token.length - 5)}` : null,
      all_env_keys: Object.keys(process.env).filter(k => 
        k.includes('MELHOR') || 
        k.includes('ENVIO') || 
        k.includes('SHIPPING')
      ),
      // Não retornar o token completo por segurança
      message: token 
        ? 'Token encontrado e configurado corretamente! ✅' 
        : 'Token NÃO encontrado! ❌ Configure MELHOR_ENVIO_TOKEN no .env.local',
      cwd: process.cwd(),
      env_files_checked: [
        '.env.local',
        '.env'
      ]
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Erro ao verificar token',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

