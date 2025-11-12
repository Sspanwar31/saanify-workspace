import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, AuthenticatedRequest } from '@/lib/auth-middleware'
import SupabaseService, { SupabaseConfig } from '@/lib/supabase-service'
import { db } from '@/lib/db'

interface AutomationLog {
  task_name: string
  status: string
  duration_ms: number
  details?: string
  error?: string
}

async function logAutomation(taskName: string, status: string, durationMs: number, details?: string, error?: string) {
  try {
    await db.automationLog.create({
      data: {
        task_name: taskName,
        status,
        duration_ms: durationMs,
        details,
        error,
        run_time: new Date()
      }
    })
  } catch (logError) {
    console.log('Automation log:', { taskName, status, durationMs, details, error })
    console.warn('Failed to log to database (table may not exist):', logError)
  }
}

const DEFAULT_TABLES = [
  {
    name: 'users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'CLIENT',
        society_account_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `
  },
  {
    name: 'admins',
    sql: `
      CREATE TABLE IF NOT EXISTS admins (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        permissions JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
    `
  },
  {
    name: 'clients',
    sql: `
      CREATE TABLE IF NOT EXISTS clients (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        society_name TEXT,
        address TEXT,
        phone TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
      CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
    `
  },
    {
    name: 'automation_logs',
    sql: `
      CREATE TABLE IF NOT EXISTS automation_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        task_name TEXT NOT NULL,
        status TEXT NOT NULL,
        duration_ms INTEGER,
        details TEXT,
        error TEXT,
        run_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_automation_logs_task_name ON automation_logs(task_name);
      CREATE INDEX IF NOT EXISTS idx_automation_logs_status ON automation_logs(status);
      CREATE INDEX IF NOT EXISTS idx_automation_logs_run_time ON automation_logs(run_time);
    `
  }
]

export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  const startTime = Date.now()
  const logData: AutomationLog = {
    task_name: 'Schema Sync',
    status: 'running',
    duration_ms: 0
  }

  try {
    const supabaseService = SupabaseService.getInstance()
    const config = await supabaseService.getConfig()
    
    if (!config) {
      const error = 'Supabase configuration not found in secrets'
      await logAutomation('Schema Sync', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'Schema Sync',
        status: 'failed'
      }, { status: 500 })
    }

    const client = await supabaseService.getClient()
    if (!client) {
      const error = 'Failed to create Supabase client'
      await logAutomation('Schema Sync', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'Schema Sync',
        status: 'failed'
      }, { status: 500 })
    }

    const createdTables = []
    const errors = []
    const tableStatus: { [key: string]: string } = {}

    // Check and create each table
    for (const table of DEFAULT_TABLES) {
      try {
        console.log(`🔍 Creating table: ${table.name}`)
        
        // Try to create table using PostgreSQL function first
        const { error: sqlError } = await client.rpc('exec_sql', { 
          sql_query: table.sql 
        })
        
        if (sqlError) {
          console.warn(`⚠️ PostgreSQL function failed for ${table.name}: ${sqlError.message}`)
          
          // Fallback: Try using raw SQL
          const { error: rawError } = await client
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .single()
          
          const tableExists = existingTables?.some(t => t.table_name === table.name)
          
          if (!tableExists) {
            console.log(`📝 Creating table with raw SQL: ${table.name}`)
            
            // Create table using raw SQL
            const { error: createError } = await client.rpc('exec_sql', { 
              sql_query: table.sql 
            })
            
            if (createError) {
              console.error(`❌ Failed to create table ${table.name}: ${createError.message}`)
              errors.push(`${table.name}: ${createError.message}`)
            } else {
              console.log(`✅ Successfully created table: ${table.name}`)
              createdTables.push(table.name)
              tableStatus[table.name] = 'created'
            }
          } else {
            console.log(`✅ Table already exists: ${table.name}`)
            createdTables.push(table.name)
            tableStatus[table.name] = 'verified'
          }
        } else {
          console.log(`✅ Successfully created table with function: ${table.name}`)
          createdTables.push(table.name)
          tableStatus[table.name] = 'created'
        }
        
      } catch (error) {
        console.error(`💥 Error creating table ${table.name}:`, error)
        errors.push(`${table.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        tableStatus[table.name] = 'failed'
      }
    }

    const duration = Date.now() - startTime
    const finalStatus = errors.length === 0 ? 'completed' : 'completed_with_errors'
    const details = `Created/verified tables: ${createdTables.join(', ')}${errors.length > 0 ? `. Errors: ${errors.join('; ')}` : ''}`
    
    await logAutomation('Schema Sync', finalStatus, duration, details)

    return NextResponse.json({
      success: true,
      task: 'Schema Sync',
      status: finalStatus,
      duration: `${(duration / 1000).toFixed(1)}s`,
      details,
      created_tables: createdTables,
      errors: errors.length > 0 ? errors : undefined,
      table_status: tableStatus,
      result: {
        success: true,
        task: 'Schema Sync',
        status: finalStatus,
        duration: `${(duration / 1000).toFixed(1)}s`,
        details,
        created_tables: createdTables,
        errors: errors.length > 0 ? errors : undefined,
        table_status: tableStatus,
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    
    await logAutomation('Schema Sync', 'failed', duration, undefined, errorMsg)
    
    return NextResponse.json({
      success: false,
      error: errorMsg,
      task: 'Schema Sync',
      status: 'failed',
      duration: `${(duration / 1000).toFixed(1)}s`
    }, { status: 500 })
  }
})