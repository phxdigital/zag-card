import { NextRequest, NextResponse } from 'next/server';
import { uploadWithBackgroundRemoval, generateFileHash } from '@/lib/cloudinary';

// Interface para o cache de imagens processadas
interface ProcessedImageCache {
  [hash: string]: {
    url: string;
    publicId: string;
    timestamp: number;
  };
}

// Cache em memória (em produção, use Redis ou banco de dados)
const imageCache: ProcessedImageCache = {};

// Rate limiting por IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const MAX_REQUESTS_PER_DAY = 2;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 horas

function getRateLimitKey(request: NextRequest): string {
  // Usar IP do cliente como chave
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset ou primeira requisição
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS_PER_DAY - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  if (userLimit.count >= MAX_REQUESTS_PER_DAY) {
    return { allowed: false, remaining: 0, resetTime: userLimit.resetTime };
  }

  // Incrementar contador
  userLimit.count++;
  rateLimitMap.set(ip, userLimit);

  return { 
    allowed: true, 
    remaining: MAX_REQUESTS_PER_DAY - userLimit.count, 
    resetTime: userLimit.resetTime 
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verificar rate limiting
    const ip = getRateLimitKey(request);
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime);
      return NextResponse.json(
        { 
          error: 'Limite de uso atingido',
          message: `Você já usou suas ${MAX_REQUESTS_PER_DAY} remoções gratuitas. Aguarde até ${resetDate.toLocaleString('pt-BR')} para nova tentativa.`,
          remaining: 0,
          resetTime: rateLimit.resetTime
        },
        { status: 429 }
      );
    }

    // Verificar se o Cloudinary está configurado
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Serviço de remoção de fundo não configurado' },
        { status: 500 }
      );
    }

    // Obter dados do formulário
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhuma imagem foi enviada' },
        { status: 400 }
      );
    }

    // Validações de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use apenas JPG ou PNG.' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB.' },
        { status: 400 }
      );
    }

    // Converter arquivo para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Gerar hash MD5 do arquivo
    const fileHash = generateFileHash(buffer);

    // Verificar cache
    if (imageCache[fileHash]) {
      const cached = imageCache[fileHash];
      // Verificar se o cache não expirou (24 horas)
      if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
        return NextResponse.json({
          success: true,
          url: cached.url,
          publicId: cached.publicId,
          cached: true,
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime
        });
      } else {
        // Remover do cache se expirado
        delete imageCache[fileHash];
      }
    }

    // Gerar ID único para o arquivo
    const publicId = `background-removal/${fileHash}`;

    // Fazer upload com remoção de fundo
    const result = await uploadWithBackgroundRemoval(buffer, {
      public_id: publicId,
      folder: 'zag-card-app/background-removal'
    });

    // Salvar no cache
    imageCache[fileHash] = {
      url: result.secure_url,
      publicId: result.public_id,
      timestamp: Date.now()
    };

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      cached: false,
      remaining: rateLimit.remaining,
      resetTime: rateLimit.resetTime
    });

  } catch {
    console.error('Erro na API de remoção de fundo:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Não foi possível processar a imagem. Tente novamente ou use outra imagem.'
      },
      { status: 500 }
    );
  }
}

// Endpoint para verificar status do rate limiting
export async function GET(request: NextRequest) {
  try {
    const ip = getRateLimitKey(request);
    const userLimit = rateLimitMap.get(ip);
    
    if (!userLimit) {
      return NextResponse.json({
        remaining: MAX_REQUESTS_PER_DAY,
        resetTime: null
      });
    }

    const now = Date.now();
    if (now > userLimit.resetTime) {
      return NextResponse.json({
        remaining: MAX_REQUESTS_PER_DAY,
        resetTime: null
      });
    }

    return NextResponse.json({
      remaining: MAX_REQUESTS_PER_DAY - userLimit.count,
      resetTime: userLimit.resetTime
    });

  } catch (error) {
return NextResponse.json(
      { error: 'Erro ao verificar status' 
},
      { status: 500 }
    );
  }
}
