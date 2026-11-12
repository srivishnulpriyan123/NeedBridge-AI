-- ========================================================
-- NeedBridge AI - Migration 002: Supply Catalogue & AI Analyses
-- ========================================================

-- 1. SUPPLIES CATALOGUE TABLE
CREATE TABLE IF NOT EXISTS supplies_catalogue (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    unit VARCHAR(50) NOT NULL DEFAULT 'kit',
    available_quantity INTEGER NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    availability_status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'low_stock', 'out_of_stock')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_catalogue_category ON supplies_catalogue(category);
CREATE INDEX IF NOT EXISTS idx_catalogue_availability ON supplies_catalogue(availability_status);
CREATE INDEX IF NOT EXISTS idx_catalogue_product_name ON supplies_catalogue(product_name);

-- 2. AI ANALYSES TABLE (Audit & Analysis History)
CREATE TABLE IF NOT EXISTS ai_analyses (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES aid_requests(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_request ON ai_analyses(request_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at DESC);

