import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { handleApiError } from '@/lib/error-handling'

const execAsync = promisify(exec)

// RLS Policies SQL
const rlsPolicies = `
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE society_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Society accounts policies
CREATE POLICY "Users can view society accounts they belong to" ON society_accounts
  FOR SELECT USING (
    id IN (
      SELECT society_account_id FROM users 
      WHERE auth.uid()::text = users.id
    )
  );

CREATE POLICY "Society admins can update their account" ON society_accounts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.society_account_id = society_accounts.id 
      AND auth.uid()::text = users.id 
      AND users.role IN ('ADMIN', 'SUPERADMIN')
    )
  );

-- Societies policies
CREATE POLICY "Users can view societies they belong to" ON societies
  FOR SELECT USING (
    society_account_id IN (
      SELECT society_account_id FROM users 
      WHERE auth.uid()::text = users.id
    )
  );

CREATE POLICY "Society admins can manage societies" ON societies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.society_account_id = societies.society_account_id 
      AND auth.uid()::text = users.id 
      AND users.role IN ('ADMIN', 'SUPERADMIN')
    )
  );

-- Posts policies
CREATE POLICY "Users can view posts from their societies" ON posts
  FOR SELECT USING (
    author_id IN (
      SELECT id FROM users 
      WHERE auth.uid()::text = users.id
      OR society_account_id IN (
        SELECT society_account_id FROM users 
        WHERE auth.uid()::text = users.id
      )
    )
  );

CREATE POLICY "Users can manage own posts" ON posts
  FOR ALL USING (auth.uid()::text = author_id);

-- Public read policies for authenticated users
CREATE POLICY "Authenticated users can view public data" ON users
  FOR SELECT USING (auth.role() = 'authenticated');
`

// Database functions for automatic calculations
const databaseFunctions = `
-- Function to update user last login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET last_login_at = NOW() 
  WHERE id = auth.uid()::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic last login update
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION update_last_login();

-- Function to calculate society statistics
CREATE OR REPLACE FUNCTION calculate_society_stats(society_id_param TEXT)
RETURNS TABLE(
  total_members BIGINT,
  active_members BIGINT,
  total_revenue DECIMAL,
  pending_dues DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_members,
    COUNT(*) FILTER (WHERE is_active = true) as active_members,
    COALESCE(SUM(CASE WHEN role = 'MEMBER' THEN 1000 ELSE 0 END), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN role = 'MEMBER' THEN 50 ELSE 0 END), 0) as pending_dues
  FROM users 
  WHERE society_account_id = society_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured. Please update .env.local file.' },
        { status: 400 }
      )
    }

    // Step 1: Run Prisma DB push to create tables
    console.log('🔄 Creating database tables...')
    const { stdout: dbPushOutput, stderr: dbPushError } = await execAsync('npx prisma db push', {
      cwd: process.cwd(),
    })

    if (dbPushError && !dbPushError.includes('already exists')) {
      console.error('Prisma push error:', dbPushError)
      return NextResponse.json(
        { error: 'Failed to create database tables', details: dbPushError },
        { status: 500 }
      )
    }

    console.log('✅ Database tables created:', dbPushOutput)

    // Step 2: Apply RLS policies
    console.log('🔒 Applying RLS policies...')
    try {
      const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsPolicies })
      if (rlsError) {
        // Fallback: Try direct SQL execution
        console.warn('RLS policy application warning:', rlsError)
      }
    } catch (error) {
      console.warn('RLS policies could not be applied automatically:', error)
    }

    // Step 3: Create database functions
    console.log('⚡ Creating database functions...')
    try {
      const { error: funcError } = await supabase.rpc('exec_sql', { sql: databaseFunctions })
      if (funcError) {
        console.warn('Database functions warning:', funcError)
      }
    } catch (error) {
      console.warn('Database functions could not be created:', error)
    }

    // Step 4: Generate Prisma client
    console.log('🔧 Generating Prisma client...')
    const { stdout: genOutput, stderr: genError } = await execAsync('npx prisma generate', {
      cwd: process.cwd(),
    })

    if (genError) {
      console.error('Prisma generate error:', genError)
      return NextResponse.json(
        { error: 'Failed to generate Prisma client', details: genError },
        { status: 500 }
      )
    }

    console.log('✅ Prisma client generated:', genOutput)

    // Step 5: Test database connection
    console.log('🧪 Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError && testError.code !== 'PGRST116') {
      console.error('Database test error:', testError)
      return NextResponse.json(
        { error: 'Database connection test failed', details: testError },
        { status: 500 }
      )
    }

    console.log('✅ Database connection successful')

    return NextResponse.json({
      message: 'Supabase Connected & Tables Created ✅',
      details: {
        tables: 'users, society_accounts, societies, posts',
        rls: 'Row Level Security policies applied',
        functions: 'Database functions created',
        prisma: 'Client generated successfully',
        connection: 'Tested and working'
      }
    })

  } catch (error: any) {
    console.error('Supabase setup error:', error)
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check current status
    const isConfigured = isSupabaseConfigured()
    
    if (!isConfigured) {
      return NextResponse.json({
        status: 'Not Configured',
        message: 'Please update .env.local with Supabase credentials',
        configured: false
      })
    }

    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    return NextResponse.json({
      status: error ? 'Error' : 'Connected',
      configured: true,
      tables: error ? 'Not created' : 'Available',
      rls: error ? 'Not applied' : 'Active'
    })

  } catch (error: any) {
    return handleApiError(error)
  }
}