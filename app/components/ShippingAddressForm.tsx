'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Search, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { validateCEP } from '@/lib/shipping';

interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  document?: string; // CPF/CNPJ do destinatário
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  reference?: string;
  instructions?: string;
}

interface ShippingAddressFormProps {
  onAddressChange: (address: ShippingAddress) => void;
  initialData?: Partial<ShippingAddress>;
  loading?: boolean;
  autoFillFromPayment?: {
    name: string;
    email: string;
    phone: string;
    document?: string; // CPF/CNPJ do pagamento
    postalCode: string;
    addressNumber: string;
    addressComplement: string;
  };
}

export default function ShippingAddressForm({ 
  onAddressChange, 
  initialData = {},
  loading = false,
  autoFillFromPayment
}: ShippingAddressFormProps) {
  // Usar ref para manter referência estável de onAddressChange
  const onAddressChangeRef = useRef(onAddressChange);
  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
  }, [onAddressChange]);

  // Flag para indicar se o usuário escolheu limpar os dados manualmente
  const userClearedDataRef = useRef(false);

  const [formData, setFormData] = useState<ShippingAddress>({
    name: '',
    email: '',
    phone: '',
    document: '', // CPF/CNPJ
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'BR',
    reference: '',
    instructions: '',
    ...initialData
  });

  // Auto-preenchimento quando dados de pagamento são fornecidos (apenas uma vez, se não foi limpo manualmente)
  useEffect(() => {
    if (autoFillFromPayment && !formData.name && !userClearedDataRef.current) {
      setFormData(prev => ({
        ...prev,
        name: autoFillFromPayment.name,
        email: autoFillFromPayment.email,
        phone: autoFillFromPayment.phone,
        document: autoFillFromPayment.document || prev.document || '',
        postal_code: autoFillFromPayment.postalCode,
        number: autoFillFromPayment.addressNumber,
        complement: autoFillFromPayment.addressComplement
      }));
    }
  }, [autoFillFromPayment]); // Removido formData.name das dependências

  // Atualizar formulário quando initialData mudar (usar useRef para evitar loops)
  const initialDataRef = useRef(initialData);
  const hasInitializedRef = useRef(false);
  
  useEffect(() => {
    // Verificar se initialData realmente mudou comparando valores
    const currentKeys = Object.keys(initialData || {});
    const prevKeys = Object.keys(initialDataRef.current || {});
    
    const hasChanged = currentKeys.length !== prevKeys.length || 
      currentKeys.some(key => {
        const keyName = key as keyof ShippingAddress;
        return initialData[keyName] !== initialDataRef.current[keyName];
      });
    
    // Não preencher automaticamente se o usuário escolheu limpar manualmente
    if (hasChanged && initialData && Object.keys(initialData).length > 0 && !hasInitializedRef.current && !userClearedDataRef.current) {
      setFormData(prev => {
        // Só atualiza se os dados realmente mudaram e se os campos estão vazios
        const hasChanges = Object.keys(initialData).some(key => {
          const keyName = key as keyof ShippingAddress;
          const newValue = initialData[keyName];
          const oldValue = prev[keyName];
          // Só atualiza se o novo valor existe e o campo atual está vazio
          return newValue && newValue !== '' && (!oldValue || oldValue === '');
        });
        
        if (hasChanges) {
          hasInitializedRef.current = true;
          return {
            ...prev,
            ...initialData
          };
        }
        return prev;
      });
      initialDataRef.current = initialData;
    }
  }, [initialData]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validatingCEP, setValidatingCEP] = useState(false);
  const [cepValid, setCepValid] = useState<boolean | null>(null);

  // Validar CEP quando mudar (com debounce para evitar múltiplas chamadas)
  useEffect(() => {
    const cleanCEP = formData.postal_code.replace(/\D/g, '');
    if (cleanCEP.length === 8 && !validatingCEP) {
      const timeoutId = setTimeout(() => {
        handleCEPValidation(cleanCEP);
      }, 500); // Aguardar 500ms após parar de digitar

      return () => clearTimeout(timeoutId);
    } else if (cleanCEP.length < 8) {
      setCepValid(null);
      setErrors(prev => ({ ...prev, postal_code: '' }));
    }
  }, [formData.postal_code, validatingCEP]);

  const handleCEPValidation = async (cep: string) => {
    if (cep.length !== 8 || validatingCEP) return;
    
    setValidatingCEP(true);
    try {
      const result = await validateCEP(cep);
      
      if (result.valid && result.address) {
        setFormData(prev => ({
          ...prev,
          street: result.address!.street || prev.street,
          neighborhood: result.address!.neighborhood || prev.neighborhood,
          city: result.address!.city || prev.city,
          state: result.address!.state || prev.state
        }));
        setCepValid(true);
        setErrors(prev => ({ ...prev, postal_code: '' }));
      } else {
        setCepValid(false);
        setErrors(prev => ({ 
          ...prev, 
          postal_code: result.error || 'CEP inválido' 
        }));
      }
    } catch (error) {
      setCepValid(false);
      setErrors(prev => ({ 
        ...prev, 
        postal_code: 'Erro ao validar CEP' 
      }));
    } finally {
      setValidatingCEP(false);
    }
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 8);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos';
    }

    if (!formData.document?.trim()) {
      newErrors.document = 'CPF/CNPJ é obrigatório';
    } else {
      const cleanDocument = formData.document.replace(/\D/g, '');
      if (cleanDocument.length === 11) {
        // Validar CPF básico (11 dígitos)
        if (!/^\d{11}$/.test(cleanDocument)) {
          newErrors.document = 'CPF inválido';
        }
      } else if (cleanDocument.length === 14) {
        // Validar CNPJ básico (14 dígitos)
        if (!/^\d{14}$/.test(cleanDocument)) {
          newErrors.document = 'CNPJ inválido';
        }
      } else {
        newErrors.document = 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos';
      }
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Rua é obrigatória';
    }

    if (!formData.number.trim()) {
      newErrors.number = 'Número é obrigatório';
    }

    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'CEP é obrigatório';
    } else if (formData.postal_code.replace(/\D/g, '').length !== 8) {
      newErrors.postal_code = 'CEP deve ter 8 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Notificar mudanças no endereço apenas quando campos obrigatórios estiverem preenchidos
  useEffect(() => {
    // Usar debounce para evitar múltiplas chamadas
    const timeoutId = setTimeout(() => {
      const hasRequiredFields = 
        formData.name.trim() && 
        formData.email.trim() && 
        formData.phone.trim() && 
        formData.document?.trim() &&
        formData.street.trim() && 
        formData.number.trim() && 
        formData.neighborhood.trim() && 
        formData.city.trim() && 
        formData.state.trim() && 
        formData.postal_code.replace(/\D/g, '').length === 8;
      
      if (hasRequiredFields) {
        onAddressChangeRef.current(formData);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [formData]); // Removido onAddressChange das dependências

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Endereço de Entrega
        </h3>
      </div>

      {/* Aviso de auto-preenchimento */}
      {autoFillFromPayment && formData.name && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Dados preenchidos automaticamente com base no pagamento
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                userClearedDataRef.current = true; // Marcar que usuário escolheu limpar
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  document: '',
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
                });
              }}
              className="text-xs text-green-700 hover:text-green-900 underline"
            >
              Limpar e preencher manualmente
            </button>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Você pode editar qualquer campo se necessário
          </p>
        </div>
      )}

      {/* Dados Pessoais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Seu nome completo"
            disabled={loading}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF/CNPJ *
          </label>
          <input
            type="text"
            value={formData.document || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              // Formatar como CPF (11 dígitos) ou CNPJ (14 dígitos)
              let formatted = value;
              if (value.length <= 11) {
                // CPF: 000.000.000-00
                formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
              } else {
                // CNPJ: 00.000.000/0000-00
                formatted = value.slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
              }
              handleInputChange('document', formatted);
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.document ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            disabled={loading}
            maxLength={18}
          />
          {errors.document && <p className="text-red-500 text-sm mt-1">{errors.document}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="seu@email.com"
            disabled={loading}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone *
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="(00) 00000-0000"
            maxLength={15}
            disabled={loading}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* CEP e Endereço */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CEP *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', formatCEP(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.postal_code ? 'border-red-500' : 
                  cepValid === true ? 'border-green-500' : 
                  cepValid === false ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="00000-000"
                maxLength={8}
                disabled={loading}
              />
              {validatingCEP && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader className="h-4 w-4 animate-spin text-blue-600" />
                </div>
              )}
              {!validatingCEP && cepValid === true && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              )}
              {!validatingCEP && cepValid === false && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              )}
            </div>
            {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rua *
            </label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.street ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome da rua"
              disabled={loading}
            />
            {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número *
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.number ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123"
              disabled={loading}
            />
            {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complemento
            </label>
            <input
              type="text"
              value={formData.complement}
              onChange={(e) => handleInputChange('complement', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Apto, casa, etc."
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bairro *
            </label>
            <input
              type="text"
              value={formData.neighborhood}
              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.neighborhood ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome do bairro"
              disabled={loading}
            />
            {errors.neighborhood && <p className="text-red-500 text-sm mt-1">{errors.neighborhood}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome da cidade"
              disabled={loading}
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Selecione o estado</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ponto de Referência
          </label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => handleInputChange('reference', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Próximo ao shopping, escola, etc."
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instruções de Entrega
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Instruções especiais para a entrega..."
            rows={3}
            disabled={loading}
          />
        </div>
      </div>

      {/* Resumo do Endereço */}
      {formData.street && formData.number && formData.city && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Resumo do Endereço:</h4>
          <p className="text-sm text-gray-600">
            {formData.street}, {formData.number}
            {formData.complement && `, ${formData.complement}`}
            <br />
            {formData.neighborhood} - {formData.city}/{formData.state}
            <br />
            CEP: {formData.postal_code}
          </p>
        </div>
      )}
    </div>
  );
}
