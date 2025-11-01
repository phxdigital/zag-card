/**
 * Analytics Dashboard - Main Page
 * 
 * This page shows an overview of analytics for all user pages.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, 
  Eye, 
  Users, 
  Clock, 
  Smartphone, 
  Monitor, 
  Tablet,
  TrendingUp,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Page {
  id: string;
  subdomain: string;
  title?: string;
  created_at: string;
}

interface PageAnalytics {
  pageId: string;
  subdomain: string;
  title?: string;
  created_at: string;
  totalVisits: number;
  uniqueVisitors: number;
  avgDuration: number;
  mobilePercent: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  lastVisit?: string;
}

export default function AnalyticsDashboard() {
  const [pages, setPages] = useState<Page[]>([]);
  const [analytics, setAnalytics] = useState<PageAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Fetch user pages
  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages');
      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }
      const data = await response.json();
      setPages(data.pages || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setError('Failed to load pages');
    }
  };

  // Fetch analytics for all pages
  const fetchAnalytics = useCallback(async () => {
    try {
      setRefreshing(true);
      const analyticsData: PageAnalytics[] = [];
      
      for (const page of pages) {
        try {
          const response = await fetch(`/api/analytics/${page.id}?period=30d`);
          if (response.ok) {
            const data = await response.json();
            analyticsData.push({
              pageId: page.id,
              subdomain: page.subdomain,
              title: page.title,
              created_at: page.created_at,
              ...data.data
            });
          } else {
            // Page with no analytics data
            analyticsData.push({
              pageId: page.id,
              subdomain: page.subdomain,
              title: page.title,
              created_at: page.created_at,
              totalVisits: 0,
              uniqueVisitors: 0,
              avgDuration: 0,
              mobilePercent: 0,
              deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 }
            });
          }
        } catch (error) {
          console.error(`Error fetching analytics for page ${page.id}:`, error);
        }
      }
      
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setRefreshing(false);
    }
  }, [pages]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPages();
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Fetch analytics when pages are loaded
  useEffect(() => {
    if (pages.length > 0) {
      fetchAnalytics();
    }
  }, [pages]);

  // Handle refresh
  const handleRefresh = async () => {
    await fetchAnalytics();
  };

  // Calculate total metrics
  const totalMetrics = analytics.reduce(
    (acc, page) => ({
      totalVisits: acc.totalVisits + page.totalVisits,
      uniqueVisitors: acc.uniqueVisitors + page.uniqueVisitors,
      avgDuration: acc.avgDuration + page.avgDuration,
      mobilePercent: acc.mobilePercent + page.mobilePercent
    }),
    { totalVisits: 0, uniqueVisitors: 0, avgDuration: 0, mobilePercent: 0 }
  );

  const avgDuration = analytics.length > 0 ? totalMetrics.avgDuration / analytics.length : 0;
  const avgMobilePercent = analytics.length > 0 ? totalMetrics.mobilePercent / analytics.length : 0;

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
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Analytics</h1>
            <p className="text-gray-600 mt-2">
              Monitore o desempenho das suas páginas NFC
            </p>
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

        {/* Total Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Visitas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMetrics.totalVisits.toLocaleString()}
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
                  {totalMetrics.uniqueVisitors.toLocaleString()}
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
                  {Math.round(avgDuration)}s
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
                  {Math.round(avgMobilePercent)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pages Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Suas Páginas</h2>
            <p className="text-sm text-gray-600">Clique em uma página para ver analytics detalhados</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {analytics.length === 0 ? (
              <div className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sem Dados de Analytics</h3>
                <p className="text-gray-600 mb-4">
                  Suas páginas ainda não receberam visitas. Compartilhe suas páginas NFC para começar a coletar analytics!
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Pages
                </Link>
              </div>
            ) : (
              analytics.map((page) => (
                <div key={page.pageId} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          {page.subdomain}.zagnfc.com.br
                        </h3>
                        {page.title && (
                          <span className="ml-2 text-sm text-gray-500">({page.title})</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Criado em {format(new Date(page.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{page.totalVisits}</p>
                        <p className="text-xs text-gray-500">Visitas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{page.uniqueVisitors}</p>
                        <p className="text-xs text-gray-500">Únicos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{Math.round(page.avgDuration)}s</p>
                        <p className="text-xs text-gray-500">Tempo Médio</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{Math.round(page.mobilePercent)}%</p>
                        <p className="text-xs text-gray-500">Mobile</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Smartphone className="h-4 w-4 mr-1" />
                          {page.deviceBreakdown.mobile}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Monitor className="h-4 w-4 mr-1" />
                          {page.deviceBreakdown.desktop}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Tablet className="h-4 w-4 mr-1" />
                          {page.deviceBreakdown.tablet}
                        </div>
                      </div>
                      
                      <Link
                        href={`/dashboard/analytics/${page.pageId}`}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
