import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase-service'

export async function POST(request: NextRequest) {
  try {
    // ---------------------------------------------
    // SECURITY LAYER #1 — Allow only POST
    // ---------------------------------------------
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method Not Allowed' },
        { status: 405 }
      );
    }

    const body = await request.json()
    const { setup_key } = body

    // ---------------------------------------------
    // SECURITY LAYER #2 — Validate Setup Key Strictly
    // ---------------------------------------------
    if (process.env.SETUP_MODE === 'true') {
      if (!process.env.SETUP_KEY) {
        return NextResponse.json(
          { error: 'Setup key missing in server config' },
          { status: 500 }
        );
      }

      if (!setup_key || setup_key !== process.env.SETUP_KEY) {
        return NextResponse.json(
          { 
            error: 'Invalid setup key',
            message: 'You are not authorized to initialize the system'
          },
          { status: 403 }
        )
      }
    }

    // ---------------------------------------------
    // SAFETY: Disable endpoint when setup_mode = false
    // ---------------------------------------------
    if (process.env.SETUP_MODE !== 'true') {
      return NextResponse.json(
        { error: 'System initialization is disabled' },
        { status: 403 }
      );
    }

    const supabase = getServiceClient()
    const jobId = crypto.randomUUID()

    // ---------------------------------------------
    // Create initialization log
    // ---------------------------------------------
    const { error: logError } = await supabase
      .from('automation_logs')
      .insert({
        id: jobId,
        task_name: 'initialize',
        status: 'running',
        message: 'System initialization started',
        details: { setup_mode: process.env.SETUP_MODE }
      })

    if (logError && !logError.message.includes('automation_logs')) {
      console.error('Log creation failed:', logError)
    }

    let initError = null
    const steps: any[] = []

    try {
      // -------------------------------------------------
      // Step 1: Create missing tables
      // -------------------------------------------------
      try {
        const { data, error } = await supabase.rpc('create_missing_tables')
        if (error) throw new Error(error.message)

        steps.push({ step: 'create_tables', status: 'success', result: data })
      } catch (err: any) {
        steps.push({ step: 'create_tables', status: 'error', error: err.message })
        throw err
      }

      // -------------------------------------------------
      // Step 2: Validate Schema
      // -------------------------------------------------
      try {
        const { data, error } = await supabase.rpc('validate_db')
        if (error) throw new Error(error.message)

        steps.push({ step: 'validate_database', status: 'success', result: data })
      } catch (err: any) {
        steps.push({ step: 'validate_database', status: 'error', error: err.message })
      }

      // -------------------------------------------------
      // Step 3: Create Default SUPERADMIN user
      // -------------------------------------------------
      if (
        process.env.SETUP_ADMIN_EMAIL &&
        process.env.SETUP_ADMIN_PASSWORD
      ) {
        try {
          const { data: existing, error: existsErr } = await supabase
            .from('users')
            .select('id')
            .eq('email', process.env.SETUP_ADMIN_EMAIL)
            .single()

          if (!existsErr && existing) {
            steps.push({
              step: 'create_admin',
              status: 'skipped',
              message: 'Admin user already exists'
            })
          } else {
            const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
              email: process.env.SETUP_ADMIN_EMAIL,
              password: process.env.SETUP_ADMIN_PASSWORD,
              email_confirm: true,
              user_metadata: { role: 'SUPERADMIN' }
            })

            if (authErr) throw new Error(authErr.message)

            await supabase.from('users').insert({
              id: authData.user.id,
              email: process.env.SETUP_ADMIN_EMAIL,
              name: 'System Administrator',
              role: 'SUPERADMIN'
            })

            steps.push({
              step: 'create_admin',
              status: 'success',
              result: authData.user.id
            })
          }
        } catch (err: any) {
          steps.push({ step: 'create_admin', status: 'error', error: err.message })
        }
      }

      // -------------------------------------------------
      // Step 4: Insert default automation tasks
      // -------------------------------------------------
      try {
        const defaultTasks = [
          { task_name: 'schema_sync', schedule: '0 2 * * *', enabled: true },
          { task_name: 'auto_sync_data', schedule: '*/30 * * * *', enabled: true },
          { task_name: 'backup', schedule: '0 3 * * *', enabled: true },
          { task_name: 'health_check', schedule: '*/15 * * * *', enabled: true }
        ];

        for (const t of defaultTasks) {
          await supabase.from('automation_tasks').upsert(t, {
            onConflict: 'task_name'
          })
        }

        steps.push({ step: 'default_tasks', status: 'success' })
      } catch (err: any) {
        steps.push({ step: 'default_tasks', status: 'error', error: err.message })
      }

    } catch (error) {
      initError = error
    }

    // -------------------------------------------------
    // Update log (success or failed)
    // -------------------------------------------------
    await supabase
      .from('automation_logs')
      .update({
        status: initError ? 'failed' : 'success',
        details: { steps },
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)

    // -------------------------------------------------
    // Final Response
    // -------------------------------------------------
    return NextResponse.json({
      success: !initError,
      job_id: jobId,
      message: initError ? 'Initialization failed' : 'Initialization successful',
      steps
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
