// src/app/api/debug-prisma/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // आपके Prisma Client का इम्पोर्ट

export async function GET() {
  try {
    // हम Prisma Client ('db') के अंदर मौजूद सभी मॉडलों की एक लिस्ट निकालेंगे।
    const availableModels = Object.keys(db);

    // हम यह भी जांचेंगे कि 'automation_settings' विशेष रूप से मौजूद है या नहीं।
    const hasAutomationSettings = 'automation_settings' in db;

    // हम यह भी जांचेंगे कि Prisma Client खुद मौजूद है या नहीं।
    const prismaClientExists = !!db;

    return NextResponse.json({
      success: true,
      message: "Prisma Client Debug Information",
      data: {
        prismaClientExists: prismaClientExists,
        hasAutomationSettingsModel: hasAutomationSettings,
        availableModels: availableModels,
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "An error occurred while inspecting Prisma Client.",
      error: error.message,
    }, { status: 500 });
  }
}
