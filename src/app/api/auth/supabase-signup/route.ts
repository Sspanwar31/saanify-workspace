import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  userType: z.enum(['client', 'admin'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Supabase signup attempt:', body)
    
    // Validate input
    const validatedData = signupSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Check if user already exists in profiles
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', validatedData.email)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true,
      user_metadata: {
        name: validatedData.name,
        role: validatedData.userType === 'admin' ? 'SUPER_ADMIN' : 'CLIENT'
      }
    })

    if (authError) {
      console.log('Supabase auth error:', authError)
      return NextResponse.json(
        { error: 'Failed to create user: ' + authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      console.log('No user created')
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Profile will be created automatically by the trigger
    // But let's verify it was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      console.log('Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'User created but profile setup failed' },
        { status: 500 }
      )
    }

    // If it's a client, create a demo society account
    if (validatedData.userType === 'client') {
      const { data: societyAccount, error: societyError } = await supabase
        .from('society_accounts')
        .insert([{
          name: `${validatedData.name}'s Society`,
          admin_name: validatedData.name,
          email: validatedData.email,
          subscription_plan: 'TRIAL',
          status: 'TRIAL'
        }])
        .select()
        .single()

      if (!societyError && societyAccount) {
        // Link the society account to the user profile
        await supabase
          .from('profiles')
          .update({ society_account_id: societyAccount.id })
          .eq('id', authData.user.id)
      }
    }

    console.log('User created successfully:', authData.user.id)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Supabase signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}