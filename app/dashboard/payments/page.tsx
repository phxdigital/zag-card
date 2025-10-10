'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle, AlertCircle, Clock, Package, 
  Truck, Award, ExternalLink, 
  RefreshCw, FileText, Receipt, ShoppingCart, Copy,
  Calendar, DollarSign, Star, TrendingUp
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Payment {
  id: string;
  amount: number;
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED';
  created_at: string;
  description: string;
  plan_type: string;
  asaas_payment_id: string;
  due_date?: string;
  billing_type?: string;
  invoice_url?: string;
  pix_qr_code?: string;
}

interface UserProfile {
  subscription_status?: string;
  subscription_plan?: string;
  subscription_end?: string;
  max_pages?: number;
  features?: string[];
}

interface ProductInfo {
  name: string;
  price: number;
  items: string[];
  shipping: string;
  color: string;
  popular?: boolean;
}

// Informações dos produtos/planos
const PRODUCT_INFO: Record<string, ProductInfo> = {
  para_mim: {
    name: 'Para Mim',
    price: 89.00,
    items: ['1 Cartão NFC Premium', 'Página web personalizada', 'QR Code integrado', 'Suporte por email'],
    shipping: 'Envio em até 5 dias úteis',
    color: 'blue'
  },
  para_equipe: {
    name: 'Para Minha Equipe',
    price: 387.00,
    items: ['2 Cartões NFC Premium', '3 Adesivos NFC', 'Páginas web personalizadas', 'QR Codes integrados', 'Suporte prioritário'],
    shipping: 'Envio em até 3 dias úteis',
    color: 'purple',
    popular: true
  },
  para_negocio: {
    name: 'Para Meu Negócio',
    price: 928.00,
    items: ['8 Cartões NFC Premium', '8 Adesivos NFC', '8 Páginas web', 'Analytics avançado', 'Suporte VIP 24/7'],
    shipping: 'Envio expresso em até 2 dias úteis',
    color: 'green'
  }
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Carregar perfil do usuário
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Carregar pagamentos
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setPayments(paymentsData || []);
    } catch {
console.error('Erro ao carregar dados:', error);
    

} finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleBuyAgain = () => {
    // Redirecionar para homepage com seção de preços
    window.location.href = `/#pricing`;
  };

  const handleDownloadInvoice = async (payment: Payment) => {
    // Abrir fatura do Asaas em nova aba
    if (payment.invoice_url) {
      window.open(payment.invoice_url, '_blank');
    } else {
      // Construir URL da fatura do Asaas
      window.open(`https://www.asaas.com/c/${payment.asaas_payment_id}`, '_blank');
    }
  };

  const copyPixCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Código PIX copiado!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'RECEIVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'OVERDUE':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'REFUNDED':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'RECEIVED':
        return 'Pago';
      case 'PENDING':
        return 'Aguardando Pagamento';
      case 'OVERDUE':
        return 'Vencido';
      case 'REFUNDED':
        return 'Estornado';
      default:
        return 'Processando';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'RECEIVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getDeliveryStatus = (payment: Payment) => {
    if (payment.status === 'CONFIRMED' || payment.status === 'RECEIVED') {
      const daysSincePurchase = Math.floor(
        (new Date().getTime() - new Date(payment.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSincePurchase < 2) return { text: 'Preparando envio', icon: Package, color: 'text-blue-600' };
      if (daysSincePurchase < 5) return { text: 'Em trânsito', icon: Truck, color: 'text-purple-600' };
      return { text: 'Entregue', icon: CheckCircle, color: 'text-green-600' };
    }
    return { text: 'Aguardando pagamento', icon: Clock, color: 'text-gray-400' };
  };

  const getPlanInfo = (planType: string) => PRODUCT_INFO[planType] || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalPaid = payments
    .filter(p => p.status === 'CONFIRMED' || p.status === 'RECEIVED')
    .reduce((sum, p) => sum + p.amount, 0);

  const confirmedPayments = payments.filter(p => p.status === 'CONFIRMED' || p.status === 'RECEIVED');
  const pendingPayments = payments.filter(p => p.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Meus Pedidos</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus pedidos e acompanhe entregas dos seus cartões NFC
          </p>
        </div>
        <div className="mt-4 flex gap-3 md:mt-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={() => window.location.href = '/#pricing'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Novo Pedido
          </button>
        </div>
      </div>

      {/* Assinatura Ativa (se houver) */}
      {profile?.subscription_status === 'active' && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-3">
                <Award className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Plano Ativo</h3>
                <p className="text-blue-100 text-sm">
                  {getPlanInfo(profile.subscription_plan || '').name}
                </p>
              </div>
            </div>
            <span className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-semibold">
              Ativo
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-blue-100 text-sm">Páginas disponíveis</p>
              <p className="text-2xl font-bold">{profile.max_pages}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Válido até</p>
              <p className="text-lg font-semibold">
                {profile.subscription_end 
                  ? new Date(profile.subscription_end).toLocaleDateString('pt-BR')
                  : 'Vitalício'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Investido</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalPaid.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pedidos Completos</p>
              <p className="text-2xl font-bold text-gray-900">{confirmedPayments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{pendingPayments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {confirmedPayments.length > 0 
                  ? (totalPaid / confirmedPayments.length).toFixed(2).replace('.', ',')
                  : '0,00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Histórico de Pedidos</h3>
        </div>

        {payments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pedido encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece fazendo seu primeiro pedido de cartões NFC!
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/#pricing'}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver Produtos
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {payments.map((payment) => {
              const planInfo = getPlanInfo(payment.plan_type);
              const deliveryStatus = getDeliveryStatus(payment);
              const DeliveryIcon = deliveryStatus.icon;
              
              return (
                <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    {/* Info do Pedido */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {planInfo.name}
                        </h4>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {getStatusText(payment.status)}
                        </span>
                        {planInfo.popular && (
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            <Star className="h-3 w-3 inline mr-1" />
                            Popular
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(payment.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center">
                          <Receipt className="h-4 w-4 mr-1" />
                          #{payment.asaas_payment_id.substring(0, 8)}
                        </span>
                        {payment.billing_type && (
                          <span className="flex items-center uppercase">
                            <CreditCard className="h-4 w-4 mr-1" />
                            {payment.billing_type}
                          </span>
                        )}
                      </div>

                      {/* Itens do Produto */}
                      <div className="mt-3">
                        <ul className="space-y-1">
                          {planInfo.items?.slice(0, 3).map((item: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                              {item}
                            </li>
                          ))}
                          {planInfo.items?.length > 3 && (
                            <li className="text-sm text-gray-500 italic">
                              +{planInfo.items.length - 3} itens...
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Status de Entrega */}
                      {(payment.status === 'CONFIRMED' || payment.status === 'RECEIVED') && (
                        <div className="mt-4 flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <DeliveryIcon className={`h-5 w-5 ${deliveryStatus.color}`} />
                          <div>
                            <p className={`text-sm font-medium ${deliveryStatus.color}`}>
                              {deliveryStatus.text}
                            </p>
                            <p className="text-xs text-gray-500">{planInfo.shipping}</p>
                          </div>
                        </div>
                      )}

                      {/* PIX Pendente */}
                      {payment.status === 'PENDING' && payment.pix_qr_code && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800 mb-2">
                            Pagamento PIX pendente
                          </p>
                          <button
                            onClick={() => copyPixCode(payment.pix_qr_code!)}
                            className="text-sm text-yellow-700 hover:text-yellow-900 flex items-center"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar código PIX
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Valor e Ações */}
                    <div className="ml-6 flex flex-col items-end">
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {payment.amount.toFixed(2).replace('.', ',')}
                      </p>
                      
                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          onClick={() => handleDownloadInvoice(payment)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Ver Fatura
                        </button>
                        
                        <a
                          href={`https://www.asaas.com/c/${payment.asaas_payment_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Asaas
                        </a>

                        {payment.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleBuyAgain()}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Comprar Novamente
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA para novo pedido */}
      {payments.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Precisa de mais cartões NFC?
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Expanda seu negócio com nossos planos personalizados
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/#pricing'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
            >
              Ver Planos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

