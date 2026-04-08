import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@workspace/db";
import { usersTable, doctorsTable, reviewsTable, appointmentsTable } from "@workspace/db";
import { eq, and, ilike, avg, count, sql, gte } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";
import type { JwtPayload } from "../middlewares/auth";
import type { Request } from "express";

const router = Router();

const uploadsDir = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

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

function formatDoctor(
  doctor: typeof doctorsTable.$inferSelect,
  user: typeof usersTable.$inferSelect,
  avgRating?: number,
  totalReviews?: number,
  totalAppts?: number
) {
  return {
    id: doctor.id,
    userId: doctor.userId,
    name: user.name,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    specialties: doctor.specialties,
    district: doctor.district,
    upazila: doctor.upazila,
    clinicName: doctor.clinicName,
    chamberAddress: doctor.chamberAddress,
    bio: doctor.bio,
    yearsExperience: doctor.yearsExperience,
    consultationFee: doctor.consultationFee,
    status: doctor.status,
    isFeatured: doctor.isFeatured,
    averageRating: avgRating ?? 0,
    totalReviews: totalReviews ?? 0,
    totalAppointments: totalAppts ?? 0,
    createdAt: doctor.createdAt,
  };
}

async function getDoctorWithStats(doctorId: number) {
  const [row] = await db
    .select()
    .from(doctorsTable)
    .innerJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
    .where(eq(doctorsTable.id, doctorId));
  if (!row) return null;
  const [ratingRow] = await db
    .select({ avg: avg(reviewsTable.rating), count: count() })
    .from(reviewsTable)
    .where(eq(reviewsTable.doctorId, doctorId));
  return formatDoctor(
    row.doctors,
    row.users,
    ratingRow?.avg ? parseFloat(ratingRow.avg) : 0,
    ratingRow?.count ?? 0,
    0
  );
}

router.get("/doctors", async (req, res) => {
  const { district, specialty, search, page = "1", limit = "12" } = req.query as Record<string, string>;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 12;
  const offset = (pageNum - 1) * limitNum;

  try {
    const conditions = [eq(doctorsTable.status, "approved")];
    if (district) conditions.push(ilike(doctorsTable.district, `%${district}%`));

    const allDoctors = await db
      .select()
      .from(doctorsTable)
      .innerJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
      .where(and(...conditions));

    let filtered = allDoctors;
    if (specialty) {
      filtered = filtered.filter(row => row.doctors.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase())));
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(row =>
        row.users.name.toLowerCase().includes(s) ||
        row.doctors.district.toLowerCase().includes(s) ||
        (row.doctors.clinicName?.toLowerCase().includes(s) ?? false)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limitNum);

    const doctorsWithStats = await Promise.all(paginated.map(async (row) => {
      const [ratingRow] = await db
        .select({ avg: avg(reviewsTable.rating), count: count() })
        .from(reviewsTable)
        .where(eq(reviewsTable.doctorId, row.doctors.id));
      return formatDoctor(
        row.doctors,
        row.users,
        ratingRow?.avg ? parseFloat(ratingRow.avg) : 0,
        ratingRow?.count ?? 0,
        0
      );
    }));

    res.json({ doctors: doctorsWithStats, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list doctors" });
  }
});

router.get("/doctors/featured", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(doctorsTable)
      .innerJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
      .where(and(eq(doctorsTable.isFeatured, true), eq(doctorsTable.status, "approved")))
      .limit(6);

    const result = await Promise.all(rows.map(async (row) => {
      const [ratingRow] = await db
        .select({ avg: avg(reviewsTable.rating), count: count() })
        .from(reviewsTable)
        .where(eq(reviewsTable.doctorId, row.doctors.id));
      return formatDoctor(row.doctors, row.users, ratingRow?.avg ? parseFloat(ratingRow.avg) : 0, ratingRow?.count ?? 0, 0);
    }));

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list featured doctors" });
  }
});

router.get("/doctors/me", requireAuth, async (req, res) => {
  const { userId, role } = (req as Request & { user: JwtPayload }).user;
  if (role !== "doctor") {
    res.status(403).json({ error: "Only doctors can access this" });
    return;
  }
  try {
    const [doctorRow] = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId)).limit(1);
    if (!doctorRow) {
      res.status(404).json({ error: "Doctor profile not found" });
      return;
    }
    const profile = await getDoctorWithStats(doctorRow.id);
    res.json(profile);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get doctor profile" });
  }
});

router.patch("/doctors/me", requireAuth, async (req, res) => {
  const { userId, role } = (req as Request & { user: JwtPayload }).user;
  if (role !== "doctor") {
    res.status(403).json({ error: "Only doctors can update this" });
    return;
  }
  try {
    const [doctorRow] = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId)).limit(1);
    if (!doctorRow) {
      res.status(404).json({ error: "Doctor profile not found" });
      return;
    }

    const { name, phone, specialties, district, upazila, clinicName, chamberAddress, bio, yearsExperience, consultationFee } = req.body;

    const userUpdate: Record<string, any> = {};
    if (name !== undefined) userUpdate.name = name;
    if (phone !== undefined) userUpdate.phone = phone;
    if (Object.keys(userUpdate).length > 0) {
      await db.update(usersTable).set(userUpdate).where(eq(usersTable.id, userId));
    }

    const doctorUpdate: Record<string, any> = {};
    if (specialties !== undefined) doctorUpdate.specialties = Array.isArray(specialties) ? specialties : [specialties];
    if (district !== undefined) doctorUpdate.district = district;
    if (upazila !== undefined) doctorUpdate.upazila = upazila;
    if (clinicName !== undefined) doctorUpdate.clinicName = clinicName;
    if (chamberAddress !== undefined) doctorUpdate.chamberAddress = chamberAddress;
    if (bio !== undefined) doctorUpdate.bio = bio;
    if (yearsExperience !== undefined) doctorUpdate.yearsExperience = yearsExperience;
    if (consultationFee !== undefined) doctorUpdate.consultationFee = consultationFee;
    if (Object.keys(doctorUpdate).length > 0) {
      await db.update(doctorsTable).set(doctorUpdate).where(eq(doctorsTable.id, doctorRow.id));
    }

    const profile = await getDoctorWithStats(doctorRow.id);
    res.json(profile);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update doctor profile" });
  }
});

