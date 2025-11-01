'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import SuccessPageComponent from '@/app/components/SuccessPage';

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const paymentStatus = searchParams.get('status');
  const paymentId = searchParams.get('payment_id');
  const planType = searchParams.get('plan_type');
  
  // Parâmetros para página criada/editada
  const subdomain = searchParams.get('subdomain');
  const pageId = searchParams.get('pageId');
  const isEdit = searchParams.get('edit') === 'true';

  useEffect(() => {
    if (paymentStatus === 'success' && !subdomain && !pageId) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsRedirecting(true);
            // Usar setTimeout para evitar conflito de estado
            setTimeout(() => {
              router.push('/delivery');
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentStatus, router, subdomain, pageId]);

  // PRIMEIRO: Se houver subdomain e pageId, mostrar página de sucesso de criação/edição
  if (subdomain && pageId) {
    return <SuccessPageComponent subdomain={subdomain} pageId={pageId} isEdit={isEdit} />;
  }

  // SEGUNDO: Verificar pagamento aprovado
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Ícone de sucesso */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pagamento Aprovado!
          </h1>

          {/* Mensagem */}
          <p className="text-gray-600 mb-6">
            Muito obrigado pela compra! Agora vamos ao que interessa.
          </p>

          {/* Informações do pagamento */}
          {planType && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Plano:</strong> {planType}
              </p>
              {paymentId && (
                <p className="text-xs text-blue-600 mt-1">
                  ID: {paymentId}
                </p>
              )}
            </div>
          )}

          {/* Loading e redirecionamento */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">
                Preparando sua experiência...
              </span>
            </div>
            
            <p className="text-xs text-gray-500">
              Redirecionando em {countdown} segundos
            </p>

            <button
              onClick={() => {
                setIsRedirecting(true);
                setTimeout(() => {
                  router.push('/delivery');
                }, 0);
              }}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Continuar Agora
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TERCEIRO: Verificar pagamento com erro
  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Ícone de erro */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-100 p-4">
              <svg className="h-16 w-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pagamento Não Aprovado
          </h1>

          {/* Mensagem */}
          <p className="text-gray-600 mb-6">
            Infelizmente, não foi possível processar seu pagamento. Tente novamente ou entre em contato conosco.
          </p>

          {/* Botões */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/#pricing')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Ir para Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado padrão - sem parâmetros válidos
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Página de Status
        </h1>
        <p className="text-gray-600 mb-6">
          Esta página é exibida após o processamento do pagamento.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Ir para Dashboard
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}