import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const setupKey = body.setup_key;

    if (setupKey !== process.env.AUTOMATION_SETUP_KEY) {
      return NextResponse.json(
        { success: false, message: "Invalid setup_key" },
        { status: 401 }
      );
    }

    // ----------------------------
    // 1️⃣ CREATE FUNCTION IF MISSING
    // ----------------------------
    await db.$executeRawUnsafe(`
      create or replace function public.create_missing_tables()
      returns void
      language plpgsql
      as $$
      begin
        create table if not exists public.automation_logs (
            id uuid primary key default gen_random_uuid(),
            job_id text,
            status text,
            step text,
            error text,
            created_at timestamptz default now()
        );

        create table if not exists public.automation_settings (
            id uuid primary key default gen_random_uuid(),
            key text unique,
            value jsonb,
            created_at timestamptz default now()
        );
      end
      $$;
    `);

    // ----------------------------
    // 2️⃣ CALL FUNCTION (CREATES TABLES)
    // ----------------------------
    await db.$executeRawUnsafe(`select public.create_missing_tables();`);

    // ----------------------------
    // 3️⃣ INSERT DEFAULT SETTINGS IF MISSING
    // ----------------------------
    await db.automation_settings.upsert({
      where: { key: "automation_enabled" },
      update: {},
      create: { key: "automation_enabled", value: { enabled: true } }
    });

    // ----------------------------
    // 4️⃣ DONE — RETURN SUCCESS
    // ----------------------------
    return NextResponse.json({
      success: true,
      message: "Supabase automation initialized successfully",
      steps: [
        { step: "function_created_or_verified", status: "done" },
        { step: "tables_created_or_verified", status: "done" },
        { step: "default_settings_added", status: "done" }
      ]
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
