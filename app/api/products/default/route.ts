import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Buscar produto padrão (Zag Card) do banco
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Configuração do Supabase não encontrada' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar produto padrão (slug 'zag-card' ou primeiro produto ativo)
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, weight, dimensions, price')
      .eq('is_active', true)
      .eq('requires_shipping', true)
      .limit(1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!products || products.length === 0) {
      // Retornar valores padrão se não houver produto no banco
      return NextResponse.json({
        id: 'default',
        name: 'Zag NFC Card',
        weight: 0.05, // 50g
        dimensions: {
          length: 20, // cm
          width: 15,  // cm
          height: 1   // cm
        },
        price: 0
      });
    }

    const product = products[0];

    return NextResponse.json({
      id: product.id,
      name: product.name,
      weight: product.weight || 0.05,
      dimensions: product.dimensions || {
        length: 20,
        width: 15,
        height: 1
      },
      price: product.price || 0
    });

  } catch (error) {
    console.error('❌ Erro ao buscar produto padrão:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao buscar produto',
        // Valores padrão em caso de erro
        default: {
          weight: 0.05,
          dimensions: { length: 20, width: 15, height: 1 }
        }
      },
      { status: 500 }
    );
  }
}

