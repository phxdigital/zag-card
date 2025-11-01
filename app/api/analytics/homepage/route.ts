/**
 * Homepage Analytics API
 * 
 * This endpoint receives analytics data from the homepage tracking script
 * and stores it in the database with detailed conversion tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 200, // per IP per hour (higher for homepage)
  windowMs: 60 * 60 * 1000, // 1 hour
};

/**
 * Get client IP address from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return '127.0.0.1'; // fallback
}

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = `homepage_rate_limit_${ip}`;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    });
    return true;
  }
  
  if (current.count >= RATE_LIMIT.maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

/**
 * Get geolocation data from IP address
 */
async function getGeolocation(ip: string): Promise<Record<string, unknown>> {
  try {
    // Skip geolocation for localhost and private IPs
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        ip,
        country: 'Local',
        city: 'Local',
        region: 'Local',
        timezone: 'UTC',
        isp: 'Local'
      };
    }
    
    // Use ipapi.co for geolocation (free tier: 1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    
    if (!response.ok) {
      // If rate limited or error, return default values silently
      if (response.status === 429) {
        // Silently handle rate limit - don't log as warning to avoid console spam
        return {
          ip,
          country: 'Unknown',
          city: 'Unknown',
          region: 'Unknown',
          timezone: 'UTC',
          isp: 'Unknown'
        };
      }
      // For other errors, also return defaults silently instead of throwing
      return {
        ip,
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        timezone: 'UTC',
        isp: 'Unknown'
      };
    }
    
    const data = await response.json();
    
    return {
      ip: data.ip || ip,
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      timezone: data.timezone || 'UTC',
      isp: data.org || 'Unknown'
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return {
      ip,
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'UTC',
      isp: 'Unknown'
    };
  }
}

/**
 * Validate homepage analytics data
 */
function validateHomepageData(data: Record<string, unknown>): boolean {
  return (
    data &&
    typeof data.session_id === 'string' &&
    typeof data.timestamp === 'string' &&
    typeof data.user_agent === 'string' &&
    ['homepage_view', 'page_view', 'conversion', 'heartbeat', 'session_end', 'button_click', 'section_time'].includes(String(data.type))
  );
}

/**
 * Get Supabase client for server-side operations
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration is missing');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Process and store homepage analytics data
 */
