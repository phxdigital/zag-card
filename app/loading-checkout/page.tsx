'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoadingCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutType = searchParams.get('type'); // 'card' ou 'pix'

  useEffect(() => {
    // Simular tempo de processamento (2-3 segundos)
    const timer = setTimeout(() => {
      if (checkoutType === 'card') {
        router.push('/checkout/card');
      } else {
        router.push('/checkout');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [checkoutType, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Logo ou Ícone */}
        <div className="flex justify-center mb-6">
          <img src="/zag-site.png" alt="Zag NFC" className="h-12 object-contain" />
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center mb-6">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>

        {/* Mensagem */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Preparando seu checkout...
        </h2>
        <p className="text-gray-600 mb-6">
          Estamos carregando as informações necessárias para processar sua compra.
        </p>

        {/* Indicador de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>

        <p className="text-xs text-gray-500">
          Isso leva apenas alguns segundos
        </p>
      </div>
    </div>
  );
}