router.post("/doctors/me/avatar", requireAuth, upload.single("avatar"), async (req, res) => {
  const { userId, role } = (req as Request & { user: JwtPayload }).user;
  if (role !== "doctor") {
    res.status(403).json({ error: "Only doctors can access this" });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  try {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await db.update(usersTable).set({ avatarUrl }).where(eq(usersTable.id, userId));
    res.json({ avatarUrl });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

router.get("/doctors/me/revenue", requireAuth, async (req, res) => {
  const { userId, role } = (req as Request & { user: JwtPayload }).user;
  if (role !== "doctor") {
    res.status(403).json({ error: "Only doctors can access this" });
    return;
  }
  const { period = "all" } = req.query as { period?: string };

  try {
    const [doctorRow] = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId)).limit(1);
    if (!doctorRow) {
      res.json({ revenue: 0, completedCount: 0, period });
      return;
    }

    const periodDays: Record<string, number> = {
      "7d": 7, "15d": 15, "30d": 30, "90d": 90, "180d": 180, "365d": 365,
    };

    let completedAppointments;
    if (period !== "all" && periodDays[period]) {
      const days = periodDays[period];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffStr = cutoffDate.toISOString().split("T")[0];
      completedAppointments = await db
        .select()
        .from(appointmentsTable)
        .where(and(
          eq(appointmentsTable.doctorId, doctorRow.id),
          eq(appointmentsTable.status, "completed"),
          gte(appointmentsTable.appointmentDate, cutoffStr),
        ));
    } else {
      completedAppointments = await db
        .select()
        .from(appointmentsTable)
        .where(and(
          eq(appointmentsTable.doctorId, doctorRow.id),
          eq(appointmentsTable.status, "completed"),
        ));
    }

    const fee = doctorRow.consultationFee ?? 0;
    const revenue = completedAppointments.length * fee;

    res.json({ revenue, completedCount: completedAppointments.length, consultationFee: fee, period });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get revenue" });
  }
});

router.get("/doctors/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const profile = await getDoctorWithStats(id);
    if (!profile) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    res.json(profile);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get doctor" });
  }
});

router.post("/doctors", requireAuth, async (req, res) => {
  const { userId, role } = (req as Request & { user: JwtPayload }).user;
  if (role !== "doctor") {
    res.status(403).json({ error: "Only doctors can create a profile" });
    return;
  }
  const { specialties, district, upazila, clinicName, chamberAddress, bio, yearsExperience, consultationFee } = req.body;
  if (!specialties || !district) {
    res.status(400).json({ error: "Specialties and district are required" });
    return;
  }
  try {
    const existing = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Doctor profile already exists" });
      return;
    }
    const [doctor] = await db.insert(doctorsTable).values({
      userId,
      specialties: Array.isArray(specialties) ? specialties : [specialties],
      district,
      upazila: upazila || null,
      clinicName: clinicName || null,
      chamberAddress: chamberAddress || null,
      bio: bio || null,
      yearsExperience: yearsExperience || 0,
      consultationFee: consultationFee || 0,
      status: "pending",
      isFeatured: false,
    }).returning();
    const profile = await getDoctorWithStats(doctor.id);
    res.status(201).json(profile);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create doctor profile" });
  }
});

router.patch("/doctors/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { userId } = (req as Request & { user: JwtPayload }).user;
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [existing] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, id)).limit(1);
    if (!existing || existing.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { specialties, district, upazila, clinicName, chamberAddress, bio, yearsExperience, consultationFee } = req.body;
    await db.update(doctorsTable).set({
      ...(specialties !== undefined && { specialties }),
      ...(district !== undefined && { district }),
      ...(upazila !== undefined && { upazila }),
      ...(clinicName !== undefined && { clinicName }),
      ...(chamberAddress !== undefined && { chamberAddress }),
      ...(bio !== undefined && { bio }),
      ...(yearsExperience !== undefined && { yearsExperience }),
      ...(consultationFee !== undefined && { consultationFee }),
    }).where(eq(doctorsTable.id, id));
    const profile = await getDoctorWithStats(id);
    res.json(profile);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update doctor" });
  }
});

router.get("/doctors/:id/reviews", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const reviews = await db
      .select()
      .from(reviewsTable)
      .innerJoin(usersTable, eq(reviewsTable.farmerId, usersTable.id))
      .where(eq(reviewsTable.doctorId, id))
      .orderBy(sql`${reviewsTable.createdAt} desc`);
    res.json(reviews.map(r => ({
      id: r.reviews.id,
      farmerId: r.reviews.farmerId,
      doctorId: r.reviews.doctorId,
      appointmentId: r.reviews.appointmentId,
      farmerName: r.users.name,
      rating: r.reviews.rating,
      comment: r.reviews.comment,
      createdAt: r.reviews.createdAt,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get reviews" });
  }
});

export default router;
