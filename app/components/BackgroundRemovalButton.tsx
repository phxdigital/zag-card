'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useBackgroundRemoval } from '@/lib/hooks/useBackgroundRemoval';

interface BackgroundRemovalButtonProps {
  onImageProcessed?: (url: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function BackgroundRemovalButton({ 
  onImageProcessed, 
  className = '',
  disabled = false 
}: BackgroundRemovalButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { 
    isProcessing, 
    processedImageUrl, 
    error, 
    remaining, 
    resetTime, 
    removeBackground, 
    checkRateLimit, 
    reset,
    formatResetTime 
  } = useBackgroundRemoval();

  // Verificar rate limit ao carregar o componente
  useEffect(() => {
    checkRateLimit();
  }, [checkRateLimit]);

  const handleButtonClick = () => {
    if (remaining <= 0) {
      alert(`Você já usou suas 2 remoções gratuitas. ${resetTime ? `Aguarde até ${formatResetTime(resetTime)} para nova tentativa.` : ''}`);
      return;
    }
    
    if (disabled) return;
    
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não suportado. Use apenas JPG ou PNG.');
      return;
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Tamanho máximo: 5MB.');
      return;
    }

    const result = await removeBackground(file);
    
    if (result.success && result.url) {
      setShowPreview(true);
      onImageProcessed?.(result.url);
    }
  };

  const handleAcceptResult = async () => {
    if (processedImageUrl && onImageProcessed) {
      // Se for uma URL do Cloudinary, usar proxy para evitar CORS
      if (processedImageUrl.includes('res.cloudinary.com')) {
        try {
          const response = await fetch('/api/image-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl: processedImageUrl })
          });
          
          const data = await response.json();
          
          if (data.success && data.dataUrl) {
            onImageProcessed(data.dataUrl);
          } else {
            console.error('Erro ao converter imagem:', data.error);
            // Fallback: usar URL original
            onImageProcessed(processedImageUrl);
          }
        } catch (error) {
          console.error('Erro no proxy de imagem:', error);
          // Fallback: usar URL original
          onImageProcessed(processedImageUrl);
        }
      } else {
        // Para outras URLs, usar diretamente
        onImageProcessed(processedImageUrl);
      }
    }
    setShowPreview(false);
    reset();
  };

  const handleRejectResult = () => {
    setShowPreview(false);
    reset();
  };

  const getButtonText = () => {
    if (isProcessing) return 'Removendo fundo...';
    if (remaining <= 0) return 'Limite atingido';
    return 'Remover Fundo';
  };

  const getButtonColor = () => {
    if (isProcessing) return 'bg-yellow-600 hover:bg-yellow-700';
    if (remaining <= 0) return 'bg-gray-400 cursor-not-allowed';
    return 'bg-green-600 hover:bg-green-700';
  };

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={handleButtonClick}
          disabled={disabled || isProcessing || remaining <= 0}
          className={`inline-flex items-center justify-center w-full h-6 text-white text-xs font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${getButtonColor()} ${className}`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {getButtonText()}
            </>
          )}
        </button>

        {/* Contador de usos */}
        <div className="text-xs text-slate-500 text-center">
          {remaining > 0 ? (
            <span>Você tem {remaining} remoção{remaining !== 1 ? 'ões' : ''} restante{remaining !== 1 ? 's' : ''} hoje</span>
          ) : (
            <span className="text-red-500">
              Limite atingido
              {resetTime && (
                <span className="block">
                  Próxima tentativa: {formatResetTime(resetTime)}
                </span>
              )}
            </span>
          )}
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="text-xs text-red-500 text-center bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Modal de preview */}
      {showPreview && processedImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Fundo Removido com Sucesso!</h3>
              
              <div className="mb-4">
                <Image
                  src={processedImageUrl}
                  alt="Imagem com fundo removido"
                  width={400}
                  height={300}
                  className="max-w-full h-auto rounded border"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAcceptResult}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Usar Esta Imagem
                </button>
                <button
                  onClick={handleRejectResult}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
