/**
 * Homepage Analytics Data API
 * 
 * This endpoint provides detailed analytics data for the homepage
 * including paid traffic analysis and conversion tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/auth-config';


/**
 * Calculate date range based on period
 */
function getDateRange(period: string): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }
  
  return { startDate, endDate };
}

/**
 * Get homepage traffic sources
 */
async function getTrafficSources(supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>, startDate: Date, endDate: Date) {
  try {
    const { data, error } = await supabase
      .from('homepage_visits')
      .select('traffic_source, utm_source, utm_medium, utm_campaign')
      .gte('visited_at', startDate.toISOString())
      .lte('visited_at', endDate.toISOString());

    if (error) {
      console.error('Error getting traffic sources:', error);
      return [];
    }

    // Aggregate traffic sources
    const sourceCounts: { [key: string]: number } = {};
    
    data?.forEach((visit: { traffic_source: string; utm_source?: string; utm_medium?: string; utm_campaign?: string }) => {
      let source = visit.traffic_source || 'direct';
      
      if (visit.utm_source) {
        source = `utm_${visit.utm_source}`;
        if (visit.utm_medium) {
          source += `_${visit.utm_medium}`;
        }
      }
      
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const totalVisits = data?.length || 0;
    
    return Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: totalVisits > 0 ? (count / totalVisits) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error getting traffic sources:', error);
    return [];
  }
}

/**
 * Get UTM campaign performance
 */
async function getUTMPerformance(supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>, startDate: Date, endDate: Date) {
  try {
    const { data, error } = await supabase
      .from('homepage_visits')
      .select('utm_source, utm_medium, utm_campaign, conversion_goal, conversion_value')
      .gte('visited_at', startDate.toISOString())
      .lte('visited_at', endDate.toISOString())
      .not('utm_source', 'is', null);

    if (error) {
      console.error('Error getting UTM performance:', error);
      return [];
    }

    // Aggregate UTM performance
    const utmPerformance: { [key: string]: { visits: number; conversions: number; revenue: number } } = {};
    
    data?.forEach((visit: { utm_source: string; utm_medium?: string; utm_campaign?: string; conversion_goal?: boolean; conversion_value?: number }) => {
      const key = `${visit.utm_source}_${visit.utm_medium || 'none'}_${visit.utm_campaign || 'none'}`;
      
      if (!utmPerformance[key]) {
        utmPerformance[key] = { visits: 0, conversions: 0, revenue: 0 };
      }
      
      utmPerformance[key].visits++;
      if (visit.conversion_goal) {
        utmPerformance[key].conversions++;
        utmPerformance[key].revenue += visit.conversion_value || 0;
      }
    });

    return Object.entries(utmPerformance)
      .map(([campaign, data]) => ({
        campaign,
        visits: data.visits,
        conversions: data.conversions,
        conversion_rate: data.visits > 0 ? (data.conversions / data.visits) * 100 : 0,
        revenue: data.revenue
      }))
      .sort((a, b) => b.visits - a.visits);
  } catch (error) {
    console.error('Error getting UTM performance:', error);
    return [];
  }
}

/**
 * Get daily performance
 */
async function getDailyPerformance(supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>, startDate: Date, endDate: Date) {
  try {
    const { data, error } = await supabase
      .from('homepage_visits')
      .select('visited_at, conversion_goal, conversion_value')
      .gte('visited_at', startDate.toISOString())
      .lte('visited_at', endDate.toISOString())
      .order('visited_at', { ascending: true });

    if (error) {
      console.error('Error getting daily performance:', error);
      return [];
    }

    // Group by date and calculate metrics
    const dailyData: { [key: string]: { visits: number; conversions: number; revenue: number } } = {};
    
    data?.forEach((visit: { visited_at: string; conversion_goal?: boolean; conversion_value?: number }) => {
      const date = visit.visited_at.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { visits: 0, conversions: 0, revenue: 0 };
      }
      dailyData[date].visits++;
      if (visit.conversion_goal) {
        dailyData[date].conversions++;
        dailyData[date].revenue += visit.conversion_value || 0;
      }
    });

    return Object.entries(dailyData).map(([date, metrics]) => ({
      date,
      visits: metrics.visits,
      conversions: metrics.conversions,
      conversion_rate: metrics.visits > 0 ? (metrics.conversions / metrics.visits) * 100 : 0,
      revenue: metrics.revenue
    }));
  } catch (error) {
    console.error('Error getting daily performance:', error);
    return [];
  }
}

/**
 * Get conversion funnel
 */
async function getConversionFunnel(supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>, startDate: Date, endDate: Date) {
  try {
    const { data, error } = await supabase
      .from('homepage_visits')
      .select('conversion_goal, conversion_value, traffic_source')
      .gte('visited_at', startDate.toISOString())
      .lte('visited_at', endDate.toISOString());

    if (error) {
      console.error('Error getting conversion funnel:', error);
      return [];
    }

    // Calculate funnel metrics
    const totalVisits = data?.length || 0;
    const conversions = data?.filter((visit: { conversion_goal?: boolean }) => visit.conversion_goal).length || 0;
    const totalRevenue = data?.reduce((sum: number, visit: { conversion_value?: number }) => sum + (visit.conversion_value || 0), 0) || 0;
    
    return [
      {
        stage: 'Visits',
        count: totalVisits,
        percentage: 100
      },
      {
        stage: 'Conversions',
        count: conversions,
        percentage: totalVisits > 0 ? (conversions / totalVisits) * 100 : 0
      },
      {
        stage: 'Revenue',
        count: totalRevenue,
        percentage: conversions > 0 ? (totalRevenue / conversions) : 0
      }
    ];
  } catch (error) {
    console.error('Error getting conversion funnel:', error);
    return [];
  }
}

/**
 * Get homepage summary metrics
 */
async function getHomepageSummary(supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>, startDate: Date, endDate: Date) {
  try {
    const { data, error } = await supabase
      .from('homepage_visits')
      .select('*')
      .gte('visited_at', startDate.toISOString())
      .lte('visited_at', endDate.toISOString());

    if (error) {
      console.error('Error getting homepage summary:', error);
      return {
        totalVisits: 0,
        uniqueVisitors: 0,
        conversions: 0,
        conversionRate: 0,
        totalRevenue: 0,
        avgSessionDuration: 0,
        paidTrafficPercent: 0
      };
    }

    if (!data || data.length === 0) {
      return {
        totalVisits: 0,
        uniqueVisitors: 0,
        conversions: 0,
        conversionRate: 0,
        totalRevenue: 0,
        avgSessionDuration: 0,
        paidTrafficPercent: 0
      };
    }

    const totalVisits = data.length;
    const uniqueVisitors = new Set(data.map((v: Record<string, unknown>) => v.session_id)).size;
    const conversions = data.filter((v: Record<string, unknown>) => v.conversion_goal).length;
    const conversionRate = totalVisits > 0 ? (conversions / totalVisits) * 100 : 0;
    const totalRevenue = data.reduce((sum: number, v: Record<string, unknown>) => sum + (v.conversion_value || 0), 0);
    const avgSessionDuration = data.reduce((sum: number, v: Record<string, unknown>) => sum + (v.duration_seconds || 0), 0) / totalVisits;
    const paidTraffic = data.filter((v: Record<string, unknown>) => v.traffic_source === 'paid').length;
    const paidTrafficPercent = totalVisits > 0 ? (paidTraffic / totalVisits) * 100 : 0;

    return {
      totalVisits,
      uniqueVisitors,
      conversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalRevenue,
      avgSessionDuration: Math.round(avgSessionDuration),
      paidTrafficPercent: Math.round(paidTrafficPercent * 100) / 100
    };
  } catch (error) {
    console.error('Error getting homepage summary:', error);
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      conversions: 0,
      conversionRate: 0,
      totalRevenue: 0,
      avgSessionDuration: 0,
      paidTrafficPercent: 0
    };
  }
}

/**
 * Validate admin access
 */
async function validateAdminAccess(supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return false;
    }

    return isAdminEmail(user.email || '');
  } catch (error) {
    console.error('Error validating admin access:', error);
    return false;
  }
}

/**
 * GET /api/analytics/homepage/data
 * 
 * Get comprehensive homepage analytics data.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    // Validate period
    if (!['7d', '30d', '90d'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be 7d, 30d, or 90d' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Validate admin access
    const isAdmin = await validateAdminAccess(supabase);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Get date range
    const { startDate, endDate } = getDateRange(period);
    
    // Get all analytics data
    const [
      summary,
      trafficSources,
      utmPerformance,
      dailyPerformance,
      conversionFunnel
    ] = await Promise.all([
      getHomepageSummary(supabase, startDate, endDate),
      getTrafficSources(supabase, startDate, endDate),
      getUTMPerformance(supabase, startDate, endDate),
      getDailyPerformance(supabase, startDate, endDate),
      getConversionFunnel(supabase, startDate, endDate)
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        summary,
        trafficSources,
        utmPerformance,
        dailyPerformance,
        conversionFunnel
      },
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

  } catch (error) {
    console.error('Homepage analytics API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
