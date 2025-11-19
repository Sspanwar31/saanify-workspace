import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs"; // ✅ हम Password यहाँ Hash करेंगे ताकि Login में दिक्कत न आए

// Helper: SQL चलाने के लिए
async function runSql(sql: string) {
  try {
    await db.$executeRawUnsafe(sql);
  } catch (e) {
    console.error("runSql failed:", e);
  }
}

// Helper: Column Auto-repair
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
    const { setupKey, superadminEmail, superadminPassword } = body;

    // --- SECURITY CHECK ---
    if (!process.env.SETUP_KEY) {
      return NextResponse.json({ success: false, message: "ENV ERROR: SETUP_KEY missing" }, { status: 500 });
    }
    if (setupKey !== process.env.SETUP_KEY) {
      return NextResponse.json({ success: false, message: "Invalid Setup Key" }, { status: 401 });
    }

    const adminEmail = superadminEmail || "testadmin1@gmail.com";
    const rawPassword = superadminPassword || "admin123_password";

    // ✅ FIX 1: Password को bcryptjs से Hash करें (ताकि Login API इसे पढ़ सके)
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    console.log("Setup Started...");

    // --- STEP 1: Enable Extensions ---
    await runSql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    await runSql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // --- STEP 2: Create Schema Function ---
    await runSql(`
      CREATE OR REPLACE FUNCTION public.create_perfect_initial_schema()
      RETURNS VOID LANGUAGE plpgsql AS $$
      BEGIN
        
        -- A. USERS TABLE
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

        -- B. NEXTAUTH TABLES
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

        CREATE TABLE IF NOT EXISTS public.sessions (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          "sessionToken" TEXT UNIQUE NOT NULL,
          "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          expires TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS public.verification_tokens (
            identifier TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires TIMESTAMPTZ NOT NULL,
            CONSTRAINT verification_tokens_identifier_token_key UNIQUE (identifier, token)
        );

        -- C. SOCIETY ACCOUNTS
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

        -- D. AUTOMATION TABLES
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
          duration_ms INTEGER,
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

    // Run Schema Creation
    await runSql(`SELECT public.create_perfect_initial_schema();`);

    // --- STEP 3: Auto-Repair ---
    await ensureColumn("public.users", "role", "text DEFAULT 'CLIENT'");
    await ensureColumn("public.users", "societyAccountId", "text");
    await
