import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { setup_key } = body

    // Verify setup key if provided
    if (process.env.SETUP_MODE === 'true' && process.env.SETUP_KEY) {
      if (!setup_key || setup_key !== process.env.SETUP_KEY) {
        return NextResponse.json({ 
          error: 'Invalid setup key',
          message: 'A valid setup key is required for initialization'
        }, { status: 403 })
      }
    }

    const supabase = getServiceClient()
    const jobId = crypto.randomUUID()

    // Insert initialization log entry
    const { data: logEntry, error: logError } = await supabase
      .from('automation_logs')
      .insert({
        id: jobId,
        task_name: 'initialize',
        status: 'running',
        message: 'System initialization started',
        details: { 
          setup_mode: process.env.SETUP_MODE,
          initiated_at: new Date().toISOString()
        }
      })
      .select()
      .single()

    // If logs table doesn't exist yet, continue anyway
    if (logError && !logError.message.includes('relation "automation_logs" does not exist')) {
      console.error('Error creating log entry:', logError)
    }

    let initResult = null
    let initError = null

    try {
      const initSteps = []

      // Step 1: Create missing tables
      try {
        const { data: tablesResult, error: tablesError } = await supabase.rpc('create_missing_tables')
        
        if (tablesError) {
          throw new Error(`Table creation failed: ${tablesError.message}`)
        }

        initSteps.push({
          step: 'create_tables',
          status: 'success',
          result: tablesResult
        })

      } catch (error) {
        initSteps.push({
          step: 'create_tables',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error
      }

      // Step 2: Validate database
      try {
        const { data: validationResult, error: validationError } = await supabase.rpc('validate_db')
        
        if (validationError) {
          throw new Error(`Database validation failed: ${validationError.message}`)
        }

        initSteps.push({
          step: 'validate_database',
          status: 'success',
          result: validationResult
        })

      } catch (error) {
        initSteps.push({
          step: 'validate_database',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      // Step 3: Create default SUPERADMIN if in setup mode
      if (process.env.SETUP_MODE === 'true' && process.env.SETUP_ADMIN_EMAIL && process.env.SETUP_ADMIN_PASSWORD) {
        try {
          // Check if admin user already exists
          const { data: existingAdmin, error: checkError } = await supabase
            .from('users')
            .select('id, email, role')
            .eq('email', process.env.SETUP_ADMIN_EMAIL)
            .single()

          if (!checkError && existingAdmin) {
            initSteps.push({
              step: 'create_admin',
              status: 'skipped',
              message: 'Admin user already exists'
            })
          } else {
            // Create admin user using auth API
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: process.env.SETUP_ADMIN_EMAIL,
              password: process.env.SETUP_ADMIN_PASSWORD,
              email_confirm: true,
              user_metadata: {
                role: 'SUPERADMIN',
                created_by: 'system_initialization'
              }
            })

            if (authError) {
              throw new Error(`Admin creation failed: ${authError.message}`)
            }

            // Create user record in users table
            const { data: userData, error: userError } = await supabase
              .from('users')
              .insert({
                id: authData.user.id,
                email: process.env.SETUP_ADMIN_EMAIL,
                name: 'System Administrator',
                role: 'SUPERADMIN'
              })
              .select()
              .single()

            if (userError) {
              throw new Error(`User record creation failed: ${userError.message}`)
            }

            initSteps.push({
              step: 'create_admin',
              status: 'success',
              result: {
                user_id: authData.user.id,
                email: process.env.SETUP_ADMIN_EMAIL
              }
            })
          }
        } catch (error) {
          initSteps.push({
            step: 'create_admin',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      // Step 4: Create default automation tasks
      try {
        const defaultTasks = [
          { task_name: 'schema_sync', schedule: '0 2 * * *', enabled: true },
          { task_name: 'auto_sync_data', schedule: '*/30 * * * *', enabled: true },
          { task_name: 'backup', schedule: '0 3 * * *', enabled: true },
          { task_name: 'health_check', schedule: '*/15 * * * *', enabled: true }
        ]

        for (const task of defaultTasks) {
          await supabase
            .from('automation_tasks')
            .upsert(task, { onConflict: 'task_name' })
        }

        initSteps.push({
          step: 'create_default_tasks',
          status: 'success',
          result: { tasks_created: defaultTasks.length }
        })

      } catch (error) {
        initSteps.push({
          step: 'create_default_tasks',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      initResult = {
        initialization_completed: true,
        steps: initSteps,
        setup_mode: process.env.SETUP_MODE,
        timestamp: new Date().toISOString()
      }

      // Update log entry with success
      try {
        await supabase
          .from('automation_logs')
          .update({
            status: 'success',
            message: 'System initialization completed successfully',
            details: { 
              init_result: initResult,
              completed_at: new Date().toISOString()
            }
          })
          .eq('id', jobId)
      } catch (logUpdateError) {
        console.error('Failed to update log entry:', logUpdateError)
      }

    } catch (error) {
      initError = error
      console.error('Initialization failed:', error)

      // Update log entry with failure
      try {
        await supabase
          .from('automation_logs')
          .update({
            status: 'failed',
            message: `System initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: { 
              error: error instanceof Error ? error.message : 'Unknown error',
              failed_at: new Date().toISOString()
            }
          })
          .eq('id', jobId)
      } catch (logUpdateError) {
        console.error('Failed to update log entry:', logUpdateError)
      }
    }

    return NextResponse.json({
      success: !initError,
      job_id: jobId,
      message: initError 
        ? `Initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`
        : 'System initialization completed successfully',
      result: initResult,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Initialize API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}