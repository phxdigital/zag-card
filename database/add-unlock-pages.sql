-- Adds unlock_pages to products and seeds default values for key kits

ALTER TABLE products
ADD COLUMN IF NOT EXISTS unlock_pages INTEGER DEFAULT 1;

-- Seed defaults for known kit slugs if they exist
UPDATE products SET unlock_pages = 1 WHERE slug = 'kit-para-mim' AND (unlock_pages IS NULL OR unlock_pages = 0);
UPDATE products SET unlock_pages = 2 WHERE slug = 'kit-para-equipe' AND (unlock_pages IS NULL OR unlock_pages = 0);
UPDATE products SET unlock_pages = 8 WHERE slug = 'kit-para-negocio' AND (unlock_pages IS NULL OR unlock_pages = 0);

-- Ensure updated_at is refreshed
UPDATE products SET updated_at = NOW() WHERE slug IN ('kit-para-mim','kit-para-equipe','kit-para-negocio');