async function processHomepageData(data: Record<string, unknown>, ip: string, geolocation: Record<string, unknown>) {
  const supabase = getSupabaseClient();
  
  try {
    // Extract device information
    const deviceInfo = data.device_info || {
      device_type: 'desktop',
      browser: 'Unknown',
      os: 'Unknown'
    };
    
    // Prepare data for database
    const visitData = {
      visited_at: data.timestamp,
      referrer: data.referrer || null,
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
      utm_content: data.utm_content || null,
      utm_term: data.utm_term || null,
      user_agent: data.user_agent,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      device_type: (deviceInfo as any)?.device_type || 'unknown',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      browser: (deviceInfo as any)?.browser || 'unknown',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      os: (deviceInfo as any)?.os || 'unknown',
      ip_address: ip,
      country: geolocation?.country || null,
      city: geolocation?.city || null,
      session_id: data.session_id,
      duration_seconds: data.duration_seconds || 0,
      page_views: data.page_views || 1,
      exit_page: data.exit_page || null,
      traffic_source: data.traffic_source || 'direct',
      campaign_name: data.campaign_name || null,
      ad_group: data.ad_group || null,
      keyword: data.keyword || null,
      landing_page: data.landing_page || null,
      conversion_goal: data.conversion_goal || null,
      conversion_value: data.conversion_value || 0,
      // New fields for button and section tracking
      type: data.type || 'homepage_view',
      button_id: data.button_id || null,
      button_text: data.button_text || null,
      button_type: data.button_type || null,
      section_id: data.section_id || null,
      time_spent_seconds: data.time_spent_seconds || null
    };
    
    // Insert into database
    const { data: insertedData, error } = await supabase
      .from('homepage_visits')
      .insert(visitData)
      .select();
    
    if (error) {
      console.error('Database insert error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      console.error('Visit data attempted:', visitData);
      throw error;
    }
    
    return { success: true, data: insertedData };
  } catch (error: unknown) {
    console.error('Process homepage analytics data error:', error);
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

/**
 * Handle different types of homepage analytics events
 */
async function handleHomepageEvent(data: Record<string, unknown>, ip: string, geolocation: Record<string, unknown>) {
  const supabase = getSupabaseClient();
  
  switch (data.type) {
    case 'homepage_view':
      // Store initial homepage view
      return await processHomepageData(data, ip, geolocation);
      
    case 'page_view':
      // Update existing session with page view
      // First, get the most recent visit for this session
      const { data: latestVisit } = await supabase
        .from('homepage_visits')
        .select('id')
        .eq('session_id', data.session_id)
        .order('visited_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (latestVisit?.id) {
        const { error: pageViewError } = await supabase
          .from('homepage_visits')
          .update({
            page_views: data.page_views || 1,
            visited_at: data.timestamp
          })
          .eq('id', latestVisit.id);
        
        if (pageViewError) {
          console.error('Page view update error:', pageViewError);
        }
      }
      
      return { success: true };
      
    case 'conversion':
      // Store conversion event
      if (data.conversion_goal) {
        const conversionData = {
          visited_at: data.timestamp,
          user_agent: data.user_agent || 'Unknown',
          device_type: 'desktop',
          browser: 'Unknown',
          os: 'Unknown',
          ip_address: ip,
          country: geolocation?.country || null,
          city: geolocation?.city || null,
          session_id: data.session_id,
          duration_seconds: 0,
          page_views: 1,
          traffic_source: 'direct',
          conversion_goal: data.conversion_goal,
          conversion_value: data.conversion_value || 0
        };
        
        return await processHomepageData(conversionData, ip, geolocation);
      }
      return { success: true };
      
    case 'heartbeat':
      // Update existing session with heartbeat
      // First, get the most recent visit for this session
      const { data: latestHeartbeatVisit } = await supabase
        .from('homepage_visits')
        .select('id')
        .eq('session_id', data.session_id)
        .order('visited_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (latestHeartbeatVisit?.id) {
        const { error: heartbeatError } = await supabase
          .from('homepage_visits')
          .update({
            duration_seconds: data.duration_seconds || 0,
            visited_at: data.timestamp
          })
          .eq('id', latestHeartbeatVisit.id);
        
        if (heartbeatError) {
          console.error('Heartbeat update error:', heartbeatError);
        }
      }
      
      return { success: true };
      
    case 'session_end':
      // Update session with final data
      // First, get the most recent visit for this session
      const { data: latestSessionVisit } = await supabase
        .from('homepage_visits')
        .select('id')
        .eq('session_id', data.session_id)
        .order('visited_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (latestSessionVisit?.id) {
        const { error: sessionError } = await supabase
          .from('homepage_visits')
          .update({
            duration_seconds: data.duration_seconds || 0,
            page_views: data.page_views || 1
          })
          .eq('id', latestSessionVisit.id);
        
        if (sessionError) {
          console.error('Session end update error:', sessionError);
        }
      }
      
      return { success: true };
      
    case 'button_click':
      // Store button click event
      return await processHomepageData(data, ip, geolocation);
      
    case 'section_time':
      // Store section time event
      return await processHomepageData(data, ip, geolocation);
      
    default:
      // For unknown types, try to store as generic event
      console.warn(`Unknown homepage analytics event type: ${data.type}, storing as generic event`);
      return await processHomepageData(data, ip, geolocation);
  }
}

/**
 * POST /api/analytics/homepage
 * 
 * Receives homepage analytics data from tracking script and stores it in the database.
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip = getClientIP(request);
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    
    // Validate data
    if (!validateHomepageData(data)) {
      return NextResponse.json(
        { error: 'Invalid homepage analytics data' },
        { status: 400 }
      );
    }
    
    // Get geolocation data (async, don't block response)
    const geolocationPromise = getGeolocation(ip);
    
    // Process homepage analytics data
    const result = await handleHomepageEvent(data, ip, await geolocationPromise);
    
    if (!result || !result.success) {
      return NextResponse.json(
        { error: 'Failed to process homepage analytics data' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json(
      { success: true, timestamp: new Date().toISOString() },
      { status: 200 }
    );
    
  } catch (error: unknown) {
    console.error('Homepage analytics tracking error:', error);
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name
      });
    } else if (typeof error === 'object' && error !== null) {
      console.error('Error details:', error);
    }
    
    // Return error response (don't expose internal details)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/homepage
 * 
 * Health check endpoint for the homepage analytics service.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ZAG Homepage Analytics Tracking'
  });
}
