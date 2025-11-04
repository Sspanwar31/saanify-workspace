import { execSync } from "child_process";

export default async function handler(req, res) {
  try {
    const token = req.headers["x-run-migrations-token"];
    if (token !== process.env.NEXTAUTH_SECRET) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    execSync("node scripts/create_admins.js", { stdio: "inherit" });

    return res.status(200).json({ message: "Migration and seed completed successfully" });
  } catch (err) {
    console.error("Migration failed:", err);
    return res.status(500).json({ error: "Migration failed" });
  }
}