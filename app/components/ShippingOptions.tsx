'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, Clock, DollarSign, CheckCircle, 
  Loader, AlertCircle, Package, MapPin 
} from 'lucide-react';
import { calculateShipping, ShippingOption } from '@/lib/shipping';

interface ShippingOptionsProps {
  address: {
    postal_code: string;
    city: string;
    state: string;
  };
  products: Array<{
    weight: number;
    dimensions: { length: number; width: number; height: number };
  }>;
  onOptionSelect: (option: ShippingOption) => void;
  selectedOption?: ShippingOption;
  loading?: boolean;
}

export default function ShippingOptions({
  address,
  products,
  onOptionSelect,
  selectedOption,
  loading = false
}: ShippingOptionsProps) {
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular opções de frete quando endereço ou produtos mudarem
  useEffect(() => {
    if (address.postal_code.length === 8 && products.length > 0) {
      calculateShippingOptions();
    }
  }, [address.postal_code, products]);

  const calculateShippingOptions = async () => {
    setCalculating(true);
    setError(null);

    try {
      // Calcular peso total e dimensões
      const totalWeight = products.reduce((sum, product) => sum + product.weight, 0);
      const maxDimensions = {
        length: Math.max(...products.map(p => p.dimensions.length)),
        width: Math.max(...products.map(p => p.dimensions.width)),
        height: products.reduce((sum, p) => sum + p.dimensions.height, 0)
      };

      // Calcular opções de frete
      const shippingOptions = await calculateShipping(
        '88010001', // CEP de origem (Florianópolis)
        address.postal_code,
        totalWeight,
        maxDimensions
      );

      setOptions(shippingOptions);
    } catch (err) {
      setError('Erro ao calcular opções de frete');
      console.error('Erro ao calcular frete:', err);
    } finally {
      setCalculating(false);
    }
  };

  const getCarrierIcon = (carrier: string) => {
    switch (carrier) {
      case 'correios':
        return '📮';
      case 'melhor_envio':
        return '🚚';
      case 'jadlog':
        return '📦';
      case 'total_express':
        return '⚡';
      default:
        return '📦';
    }
  };

  const getCarrierName = (carrier: string) => {
    switch (carrier) {
      case 'correios':
        return 'Correios';
      case 'melhor_envio':
        return 'Melhor Envio';
      case 'jadlog':
        return 'Jadlog';
      case 'total_express':
        return 'Total Express';
      default:
        return carrier;
    }
  };

  const getServiceColor = (carrier: string) => {
    switch (carrier) {
      case 'correios':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'melhor_envio':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'jadlog':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'total_express':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando opções de frete...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Opções de Frete
        </h3>
      </div>

      {/* Endereço de destino */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>
            Entregando em: {address.city}/{address.state} - CEP: {address.postal_code}
          </span>
        </div>
      </div>

      {/* Loading state */}
      {calculating && (
        <div className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Calculando opções de frete...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Opções de frete */}
      {options.length > 0 && (
        <div className="space-y-3">
          {options.map((option, index) => (
            <div
              key={`${option.carrier}-${option.service_type}`}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedOption?.carrier === option.carrier && 
                selectedOption?.service_type === option.service_type
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onOptionSelect(option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getCarrierIcon(option.carrier)}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {getCarrierName(option.carrier)}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getServiceColor(option.carrier)}`}>
                        {option.service_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold text-gray-900">
                      R$ {option.cost.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {option.estimated_days} dia{option.estimated_days > 1 ? 's' : ''} úteis
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações adicionais */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Entrega estimada: {new Date(option.estimated_delivery).toLocaleDateString('pt-BR')}</span>
                  <span>Peso: {products.reduce((sum, p) => sum + p.weight, 0).toFixed(1)}kg</span>
                </div>
              </div>

              {/* Checkbox de seleção */}
              {selectedOption?.carrier === option.carrier && 
               selectedOption?.service_type === option.service_type && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Nenhuma opção disponível */}
      {!calculating && !error && options.length === 0 && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma opção de frete disponível
          </h3>
          <p className="text-gray-600">
            Não foi possível calcular o frete para este endereço.
          </p>
        </div>
      )}

      {/* Resumo da seleção */}
      {selectedOption && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Opção selecionada:</span>
          </div>
          <div className="text-sm text-blue-800">
            <strong>{getCarrierName(selectedOption.carrier)}</strong> - {selectedOption.service_type}
            <br />
            <strong>R$ {selectedOption.cost.toFixed(2).replace('.', ',')}</strong> - 
            Entrega em {selectedOption.estimated_days} dia{selectedOption.estimated_days > 1 ? 's' : ''} úteis
          </div>
        </div>
      )}
    </div>
  );
}
