import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, doctorsTable, reviewsTable } from "@workspace/db";
import { eq, and, ilike, avg, count, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";
import type { JwtPayload } from "../middlewares/auth";
import type { Request } from "express";

const router = Router();

function formatDoctor(doctor: typeof doctorsTable.$inferSelect, user: typeof usersTable.$inferSelect, avgRating?: number, totalReviews?: number, totalAppts?: number) {
  return {
    id: doctor.id,
    userId: doctor.userId,
    name: user.name,
    phone: user.phone,
    specialties: doctor.specialties,
    district: doctor.district,
    upazila: doctor.upazila,
    clinicName: doctor.clinicName,
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

    res.json({
      doctors: doctorsWithStats,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
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
      return formatDoctor(
        row.doctors,
        row.users,
        ratingRow?.avg ? parseFloat(ratingRow.avg) : 0,
        ratingRow?.count ?? 0,
        0
      );
    }));

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list featured doctors" });
  }
});

router.get("/doctors/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [row] = await db
      .select()
      .from(doctorsTable)
      .innerJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
      .where(eq(doctorsTable.id, id));
    if (!row) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    const [ratingRow] = await db
      .select({ avg: avg(reviewsTable.rating), count: count() })
      .from(reviewsTable)
      .where(eq(reviewsTable.doctorId, id));
    res.json(formatDoctor(
      row.doctors,
      row.users,
      ratingRow?.avg ? parseFloat(ratingRow.avg) : 0,
      ratingRow?.count ?? 0,
      0
    ));
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
  const { specialties, district, upazila, clinicName, bio, yearsExperience, consultationFee } = req.body;
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
      bio: bio || null,
      yearsExperience: yearsExperience || 0,
      consultationFee: consultationFee || 0,
      status: "pending",
      isFeatured: false,
    }).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    res.status(201).json(formatDoctor(doctor, user, 0, 0, 0));
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
    const { specialties, district, upazila, clinicName, bio, yearsExperience, consultationFee } = req.body;
    const [updated] = await db.update(doctorsTable).set({
      ...(specialties !== undefined && { specialties }),
      ...(district !== undefined && { district }),
      ...(upazila !== undefined && { upazila }),
      ...(clinicName !== undefined && { clinicName }),
      ...(bio !== undefined && { bio }),
      ...(yearsExperience !== undefined && { yearsExperience }),
      ...(consultationFee !== undefined && { consultationFee }),
    }).where(eq(doctorsTable.id, id)).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    res.json(formatDoctor(updated, user, 0, 0, 0));
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
