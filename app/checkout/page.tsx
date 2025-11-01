'use client';

import React, { useEffect, useState } from 'react';
import { Copy, CheckCircle, Clock, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PaymentData {
  id: string;
  status: string;
  value: number;
  dueDate: string;
  invoiceUrl?: string;
  pix: {
    qrCode: string;
    qrCodeImage: string;
    expirationDate: string;
  };
}

interface CheckoutData {
  product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    // Recuperar dados do pagamento do sessionStorage
    const storedPaymentData = sessionStorage.getItem('payment_data');
    if (storedPaymentData) {
      try {
        setPaymentData(JSON.parse(storedPaymentData));
      } catch (e) {
        console.error('Erro ao parsear payment_data:', e);
      }
    }
    
    // Recuperar dados do checkout do sessionStorage
    const storedCheckoutData = sessionStorage.getItem('checkout_data');
    if (storedCheckoutData) {
      try {
        setCheckoutData(JSON.parse(storedCheckoutData));
      } catch (e) {
        console.error('Erro ao parsear checkout_data:', e);
      }
    }
    
    // Se não houver payment_data, redirecionar para homepage
    if (!storedPaymentData) {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (!paymentData?.pix.expirationDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiration = new Date(paymentData.pix.expirationDate).getTime();
      const distance = expiration - now;

      if (distance < 0) {
        setTimeLeft('Expirado');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentData]);

  const copyToClipboard = () => {
    if (paymentData?.pix.qrCode) {
      navigator.clipboard.writeText(paymentData.pix.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Mostrar loading enquanto não há paymentData
  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/zag-site.png" alt="Zag" className="h-8 object-contain" />
          </div>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-3">
              <QrCode className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Pagamento via PIX
          </h1>
          <p className="text-gray-600">
            Escaneie o QR Code ou copie o código PIX para realizar o pagamento
          </p>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Valor a pagar</p>
              <p className="text-3xl font-bold text-gray-900">
                R$ {(checkoutData?.product.total || paymentData?.value || 0).toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Válido por</p>
              <div className="flex items-center text-orange-600">
                <Clock className="h-4 w-4 mr-1" />
                <p className="font-semibold">{timeLeft}</p>
              </div>
            </div>
          </div>
          
          {/* Informações do produto se disponível */}
          {checkoutData && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Produto</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{checkoutData.product.name}</p>
                  <p className="text-sm text-gray-600">Quantidade: {checkoutData.product.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Preço unitário</p>
                  <p className="font-medium">R$ {checkoutData.product.price.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            1. Escaneie o QR Code
          </h2>
          <div className="flex justify-center mb-4">
            <img 
              src={`data:image/png;base64,${paymentData.pix.qrCodeImage}`}
              alt="QR Code PIX"
              className="w-64 h-64 border-4 border-gray-200 rounded-lg"
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Abra o app do seu banco e escaneie o QR Code acima
          </p>
        </div>

        {/* PIX Code */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            2. Ou copie o código PIX
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-800 font-mono break-all">
              {paymentData.pix.qrCode}
            </p>
          </div>
          <button
            onClick={copyToClipboard}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            {copied ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5 mr-2" />
                Copiar Código PIX
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Como pagar:</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex">
              <span className="font-semibold mr-2">1.</span>
              <span>Abra o aplicativo do seu banco</span>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">2.</span>
              <span>Escolha a opção PIX e &quot;Ler QR Code&quot; ou &quot;Pix Copia e Cola&quot;</span>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">3.</span>
              <span>Escaneie o QR Code ou cole o código copiado</span>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">4.</span>
              <span>Confirme as informações e finalize o pagamento</span>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">5.</span>
              <span>Seu acesso será liberado automaticamente após a confirmação</span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
          onClick={() => router.push('/delivery')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Ir para Entrega
          </button>
          <button
            onClick={() => router.push('/dashboard/payments')}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Ver Meus Pagamentos
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          O pagamento via PIX é processado instantaneamente. Após a confirmação, 
          você receberá um e-mail e seu plano será ativado automaticamente.
        </p>
      </div>
    </div>
  );
}

