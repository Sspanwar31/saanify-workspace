import { NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const { supabaseUrl, serviceRoleKey } = await request.json();

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase URL and Service Role Key are required'
      });
    }

    // Validate URL format
    if (!supabaseUrl.includes('supabase.co')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Supabase URL format'
      });
    }

    // Validate service role key format
    if (!serviceRoleKey.startsWith('eyJ')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Service Role Key format'
      });
    }

    // Update .env.local file
    const envPath = join(process.cwd(), '.env.local');
    let envContent = '';

    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf8');
    }

    // Update or add environment variables
    const lines = envContent.split('\n');
    const updatedLines = lines.map(line => {
      if (line.startsWith('SUPABASE_URL=')) {
        return `SUPABASE_URL=${supabaseUrl}`;
      }
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        return `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`;
      }
      if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        return `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`;
      }
      return line;
    });

    // Add variables if they don't exist
    if (!updatedLines.some(line => line.startsWith('SUPABASE_URL='))) {
      updatedLines.push(`SUPABASE_URL=${supabaseUrl}`);
    }
    if (!updatedLines.some(line => line.startsWith('NEXT_PUBLIC_SUPABASE_URL='))) {
      updatedLines.push(`NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`);
    }
    if (!updatedLines.some(line => line.startsWith('SUPABASE_SERVICE_ROLE_KEY='))) {
      updatedLines.push(`SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`);
    }

    // Write back to .env.local
    writeFileSync(envPath, updatedLines.join('\n'));

    // Update process.env for current request
    process.env.SUPABASE_URL = supabaseUrl;
    process.env.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey;

    return NextResponse.json({
      success: true,
      message: 'Supabase configuration saved successfully',
      config: {
        url: supabaseUrl.replace(/(https:\/\/[^.]+).*/, '$1.***.***.co'),
        hasServiceRole: true
      }
    });

  } catch (error: any) {
    console.error('Configuration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save configuration: ' + error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Supabase Configuration API',
    usage: 'POST /api/supabase/configure to update Supabase settings',
    security: 'Service role keys are handled server-side only'
  });
}