import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "missing",
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "present" : "missing",
    service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "present" : "missing"
  });
}
