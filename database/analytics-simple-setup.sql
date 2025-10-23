-- Analytics System - Simple Setup (Without Materialized View)
-- This script creates the basic analytics system without materialized view

-- ============================================
-- STEP 1: CLEANUP EXISTING OBJECTS
-- ============================================

-- Drop existing functions (if they exist)
DROP FUNCTION IF EXISTS get_daily_visits(BIGINT, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_daily_visits(UUID, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_top_clicked_links(BIGINT, DATE, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_top_clicked_links(UUID, DATE, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_browser_breakdown(BIGINT, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_browser_breakdown(UUID, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_country_breakdown(BIGINT, DATE, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_country_breakdown(UUID, DATE, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS refresh_page_analytics() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_analytics() CASCADE;

-- Drop materialized view (if exists)
DROP MATERIALIZED VIEW IF EXISTS page_analytics CASCADE;

-- Drop table (if exists)
DROP TABLE IF EXISTS page_visits CASCADE;

-- ============================================
-- STEP 2: CREATE TABLE
-- ============================================

CREATE TABLE page_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id BIGINT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    user_agent TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    browser TEXT NOT NULL,
    os TEXT NOT NULL,
    ip_address INET,
    country TEXT,
    city TEXT,
    session_id TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    clicked_links JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- STEP 3: CREATE INDEXES
-- ============================================

CREATE INDEX idx_page_visits_page_id ON page_visits(page_id);
CREATE INDEX idx_page_visits_visited_at ON page_visits(visited_at);
CREATE INDEX idx_page_visits_session_id ON page_visits(session_id);
CREATE INDEX idx_page_visits_page_visited_at ON page_visits(page_id, visited_at);

-- ============================================
-- STEP 4: CREATE FUNCTIONS (NO MATERIALIZED VIEW)
-- ============================================

-- Function to get daily visits for a specific page
CREATE OR REPLACE FUNCTION get_daily_visits(p_page_id BIGINT, p_start_date DATE)
RETURNS TABLE (
    visit_date DATE,
    total_visits BIGINT,
    unique_visitors BIGINT,
    avg_duration NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(pv.visited_at) as visit_date,
        COUNT(*) as total_visits,
        COUNT(DISTINCT pv.session_id) as unique_visitors,
        AVG(pv.duration_seconds) as avg_duration
    FROM page_visits pv
    WHERE pv.page_id = p_page_id
        AND DATE(pv.visited_at) >= p_start_date
    GROUP BY DATE(pv.visited_at)
    ORDER BY visit_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get top clicked links for a page
CREATE OR REPLACE FUNCTION get_top_clicked_links(p_page_id BIGINT, p_start_date DATE, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
    link_id TEXT,
    link_text TEXT,
    total_clicks BIGINT,
    click_rate NUMERIC
) AS $$
DECLARE
    total_visits_count BIGINT;
BEGIN
    -- Get total visits for click rate calculation
    SELECT COUNT(*) INTO total_visits_count
    FROM page_visits
    WHERE page_id = p_page_id
        AND DATE(visited_at) >= p_start_date;
    
    -- Return top clicked links
    RETURN QUERY
    WITH link_clicks AS (
        SELECT 
            jsonb_array_elements(clicked_links) as link_data
        FROM page_visits
        WHERE page_id = p_page_id
            AND DATE(visited_at) >= p_start_date
            AND jsonb_array_length(clicked_links) > 0
    ),
    aggregated_clicks AS (
        SELECT 
            (link_data->>'link_id')::TEXT as link_id,
            (link_data->>'link_text')::TEXT as link_text,
            COUNT(*) as total_clicks
        FROM link_clicks
        GROUP BY link_id, link_text
    )
    SELECT 
        ac.link_id,
        ac.link_text,
        ac.total_clicks,
        CASE 
            WHEN total_visits_count > 0 THEN (ac.total_clicks::NUMERIC / total_visits_count::NUMERIC * 100)
            ELSE 0
        END as click_rate
    FROM aggregated_clicks ac
    ORDER BY ac.total_clicks DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get browser breakdown for a page
CREATE OR REPLACE FUNCTION get_browser_breakdown(p_page_id BIGINT, p_start_date DATE)
RETURNS TABLE (
    browser TEXT,
    visit_count BIGINT,
    percentage NUMERIC
) AS $$
DECLARE
    total_visits_count BIGINT;
BEGIN
    -- Get total visits for percentage calculation
    SELECT COUNT(*) INTO total_visits_count
    FROM page_visits
    WHERE page_id = p_page_id
        AND DATE(visited_at) >= p_start_date;
    
    RETURN QUERY
    SELECT 
        pv.browser,
        COUNT(*) as visit_count,
        CASE 
            WHEN total_visits_count > 0 THEN (COUNT(*)::NUMERIC / total_visits_count::NUMERIC * 100)
            ELSE 0
        END as percentage
    FROM page_visits pv
    WHERE pv.page_id = p_page_id
        AND DATE(pv.visited_at) >= p_start_date
    GROUP BY pv.browser
    ORDER BY visit_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get country breakdown for a page
CREATE OR REPLACE FUNCTION get_country_breakdown(p_page_id BIGINT, p_start_date DATE, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    country TEXT,
    visit_count BIGINT,
    percentage NUMERIC
) AS $$
DECLARE
    total_visits_count BIGINT;
BEGIN
    -- Get total visits for percentage calculation
    SELECT COUNT(*) INTO total_visits_count
    FROM page_visits
    WHERE page_id = p_page_id
        AND DATE(visited_at) >= p_start_date;
    
    RETURN QUERY
    SELECT 
        COALESCE(pv.country, 'Unknown') as country,
        COUNT(*) as visit_count,
        CASE 
            WHEN total_visits_count > 0 THEN (COUNT(*)::NUMERIC / total_visits_count::NUMERIC * 100)
            ELSE 0
        END as percentage
    FROM page_visits pv
    WHERE pv.page_id = p_page_id
        AND DATE(pv.visited_at) >= p_start_date
    GROUP BY COALESCE(pv.country, 'Unknown')
    ORDER BY visit_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old analytics data (for privacy)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
    -- Anonymize IPs older than 90 days
    UPDATE page_visits 
    SET ip_address = NULL 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Truncate user agents older than 30 days (keep only browser/device info)
    UPDATE page_visits 
    SET user_agent = CONCAT(
        CASE WHEN device_type = 'mobile' THEN 'Mobile' ELSE 'Desktop' END,
        ' - ',
        browser
    )
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 5: SETUP ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see analytics for their own pages
CREATE POLICY "Users can view analytics for their own pages" ON page_visits
    FOR SELECT USING (
        page_id IN (
            SELECT id FROM pages WHERE user_id = auth.uid()
        )
    );

-- Policy: Allow system to insert analytics data
CREATE POLICY "Allow analytics data insertion" ON page_visits
    FOR INSERT WITH CHECK (true);

-- ============================================
-- STEP 6: GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON page_visits TO authenticated;
GRANT INSERT ON page_visits TO anon;
GRANT EXECUTE ON FUNCTION get_daily_visits(BIGINT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_clicked_links(BIGINT, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_browser_breakdown(BIGINT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_country_breakdown(BIGINT, DATE, INTEGER) TO authenticated;

-- ============================================
-- STEP 7: VERIFICATION
-- ============================================

DO $$
DECLARE
    table_exists BOOLEAN;
    function_exists BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'page_visits' AND table_schema = 'public'
    ) INTO table_exists;
    
    -- Check if function exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_daily_visits' AND routine_schema = 'public'
    ) INTO function_exists;
    
    -- Report results
    IF table_exists THEN
        RAISE NOTICE '✅ Table page_visits created successfully';
    ELSE
        RAISE EXCEPTION '❌ Table page_visits was not created';
    END IF;
    
    IF function_exists THEN
        RAISE NOTICE '✅ Function get_daily_visits created successfully';
    ELSE
        RAISE EXCEPTION '❌ Function get_daily_visits was not created';
    END IF;
    
    RAISE NOTICE '🎉 Analytics system setup completed successfully!';
    RAISE NOTICE '📊 You can now start collecting analytics data.';
    RAISE NOTICE '💡 Materialized view can be added later for performance optimization.';
END $$;
