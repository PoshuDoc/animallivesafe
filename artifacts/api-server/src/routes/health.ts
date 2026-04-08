import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/healthz/db", async (_req, res) => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    res.json({ status: "ok", db: "connected", url_prefix: (process.env.DATABASE_URL ?? "").slice(0, 40) + "..." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ status: "error", db: "failed", error: msg, url_prefix: (process.env.DATABASE_URL ?? "").slice(0, 40) + "..." });
  }
});

export default router;
