-- Migration: 001_initial_schema.sql
-- TODO: Convert Prisma schema to Supabase SQL
-- This is a scaffold file - replace with actual Supabase migration

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'SUPER_ADMIN')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    society_account_id TEXT REFERENCES society_accounts(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Society accounts table
CREATE TABLE IF NOT EXISTS society_accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    admin_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    subscription_plan TEXT DEFAULT 'TRIAL' CHECK (subscription_plan IN ('TRIAL', 'BASIC', 'PRO', 'ENTERPRISE')),
    status TEXT DEFAULT 'TRIAL' CHECK (status IN ('TRIAL', 'ACTIVE', 'EXPIRED', 'LOCKED')),
    trial_ends_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Societies table
CREATE TABLE IF NOT EXISTS societies (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    society_account_id TEXT REFERENCES society_accounts(id) NOT NULL,
    created_by_user_id TEXT REFERENCES users(id) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table (if needed)
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    published BOOLEAN DEFAULT false,
    author_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_society_accounts_email ON society_accounts(email);
CREATE INDEX IF NOT EXISTS idx_societies_society_account_id ON societies(society_account_id);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE society_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- TODO: Add RLS policies based on your business logic
-- Example: Users can only see their own data
-- CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id);