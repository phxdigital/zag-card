'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, Package, CheckCircle, Clock, AlertCircle, 
  MapPin, Calendar, RefreshCw, ExternalLink,
  Loader
} from 'lucide-react';
import { trackShipment, TrackingEvent } from '@/lib/shipping';

interface TrackingSectionProps {
  paymentId: string;
  trackingCode?: string;
  carrier?: string;
  serviceType?: string;
  shippingStatus?: string;
  estimatedDelivery?: string;
}

export default function TrackingSection({
  paymentId,
  trackingCode,
  carrier,
  serviceType,
  shippingStatus,
  estimatedDelivery
}: TrackingSectionProps) {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (trackingCode) {
      fetchTrackingData();
    }
  }, [trackingCode]);

  const fetchTrackingData = async () => {
    if (!trackingCode) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await trackShipment(trackingCode);
      
      if (result.success && result.events) {
        setTrackingEvents(result.events);
        setLastUpdate(new Date());
      } else {
        setError(result.error || 'Erro ao buscar dados de rastreamento');
      }
    } catch (err) {
      setError('Erro ao conectar com o sistema de rastreamento');
      console.error('Erro ao buscar rastreamento:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'entregue':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_transit':
      case 'em_trânsito':
      case 'shipped':
      case 'enviado':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'created':
      case 'criado':
        return <Package className="h-5 w-5 text-gray-600" />;
      case 'out_for_delivery':
      case 'saiu_para_entrega':
        return <Truck className="h-5 w-5 text-orange-600" />;
      case 'exception':
      case 'exceção':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'entregue':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_transit':
      case 'em_trânsito':
      case 'shipped':
      case 'enviado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'out_for_delivery':
      case 'saiu_para_entrega':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'exception':
      case 'exceção':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'entregue':
        return 'Entregue';
      case 'in_transit':
      case 'em_trânsito':
        return 'Em Trânsito';
      case 'shipped':
      case 'enviado':
        return 'Enviado';
      case 'out_for_delivery':
      case 'saiu_para_entrega':
        return 'Saiu para Entrega';
      case 'exception':
      case 'exceção':
        return 'Exceção';
      case 'created':
      case 'criado':
        return 'Criado';
      default:
        return status;
    }
  };

  const getCarrierName = (carrier?: string) => {
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
        return carrier || 'Transportadora';
    }
  };

  if (!trackingCode) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 text-gray-600">
          <Package className="h-5 w-5" />
          <span className="text-sm">Aguardando criação do envio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com informações básicas */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Rastreamento
            </h3>
          </div>
          
          <button
            onClick={fetchTrackingData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Informações do envio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Código de Rastreamento</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {trackingCode}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(trackingCode)}
                className="text-blue-600 hover:text-blue-700"
                title="Copiar código"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Transportadora</label>
            <p className="text-sm text-gray-900 mt-1">
              {getCarrierName(carrier)} - {serviceType}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Status Atual</label>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(shippingStatus || 'pending')}`}>
                {getStatusIcon(shippingStatus || 'pending')}
                {getStatusText(shippingStatus || 'pending')}
              </span>
            </div>
          </div>

          {estimatedDelivery && (
            <div>
              <label className="text-sm font-medium text-gray-500">Previsão de Entrega</label>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {new Date(estimatedDelivery).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Última atualização */}
        {lastUpdate && (
          <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
            Última atualização: {lastUpdate.toLocaleString('pt-BR')}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Buscando atualizações...</span>
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

      {/* Timeline de eventos */}
      {trackingEvents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-4">Histórico de Rastreamento</h4>
          
          <div className="space-y-4">
            {trackingEvents.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {getStatusIcon(event.status)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {event.description}
                    </p>
                    <time className="text-xs text-gray-500">
                      {new Date(event.event_date).toLocaleString('pt-BR')}
                    </time>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nenhum evento */}
      {!loading && !error && trackingEvents.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Ainda não há informações de rastreamento disponíveis.
          </p>
        </div>
      )}

      {/* Links externos */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Rastrear em outros sites:</h4>
        <div className="flex flex-wrap gap-2">
          {carrier === 'correios' && (
            <a
              href={`https://www2.correios.com.br/sistemas/rastreamento/ctrl/ctrlRastreamento.cfm?objetos=${trackingCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Correios
            </a>
          )}
          
          <a
            href={`https://www.melhorrastreio.com.br/rastreio/${trackingCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Melhor Rastreio
          </a>
        </div>
      </div>
    </div>
  );
}
