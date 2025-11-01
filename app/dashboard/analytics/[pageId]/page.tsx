/**
 * Analytics Detail Page
 * 
 * This page shows detailed analytics for a specific page with charts and visualizations.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Eye, 
  Users, 
  Clock, 
  Smartphone, 
  TrendingUp,
  RefreshCw,
  Calendar,
  MousePointer
} from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AnalyticsSummary, DailyVisit, BrowserBreakdown, CountryBreakdown } from '@/types/analytics';

interface ButtonStats {
  button_id: string;
  button_text: string;
  button_type: string;
  click_count: number;
}

interface SectionStats {
  section_id: string;
  total_time: number;
  visit_count: number;
  avg_time: number;
}

interface PageDetailProps {
  params: Promise<{ pageId: string }>;
}

export default function AnalyticsDetailPage({ params }: PageDetailProps) {
  const [pageId, setPageId] = useState<string>('');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [buttonStats, setButtonStats] = useState<ButtonStats[]>([]);
  const [sectionStats, setSectionStats] = useState<SectionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Initialize page ID
  useEffect(() => {
    const initPageId = async () => {
      const resolvedParams = await params;
      setPageId(resolvedParams.pageId);
    };
    initPageId();
  }, [params]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!pageId) return;
    
    try {
      setRefreshing(true);
      const response = await fetch(`/api/analytics/${pageId}?period=${period}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Page not found or access denied');
        } else {
          setError('Failed to load analytics data');
        }
        return;
      }
      
      const data = await response.json();
      setAnalytics(data.data);
      setButtonStats(data.data.buttonStats || []);
      setSectionStats(data.data.sectionStats || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pageId, period]);

  // Load analytics when page ID or period changes
  useEffect(() => {
    if (pageId) {
      fetchAnalytics();
    }
  }, [pageId, period, fetchAnalytics]);

  // Handle refresh
  const handleRefresh = async () => {
    await fetchAnalytics();
  };

  // Handle period change
  const handlePeriodChange = (newPeriod: '7d' | '30d' | '90d') => {
    setPeriod(newPeriod);
  };

  // Prepare chart data
  const prepareDailyVisitsData = (dailyVisits: DailyVisit[]) => {
    return dailyVisits.map(visit => ({
      date: format(new Date(visit.date), 'MMM dd'),
      visits: visit.count,
      uniqueVisitors: visit.unique_visitors,
      avgDuration: Math.round(visit.avg_duration)
    }));
  };

  const prepareDeviceData = (deviceBreakdown: { [key: string]: number }) => {
    const total = deviceBreakdown.mobile + deviceBreakdown.desktop + deviceBreakdown.tablet;
    
    return [
      { 
        name: 'Mobile', 
        value: deviceBreakdown.mobile, 
        color: '#3B82F6',
        percentage: total > 0 ? (deviceBreakdown.mobile / total * 100).toFixed(1) : '0.0'
      },
      { 
        name: 'Desktop', 
        value: deviceBreakdown.desktop, 
        color: '#10B981',
        percentage: total > 0 ? (deviceBreakdown.desktop / total * 100).toFixed(1) : '0.0'
      },
      { 
        name: 'Tablet', 
        value: deviceBreakdown.tablet, 
        color: '#F59E0B',
        percentage: total > 0 ? (deviceBreakdown.tablet / total * 100).toFixed(1) : '0.0'
      }
    ];
  };

  const prepareBrowserData = (browserBreakdown: BrowserBreakdown[]) => {
    return browserBreakdown.slice(0, 5).map(browser => ({
      name: browser.browser,
      count: browser.count,
      percentage: browser.percentage
    }));
  };

  const prepareCountryData = (countryBreakdown: CountryBreakdown[]) => {
    return countryBreakdown.slice(0, 8).map(country => ({
      name: country.country,
      count: country.count,
      percentage: country.percentage
    }));
  };

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
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
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error Loading Analytics</h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600 mb-4">
              This page hasn&apos;t received any visits yet. Share your NFC page to start collecting analytics!
            </p>
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analytics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dailyVisitsData = prepareDailyVisitsData(analytics.dailyVisits);
  const deviceData = prepareDeviceData(analytics.deviceBreakdown);
  const browserData = prepareBrowserData(analytics.browserBreakdown);
  const countryData = prepareCountryData(analytics.countryBreakdown);

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
              <h1 className="text-3xl font-bold text-gray-900">Analytics da Página</h1>
              <p className="text-gray-600 mt-2">
                Analytics detalhados da sua página NFC
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
                  {analytics.totalVisits.toLocaleString()}
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
                  {analytics.uniqueVisitors.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Duração Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(analytics.avgDuration)}s
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tráfego Mobile</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(analytics.mobilePercent)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Visits Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitas ao Longo do Tempo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyVisitsData}>
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
                  name="Total de Visitas"
                />
                <Line 
                  type="monotone" 
                  dataKey="uniqueVisitors" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Visitantes Únicos"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Device Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Dispositivos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={false}
                  labelLine={false}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} visitas (${props.payload.percentage}%)`, 
                    name
                  ]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => `${value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Browser Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Principais Navegadores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={browserData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Country Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Principais Países</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Links Table */}
        {analytics.topLinks.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Links Mais Clicados</h3>
            <p className="text-sm text-gray-600">Links mais clicados na sua página</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliques
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxa de Cliques
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.topLinks.map((link, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MousePointer className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {link.link_text}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {link.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {link.rate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Button Click Statistics */}
        {buttonStats.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Estatísticas de Botões</h3>
              <p className="text-sm text-gray-600">Botões mais clicados na sua página</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Botão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliques
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {buttonStats.map((button, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MousePointer className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {button.button_text}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {button.button_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {button.click_count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section Time Statistics */}
        {sectionStats.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tempo por Seção</h3>
              <p className="text-sm text-gray-600">Tempo gasto pelos usuários em cada seção da página</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seção
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempo Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempo Médio
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sectionStats.map((section, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {section.section_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.floor(section.total_time / 60)}m {section.total_time % 60}s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {section.visit_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {section.avg_time}s
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
