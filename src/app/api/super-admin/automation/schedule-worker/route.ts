import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import cron from "cron-parser";

export async function GET() {
  try {
    const tasks: any[] = await db.$queryRaw`
      SELECT * FROM "automation_tasks" WHERE enabled = true
    `;

    const now = new Date();

    for (const task of tasks) {
      if (!task.schedule || task.schedule === "manual") continue;

      const interval = cron.parseExpression(task.schedule);
      const next = interval.next().toDate();

      // Run when next execution is due
      if (task.last_run_at == null || next <= now) {
        await db.$executeRaw`
          INSERT INTO "automation_logs" (task_name, details)
          VALUES (${task.task_name}, 'Auto executed')
        `;

        await db.$executeRaw`
          UPDATE "automation_tasks"
          SET last_run_at = NOW()
          WHERE id = ${task.id}
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ScheduleWorker Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
