-- Homepage Analytics Setup - CORRIGIDO
-- Este script adiciona homepage tracking ao sistema de analytics existente
-- CORREÇÃO: Verifica se objetos já existem antes de criar

-- ============================================
-- STEP 1: CREATE HOMEPAGE TRACKING TABLE
-- ============================================

-- Create a special table for homepage analytics
CREATE TABLE IF NOT EXISTS homepage_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    user_agent TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    browser TEXT NOT NULL,
    os TEXT NOT NULL,
    ip_address INET,
    country TEXT,
    city TEXT,
    session_id TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 1,
    exit_page TEXT,
    traffic_source TEXT, -- 'organic', 'paid', 'direct', 'social', 'referral'
    campaign_name TEXT,
    ad_group TEXT,
    keyword TEXT,
    landing_page TEXT,
    conversion_goal TEXT, -- 'signup', 'purchase', 'contact', 'download'
    conversion_value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_homepage_visits_visited_at ON homepage_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_homepage_visits_session_id ON homepage_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_homepage_visits_utm_source ON homepage_visits(utm_source);
CREATE INDEX IF NOT EXISTS idx_homepage_visits_traffic_source ON homepage_visits(traffic_source);
CREATE INDEX IF NOT EXISTS idx_homepage_visits_conversion_goal ON homepage_visits(conversion_goal);
CREATE INDEX IF NOT EXISTS idx_homepage_visits_country ON homepage_visits(country);

-- ============================================
-- STEP 3: CREATE ANALYTICS FUNCTIONS FOR HOMEPAGE
-- ============================================

-- Function to get homepage traffic sources
CREATE OR REPLACE FUNCTION get_homepage_traffic_sources(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    traffic_source TEXT,
    visit_count BIGINT,
    percentage NUMERIC,
    conversion_rate NUMERIC,
    avg_conversion_value NUMERIC
) AS $$
DECLARE
    total_visits_count BIGINT;
BEGIN
    -- Get total visits for percentage calculation
    SELECT COUNT(*) INTO total_visits_count
    FROM homepage_visits
    WHERE DATE(visited_at) >= p_start_date
        AND DATE(visited_at) <= p_end_date;
    
    RETURN QUERY
    SELECT 
        COALESCE(hv.traffic_source, 'Unknown') as traffic_source,
        COUNT(*) as visit_count,
        CASE 
            WHEN total_visits_count > 0 THEN (COUNT(*)::NUMERIC / total_visits_count::NUMERIC * 100)
            ELSE 0
        END as percentage,
        CASE 
            WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN hv.conversion_goal IS NOT NULL THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100)
            ELSE 0
        END as conversion_rate,
        AVG(hv.conversion_value) as avg_conversion_value
    FROM homepage_visits hv
    WHERE DATE(hv.visited_at) >= p_start_date
        AND DATE(hv.visited_at) <= p_end_date
    GROUP BY COALESCE(hv.traffic_source, 'Unknown')
    ORDER BY visit_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get homepage UTM campaigns performance
CREATE OR REPLACE FUNCTION get_homepage_utm_performance(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    visit_count BIGINT,
    conversion_count BIGINT,
    conversion_rate NUMERIC,
    total_conversion_value NUMERIC,
    avg_conversion_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(hv.utm_source, 'Unknown') as utm_source,
        COALESCE(hv.utm_medium, 'Unknown') as utm_medium,
        COALESCE(hv.utm_campaign, 'Unknown') as utm_campaign,
        COUNT(*) as visit_count,
        COUNT(CASE WHEN hv.conversion_goal IS NOT NULL THEN 1 END) as conversion_count,
        CASE 
            WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN hv.conversion_goal IS NOT NULL THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100)
            ELSE 0
        END as conversion_rate,
        SUM(hv.conversion_value) as total_conversion_value,
        AVG(hv.conversion_value) as avg_conversion_value
    FROM homepage_visits hv
    WHERE DATE(hv.visited_at) >= p_start_date
        AND DATE(hv.visited_at) <= p_end_date
        AND (hv.utm_source IS NOT NULL OR hv.utm_medium IS NOT NULL OR hv.utm_campaign IS NOT NULL)
    GROUP BY hv.utm_source, hv.utm_medium, hv.utm_campaign
    ORDER BY visit_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get homepage daily performance
