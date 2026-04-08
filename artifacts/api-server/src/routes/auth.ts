import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken } from "../middlewares/auth";
import type { JwtPayload } from "../middlewares/auth";
import type { Request } from "express";
import { sendWelcomeEmail } from "../lib/email";

const router = Router();

const uploadsDir = process.env.NODE_ENV === "production"
  ? "/tmp/uploads/avatars"
  : path.join(process.cwd(), "uploads", "avatars");

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch {
  // serverless read-only filesystem — avatar upload disabled
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `avatar_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    district: user.district,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

router.post("/auth/register", async (req, res) => {
  const { name, phone, email, password, role, district } = req.body;
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
      email: email || null,
      passwordHash,
      role,
      district: district || null,
    }).returning();
    const token = signToken({ userId: user.id, role: user.role, phone: user.phone });
    if (user.email) {
      sendWelcomeEmail(user.name, user.email, user.role).catch(() => {});
    }
    res.status(201).json({ token, user: formatUser(user) });
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
    res.json({ token, user: formatUser(user) });
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
    res.json(formatUser(user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.patch("/auth/profile", requireAuth, async (req, res) => {
  const { userId } = (req as Request & { user: JwtPayload }).user;
  const { name, district } = req.body;
  try {
    const updateData: Record<string, string | null> = {};
    if (name !== undefined) updateData.name = name;
    if (district !== undefined) updateData.district = district || null;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }
    const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId)).returning();
    res.json(formatUser(user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.post("/auth/profile/avatar", requireAuth, upload.single("avatar"), async (req, res) => {
  const { userId } = (req as Request & { user: JwtPayload }).user;
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  try {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const [user] = await db.update(usersTable).set({ avatarUrl }).where(eq(usersTable.id, userId)).returning();
    res.json({ avatarUrl, user: formatUser(user) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

export default router;
