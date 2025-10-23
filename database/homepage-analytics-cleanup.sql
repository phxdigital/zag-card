-- Homepage Analytics - Cleanup Script
-- Este script remove todos os objetos relacionados ao homepage analytics
-- Use apenas se quiser começar do zero

-- ============================================
-- REMOVER POLICIES
-- ============================================

DROP POLICY IF EXISTS "Admins can view homepage analytics" ON homepage_visits;
DROP POLICY IF EXISTS "Allow homepage analytics data insertion" ON homepage_visits;

-- ============================================
-- REMOVER FUNÇÕES
-- ============================================

DROP FUNCTION IF EXISTS get_homepage_traffic_sources(DATE, DATE);
DROP FUNCTION IF EXISTS get_homepage_utm_performance(DATE, DATE);
DROP FUNCTION IF EXISTS get_homepage_daily_performance(DATE, DATE);
DROP FUNCTION IF EXISTS get_homepage_conversion_funnel(DATE, DATE);

-- ============================================
-- REMOVER TABELA
-- ============================================

DROP TABLE IF EXISTS homepage_visits CASCADE;

-- ============================================
-- CONFIRMAÇÃO
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '🧹 Homepage analytics cleanup completed!';
    RAISE NOTICE '🗑️ All homepage analytics objects have been removed.';
    RAISE NOTICE '📝 You can now run the setup script again.';
END $$;
