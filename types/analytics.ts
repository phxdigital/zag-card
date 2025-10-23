/**
 * Analytics Types for ZAG NFC System
 * 
 * This file contains all TypeScript types and interfaces for the analytics system.
 */

// Base analytics data structure
export interface AnalyticsData {
  type: 'page_view' | 'heartbeat' | 'click' | 'session_end';
  page_id: string;
  session_id: string;
  timestamp: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  user_agent: string;
  device_info?: DeviceInfo;
  duration_seconds?: number;
  clicked_links?: ClickedLink[];
  link_id?: string;
  link_text?: string;
}

// Device information
export interface DeviceInfo {
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
}

// Clicked link data
export interface ClickedLink {
  link_id: string;
  link_text: string;
  clicked_at: string;
}

// Database models
export interface PageVisit {
  id: string;
  page_id: string;
  visited_at: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  user_agent: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  ip_address?: string | null;
  country?: string | null;
  city?: string | null;
  session_id: string;
  duration_seconds: number;
  clicked_links: ClickedLink[];
  created_at: string;
}

// Analytics summary data
export interface AnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  avgDuration: number;
  mobilePercent: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  dailyVisits: DailyVisit[];
  topLinks: TopLink[];
  browserBreakdown: BrowserBreakdown[];
  countryBreakdown: CountryBreakdown[];
}

// Daily visit data
export interface DailyVisit {
  date: string;
  count: number;
  unique_visitors: number;
  avg_duration: number;
}

// Top clicked links
export interface TopLink {
  link_id: string;
  link_text: string;
  clicks: number;
  rate: number;
}

// Browser breakdown
export interface BrowserBreakdown {
  browser: string;
  count: number;
  percentage: number;
}

// Country breakdown
export interface CountryBreakdown {
  country: string;
  count: number;
  percentage: number;
}

// API request/response types
export interface AnalyticsRequest {
  pageId: string;
  period?: '7d' | '30d' | '90d';
  startDate?: string;
  endDate?: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: AnalyticsSummary;
  error?: string;
}

// Geolocation data from IP lookup
export interface GeolocationData {
  ip: string;
  country: string;
  city: string;
  region: string;
  timezone: string;
  isp: string;
}

// Tracking script configuration
export interface TrackingConfig {
  apiEndpoint: string;
  heartbeatInterval: number;
  sessionTimeout: number;
  maxRetries: number;
  retryDelay: number;
}

// Dashboard filter options
export interface DashboardFilters {
  period: '7d' | '30d' | '90d' | 'custom';
  startDate?: string;
  endDate?: string;
  deviceType?: 'all' | 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  country?: string;
}

// Chart data types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  date: string;
  visits: number;
  uniqueVisitors: number;
  avgDuration: number;
}

export interface BarChartData {
  name: string;
  count: number;
  percentage: number;
}

// Export data types
export interface ExportData {
  format: 'csv' | 'pdf';
  period: string;
  data: any[];
  filename: string;
}

// Error types
export interface AnalyticsError {
  code: string;
  message: string;
  details?: any;
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

// Database query parameters
export interface QueryParams {
  pageId: string;
  startDate: Date;
  endDate: Date;
  limit?: number;
  offset?: number;
}

// Materialized view data
export interface PageAnalytics {
  page_id: string;
  visit_date: string;
  total_visits: number;
  unique_visitors: number;
  avg_duration: number;
  mobile_visits: number;
  desktop_visits: number;
  tablet_visits: number;
}

// Real-time analytics events
export interface RealtimeEvent {
  type: 'visit' | 'click' | 'heartbeat';
  pageId: string;
  timestamp: string;
  data: any;
}

// Analytics metrics
export interface AnalyticsMetrics {
  // Traffic metrics
  totalVisits: number;
  uniqueVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  
  // Engagement metrics
  avgSessionDuration: number;
  bounceRate: number;
  pagesPerSession: number;
  
  // Device metrics
  mobileTraffic: number;
  desktopTraffic: number;
  tabletTraffic: number;
  
  // Geographic metrics
  topCountries: CountryBreakdown[];
  topCities: Array<{ city: string; count: number; percentage: number }>;
  
  // Source metrics
  topReferrers: Array<{ referrer: string; count: number; percentage: number }>;
  utmSources: Array<{ source: string; count: number; percentage: number }>;
  
  // Performance metrics
  topPages: Array<{ page: string; visits: number; avgDuration: number }>;
  topLinks: TopLink[];
  
  // Time-based metrics
  hourlyDistribution: Array<{ hour: number; visits: number }>;
  dailyDistribution: DailyVisit[];
  weeklyDistribution: Array<{ week: string; visits: number }>;
  monthlyDistribution: Array<{ month: string; visits: number }>;
}

// Dashboard widget types
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'map';
  title: string;
  data: any;
  config?: any;
}

// Analytics settings
export interface AnalyticsSettings {
  trackingEnabled: boolean;
  anonymizeIPs: boolean;
  retentionPeriod: number; // in days
  realtimeEnabled: boolean;
  exportEnabled: boolean;
  privacyMode: boolean;
}

// Notification types
export interface AnalyticsNotification {
  id: string;
  type: 'milestone' | 'anomaly' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

// A/B testing analytics
export interface ABTestAnalytics {
  testId: string;
  variant: string;
  conversions: number;
  visitors: number;
  conversionRate: number;
  confidence: number;
}

// Cohort analysis
export interface CohortData {
  cohort: string;
  period: number;
  visitors: number;
  retention: number;
}

// Funnel analysis
export interface FunnelStep {
  step: number;
  name: string;
  visitors: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface FunnelData {
  name: string;
  steps: FunnelStep[];
  totalVisitors: number;
  totalConversions: number;
  overallConversionRate: number;
}
