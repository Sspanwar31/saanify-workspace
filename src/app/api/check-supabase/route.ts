import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    status: "ok",
    url: supabaseUrl ? "FOUND" : "MISSING",
    anon: anon ? "FOUND" : "MISSING",
    service: service ? "FOUND" : "MISSING",
    envMode: process.env.NODE_ENV,
  });
}
