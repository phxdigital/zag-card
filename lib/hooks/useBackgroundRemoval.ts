import { useState, useCallback } from 'react';

interface BackgroundRemovalState {
  isProcessing: boolean;
  processedImageUrl: string | null;
  error: string | null;
  remaining: number;
  resetTime: number | null;
}

interface BackgroundRemovalResult {
  success: boolean;
  url?: string;
  publicId?: string;
  cached?: boolean;
  remaining?: number;
  resetTime?: number;
  error?: string;
  message?: string;
}

export function useBackgroundRemoval() {
  const [state, setState] = useState<BackgroundRemovalState>({
    isProcessing: false,
    processedImageUrl: null,
    error: null,
    remaining: 2,
    resetTime: null
  });

  const checkRateLimit = useCallback(async () => {
    try {
      const response = await fetch('/api/remove-background');
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        remaining: data.remaining,
        resetTime: data.resetTime
      }));

      return data;
    } catch (error) {
      console.error('Erro ao verificar rate limit:', error);
      return null;
    }
  }, []);

  const removeBackground = useCallback(async (file: File): Promise<BackgroundRemovalResult> => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      processedImageUrl: null
    }));

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro ao processar imagem');
      }

      setState(prev => ({
        ...prev,
        isProcessing: false,
        processedImageUrl: data.url,
        remaining: data.remaining,
        resetTime: data.resetTime
      }));

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }));

      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      processedImageUrl: null,
      error: null,
      remaining: 2,
      resetTime: null
    });
  }, []);

  const formatResetTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  }, []);

  return {
    ...state,
    removeBackground,
    checkRateLimit,
    reset,
    formatResetTime
  };
}