CREATE OR REPLACE FUNCTION get_homepage_daily_performance(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    visit_date DATE,
    total_visits BIGINT,
    unique_visitors BIGINT,
    conversions BIGINT,
    conversion_rate NUMERIC,
    total_revenue NUMERIC,
    avg_session_duration NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(hv.visited_at) as visit_date,
        COUNT(*) as total_visits,
        COUNT(DISTINCT hv.session_id) as unique_visitors,
        COUNT(CASE WHEN hv.conversion_goal IS NOT NULL THEN 1 END) as conversions,
        CASE 
            WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN hv.conversion_goal IS NOT NULL THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100)
            ELSE 0
        END as conversion_rate,
        SUM(hv.conversion_value) as total_revenue,
        AVG(hv.duration_seconds) as avg_session_duration
    FROM homepage_visits hv
    WHERE DATE(hv.visited_at) >= p_start_date
        AND DATE(hv.visited_at) <= p_end_date
    GROUP BY DATE(hv.visited_at)
    ORDER BY visit_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get homepage conversion funnel
CREATE OR REPLACE FUNCTION get_homepage_conversion_funnel(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    funnel_step TEXT,
    visitors BIGINT,
    conversion_rate NUMERIC,
    drop_off_rate NUMERIC
) AS $$
DECLARE
    total_visitors BIGINT;
    page_view_visitors BIGINT;
    engagement_visitors BIGINT;
    conversion_visitors BIGINT;
BEGIN
    -- Get funnel metrics
    SELECT COUNT(DISTINCT session_id) INTO total_visitors
    FROM homepage_visits
    WHERE DATE(visited_at) >= p_start_date
        AND DATE(visited_at) <= p_end_date;
    
    SELECT COUNT(DISTINCT session_id) INTO page_view_visitors
    FROM homepage_visits
    WHERE DATE(visited_at) >= p_start_date
        AND DATE(visited_at) <= p_end_date
        AND page_views > 1;
    
    SELECT COUNT(DISTINCT session_id) INTO engagement_visitors
    FROM homepage_visits
    WHERE DATE(visited_at) >= p_start_date
        AND DATE(visited_at) <= p_end_date
        AND duration_seconds > 30;
    
    SELECT COUNT(DISTINCT session_id) INTO conversion_visitors
    FROM homepage_visits
    WHERE DATE(visited_at) >= p_start_date
        AND DATE(visited_at) <= p_end_date
        AND conversion_goal IS NOT NULL;
    
    -- Return funnel data
    RETURN QUERY
    SELECT 
        'Visitas'::TEXT as funnel_step,
        total_visitors as visitors,
        CASE WHEN total_visitors > 0 THEN (total_visitors::NUMERIC / total_visitors::NUMERIC * 100) ELSE 0 END as conversion_rate,
        0::NUMERIC as drop_off_rate
    UNION ALL
    SELECT 
        'Múltiplas Páginas'::TEXT as funnel_step,
        page_view_visitors as visitors,
        CASE WHEN total_visitors > 0 THEN (page_view_visitors::NUMERIC / total_visitors::NUMERIC * 100) ELSE 0 END as conversion_rate,
        CASE WHEN total_visitors > 0 THEN ((total_visitors - page_view_visitors)::NUMERIC / total_visitors::NUMERIC * 100) ELSE 0 END as drop_off_rate
    UNION ALL
    SELECT 
        'Engajamento'::TEXT as funnel_step,
        engagement_visitors as visitors,
        CASE WHEN total_visitors > 0 THEN (engagement_visitors::NUMERIC / total_visitors::NUMERIC * 100) ELSE 0 END as conversion_rate,
        CASE WHEN total_visitors > 0 THEN ((total_visitors - engagement_visitors)::NUMERIC / total_visitors::NUMERIC * 100) ELSE 0 END as drop_off_rate
    UNION ALL
    SELECT 
        'Conversões'::TEXT as funnel_step,
        conversion_visitors as visitors,
        CASE WHEN total_visitors > 0 THEN (conversion_visitors::NUMERIC / total_visitors::NUMERIC * 100) ELSE 0 END as conversion_rate,
        CASE WHEN total_visitors > 0 THEN ((total_visitors - conversion_visitors)::NUMERIC / total_visitors::NUMERIC * 100) ELSE 0 END as drop_off_rate;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 4: SETUP ROW LEVEL SECURITY (CORRIGIDO)
