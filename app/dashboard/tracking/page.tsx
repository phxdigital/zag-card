'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, Truck, CheckCircle, Clock, AlertCircle,
  MapPin, Calendar, RefreshCw, ExternalLink, Search
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import TrackingSection from '@/app/components/TrackingSection';

interface Order {
  id: string;
  payment_id: string;
  tracking_code: string | null;
  carrier: string | null;
  service_type: string | null;
  status: string | null;
  shipped_at: string | null;
  created_at: string;
  address: {
    name: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
  } | null;
  payment: {
    amount: number;
    description: string;
    created_at: string;
  } | null;
  page: {
    subdomain: string;
    production_status: string | null;
  } | null;
}

export default function TrackingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Buscar todos os envios do usuário através dos pagamentos
      const { data: payments } = await supabase
        .from('payments')
        .select('id, amount, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!payments || payments.length === 0) {
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const paymentIds = payments.map(p => p.id);

      // Buscar envios vinculados aos pagamentos
      const { data: shipments } = await supabase
        .from('shipments')
        .select(`
          id,
          payment_id,
          tracking_code,
          carrier,
          service_type,
          status,
          shipped_at,
          created_at
        `)
        .in('payment_id', paymentIds)
        .order('created_at', { ascending: false });

      // Buscar endereços de entrega
      const { data: addresses } = await supabase
        .from('shipping_addresses')
        .select('payment_id, name, street, city, state, postal_code')
        .in('payment_id', paymentIds);

      // Buscar páginas/designs
      const { data: pages } = await supabase
        .from('pages')
        .select('payment_id, subdomain, production_status')
        .in('payment_id', paymentIds);

      // Combinar dados
      const ordersData: Order[] = (shipments || []).map(shipment => {
        const payment = payments.find(p => p.id === shipment.payment_id);
        const address = addresses?.find(a => a.payment_id === shipment.payment_id);
        const page = pages?.find(p => p.payment_id === shipment.payment_id);

        return {
          id: shipment.id,
          payment_id: shipment.payment_id,
          tracking_code: shipment.tracking_code,
          carrier: shipment.carrier,
          service_type: shipment.service_type,
          status: shipment.status,
          shipped_at: shipment.shipped_at,
          created_at: shipment.created_at,
          address: address ? {
            name: address.name,
            street: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code
          } : null,
          payment: payment ? {
            amount: payment.amount,
            description: payment.description,
            created_at: payment.created_at
          } : null,
          page: page ? {
            subdomain: page.subdomain,
            production_status: page.production_status
          } : null
        };
      });

      setOrders(ordersData);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    // Filtro por status
    if (filter !== 'all') {
      if (filter === 'pending' && order.status !== 'shipped' && order.status !== 'delivered') return false;
      if (filter === 'shipped' && order.status !== 'shipped') return false;
      if (filter === 'delivered' && order.status !== 'delivered') return false;
    }

    // Filtro por busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        order.tracking_code?.toLowerCase().includes(search) ||
        order.address?.name.toLowerCase().includes(search) ||
        order.address?.city.toLowerCase().includes(search) ||
        order.page?.subdomain.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'created':
        return <Package className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'delivered':
        return 'Entregue';
      case 'shipped':
        return 'Enviado';
      case 'created':
        return 'Criado';
      default:
        return 'Aguardando';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'created':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Carregando pedidos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                Meus Pedidos e Rastreamento
              </h1>
              <p className="text-gray-600 mt-2">
                Acompanhe o status dos seus pedidos e envios
              </p>
            </div>
            <button
              onClick={loadOrders}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por código de rastreamento, nome ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFilter('shipped')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'shipped' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Enviados
              </button>
              <button
                onClick={() => setFilter('delivered')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'delivered' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Entregues
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `Nenhum resultado para "${searchTerm}"`
                : 'Você ainda não tem pedidos com envio.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.payment?.description || 'Pedido #' + order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Pedido em {new Date(order.payment?.created_at || order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Informações do Pedido */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {order.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-gray-700">Endereço de Entrega</p>
                        <p className="text-gray-600">
                          {order.address.name}<br />
                          {order.address.street}<br />
                          {order.address.city} - {order.address.state}<br />
                          CEP: {order.address.postal_code}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.page && (
                    <div className="flex items-start gap-2 text-sm">
                      <ExternalLink className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-gray-700">Design Personalizado</p>
                        <p className="text-gray-600">
                          {order.page.subdomain}.zagnfc.com.br
                        </p>
                        {order.page.production_status && (
                          <p className="text-xs text-gray-500 mt-1">
                            Status: {order.page.production_status}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rastreamento */}
                {order.tracking_code ? (
                  <div className="mt-4">
                    <TrackingSection
                      paymentId={order.payment_id}
                      trackingCode={order.tracking_code}
                      carrier={order.carrier || undefined}
                      serviceType={order.service_type || undefined}
                      shippingStatus={order.status || undefined}
                    />
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Aguardando criação do envio. O código de rastreamento será disponibilizado em breve.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

