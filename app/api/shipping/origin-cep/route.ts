import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { loadEnv, getEnv } from '@/lib/env-loader';

export async function GET() {
  try {
    loadEnv();
    
    // Primeiro tentar buscar do banco de dados
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: config, error } = await supabase
        .from('shipping_configs')
        .select('origin_postal_code')
        .eq('carrier', 'melhor_envio')
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (!error && config?.origin_postal_code) {
        return NextResponse.json({
          success: true,
          originCep: config.origin_postal_code,
          source: 'database'
        });
      }
    }
    
    // Fallback: buscar da variável de ambiente
    const envCep = getEnv('SHIPPING_ORIGIN_POSTAL_CODE') || 
                   getEnv('SHIPPING_ORIGIN_CEP') ||
                   getEnv('ORIGIN_POSTAL_CODE') ||
                   getEnv('ORIGIN_CEP');
    
    if (envCep) {
      return NextResponse.json({
        success: true,
        originCep: envCep.replace(/\D/g, ''),
        source: 'environment'
      });
    }
    
    // Último fallback: CEP padrão
    return NextResponse.json({
      success: true,
      originCep: '88010001',
      source: 'default',
      warning: 'Usando CEP padrão. Configure SHIPPING_ORIGIN_POSTAL_CODE no .env ou shipping_configs no banco'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar CEP de origem:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      originCep: '88010001', // Fallback seguro
      source: 'error'
    });
  }
}

