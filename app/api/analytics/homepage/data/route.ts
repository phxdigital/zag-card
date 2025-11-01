/**
 * Homepage Analytics Data API
 * 
 * This endpoint provides detailed analytics data for the homepage
 * including paid traffic analysis and conversion tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTrafficSources(supabase: any, startDate: Date, endDate: Date) {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUTMPerformance(supabase: any, startDate: Date, endDate: Date) {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDailyPerformance(supabase: any, startDate: Date, endDate: Date) {
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
      visit_date: date,
      total_visits: metrics.visits,
      unique_visitors: metrics.visits, // Simplified for now
      conversions: metrics.conversions,
      conversion_rate: metrics.visits > 0 ? (metrics.conversions / metrics.visits) * 100 : 0,
      total_revenue: metrics.revenue
    }));
  } catch (error) {
    console.error('Error getting daily performance:', error);
    return [];
  }
}

/**
 * Get conversion funnel
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getConversionFunnel(supabase: any, startDate: Date, endDate: Date) {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getHomepageSummary(supabase: any, startDate: Date, endDate: Date) {
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
    const totalRevenue = data.reduce((sum: number, v: Record<string, unknown>) => sum + (Number(v.conversion_value) || 0), 0);
    const avgSessionDuration = data.reduce((sum: number, v: Record<string, unknown>) => sum + (Number(v.duration_seconds) || 0), 0) / totalVisits;
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function validateAdminAccess(supabase: any): Promise<boolean> {
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
 * Get button click statistics for homepage
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getButtonStats(supabase: any, startDate: Date, endDate: Date) {
  try {
    const { data, error } = await supabase
      .from('homepage_visits')
      .select('button_id, button_text, button_type')
      .eq('type', 'button_click')
      .gte('visited_at', startDate.toISOString())
      .lte('visited_at', endDate.toISOString())
      .not('button_id', 'is', null);

    if (error) {
      console.error('Error getting button stats:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Aggregate button data
    const buttonCounts: { [key: string]: { button_text: string; button_type: string; count: number } } = {};
    
    data.forEach((visit: { button_id: string; button_text: string; button_type: string }) => {
      const key = visit.button_id;
      if (!buttonCounts[key]) {
        buttonCounts[key] = {
          button_text: visit.button_text || 'Unknown',
          button_type: visit.button_type || 'unknown',
          count: 0
        };
      }
      buttonCounts[key].count++;
    });

    return Object.entries(buttonCounts)
      .map(([button_id, data]) => ({
        button_id,
        button_text: data.button_text,
        button_type: data.button_type,
        click_count: data.count
      }))
      .sort((a, b) => b.click_count - a.click_count)
      .slice(0, 10);
  } catch (error) {
    console.error('Error getting button stats:', error);
    return [];
  }
}

/**
 * Get section time statistics for homepage
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSectionStats(supabase: any, startDate: Date, endDate: Date) {
  try {
    const { data, error } = await supabase
      .from('homepage_visits')
      .select('section_id, time_spent_seconds')
      .eq('type', 'section_time')
      .gte('visited_at', startDate.toISOString())
      .lte('visited_at', endDate.toISOString())
      .not('section_id', 'is', null);

    if (error) {
      console.error('Error getting section stats:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Aggregate section data
    const sectionData: { [key: string]: { total_time: number; visit_count: number } } = {};
    
    data.forEach((visit: { section_id: string; time_spent_seconds: number }) => {
      const sectionId = visit.section_id;
      if (!sectionData[sectionId]) {
        sectionData[sectionId] = {
          total_time: 0,
          visit_count: 0
        };
      }
      sectionData[sectionId].total_time += Number(visit.time_spent_seconds) || 0;
      sectionData[sectionId].visit_count++;
    });

    return Object.entries(sectionData)
      .map(([section_id, data]) => ({
        section_id,
        total_time: data.total_time,
        visit_count: data.visit_count,
        avg_time: data.visit_count > 0 ? Math.round(data.total_time / data.visit_count) : 0
      }))
      .sort((a, b) => b.total_time - a.total_time)
      .slice(0, 10);
  } catch (error) {
    console.error('Error getting section stats:', error);
    return [];
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

    try {
      // Create Supabase client
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
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
        conversionFunnel,
        buttonStats,
        sectionStats
      ] = await Promise.all([
        getHomepageSummary(supabase, startDate, endDate),
        getTrafficSources(supabase, startDate, endDate),
        getUTMPerformance(supabase, startDate, endDate),
        getDailyPerformance(supabase, startDate, endDate),
        getConversionFunnel(supabase, startDate, endDate),
        getButtonStats(supabase, startDate, endDate),
        getSectionStats(supabase, startDate, endDate)
      ]);
      
      // Debug log
      console.log('Homepage Analytics Data:', {
        buttonStats: buttonStats.length,
        sectionStats: sectionStats.length,
        buttonStatsData: buttonStats,
        sectionStatsData: sectionStats
      });

      return NextResponse.json({
        success: true,
        data: {
          summary,
          trafficSources,
          utmPerformance,
          dailyPerformance,
          conversionFunnel,
          buttonStats,
          sectionStats
        },
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    } catch (supabaseError: unknown) {
      console.error('Supabase client error:', supabaseError);
      return NextResponse.json(
        { error: 'Database connection error', details: process.env.NODE_ENV === 'development' ? (supabaseError instanceof Error ? supabaseError.message : String(supabaseError)) : undefined },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Homepage analytics API error:', error);
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}
