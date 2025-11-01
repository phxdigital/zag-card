'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader } from 'lucide-react';
import { validateCEP } from '@/lib/shipping';

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
    street: '',
    addressNumber: '',
    addressComplement: '',
  });
  const [loadingCEP, setLoadingCEP] = useState(false);


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

  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const handleCEPValidation = async (cep: string) => {
    setLoadingCEP(true);
    try {
      const result = await validateCEP(cep);
      if (result.valid && result.address) {
        setAddress(prev => ({
          ...prev,
          street: result.address!.street || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCEP(false);
    }
  };

  // Autopreencher endereço quando CEP for preenchido
  useEffect(() => {
    const cleanCEP = address.postalCode.replace(/\D/g, '');
    if (cleanCEP.length === 8 && !loadingCEP) {
      handleCEPValidation(cleanCEP);
    }
    // Limpar endereço se CEP for alterado para menos de 8 dígitos
    if (cleanCEP.length < 8 && address.street) {
      setAddress(prev => ({ ...prev, street: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.postalCode]);


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
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        // Exibir detalhes retornados pela API (inclui payload do Asaas quando disponível)
        console.error('Charge card error response:', result);
        const reason = result?.asaas?.body || result?.details || result?.error || 'Falha no pagamento';
        throw new Error(typeof reason === 'string' ? reason : JSON.stringify(reason));
      }

      // Salvar payment_id no sessionStorage para usar na página de entrega
      if (result.payment_id) {
        sessionStorage.setItem('payment_id', result.payment_id);
        console.log('✅ payment_id salvo no sessionStorage:', result.payment_id);
      }

      // Salvar endereço preenchido no sessionStorage para usar na página de entrega
      if (address.postalCode && address.street) {
        const savedAddress = {
          postal_code: address.postalCode.replace(/\D/g, ''),
          street: address.street,
          number: address.addressNumber,
          complement: address.addressComplement || '',
        };
        sessionStorage.setItem('checkout_address', JSON.stringify(savedAddress));
        console.log('✅ Endereço salvo no sessionStorage:', savedAddress);
      }

      // Sucesso: ir para página de sucesso
      const successUrl = `/success?status=success&payment_id=${result.payment?.id}&plan_type=${data.planType}`;
      router.push(successUrl);
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
          <h1 className="text-xl font-bold">Pagamento com Cartão</h1>
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">CEP</label>
              <div className="relative">
                <input 
                  className="w-full px-3 py-2 border rounded-md pr-10" 
                  value={address.postalCode} 
                  onChange={(e) => setAddress({ ...address, postalCode: formatCEP(e.target.value) })} 
                  placeholder="00000-000"
                  maxLength={9}
                />
                {loadingCEP && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader className="h-4 w-4 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <input 
                className="w-full px-3 py-2 border rounded-md" 
                value={address.street} 
                onChange={(e) => setAddress({ ...address, street: e.target.value })} 
                placeholder="Rua, Avenida, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Número</label>
                <input 
                  className="w-full px-3 py-2 border rounded-md" 
                  value={address.addressNumber} 
                  onChange={(e) => setAddress({ ...address, addressNumber: e.target.value })} 
                  placeholder="Ex: 123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Complemento</label>
                <input 
                  className="w-full px-3 py-2 border rounded-md" 
                  value={address.addressComplement} 
                  onChange={(e) => setAddress({ ...address, addressComplement: e.target.value })} 
                  placeholder="Ex: Apt 101"
                />
              </div>
            </div>
          </div>


          <button onClick={handlePay} disabled={loading} className="mt-4 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Processando...' : 'Pagar com Cartão'}
          </button>
        </div>
      </div>
    </div>
  );
}


