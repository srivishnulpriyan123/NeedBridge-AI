-- ========================================================
-- NeedBridge AI - Migration 003: PayPal Integration & Extended Donations
-- ========================================================

-- 1. Update payment_status check constraint to support 'cancelled'
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_payment_status_check;
ALTER TABLE donations ADD CONSTRAINT donations_payment_status_check 
  CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled'));

-- 2. Add currency column (defaults to USD)
ALTER TABLE donations ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'USD';

-- 3. Add paypal_capture_id column for settled capture reference
ALTER TABLE donations ADD COLUMN IF NOT EXISTS paypal_capture_id VARCHAR(150);

-- 4. Add updated_at timestamp column
ALTER TABLE donations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 5. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_donations_paypal_order ON donations(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_donations_paypal_capture ON donations(paypal_capture_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);

