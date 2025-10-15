import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL da imagem não fornecida' },
        { status: 400 }
      );
    }

    // Validar se é uma URL do Cloudinary
    if (!imageUrl.includes('res.cloudinary.com')) {
      return NextResponse.json(
        { error: 'URL inválida - deve ser do Cloudinary' },
        { status: 400 }
      );
    }

    // Fazer fetch da imagem
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao carregar imagem' },
        { status: 500 }
      );
    }

    // Converter para buffer
    const buffer = await response.arrayBuffer();
    
    // Converter para base64
    const base64 = Buffer.from(new Uint8Array(buffer)).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      dataUrl,
      originalUrl: imageUrl
    });

  } catch (error) {
    console.error('Erro no proxy de imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
