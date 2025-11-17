import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const setupKey = body.setup_key;

    // DEBUG LOG (temporary)
    console.log("Received setup_key:", setupKey);
    console.log("Env SETUP_KEY:", process.env.SETUP_KEY);

    if (!process.env.SETUP_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "ENV ERROR: process.env.SETUP_KEY is EMPTY in Vercel",
        },
        { status: 500 }
      );
    }

    if (setupKey !== process.env.SETUP_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid setup_key",
          received: setupKey,
          expected: process.env.SETUP_KEY, // DEBUG ONLY
        },
        { status: 401 }
      );
    }

    // ------------------------------------------
    // FUNCTION + TABLE CREATION
    // ------------------------------------------
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

    await db.$executeRawUnsafe(`select public.create_missing_tables();`);

    await db.automation_settings.upsert({
      where: { key: "automation_enabled" },
      update: {},
      create: { key: "automation_enabled", value: { enabled: true } }
    });

    return NextResponse.json({
      success: true,
      message: "Supabase automation initialized successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
