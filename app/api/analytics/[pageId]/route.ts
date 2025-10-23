/**
 * Analytics Statistics API
 * 
 * This endpoint provides analytics data for a specific page.
 * It validates that the page belongs to the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AnalyticsSummary, DailyVisit, TopLink, BrowserBreakdown, CountryBreakdown } from '@/types/analytics';

interface RouteParams {
  params: Promise<{ pageId: string }>;
}

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
 * Get analytics summary for a page
 */
async function getAnalyticsSummary(
  supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>,
  pageId: string,
  startDate: Date,
  endDate: Date
): Promise<AnalyticsSummary> {
  try {
    // Get basic metrics
    const { data: basicMetrics, error: basicError } = await supabase
      .from('page_visits')
      .select('*')
      .eq('page_id', pageId)
      .gte('visited_at', startDate.toISOString())
      .lte('visited_at', endDate.toISOString());

    if (basicError) {
      throw basicError;
    }

    if (!basicMetrics || basicMetrics.length === 0) {
      return {
        totalVisits: 0,
        uniqueVisitors: 0,
        avgDuration: 0,
        mobilePercent: 0,
        deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
        dailyVisits: [],
        topLinks: [],
        browserBreakdown: [],
        countryBreakdown: []
      };
    }

    // Calculate basic metrics
    const totalVisits = basicMetrics.length;
    const uniqueVisitors = new Set(basicMetrics.map((v: Record<string, unknown>) => v.session_id)).size;
    const avgDuration = basicMetrics.reduce((sum: number, v: Record<string, unknown>) => sum + (Number(v.duration_seconds) || 0), 0) / totalVisits;
    
    // Device breakdown
    const deviceBreakdown = {
      mobile: basicMetrics.filter((v: Record<string, unknown>) => v.device_type === 'mobile').length,
      desktop: basicMetrics.filter((v: Record<string, unknown>) => v.device_type === 'desktop').length,
      tablet: basicMetrics.filter((v: Record<string, unknown>) => v.device_type === 'tablet').length
    };
    
    const mobilePercent = totalVisits > 0 ? (deviceBreakdown.mobile / totalVisits) * 100 : 0;

    // Get daily visits
    const dailyVisits = await getDailyVisits(supabase, pageId, startDate);
    
    // Get top links
    const topLinks = await getTopLinks(supabase, pageId, startDate, endDate);
    
    // Get browser breakdown
    const browserBreakdown = await getBrowserBreakdown(supabase, pageId, startDate, endDate);
    
    // Get country breakdown
    const countryBreakdown = await getCountryBreakdown(supabase, pageId, startDate, endDate);

    return {
      totalVisits,
      uniqueVisitors,
      avgDuration: Math.round(avgDuration),
      mobilePercent: Math.round(mobilePercent * 100) / 100,
      deviceBreakdown,
      dailyVisits,
      topLinks,
      browserBreakdown,
      countryBreakdown
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw error;
  }
}

/**
 * Get daily visits data
 */
async function getDailyVisits(
  supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>,
  pageId: string,
  startDate: Date
): Promise<DailyVisit[]> {
  try {
    const { data, error } = await supabase
      .from('page_visits')
      .select('visited_at, session_id, duration_seconds')
      .eq('page_id', parseInt(pageId))
      .gte('visited_at', startDate.toISOString())
      .order('visited_at', { ascending: true });

    if (error) {
      console.error('Error getting daily visits:', error);
      return [];
    }

    // Group by date and calculate metrics
    const dailyData: { [key: string]: { visits: number; uniqueVisitors: Set<string>; totalDuration: number } } = {};
    
    data?.forEach((visit: { visited_at: string; session_id: string; duration_seconds: number | null }) => {
      const date = visit.visited_at.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { visits: 0, uniqueVisitors: new Set(), totalDuration: 0 };
      }
      dailyData[date].visits++;
      dailyData[date].uniqueVisitors.add(visit.session_id);
      dailyData[date].totalDuration += Number(visit.duration_seconds) || 0;
    });

    return Object.entries(dailyData).map(([date, metrics]) => ({
      date: date,
      count: metrics.visits,
      unique_visitors: metrics.uniqueVisitors.size,
      avg_duration: metrics.visits > 0 ? metrics.totalDuration / metrics.visits : 0
    }));
  } catch (error) {
    console.error('Error getting daily visits:', error);
    return [];
  }
}

/**
 * Get top clicked links
 */
