/**
 * Analytics Tracking API
 * 
 * This endpoint receives analytics data from the tracking script
 * and stores it in the database with geolocation information.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AnalyticsData, GeolocationData } from '@/types/analytics';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 100, // per IP per hour
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
  const key = `rate_limit_${ip}`;
  
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
async function getGeolocation(ip: string): Promise<GeolocationData | null> {
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
      throw new Error(`Geolocation API error: ${response.status}`);
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
 * Validate analytics data
 */
function validateAnalyticsData(data: Record<string, unknown>): data is AnalyticsData {
  return (
    data &&
    typeof data.page_id === 'string' &&
    typeof data.session_id === 'string' &&
    typeof data.timestamp === 'string' &&
    typeof data.user_agent === 'string' &&
    ['page_view', 'heartbeat', 'click', 'session_end'].includes(data.type)
  );
}

/**
 * Process and store analytics data
 */
async function processAnalyticsData(data: AnalyticsData, ip: string, geolocation: GeolocationData | null) {
  
  try {
    // Extract device information
    const deviceInfo = data.device_info || {
      device_type: 'desktop',
      browser: 'Unknown',
      os: 'Unknown'
    };
    
    // Prepare data for database
    const visitData = {
      page_id: data.page_id,
      visited_at: data.timestamp,
      referrer: data.referrer || null,
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
      user_agent: data.user_agent,
      device_type: deviceInfo.device_type,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ip_address: ip,
      country: geolocation?.country || null,
      city: geolocation?.city || null,
      session_id: data.session_id,
      duration_seconds: data.duration_seconds || 0,
      clicked_links: data.clicked_links || []
    };
    
    // Insert into database
    const { error } = await supabase
      .from('page_visits')
      .insert(visitData);
    
    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Process analytics data error:', error);
    throw error;
  }
}

/**
 * Handle different types of analytics events
 */
async function handleAnalyticsEvent(data: AnalyticsData, ip: string, geolocation: GeolocationData | null) {
  
  switch (data.type) {
    case 'page_view':
      // Store initial page view
      return await processAnalyticsData(data, ip, geolocation);
      
    case 'heartbeat':
      // Update existing session with heartbeat
      const { error: heartbeatError } = await supabase
        .from('page_visits')
        .update({
          duration_seconds: data.duration_seconds || 0,
          visited_at: data.timestamp
        })
        .eq('session_id', data.session_id)
        .eq('page_id', data.page_id)
        .order('visited_at', { ascending: false })
        .limit(1);
      
      if (heartbeatError) {
        console.error('Heartbeat update error:', heartbeatError);
      }
      
      return { success: true };
      
    case 'click':
      // Store click event
      if (data.link_id && data.link_text) {
        const clickData = {
          page_id: data.page_id,
          visited_at: data.timestamp,
          user_agent: data.user_agent,
          device_type: data.device_info?.device_type || 'desktop',
          browser: data.device_info?.browser || 'Unknown',
          os: data.device_info?.os || 'Unknown',
          ip_address: ip,
          country: geolocation?.country || null,
          city: geolocation?.city || null,
          session_id: data.session_id,
          duration_seconds: 0,
          clicked_links: [{
            link_id: data.link_id,
            link_text: data.link_text,
            clicked_at: data.timestamp
          }]
        };
        
        return await processAnalyticsData(clickData, ip, geolocation);
      }
      break;
      
    case 'session_end':
      // Update session with final data
      const { error: sessionError } = await supabase
        .from('page_visits')
        .update({
          duration_seconds: data.duration_seconds || 0,
          clicked_links: data.clicked_links || []
        })
        .eq('session_id', data.session_id)
        .eq('page_id', data.page_id)
        .order('visited_at', { ascending: false })
        .limit(1);
      
      if (sessionError) {
        console.error('Session end update error:', sessionError);
      }
      
      return { success: true };
      
    default:
      throw new Error(`Unknown analytics event type: ${data.type}`);
  }
  
  return { success: true };
}

/**
 * POST /api/analytics/track
 * 
 * Receives analytics data from tracking script and stores it in the database.
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
    if (!validateAnalyticsData(data)) {
      return NextResponse.json(
        { error: 'Invalid analytics data' },
        { status: 400 }
      );
    }
    
    // Get geolocation data (async, don't block response)
    const geolocationPromise = getGeolocation(ip);
    
    // Process analytics data
    const result = await handleAnalyticsEvent(data, ip, await geolocationPromise);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to process analytics data' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json(
      { success: true, timestamp: new Date().toISOString() },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    // Return error response (don't expose internal details)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/track
 * 
 * Health check endpoint for the analytics service.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ZAG Analytics Tracking'
  });
}
