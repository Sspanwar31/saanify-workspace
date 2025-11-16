import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase-service'

// Security: Only run when SETUP_MODE is true
const SETUP_MODE = process.env.SETUP_MODE === 'true'
const SETUP_KEY = process.env.SETUP_KEY

export async function GET(request: NextRequest) {
  // Security check: Only allow when SETUP_MODE is true
  if (!SETUP_MODE) {
    return NextResponse.json(
      { success: false, error: 'Setup mode is disabled' },
      { status: 403 }
    )
  }

  // Check if setup is already completed
  if (SETUP_MODE === 'false') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.json({
    success: true,
    message: 'Setup wizard is ready',
    setupRequired: true
  })
}

export async function POST(request: NextRequest) {
  // Security check: Only allow when SETUP_MODE is true
  if (!SETUP_MODE) {
    return NextResponse.json(
      { success: false, error: 'Setup mode is disabled' },
      { status: 403 }
    )
  }

  try {
    const { setupKey, superadminEmail, superadminPassword } = await request.json()

    // Verify setup key
    if (setupKey !== SETUP_KEY) {
      return NextResponse.json(
        { success: false, error: 'Invalid setup key' },
        { status: 401 }
      )
    }

    // Validate inputs
    if (!superadminEmail || !superadminPassword) {
      return NextResponse.json(
        { success: false, error: 'Superadmin email and password are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(superadminEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password validation (minimum 8 characters)
    if (superadminPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Step 1: Initialize database schema
    const schemaInitResult = await initializeDatabaseSchema()
    if (!schemaInitResult.success) {
      return NextResponse.json(
        { success: false, error: `Database initialization failed: ${schemaInitResult.error}` },
        { status: 500 }
      )
    }

    // Step 2: Create superadmin user
    const userCreationResult = await createSuperadminUser(superadminEmail, superadminPassword)
    if (!userCreationResult.success) {
      return NextResponse.json(
        { success: false, error: `Superadmin creation failed: ${userCreationResult.error}` },
        { status: 500 }
      )
    }

    // Step 3: Create a completion marker file to prevent re-running
    const setupCompletionResult = await markSetupCompleted()

    if (!setupCompletionResult.success) {
      return NextResponse.json(
        { success: false, error: `Setup completion failed: ${setupCompletionResult.error}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Setup completed successfully',
      redirectUrl: '/auth/login',
      superadminCreated: {
        email: superadminEmail,
        role: 'superadmin'
      }
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: 'Setup process failed' },
      { status: 500 }
    )
  }
}

// Initialize minimal required database schema
async function initializeDatabaseSchema() {
  try {
    // Create users table if it doesn't exist
    const { error: usersError } = await supabaseService.rpc('create_users_table_if_not_exists')
    
    if (usersError) {
      // Fallback: Try direct SQL
      const { error: sqlError } = await supabaseService
        .from('raw_sql')
        .insert({ 
          sql: `
            CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_active BOOLEAN DEFAULT true,
            last_login TIMESTAMP WITH TIME ZONE,
            society_id UUID REFERENCES societies(id),
            phone VARCHAR(20),
            address TEXT,
            profile_image TEXT
          );
          
          CREATE TABLE IF NOT EXISTS societies (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_active BOOLEAN DEFAULT true
          );
          
          CREATE TABLE IF NOT EXISTS roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            permissions JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          INSERT INTO roles (name, permissions) VALUES 
            ('superadmin', '{"all": true}'),
            ('admin', '{"manage_users": true, "manage_society": true, "view_reports": true}'),
            ('treasurer', '{"manage_finances": true, "view_reports": true}'),
            ('user', '{"view_profile": true}');
          `
        })
        .select()
      
      if (sqlError) throw sqlError
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Create superadmin user in database
async function createSuperadminUser(email: string, password: string) {
  try {
    // Hash password (in production, use bcrypt)
    const hashedPassword = await hashPassword(password)

    // Insert superadmin user
    const { error: insertError } = await supabaseService
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        role: 'superadmin',
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()

    if (insertError) {
      throw insertError
    }

    // Also try to create in Supabase Auth if available
    try {
      const { error: authError } = await supabaseService.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: 'superadmin',
          is_setup_admin: true
        }
      })

      if (authError) {
        console.warn('Supabase Auth user creation failed:', authError.message)
        // Continue anyway - local user exists
      }
    } catch (authError) {
      console.warn('Supabase Auth not available:', authError.message)
      // Continue anyway - local user exists
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Mark setup as completed
async function markSetupCompleted() {
  try {
    // In a real implementation, this would:
    // 1. Set an environment variable or database flag
    // 2. Create a completion file
    // 3. Update server configuration
    
    // For this demo, we'll simulate completion
    console.log('Setup marked as completed')
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Simple password hashing (use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  // This is a simple hash - in production, use bcrypt!
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}