async function getTopLinks(
  supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>,
  pageId: string,
  startDate: Date,
  endDate: Date
): Promise<TopLink[]> {
  try {
    const { data, error } = await supabase
      .from('page_visits')
      .select('clicked_links')
      .eq('page_id', parseInt(pageId))
      .gte('visited_at', startDate.toISOString())
      .lte('visited_at', endDate.toISOString())
      .not('clicked_links', 'is', null);

    if (error) {
      console.error('Error getting top links:', error);
      return [];
    }

    // Aggregate clicked links
    const linkCounts: { [key: string]: { text: string; count: number } } = {};
    
    data?.forEach((visit: { clicked_links: { link_id?: string; link_text?: string }[] | null }) => {
      if (visit.clicked_links && Array.isArray(visit.clicked_links)) {
        visit.clicked_links.forEach((link: { link_id?: string; link_text?: string }) => {
          const key = link.link_id || link.link_text || 'unknown';
          if (!linkCounts[key]) {
            linkCounts[key] = { text: link.link_text || link.link_id || 'Unknown', count: 0 };
          }
          linkCounts[key].count++;
        });
      }
    });

    return Object.entries(linkCounts)
      .map(([link_id, data]) => ({
        link_id,
        link_text: data.text,
        clicks: data.count,
        rate: 0 // Will be calculated in the main function
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);
  } catch (error) {
    console.error('Error getting top links:', error);
    return [];
  }
}

/**
 * Get browser breakdown
 */
async function getBrowserBreakdown(
  supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>,
  pageId: string,
  startDate: Date,
  endDate: Date
): Promise<BrowserBreakdown[]> {
  try {
    const { data, error } = await supabase
      .from('page_visits')
      .select('browser')
      .eq('page_id', parseInt(pageId))
      .gte('visited_at', startDate.toISOString())
      .lte('visited_at', endDate.toISOString())
      .not('browser', 'is', null);

    if (error) {
      console.error('Error getting browser breakdown:', error);
      return [];
    }

    // Aggregate browser data
    const browserCounts: { [key: string]: number } = {};
    
    data?.forEach((visit: { browser: string }) => {
      const browser = visit.browser || 'Unknown';
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });

    const totalVisits = data?.length || 0;
    
    return Object.entries(browserCounts)
      .map(([browser, count]) => ({
        browser,
        count,
        percentage: totalVisits > 0 ? (count / totalVisits) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error getting browser breakdown:', error);
    return [];
  }
}

/**
 * Get country breakdown
 */
async function getCountryBreakdown(
  supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>,
  pageId: string,
  startDate: Date,
  endDate: Date
): Promise<CountryBreakdown[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_country_breakdown', {
        p_page_id: pageId,
        p_start_date: startDate.toISOString().split('T')[0],
        p_limit: 10
      });

    if (error) {
      console.error('Error getting country breakdown:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting country breakdown:', error);
    return [];
  }
}

/**
 * Validate that the page belongs to the authenticated user
 */
async function validatePageOwnership(supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>, pageId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('id, user_id')
      .eq('id', pageId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating page ownership:', error);
    return false;
  }
}

/**
 * GET /api/analytics/[pageId]
 * 
 * Get analytics data for a specific page.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { pageId } = await params;
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
    const supabase = createServerComponentClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate page ownership
    const isOwner = await validatePageOwnership(supabase, pageId, user.id);
    
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Page not found or access denied' },
        { status: 404 }
      );
    }

    // Get date range
    const { startDate, endDate } = getDateRange(period);
    
    // Get analytics summary
    const analyticsData = await getAnalyticsSummary(supabase, pageId, startDate, endDate);
    
    return NextResponse.json({
      success: true,
      data: analyticsData,
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/[pageId]
 * 
 * Refresh analytics data (triggers materialized view refresh).
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { pageId } = await params;
    
    // Create Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate page ownership
    const isOwner = await validatePageOwnership(supabase, pageId, user.id);
    
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Page not found or access denied' },
        { status: 404 }
      );
    }

    // Refresh materialized view
    const { error: refreshError } = await supabase
      .rpc('refresh_page_analytics');

    if (refreshError) {
      console.error('Error refreshing analytics:', refreshError);
      return NextResponse.json(
        { error: 'Failed to refresh analytics data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics data refreshed successfully'
    });

  } catch (error) {
    console.error('Analytics refresh error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
