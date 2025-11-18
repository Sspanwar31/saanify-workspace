import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // --- 1. सुरक्षा जांच (यह आपका पुराना कोड है, जो बिल्कुल सही है) ---
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

    // --- 2. [अपडेट किया हुआ] FUNCTION + TABLE CREATION ---
    // हमने फंक्शन का नाम बदल दिया है और इसके अंदर 4 टेबल बनाने का लॉजिक डाल दिया है।
    console.log("Initializing database with 4 core tables...");
    await db.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.create_perfect_initial_schema()
      RETURNS VOID
      LANGUAGE plpgsql
      AS $$
      BEGIN
        
        -- TABLE 1: PROFILES (सभी यूजर्स के लिए, Supabase Auth से लिंक)
        CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'member', -- भविष्य में रोल यहाँ स्टोर होगा
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- TABLE 2: AUTOMATION TASKS (SuperAdmin UI में टास्क की लिस्ट दिखाने के लिए)
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

        -- TABLE 3: AUTOMATION LOGS (हर टास्क के चलने का रिजल्ट रिकॉर्ड करने के लिए)
        CREATE TABLE IF NOT EXISTS public.automation_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            task_name TEXT,
            status TEXT NOT NULL, -- 'success', 'failed', 'running'
            message TEXT,
            details JSONB,
            duration_ms INTEGER,
            run_time TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- TABLE 4: AUTOMATION SETTINGS (सिस्टम की सेटिंग्स के लिए, जैसे 'setup_mode')
        CREATE TABLE IF NOT EXISTS public.automation_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            key TEXT UNIQUE NOT NULL, 
            value JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

      END;
      $$;
    `);

    // --- 3. [अपडेट किया हुआ] फंक्शन को चलाना ---
    await db.$executeRawUnsafe(`SELECT public.create_perfect_initial_schema();`);
    console.log("Core tables created successfully.");

    // --- 4. [नया और महत्वपूर्ण] AUTOMATION TASKS टेबल को डेटा से भरना ---
    // यह आपके UI को तुरंत सही डेटा दिखाएगा।
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
    
    // --- 5. [अपडेट किया हुआ] एक प्रारंभिक सेटिंग डालना ---
   await db.automationSetting.upsert({
  where: { key: "system_initialized" },
  update: { value: { status: true, date: new Date().toISOString() } },
  create: { key: "system_initialized", value: { status: true, date: new Date().toISOString() } },
});  
  console.log("Initial settings and tasks are populated.");

    // --- 6. अंतिम सफल प्रतिक्रिया ---
    return NextResponse.json({
      success: true,
      message: "Database initialized with core tables and default tasks. Ready for SuperAdmin setup.",
    });

  } catch (err: any) {
    console.error("INITIALIZATION FAILED:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
