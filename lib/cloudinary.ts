import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Função para fazer upload com remoção de fundo
export async function uploadWithBackgroundRemoval(
  file: Buffer | string,
  options: {
    public_id?: string;
    folder?: string;
    format?: string;
  } = {}
) {
  try {
    const fileString = file instanceof Buffer 
      ? `data:image/jpeg;base64,${file.toString('base64')}` 
      : file;
      
    const result = await cloudinary.uploader.upload(
      fileString as string,
      {
        ...options,
        transformation: [
          {
            effect: 'background_removal',
            quality: 'auto',
            format: 'png'
          }
        ],
        resource_type: 'image',
        format: 'png'
      }
    );

    return result;
  } catch (error) {
    console.error('Erro no upload com remoção de fundo:', error);
    throw new Error('Falha ao processar remoção de fundo');
  }
}

// Função para verificar se uma imagem já foi processada
export async function checkExistingProcessedImage(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch {
    return null;
  }
}

// Função para gerar hash MD5 do arquivo
export function generateFileHash(buffer: Buffer): string {
  return crypto.createHash('md5').update(buffer).digest('hex');
}
