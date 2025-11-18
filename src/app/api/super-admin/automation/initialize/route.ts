import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // --- 1. Security Check ---
    const body = await req.json();
    const setupKey = body.setup_key;

    if (!process.env.SETUP_KEY) {
      return NextResponse.json(
        { success: false, message: "ENV ERROR: process.env.SETUP_KEY is EMPTY in Vercel" },
        { status: 500 }
      );
    }

    if (setupKey !== process.env.SETUP_KEY) {
      return NextResponse.json(
        { success: false, message: "Invalid setup_key" },
        { status: 401 }
      );
    }

    // --- 2. Create Tables and Functions ---
    console.log("Initializing database with 4 core tables...");
    await db.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.create_perfect_initial_schema()
      RETURNS VOID
      LANGUAGE plpgsql
      AS $$
      BEGIN
        
        -- TABLE 1: PROFILES (For all users, linked to Supabase Auth)
        CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'member',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- TABLE 2: AUTOMATION TASKS (For SuperAdmin UI)
        CREATE TABLE IF NOT EXISTS public.automation_tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            task_name TEXT UNIQUE NOT NULL,
            description TEXT,
            schedule TEXT DEFAULT 'manual',
            enabled BOOLEAN DEFAULT TRUE,
            last_run_status TEXT,
            last_run_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- TABLE 3: AUTOMATION LOGS (For task results)
        CREATE TABLE IF NOT EXISTS public.automation_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            task_name TEXT,
            status TEXT NOT NULL,
            message TEXT,
            details JSONB,
            duration_ms INTEGER,
            run_time TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- TABLE 4: AUTOMATION SETTINGS (For system settings)
        CREATE TABLE IF NOT EXISTS public.automation_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            key TEXT UNIQUE NOT NULL, 
            value JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

      END;
      $$;
    `);

    // --- 3. Run the function ---
    await db.$executeRawUnsafe(`SELECT public.create_perfect_initial_schema();`);
    console.log("Core tables created successfully.");

    // --- 4. Populate the automation_tasks table ---
    console.log("Populating automation_tasks table...");
    await db.$executeRawUnsafe(`
      INSERT INTO public.automation_tasks (task_name, description, schedule) VALUES
      ('database-backup', 'Create secure database backups to Supabase Storage', 'manual'),
      ('database-restore', 'Restore database from backup files', 'manual'),
      ('schema-sync', 'Sync database schema changes automatically', '0 */6 * * *'),
      ('auto-sync', 'Scheduled data synchronization', '0 */2 * * *'),
      ('health-check', 'Monitor system health and Supabase connectivity', '*/5 * * * *')
      ON CONFLICT (task_name) DO NOTHING;
    `);
    
    // --- 5. [FIXED] Insert an initial setting ---
    console.log("Inserting initial system settings...");
    await db.automationSetting.upsert({
      where: { key: "system_initialized" },
      update: { value: { status: true, date: new Date().toISOString() } },
      create: { key: "system_initialized", value: { status: true, date: new Date().toISOString() } },
    });
    
    console.log("Initial settings and tasks are populated.");

    // --- 6. Final success response ---
    return NextResponse.json({
      success: true,
      message: "Database initialized with core tables and default tasks. Ready for SuperAdmin setup.",
    });

  } catch (err: any) {
    console.error("INITIALIZATION FAILED:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
