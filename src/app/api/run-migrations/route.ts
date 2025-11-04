import { execSync } from "child_process";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("x-run-migrations-token");
    if (token !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    execSync("node scripts/create_admins.js", { stdio: "inherit" });

    return NextResponse.json({ message: "Migration and seed completed successfully" });
  } catch (err) {
    console.error("Migration failed:", err);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}