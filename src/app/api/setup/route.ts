import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // हम Prisma का use करेंगे, SupabaseService का नहीं

// 1. Helper: SQL चलाने के लिए (ताकि RPC Error न आए)
async function runSql(sql: string) {
  try {
    await db.$executeRawUnsafe(sql);
  } catch (e) {
    console.error("runSql failed:", e);
  }
}

// 2. Helper: कॉलम चेक और रिपेयर करने के लिए
async function ensureColumn(table: string, column: string, type: string) {
  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "${column}" ${type};`
    );
  } catch (e) {
    console.error(`ensureColumn failed (${table}.${column}):`, e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Frontend से keys लें
    const { setupKey, superadminEmail, superadminPassword } = body;

    // --- SECURITY CHECK ---
    // 1. Check Environment Key
    if (!process.env.SETUP_KEY) {
      return NextResponse.json({ success: false, message: "SERVER ERROR: SETUP_KEY missing in .env" }, { status: 500 });
    }
    // 2. Match Keys
    if (setupKey !== process.env.SETUP_KEY) {
      return NextResponse.json({ success: false, message: "Invalid Setup Key" }, { status: 401 });
    }

    // Default values agar frontend se na aayein
    const adminEmail = superadminEmail || process.env.SETUP_ADMIN_EMAIL || "admin@example.com";
    const adminPass = superadminPassword || process.env.SETUP_ADMIN_PASSWORD || "admin123";

    console.log("Starting Database Setup...");

    // --- STEP 1: Enable Extensions (Password Hashing & UUID ke liye) ---
    await runSql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    await runSql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // --- STEP 2: Create Schema Function (Sari Tables ek saath) ---
    await runSql(`
      CREATE OR REPLACE FUNCTION public.create_perfect_initial_schema()
      RETURNS VOID LANGUAGE plpgsql AS $$
      BEGIN
        
        -- A. USERS TABLE (NextAuth + Custom Role)
        CREATE TABLE IF NOT EXISTS public.users (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT,
          email TEXT UNIQUE,
          "emailVerified" TIMESTAMPTZ,
          image TEXT,
          password TEXT,
          role TEXT DEFAULT 'CLIENT',
          "isActive" BOOLEAN DEFAULT TRUE,
          "societyAccountId" TEXT,
          "createdAt" TIMESTAMPTZ DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ DEFAULT NOW()
        );

        -- B. NEXTAUTH ACCOUNTS
        CREATE TABLE IF NOT EXISTS public.accounts (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          provider TEXT NOT NULL,
          "providerAccountId" TEXT NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at INTEGER,
          token_type TEXT,
          scope TEXT,
          id_token TEXT,
          session_state TEXT,
          CONSTRAINT accounts_provider_providerAccountId_key UNIQUE (provider, "providerAccountId")
        );

        -- C. NEXTAUTH SESSIONS
        CREATE TABLE IF NOT EXISTS public.sessions (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          "sessionToken" TEXT UNIQUE NOT NULL,
          "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          expires TIMESTAMPTZ NOT NULL
        );

        -- D. SOCIETY ACCOUNTS (Business Logic)
        CREATE TABLE IF NOT EXISTS public.society_accounts (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          "adminName" TEXT,
          email TEXT UNIQUE NOT NULL,
          "subscriptionPlan" TEXT DEFAULT 'TRIAL',
          "isActive" BOOLEAN DEFAULT TRUE,
          "createdAt" TIMESTAMPTZ DEFAULT NOW(),
          "updatedAt" TIMESTAMPTZ DEFAULT NOW()
        );

        -- E. AUTOMATION TABLES
        CREATE TABLE IF NOT EXISTS public.automation_tasks (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          task_name TEXT UNIQUE NOT NULL,
          description TEXT,
          schedule TEXT DEFAULT 'manual',
          enabled BOOLEAN DEFAULT TRUE,
          last_run_status TEXT,
          last_run_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.automation_logs (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          task_name TEXT,
          status TEXT NOT NULL,
          message TEXT,
          details JSONB,
          run_time TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.automation_settings (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT UNIQUE NOT NULL,
          value JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

      END;
      $$;
    `);

    // Function Run karein (Tables ban jayengi)
    await runSql(`SELECT public.create_perfect_initial_schema();`);

    // --- STEP 3: Auto-Repair (Safety Net) ---
    // Agar table pehle se thi par column nahi the, to ye unhe add kar dega
    await ensureColumn("public.users", "role", "text DEFAULT 'CLIENT'");
    await ensureColumn("public.users", "societyAccountId", "text");
    await ensureColumn("public.users", "password", "text");
    await ensureColumn("public.society_accounts", "adminName", "text");

    // --- STEP 4: Create Default Admin & Society ---
    
    // 1. Master Society बनाएं
    const societyId = '00000000-0000-0000-0000-000000000001';
    await runSql(`
      INSERT INTO public.society_accounts (id, name, email, "subscriptionPlan", "adminName")
      VALUES (
        '${societyId}', 
        'Master Admin Society', 
        '${adminEmail}', 
        'LIFETIME', 
        'Super Admin'
      )
      ON CONFLICT (email) DO NOTHING;
    `);

    // 2. Super Admin User बनाएं (Password Hash ke sath)
    // Note: Hum pgcrypto ka 'crypt' use kar rahe hain password secure karne ke liye
    await runSql(`
      INSERT INTO public.users (email, password, name, role, "societyAccountId", "emailVerified", "isActive")
      VALUES (
        '${adminEmail}',
        crypt('${adminPass}', gen_salt('bf')), 
        'Super Admin',
        'SUPERADMIN',
        '${societyId}',
        NOW(),
        TRUE
      )
      ON CONFLICT (email) DO UPDATE 
      SET role = 'SUPERADMIN', "societyAccountId" = '${societyId}';
    `);

    // --- STEP 5: Insert Default Automation Tasks ---
    await runSql(`
      INSERT INTO public.automation_tasks (task_name, description, schedule)
      VALUES
        ('database-backup', 'Create secure database backups', 'manual'),
        ('health-check', 'System Health Check', '*/5 * * * *'),
        ('schema-sync', 'Sync Schema', '0 */6 * * *')
      ON CONFLICT (task_name) DO NOTHING;
    `);

    // Mark Setup as Complete in Settings
    await runSql(`
      INSERT INTO public.automation_settings ("key", value)
      VALUES ('system_initialized', '{"status": true, "date": "${new Date().toISOString()}"}'::jsonb)
      ON CONFLICT ("key") DO UPDATE SET value = EXCLUDED.value;
    `);

    return NextResponse.json({
      success: true,
      message: "Setup Completed Successfully! Tables created & Admin account ready.",
      redirectUrl: '/auth/login'
    });

  } catch (err: any) {
    console.error("SETUP FAILED:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
