/**
 * Homepage Analytics Dashboard
 * 
 * This page shows detailed analytics for the homepage including
 * paid traffic analysis and conversion tracking.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/auth-config';
import { 
  ArrowLeft,
  Eye, 
  Users, 
  Clock, 
  DollarSign,
  Target,
  TrendingUp,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface HomepageSummary {
  totalVisits: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number;
  totalRevenue: number;
  avgSessionDuration: number;
  paidTrafficPercent: number;
}

interface TrafficSource {
  traffic_source: string;
  visit_count: number;
  percentage: number;
  conversion_rate: number;
  avg_conversion_value: number;
}

interface UTMPerformance {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  visit_count: number;
  conversion_count: number;
  conversion_rate: number;
  total_conversion_value: number;
  avg_conversion_value: number;
}

interface DailyPerformance {
  visit_date: string;
  total_visits: number;
  unique_visitors: number;
  conversions: number;
  conversion_rate: number;
  total_revenue: number;
  avg_session_duration: number;
}

interface ConversionFunnel {
  funnel_step: string;
  visitors: number;
  conversion_rate: number;
  drop_off_rate: number;
}

export default function HomepageAnalyticsPage() {
  const [summary, setSummary] = useState<HomepageSummary | null>(null);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [utmPerformance, setUtmPerformance] = useState<UTMPerformance[]>([]);
  const [dailyPerformance, setDailyPerformance] = useState<DailyPerformance[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Fetch homepage analytics data
  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/analytics/homepage/data?period=${period}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Acesso negado. Privilégios de administrador necessários.');
        } else {
          setError('Falha ao carregar dados de analytics');
        }
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.data.summary);
        setTrafficSources(data.data.trafficSources);
        setUtmPerformance(data.data.utmPerformance);
        setDailyPerformance(data.data.dailyPerformance);
        setConversionFunnel(data.data.conversionFunnel);
      }
    } catch (error) {
      console.error('Error fetching homepage analytics:', error);
      setError('Falha ao carregar dados de analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.email && isAdminEmail(user.email)) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setError('Acesso negado. Apenas administradores podem visualizar esta página.');
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setError('Erro ao verificar permissões de acesso.');
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAdminAccess();
  }, [supabase]);

  // Load analytics when period changes and user is admin
  useEffect(() => {
    if (isAdmin && !checkingAuth) {
      fetchAnalytics();
    }
  }, [period, isAdmin, checkingAuth]);

  // Handle refresh
  const handleRefresh = async () => {
    await fetchAnalytics();
  };

  // Handle period change
  const handlePeriodChange = (newPeriod: '7d' | '30d' | '90d') => {
    setPeriod(newPeriod);
  };

  // Prepare chart data
  const prepareDailyData = (dailyData: DailyPerformance[]) => {
    return dailyData.map(item => ({
      date: format(new Date(item.visit_date), 'dd/MM'),
      visits: item.total_visits,
      uniqueVisitors: item.unique_visitors,
      conversions: item.conversions,
      revenue: item.total_revenue,
      conversionRate: item.conversion_rate
    }));
  };

  const prepareTrafficData = (trafficData: TrafficSource[]) => {
    return trafficData.map(item => ({
      name: item.traffic_source,
      value: item.visit_count,
      percentage: item.percentage,
      conversionRate: item.conversion_rate
    }));
  };

  const prepareFunnelData = (funnelData: ConversionFunnel[]) => {
    return funnelData.map(item => ({
      step: item.funnel_step,
      visitors: item.visitors,
      conversionRate: item.conversion_rate,
      dropOffRate: item.drop_off_rate
    }));
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando permissões de acesso...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="flex items-center">
              <div className="text-red-600">
                <BarChart3 className="h-12 w-12" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-red-800">Acesso Negado</h3>
                <p className="text-red-600 mt-2">
                  Apenas administradores podem acessar a análise da homepage.
                </p>
                <p className="text-red-500 text-sm mt-1">
                  Esta página contém dados sensíveis de campanhas pagas e conversões.
                </p>
                <div className="mt-4">
                  <Link
                    href="/dashboard/analytics"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-red-600">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Erro ao Carregar Analytics</h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sem Dados de Analytics</h3>
            <p className="text-gray-600 mb-4">
              A homepage ainda não recebeu visitas. Compartilhe o site para começar a coletar analytics!
            </p>
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Analytics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dailyData = prepareDailyData(dailyPerformance);
  const trafficData = prepareTrafficData(trafficSources);
  const funnelData = prepareFunnelData(conversionFunnel);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/dashboard/analytics"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar para Analytics
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics da Homepage</h1>
              <p className="text-gray-600 mt-2">
                Análise detalhada do tráfego pago e conversões da homepage
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Period Selector */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={period}
                onChange={(e) => handlePeriodChange(e.target.value as '7d' | '30d' | '90d')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Visitas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalVisits.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Visitantes Únicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.uniqueVisitors.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.conversionRate.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Duração Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(summary.avgSessionDuration)}s
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tráfego Pago</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.paidTrafficPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Activity className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversões</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.conversions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Performance Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Diária</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Visitas"
                />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Conversões"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fontes de Tráfego</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${Number(percentage).toFixed(1)}%`}
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel */}
        {funnelData.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Funil de Conversão</h3>
              <p className="text-sm text-gray-600">Jornada do usuário na homepage</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {funnelData.map((step, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{step.step}</p>
                        <p className="text-sm text-gray-500">
                          {step.conversionRate.toFixed(1)}% de conversão
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{step.visitors.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">visitantes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* UTM Campaign Performance */}
        {utmPerformance.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Performance de Campanhas UTM</h3>
              <p className="text-sm text-gray-600">Análise detalhada das campanhas pagas</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campanha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversões
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxa de Conversão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receita
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {utmPerformance.map((campaign, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.utm_campaign}
                          </div>
                          <div className="text-sm text-gray-500">
                            {campaign.utm_source} / {campaign.utm_medium}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.visit_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.conversion_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.conversion_rate.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {campaign.total_conversion_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
