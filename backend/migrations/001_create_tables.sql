-- ========================================================
-- NeedBridge AI - PostgreSQL Migration 001: Initial Schema
-- ========================================================

-- Drop tables in reverse dependency order if resetting
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS aid_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('beneficiary', 'donor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. AID_REQUESTS TABLE
CREATE TABLE aid_requests (
    id SERIAL PRIMARY KEY,
    beneficiary_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    beneficiaries_count INTEGER NOT NULL CHECK (beneficiaries_count > 0),
    location VARCHAR(255) NOT NULL,
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
    estimated_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    funds_raised NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for aid_requests
CREATE INDEX idx_aid_requests_beneficiary ON aid_requests(beneficiary_id);
CREATE INDEX idx_aid_requests_status ON aid_requests(status);
CREATE INDEX idx_aid_requests_category ON aid_requests(category);
CREATE INDEX idx_aid_requests_urgency ON aid_requests(urgency);
CREATE INDEX idx_aid_requests_created_at ON aid_requests(created_at DESC);

-- 3. DONATIONS TABLE
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id INTEGER NOT NULL REFERENCES aid_requests(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    payment_provider VARCHAR(100) NOT NULL DEFAULT 'paypal_mock_sandbox',
    paypal_order_id VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for donations
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_request ON donations(request_id);
CREATE INDEX idx_donations_status ON donations(payment_status);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);

-- Automatic timestamp updater function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_aid_requests_updated_at
BEFORE UPDATE ON aid_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

