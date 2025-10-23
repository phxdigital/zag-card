'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import ShippingAddressForm from '@/app/components/ShippingAddressForm';
import ShippingOptions from '@/app/components/ShippingOptions';
import { ShippingAddress, ShippingOption } from '@/lib/shipping';

interface CardCheckoutData {
  planType: string;
  value: number;
  description?: string;
  customer: { name: string; cpf: string; phone: string; email: string };
  cardMode?: 'CREDIT' | 'DEBIT';
}

export default function CardCheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CardCheckoutData | null>(null);

  const [card, setCard] = useState({
    holderName: '',
    number: '',
    expiry: '', // MM/YY
    ccv: '',
  });
  const [installments, setInstallments] = useState<number>(1);

  const [address, setAddress] = useState({
    postalCode: '',
    addressNumber: '',
    addressComplement: '',
  });

  // Estados para shipping
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [useSameData, setUseSameData] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('card_checkout_data');
    if (!raw) {
      router.push('/');
      return;
    }
    try {
      const parsed = JSON.parse(raw) as CardCheckoutData;
      setData(parsed);
      setCard((prev) => ({ ...prev, holderName: parsed.customer.name }));
      
      // Se for débito, sempre usar 1 parcela (à vista)
      if (parsed.cardMode === 'DEBIT') {
        setInstallments(1);
      }
    } catch (e) {
      router.push('/');
    }
  }, [router]);

  const parseExpiry = (expiry: string) => {
    const clean = expiry.replace(/\s/g, '');
    const [m, y] = clean.split('/');
    return { month: (m || '').padStart(2, '0'), year: y && y.length === 2 ? `20${y}` : (y || '') };
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const formatCvv = (value: string) => value.replace(/\D/g, '').slice(0, 3);

  // Auto-completar dados de shipping com base nos dados do pagamento
  const autoFillShippingData = () => {
    if (!data) return;

    const autoFilledAddress: ShippingAddress = {
      name: data.customer.name,
      email: data.customer.email,
      phone: data.customer.phone,
      street: '', // Será preenchido pela validação de CEP
      number: address.addressNumber,
      complement: address.addressComplement,
      neighborhood: '',
      city: '',
      state: '',
      postal_code: address.postalCode,
      country: 'BR',
      reference: '',
      instructions: ''
    };

    setShippingAddress(autoFilledAddress);
    setUseSameData(true);
    setShowShippingForm(true); // Abrir o formulário automaticamente
  };

  const handlePay = async () => {
    if (!data) return;
    setLoading(true);
    setError(null);
    try {
      const { month, year } = parseExpiry(card.expiry);
      const response = await fetch('/api/charge-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: data.planType,
          value: data.value,
          description: data.description,
          customer: data.customer,
          cardMode: data.cardMode,
          installments,
          card: {
            holderName: card.holderName,
            number: card.number.replace(/\s/g, ''),
            expiryMonth: month,
            expiryYear: year,
            ccv: card.ccv,
          },
          address,
          shippingAddress,
          shippingOption,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        // Exibir detalhes retornados pela API (inclui payload do Asaas quando disponível)
        console.error('Charge card error response:', result);
        const reason = result?.asaas?.body || result?.details || result?.error || 'Falha no pagamento';
        throw new Error(typeof reason === 'string' ? reason : JSON.stringify(reason));
      }

      // Sucesso: ir para página de sucesso ou pagamentos
      router.push('/dashboard/payments');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Pagamento com Cartão</h1>
          <img src="/zag-site.png" alt="Zag" className="h-8 object-contain" />
        </div>
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <div className="text-sm text-blue-900">Plano</div>
          <div className="font-semibold text-blue-900">{data.planType}</div>
          <div className="text-2xl font-bold text-blue-900">R$ {data.value.toFixed(2).replace('.', ',')}</div>
          <div className="text-sm text-blue-900 mt-1">{data.cardMode === 'DEBIT' ? 'Débito' : 'Crédito'}</div>
          {data.cardMode === 'CREDIT' && installments > 1 && (
            <div className="mt-2 text-sm text-blue-900">
              <div className="font-medium">{installments}x de R$ {(data.value / installments).toFixed(2).replace('.', ',')}</div>
              <div className="text-xs text-blue-700">Sem juros</div>
            </div>
          )}
        </div>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        <div className="grid grid-cols-1 gap-4">
          <div className="text-xs text-gray-500 bg-gray-50 border rounded p-3">
            Ambiente de testes (sandbox): use um cartão fictício e qualquer CPF/CEP.
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome no cartão</label>
            <input className="w-full px-3 py-2 border rounded-md" value={card.holderName} onChange={(e) => setCard({ ...card, holderName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Número do cartão</label>
            <input className="w-full px-3 py-2 border rounded-md" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="0000 0000 0000 0000" maxLength={16} />
          </div>
          <div className={`grid gap-4 ${data.cardMode === 'CREDIT' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <div>
              <label className="block text-sm font-medium mb-1">Validade (MM/AA)</label>
              <input className="w-full px-3 py-2 border rounded-md" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} placeholder="MM/AA" maxLength={5} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CVV</label>
              <input className="w-full px-3 py-2 border rounded-md" value={card.ccv} onChange={(e) => setCard({ ...card, ccv: formatCvv(e.target.value) })} placeholder="000" maxLength={3} />
            </div>
            {data.cardMode === 'CREDIT' && (
              <div>
                <label className="block text-sm font-medium mb-1">Parcelas</label>
                <select className="w-full px-3 py-2 border rounded-md" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value, 10))}>
                  <option value={1}>1x (à vista)</option>
                  <option value={2}>2x</option>
                  <option value={3}>3x</option>
                </select>
              </div>
            )}
          </div>

          {/* Endereço básico para validação do cartão */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CEP</label>
              <input className="w-full px-3 py-2 border rounded-md" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número</label>
              <input className="w-full px-3 py-2 border rounded-md" value={address.addressNumber} onChange={(e) => setAddress({ ...address, addressNumber: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Complemento</label>
              <input className="w-full px-3 py-2 border rounded-md" value={address.addressComplement} onChange={(e) => setAddress({ ...address, addressComplement: e.target.value })} />
            </div>
          </div>

          {/* Seção de Shipping */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Endereço de Entrega</h3>
              <button
                type="button"
                onClick={() => setShowShippingForm(!showShippingForm)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showShippingForm ? 'Ocultar' : 'Configurar Entrega'}
              </button>
            </div>

            {/* Opção de usar os mesmos dados */}
            {!showShippingForm && data?.customer.name && data?.customer.email && address.postalCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Usar os mesmos dados para entrega?</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Nome: {data.customer.name} • Email: {data.customer.email} • CEP: {address.postalCode}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      ✓ Dados pessoais e endereço básico já preenchidos
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={autoFillShippingData}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Usar Mesmos Dados
                  </button>
                </div>
              </div>
            )}

            {/* Aviso se dados estão incompletos */}
            {!showShippingForm && (!data?.customer.name || !data?.customer.email || !address.postalCode) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Dados incompletos para auto-preenchimento</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Preencha todos os dados do pagamento primeiro para usar a opção de auto-preenchimento
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showShippingForm && (
              <div className="space-y-6">
                <ShippingAddressForm 
                  onAddressChange={setShippingAddress}
                  loading={loading}
                  autoFillFromPayment={data ? {
                    name: data.customer.name,
                    email: data.customer.email,
                    phone: data.customer.phone,
                    postalCode: address.postalCode,
                    addressNumber: address.addressNumber,
                    addressComplement: address.addressComplement
                  } : undefined}
                />

                {shippingAddress && (
                  <ShippingOptions
                    address={{
                      postal_code: shippingAddress.postal_code,
                      city: shippingAddress.city,
                      state: shippingAddress.state
                    }}
                    products={[{
                      weight: 1.0, // Peso padrão do cartão NFC
                      dimensions: { length: 20, width: 15, height: 5 }
                    }]}
                    onOptionSelect={setShippingOption}
                    selectedOption={shippingOption || undefined}
                  />
                )}

                {shippingOption && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800">
                        Frete selecionado: {shippingOption.carrier} - {shippingOption.service_type}
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      R$ {shippingOption.cost.toFixed(2).replace('.', ',')} - 
                      Entrega em {shippingOption.estimated_days} dia{shippingOption.estimated_days > 1 ? 's' : ''} úteis
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={handlePay} disabled={loading} className="mt-4 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Processando...' : 'Pagar com Cartão'}
          </button>
        </div>
      </div>
    </div>
  );
}


