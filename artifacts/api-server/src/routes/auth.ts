import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken } from "../middlewares/auth";
import type { JwtPayload } from "../middlewares/auth";
import type { Request } from "express";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const { name, phone, password, role, district } = req.body;
  if (!name || !phone || !password || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (!["farmer", "doctor"].includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Phone number already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name,
      phone,
      passwordHash,
      role,
      district: district || null,
    }).returning();
    const token = signToken({ userId: user.id, role: user.role, phone: user.phone });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        district: user.district,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    res.status(400).json({ error: "Missing phone or password" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid phone or password" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid phone or password" });
      return;
    }
    const token = signToken({ userId: user.id, role: user.role, phone: user.phone });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        district: user.district,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const { userId } = (req as Request & { user: JwtPayload }).user;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      district: user.district,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
