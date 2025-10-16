import crypto from 'crypto';

// Configuração do remove.bg
const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;
const REMOVEBG_API_URL = 'https://api.remove.bg/v1.0/removebg';

// Função para fazer upload com remoção de fundo usando remove.bg
export async function removeBackgroundWithRemoveBg(
  file: Buffer,
  options: {
    size?: 'auto' | 'preview' | 'small' | 'regular' | 'full' | 'hd';
    format?: 'auto' | 'png' | 'jpg' | 'zip';
    type?: 'auto' | 'person' | 'product' | 'car';
    crop?: boolean;
    crop_margin?: string;
    channels?: 'rgba' | 'alpha';
    add_shadow?: boolean;
    semitransparency?: boolean;
    bg_color?: string;
    bg_image_url?: string;
  } = {}
) {
  try {
    if (!REMOVEBG_API_KEY) {
      throw new Error('API key do remove.bg não configurada');
    }

    const formData = new FormData();
    formData.append('image_file', new Blob([file]), 'image.jpg');
    formData.append('size', options.size || 'auto');
    formData.append('format', options.format || 'auto');
    
    if (options.type) formData.append('type', options.type);
    if (options.crop !== undefined) formData.append('crop', options.crop.toString());
    if (options.crop_margin) formData.append('crop_margin', options.crop_margin);
    if (options.channels) formData.append('channels', options.channels);
    if (options.add_shadow !== undefined) formData.append('add_shadow', options.add_shadow.toString());
    if (options.semitransparency !== undefined) formData.append('semitransparency', options.semitransparency.toString());
    if (options.bg_color) formData.append('bg_color', options.bg_color);
    if (options.bg_image_url) formData.append('bg_image_url', options.bg_image_url);

    const response = await fetch(REMOVEBG_API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVEBG_API_KEY,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API remove.bg:', response.status, errorText);
      
      if (response.status === 402) {
        throw new Error('Limite de créditos do remove.bg atingido');
      } else if (response.status === 400) {
        throw new Error('Imagem inválida ou muito pequena');
      } else if (response.status === 403) {
        throw new Error('API key inválida');
      } else {
        throw new Error(`Erro na API remove.bg: ${response.status}`);
      }
    }

    const resultBuffer = await response.arrayBuffer();
    const resultBase64 = Buffer.from(resultBuffer).toString('base64');
    
    // Retornar como data URL para compatibilidade com o código existente
    const mimeType = options.format === 'jpg' ? 'image/jpeg' : 'image/png';
    const dataUrl = `data:${mimeType};base64,${resultBase64}`;

    return {
      success: true,
      dataUrl,
      buffer: Buffer.from(resultBuffer),
      format: options.format || 'png'
    };

  } catch (error) {
    console.error('Erro no remove.bg:', error);
    throw new Error('Falha ao processar remoção de fundo');
  }
}

// Função para verificar créditos restantes
export async function checkRemoveBgCredits() {
  try {
    if (!REMOVEBG_API_KEY) {
      throw new Error('API key do remove.bg não configurada');
    }

    const response = await fetch('https://api.remove.bg/v1.0/account', {
      method: 'GET',
      headers: {
        'X-Api-Key': REMOVEBG_API_KEY,
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao verificar créditos');
    }

    const data = await response.json();
    return {
      credits: data.data?.attributes?.credits || 0,
      api_calls: data.data?.attributes?.api_calls || 0
    };

  } catch (error) {
    console.error('Erro ao verificar créditos:', error);
    return {
      credits: 0,
      api_calls: 0
    };
  }
}

// Função para gerar hash MD5 do arquivo (mantida para compatibilidade)
export function generateFileHash(buffer: Buffer): string {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

// Função para salvar imagem processada no Supabase Storage
export async function saveProcessedImageToSupabase(
  buffer: Buffer, 
  fileName: string,
  bucketName: string = 'processed-images'
) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrl,
      path: data.path
    };

  } catch (error) {
    console.error('Erro ao salvar no Supabase:', error);
    throw new Error('Falha ao salvar imagem processada');
  }
}