-- ============================================

-- Enable RLS
ALTER TABLE homepage_visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Admins can view homepage analytics" ON homepage_visits;
CREATE POLICY "Admins can view homepage analytics" ON homepage_visits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                'admin@zagnfc.com.br',
                'contato@zagnfc.com.br'
            )
        )
    );

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Allow homepage analytics data insertion" ON homepage_visits;
CREATE POLICY "Allow homepage analytics data insertion" ON homepage_visits
    FOR INSERT WITH CHECK (true);

-- ============================================
-- STEP 5: GRANT PERMISSIONS (CORRIGIDO)
-- ============================================

-- Grant permissions (ignore if already granted)
DO $$
BEGIN
    -- Grant table permissions
    BEGIN
        GRANT SELECT ON homepage_visits TO authenticated;
    EXCEPTION WHEN duplicate_object THEN
        -- Permission already exists, ignore
    END;
    
    BEGIN
        GRANT INSERT ON homepage_visits TO anon;
    EXCEPTION WHEN duplicate_object THEN
        -- Permission already exists, ignore
    END;
    
    -- Grant function permissions
    BEGIN
        GRANT EXECUTE ON FUNCTION get_homepage_traffic_sources(DATE, DATE) TO authenticated;
    EXCEPTION WHEN duplicate_object THEN
        -- Permission already exists, ignore
    END;
    
    BEGIN
        GRANT EXECUTE ON FUNCTION get_homepage_utm_performance(DATE, DATE) TO authenticated;
    EXCEPTION WHEN duplicate_object THEN
        -- Permission already exists, ignore
    END;
    
    BEGIN
        GRANT EXECUTE ON FUNCTION get_homepage_daily_performance(DATE, DATE) TO authenticated;
    EXCEPTION WHEN duplicate_object THEN
        -- Permission already exists, ignore
    END;
    
    BEGIN
        GRANT EXECUTE ON FUNCTION get_homepage_conversion_funnel(DATE, DATE) TO authenticated;
    EXCEPTION WHEN duplicate_object THEN
        -- Permission already exists, ignore
    END;
END $$;

-- ============================================
-- STEP 6: VERIFICATION
-- ============================================

DO $$
DECLARE
    table_exists BOOLEAN;
    function_exists BOOLEAN;
    policy_exists BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'homepage_visits' AND table_schema = 'public'
    ) INTO table_exists;
    
    -- Check if function exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_homepage_traffic_sources' AND routine_schema = 'public'
    ) INTO function_exists;
    
    -- Check if policy exists
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'homepage_visits' AND policyname = 'Admins can view homepage analytics'
    ) INTO policy_exists;
    
    -- Report results
    IF table_exists THEN
        RAISE NOTICE '✅ Table homepage_visits exists';
    ELSE
        RAISE EXCEPTION '❌ Table homepage_visits was not created';
    END IF;
    
    IF function_exists THEN
        RAISE NOTICE '✅ Function get_homepage_traffic_sources exists';
    ELSE
        RAISE EXCEPTION '❌ Function get_homepage_traffic_sources was not created';
    END IF;
    
    IF policy_exists THEN
        RAISE NOTICE '✅ Policy "Admins can view homepage analytics" exists';
    ELSE
        RAISE WARNING '⚠️ Policy "Admins can view homepage analytics" was not created';
    END IF;
    
    RAISE NOTICE '🎉 Homepage analytics system setup completed successfully!';
    RAISE NOTICE '📊 You can now track homepage performance and paid traffic.';
    RAISE NOTICE '💰 Perfect for evaluating paid campaigns and making data-driven decisions.';
    RAISE NOTICE '🔒 Access restricted to administrators only.';
END $$;
