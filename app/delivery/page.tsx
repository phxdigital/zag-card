'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Truck, CheckCircle, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import ShippingAddressForm from '@/app/components/ShippingAddressForm';
import ShippingOptions from '@/app/components/ShippingOptions';
import { ShippingAddress, ShippingOption } from '@/lib/shipping';

export default function DeliveryPage() {
  const router = useRouter();
  const [step, setStep] = useState<'address' | 'options' | 'confirming' | 'success'>('address');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAutoFillOption, setShowAutoFillOption] = useState(false);
  interface UserData {
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
  }
  
  interface SavedAddress {
    name?: string;
    email?: string;
    phone?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  }
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [product, setProduct] = useState<{
    weight: number;
    dimensions: { length: number; width: number; height: number };
  } | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Carregar dados do usuário/pagamento, endereço e produto
  useEffect(() => {
    // Carregar produto padrão do banco
    loadDefaultProduct();

    // Tentar carregar dados do sessionStorage (do pagamento)
    const cardCheckoutData = sessionStorage.getItem('card_checkout_data');
    const checkoutData = sessionStorage.getItem('checkout_data');
    const savedAddressJson = sessionStorage.getItem('checkout_address');
    
    let addressData: SavedAddress | null = null;
    if (savedAddressJson) {
      try {
        addressData = JSON.parse(savedAddressJson);
        setSavedAddress(addressData);
      } catch (e) {
        console.error('Erro ao carregar endereço do sessionStorage:', e);
      }
    }
    
    if (cardCheckoutData) {
      try {
        const data = JSON.parse(cardCheckoutData);
        const userInfo = {
          name: data.customer?.name,
          email: data.customer?.email,
          phone: data.customer?.phone,
          cpf: data.customer?.cpf
        };
        setUserData(userInfo);
        setShowAutoFillOption(true);
        
        // Se houver endereço salvo, criar endereço completo para preencher automaticamente
        if (addressData && addressData.postal_code) {
          // Buscar endereço completo pelo CEP
          const loadFullAddress = async () => {
            try {
              const { validateCEP } = await import('@/lib/shipping');
              const result = await validateCEP(addressData.postal_code!);
              
              if (result.valid && result.address) {
                const fullAddress: ShippingAddress = {
                  name: userInfo.name || '',
                  email: userInfo.email || '',
                  phone: userInfo.phone || '',
                  document: userInfo.cpf || '', // CPF do checkout
                  street: result.address.street || addressData.street || '',
                  number: addressData.number || '',
                  complement: addressData.complement || '',
                  neighborhood: result.address.neighborhood || '',
                  city: result.address.city || '',
                  state: result.address.state || '',
                  postal_code: addressData.postal_code || '',
                  country: 'BR',
                  reference: '',
                  instructions: ''
                };
                setShippingAddress(fullAddress);
                console.log('✅ Endereço completo preenchido automaticamente:', fullAddress);
              }
            } catch (e) {
              console.error('Erro ao carregar endereço completo:', e);
            }
          };
          
          loadFullAddress();
        }
      } catch (e) {
        console.error('Erro ao carregar dados do checkout:', e);
      }
    } else if (checkoutData) {
      try {
        const data = JSON.parse(checkoutData);
        setUserData({
          name: data.product?.name || 'Produto',
          email: 'usuario@exemplo.com', // Dados padrão para produtos da loja
          phone: '',
          cpf: ''
        });
        setShowAutoFillOption(true);
      } catch (e) {
        console.error('Erro ao carregar dados do checkout:', e);
      }
    }
  }, []);

  const loadDefaultProduct = async () => {
    try {
      const response = await fetch('/api/products/default');
      const data = await response.json();
      
      if (data.weight && data.dimensions) {
        setProduct({
          weight: data.weight,
          dimensions: data.dimensions
        });
      } else {
        // Fallback para valores padrão
        setProduct({
          weight: 0.05,
          dimensions: { length: 20, width: 15, height: 1 }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar produto padrão:', error);
      // Fallback para valores padrão
      setProduct({
        weight: 0.05,
        dimensions: { length: 20, width: 15, height: 1 }
      });
    }
  };

  const handleAutoFill = () => {
    if (!userData) return;

    console.log('Auto-filling with user data:', userData);

    const autoFilledAddress: ShippingAddress = {
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      document: userData.cpf || '', // CPF do checkout
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'BR',
      reference: '',
      instructions: ''
    };

    console.log('Setting shipping address:', autoFilledAddress);
    setShippingAddress(autoFilledAddress);
    setShowAutoFillOption(false);
  };

  const handleAddressSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    setStep('options');
  };

  const handleAddressChange = (address: ShippingAddress) => {
    setShippingAddress(address);
  };

  const handleShippingOptionSelect = (option: ShippingOption) => {
    setShippingOption(option);
    setStep('confirming');
  };

  const handleConfirmDelivery = async () => {
    if (!shippingAddress || !shippingOption) return;
    
    setIsProcessing(true);
    
    try {
      // Buscar payment_id do sessionStorage ou contexto
      // Tentar obter do contexto do pagamento
      let paymentId = null;
      
      // Tentar buscar do sessionStorage (salvo no checkout)
      const storedPaymentId = sessionStorage.getItem('payment_id');
      if (storedPaymentId) {
        paymentId = storedPaymentId;
      } else {
        // Se não houver payment_id, o endpoint vai retornar erro
        // Em produção, sempre deve haver um payment_id válido
        console.warn('⚠️ payment_id não encontrado no sessionStorage');
      }

      // Salvar endereço e envio no banco
      const response = await fetch('/api/shipping/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentId,
          address: shippingAddress,
          shippingOption: shippingOption,
          product: product || { weight: 0.05, dimensions: { length: 20, width: 15, height: 1 } }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.details || 'Erro ao salvar entrega';
        console.error('❌ Erro da API:', errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Mostrar tela de sucesso
      setStep('success');
      setIsProcessing(false);
    } catch (error) {
      console.error('❌ Erro ao processar entrega:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar entrega';
      alert(`Erro ao processar entrega: ${errorMessage}`);
      setIsProcessing(false);
    }
  };

  // Gerenciar contagem regressiva quando step for 'success'
  useEffect(() => {
    if (step === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Usar setTimeout para garantir que o router.push seja chamado após o render
            setTimeout(() => {
              router.push('/create-page');
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [step, router]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Truck className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Informações de Entrega
          </h1>
          <p className="text-gray-600">
            Agora vamos configurar onde enviar seu cartão NFC personalizado
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'address' ? 'bg-blue-600 text-white' : 
              step === 'options' || step === 'confirming' ? 'bg-green-600 text-white' : 
              'bg-gray-300 text-gray-600'
            }`}>
              {step === 'address' ? '1' : <CheckCircle className="h-4 w-4" />}
            </div>
            <div className={`w-16 h-1 ${step === 'options' || step === 'confirming' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'options' ? 'bg-blue-600 text-white' : 
              step === 'confirming' ? 'bg-green-600 text-white' : 
              'bg-gray-300 text-gray-600'
            }`}>
              {step === 'options' ? '2' : step === 'confirming' ? <CheckCircle className="h-4 w-4" /> : '2'}
            </div>
            <div className={`w-16 h-1 ${step === 'confirming' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'confirming' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step === 'confirming' ? '3' : '3'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {step === 'address' && (
            <div>
              <div className="flex items-center mb-6">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Endereço de Entrega
                </h2>
              </div>

              {/* Opção de auto-preenchimento */}
              {showAutoFillOption && userData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Usar dados do pagamento?</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Nome: {userData.name} • Email: {userData.email}
                        {userData.phone && ` • Telefone: ${userData.phone}`}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        ✓ Dados pessoais já preenchidos automaticamente
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFill}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Usar Dados
                    </button>
                  </div>
                </div>
              )}

              {/* Aviso se não há dados para auto-preenchimento */}
              {!showAutoFillOption && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Preencha seus dados de entrega</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Complete o formulário abaixo com suas informações de entrega
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <ShippingAddressForm 
                onAddressChange={handleAddressChange}
                initialData={shippingAddress || undefined}
                autoFillFromPayment={userData ? {
                  name: userData.name || '',
                  email: userData.email || '',
                  phone: userData.phone || '',
                  document: userData.cpf || '', // CPF do checkout
                  postalCode: savedAddress?.postal_code || '',
                  addressNumber: savedAddress?.number || '',
                  addressComplement: savedAddress?.complement || ''
                } : undefined}
              />

              {/* Botão para avançar */}
              {shippingAddress && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setStep('options')}
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'options' && shippingAddress && (
            <div>
              <div className="flex items-center mb-6">
                <Truck className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Opções de Envio
                </h2>
              </div>
              {product ? (
                <ShippingOptions 
                  address={shippingAddress}
                  products={[product]}
                  onOptionSelect={handleShippingOptionSelect}
                  selectedOption={shippingOption || undefined}
                />
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">Carregando opções de frete...</p>
                </div>
              )}
            </div>
          )}

          {step === 'confirming' && shippingAddress && shippingOption && (
            <div>
              <div className="flex items-center mb-6">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Confirmar Entrega
                </h2>
              </div>

              {/* Resumo do endereço */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Endereço de Entrega</h3>
                <p className="text-sm text-gray-600">
                  {shippingAddress.street}, {shippingAddress.number}
                  {shippingAddress.complement && `, ${shippingAddress.complement}`}
                </p>
                <p className="text-sm text-gray-600">
                  {shippingAddress.neighborhood}, {shippingAddress.city} - {shippingAddress.state}
                </p>
                <p className="text-sm text-gray-600">
                  CEP: {shippingAddress.postal_code}
                </p>
              </div>

              {/* Resumo da opção de envio */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Opção de Envio</h3>
                <p className="text-sm text-blue-800">
                  <strong>{shippingOption.carrier}</strong> - {shippingOption.service_type}
                </p>
                <p className="text-sm text-blue-800">
                  Prazo estimado: {shippingOption.estimated_days} dias úteis
                </p>
                <p className="text-sm text-blue-800">
                  Valor: R$ {shippingOption.cost.toFixed(2).replace('.', ',')}
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('options')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirmDelivery}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Confirmar e Continuar
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Após confirmar a entrega, você será redirecionado para criar sua página personalizada
            </p>
          </div>
        )}
      </div>

      {/* Tela de Sucesso após entrega */}
      {step === 'success' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
            {/* Ícone de sucesso */}
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Obrigado pela sua compra!
            </h1>

            {/* Mensagem principal */}
            <div className="space-y-4 mb-6">
              <p className="text-gray-700 text-lg">
                Sua entrega foi confirmada com sucesso!
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-blue-600 mr-2" />
                  <p className="font-semibold text-blue-900">
                    Agora é a sua vez de criar!
                  </p>
                </div>
                <p className="text-blue-800 text-sm">
                  Você poderá criar o design do seu cartão e da sua página web personalizada em menos de 3 minutos.
                </p>
              </div>
            </div>

            {/* Contagem regressiva */}
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                <span className="text-sm text-gray-600">
                  Redirecionando em {countdown} segundo{countdown !== 1 ? 's' : ''}...
                </span>
              </div>
              
              <button
                onClick={() => router.push('/create-page')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Criar meu design agora
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
