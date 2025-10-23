'use client';

import React, { useState } from 'react';
import { Truck, Package, CheckCircle, AlertCircle } from 'lucide-react';
import ShippingAddressForm from '@/app/components/ShippingAddressForm';
import ShippingOptions from '@/app/components/ShippingOptions';
import { ShippingAddress, ShippingOption } from '@/lib/shipping';

export default function TestShippingPage() {
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null);
  const [testResults, setTestResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const testShippingCalculation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shipping/calculate?origin=88010001&destination=01310100&weight=1.0');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Erro no teste:', error);
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    if (!shippingOption) {
      alert('Selecione uma opção de frete primeiro');
      return;
    }

    try {
      const response = await fetch('/api/webhooks/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_code: 'TEST123456789',
          status: 'in_transit',
          description: 'Pacote em trânsito',
          location: 'Centro de distribuição',
          carrier: shippingOption.carrier
        })
      });
      
      const data = await response.json();
      alert(`Webhook testado: ${data.success ? 'Sucesso' : 'Erro'}`);
    } catch (error) {
      console.error('Erro no webhook:', error);
      alert('Erro ao testar webhook');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste de Integração de Shipping
          </h1>
          <p className="text-gray-600">
            Teste todas as funcionalidades do sistema de envio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Endereço */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Teste de Coleta de Endereço
            </h2>
            <ShippingAddressForm 
              onAddressChange={setShippingAddress}
              loading={loading}
            />
          </div>

          {/* Opções de Frete */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Teste de Cálculo de Frete
            </h2>
            {shippingAddress ? (
              <ShippingOptions
                address={{
                  postal_code: shippingAddress.postal_code,
                  city: shippingAddress.city,
                  state: shippingAddress.state
                }}
                products={[{
                  weight: 1.0,
                  dimensions: { length: 20, width: 15, height: 5 }
                }]}
                onOptionSelect={setShippingOption}
                selectedOption={shippingOption || undefined}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Preencha o endereço primeiro
              </div>
            )}
          </div>
        </div>

        {/* Testes de API */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Testes de API
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testShippingCalculation}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Package className="h-4 w-4" />
              Testar Cálculo de Frete
            </button>

            <button
              onClick={testWebhook}
              disabled={!shippingOption}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Truck className="h-4 w-4" />
              Testar Webhook
            </button>
          </div>

          {/* Resultados dos Testes */}
          {testResults && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Resultado do Teste:</h3>
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Resumo da Integração */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            Status da Integração
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-blue-800">Banco de dados configurado</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-blue-800">Componentes criados</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-blue-800">APIs implementadas</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-blue-800">Checkout integrado</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-blue-800">Dashboard atualizado</span>
            </div>
            
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-blue-800">APIs reais das transportadoras</span>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">
            Próximos Passos
          </h2>
          
          <ol className="space-y-2 text-sm text-yellow-800">
            <li>1. Implementar APIs reais das transportadoras (Correios, Melhor Envio, etc.)</li>
            <li>2. Configurar webhooks reais</li>
            <li>3. Testar fluxo completo de pagamento + envio</li>
            <li>4. Configurar notificações por email</li>
            <li>5. Implementar sistema de fallback entre transportadoras</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
