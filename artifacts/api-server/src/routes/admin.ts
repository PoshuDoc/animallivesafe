import { Router } from "express";
import { sendDoctorApprovalEmail, sendDoctorRejectionEmail, sendNewDoctorAdminNotification } from "../lib/email";
import { db } from "@workspace/db";
import { usersTable, doctorsTable, appointmentsTable, reviewsTable, siteContentTable, faqsTable } from "@workspace/db";
import { eq, count, avg, and, gte, sql, desc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

function formatDoctor(doctor: typeof doctorsTable.$inferSelect, user: typeof usersTable.$inferSelect, avgRating?: number, totalReviews?: number, totalAppointments?: number) {
  return {
    id: doctor.id,
    userId: doctor.userId,
    name: user.name,
    phone: user.phone,
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
    totalAppointments: totalAppointments ?? 0,
    createdAt: doctor.createdAt,
    avatarUrl: user.avatarUrl,
  };
}

function getDateBefore(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function periodToDate(period: string): Date | null {
  switch (period) {
    case "7d": return getDateBefore(7);
    case "15d": return getDateBefore(15);
    case "30d": return getDateBefore(30);
    case "90d": return getDateBefore(90);
    case "180d": return getDateBefore(180);
    case "365d": return getDateBefore(365);
    default: return null;
  }
}

router.use(requireAuth, requireRole("admin"));

// ─── Doctor List ──────────────────────────────────────────────────────────────

router.get("/admin/doctors", async (req, res) => {
  const { status } = req.query as { status?: string };
  try {
    const rows = await db.execute(sql`
      SELECT
        d.id, d.user_id, d.specialties, d.district, d.upazila, d.clinic_name,
        d.chamber_address, d.bio, d.years_experience, d.consultation_fee,
        d.status, d.is_featured, d.created_at as doctor_created_at,
        u.name, u.phone, u.avatar_url,
        COALESCE(AVG(r.rating), 0)::float as avg_rating,
        COUNT(DISTINCT r.id)::int as review_count,
        COUNT(DISTINCT a.id)::int as appointment_count
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN reviews r ON r.doctor_id = d.id
      LEFT JOIN appointments a ON a.doctor_id = d.id
      ${status ? sql`WHERE d.status = ${status}` : sql``}
      GROUP BY d.id, u.name, u.phone, u.avatar_url
      ORDER BY d.created_at DESC
    `);
    const result = rows.rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      phone: row.phone,
      specialties: row.specialties,
      district: row.district,
      upazila: row.upazila,
      clinicName: row.clinic_name,
      chamberAddress: row.chamber_address,
      bio: row.bio,
      yearsExperience: row.years_experience,
      consultationFee: row.consultation_fee,
      status: row.status,
      isFeatured: row.is_featured,
      avatarUrl: row.avatar_url,
      averageRating: Number(row.avg_rating ?? 0),
      totalReviews: Number(row.review_count ?? 0),
      totalAppointments: Number(row.appointment_count ?? 0),
      createdAt: row.doctor_created_at,
    }));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list doctors" });
  }
});

// ─── Doctor Full Details ──────────────────────────────────────────────────────

router.get("/admin/doctors/:id/details", async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [row] = await db
      .select()
      .from(doctorsTable)
      .innerJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
      .where(eq(doctorsTable.id, id));
    if (!row) { res.status(404).json({ error: "Doctor not found" }); return; }

    const [ratingRow] = await db
      .select({ avg: avg(reviewsTable.rating), cnt: count() })
      .from(reviewsTable)
      .where(eq(reviewsTable.doctorId, id));

    const [{ aptCnt }] = await db
      .select({ aptCnt: count() })
      .from(appointmentsTable)
      .where(eq(appointmentsTable.doctorId, id));

    const completedApts = await db
      .select()
      .from(appointmentsTable)
      .where(and(eq(appointmentsTable.doctorId, id), eq(appointmentsTable.status, "completed")))
      .orderBy(desc(appointmentsTable.createdAt))
      .limit(10);

    const revenueRows = await db
      .select({ aptCnt: count() })
      .from(appointmentsTable)
      .where(and(eq(appointmentsTable.doctorId, id), eq(appointmentsTable.status, "completed")));

    const totalRevenue = (revenueRows[0]?.aptCnt ?? 0) * (row.doctors.consultationFee ?? 0);

    const reviews = await db
      .select({ id: reviewsTable.id, rating: reviewsTable.rating, comment: reviewsTable.comment, createdAt: reviewsTable.createdAt, farmerName: usersTable.name })
      .from(reviewsTable)
      .innerJoin(usersTable, eq(reviewsTable.farmerId, usersTable.id))
      .where(eq(reviewsTable.doctorId, id))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(5);

    res.json({
      ...formatDoctor(row.doctors, row.users, ratingRow?.avg ? parseFloat(ratingRow.avg) : 0, ratingRow?.cnt ?? 0, aptCnt ?? 0),
      totalRevenue,
      recentAppointments: completedApts,
      recentReviews: reviews,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get doctor details" });
  }
});

// ─── Doctor Approve ───────────────────────────────────────────────────────────

router.patch("/admin/doctors/:id/approve", async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { status, isFeatured } = req.body;
  if (!["approved", "rejected"].includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
  try {
    const [updated] = await db.update(doctorsTable).set({
      status,
      ...(isFeatured !== undefined && { isFeatured }),
    }).where(eq(doctorsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Doctor not found" }); return; }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId)).limit(1);
    if (user?.email) {
      if (status === "approved") {
        sendDoctorApprovalEmail(user.name, user.email).catch(() => {});
      } else if (status === "rejected") {
        sendDoctorRejectionEmail(user.name, user.email).catch(() => {});
      }
    }
    res.json(formatDoctor(updated, user, 0, 0));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update doctor" });
  }
});

// ─── Revenue Summary ──────────────────────────────────────────────────────────

router.get("/admin/revenue/summary", async (req, res) => {
  try {
    async function getRevenue(since?: Date): Promise<number> {
      const query = db
        .select({ fee: doctorsTable.consultationFee })
        .from(appointmentsTable)
        .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
        .where(since
          ? and(eq(appointmentsTable.status, "completed"), gte(sql`${appointmentsTable.appointmentDate}::date`, sql`${since.toISOString().split("T")[0]}::date`))
          : eq(appointmentsTable.status, "completed")
        );
      const rows = await query;
      return rows.reduce((sum, r) => sum + (r.fee ?? 0), 0);
    }

    const [total, r7d, r15d, r30d, r90d, r180d, r365d] = await Promise.all([
      getRevenue(),
      getRevenue(getDateBefore(7)),
      getRevenue(getDateBefore(15)),
      getRevenue(getDateBefore(30)),
      getRevenue(getDateBefore(90)),
      getRevenue(getDateBefore(180)),
      getRevenue(getDateBefore(365)),
    ]);

    res.json({ total, r7d, r15d, r30d, r90d, r180d, r365d });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get revenue summary" });
  }
});

// ─── Revenue By Doctor ────────────────────────────────────────────────────────

router.get("/admin/revenue/by-doctor", async (req, res) => {
  const { period = "all" } = req.query as { period?: string };
  const since = periodToDate(period);
  try {
    const rows = await db.execute(sql`
      SELECT
        d.id as doctor_id, u.name, u.phone, d.district, d.specialties,
        d.consultation_fee, d.status,
        COUNT(a.id)::int as completed_appointments,
        (COUNT(a.id) * d.consultation_fee)::int as revenue
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN appointments a ON a.doctor_id = d.id
        AND a.status = 'completed'
        ${since ? sql`AND a.appointment_date::date >= ${since.toISOString().split("T")[0]}::date` : sql``}
      GROUP BY d.id, u.name, u.phone
      ORDER BY revenue DESC
    `);
    const result = rows.rows.map((row: Record<string, unknown>) => ({
      doctorId: row.doctor_id,
      name: row.name,
      phone: row.phone,
      district: row.district,
      specialties: row.specialties,
      consultationFee: row.consultation_fee,
      completedAppointments: Number(row.completed_appointments ?? 0),
      revenue: Number(row.revenue ?? 0),
      status: row.status,
    }));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get revenue by doctor" });
  }
});

// ─── Appointments ─────────────────────────────────────────────────────────────

router.get("/admin/appointments", async (req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT
        a.id, a.farmer_id, a.doctor_id, a.animal_type, a.animal_description,
        a.appointment_date, a.appointment_time, a.status, a.notes, a.created_at,
        fu.name as farmer_name,
        du.name as doctor_name,
        d.consultation_fee
      FROM appointments a
      JOIN users fu ON a.farmer_id = fu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      ORDER BY a.created_at DESC
    `);
    const formatted = rows.rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      farmerId: row.farmer_id,
      doctorId: row.doctor_id,
      farmerName: row.farmer_name ?? "Unknown",
      doctorName: row.doctor_name ?? "Unknown",
      animalType: row.animal_type,
      animalDescription: row.animal_description,
      appointmentDate: row.appointment_date,
      appointmentTime: row.appointment_time,
      status: row.status,
      notes: row.notes,
      consultationFee: row.consultation_fee,
      createdAt: row.created_at,
    }));
    res.json(formatted);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list appointments" });
  }
});

// ─── Users ────────────────────────────────────────────────────────────────────

router.get("/admin/users", async (req, res) => {
  try {
    const users = await db.select().from(usersTable);
    res.json(users.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      role: u.role,
      district: u.district,
      createdAt: u.createdAt,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list users" });
  }
});

// ─── Stats ────────────────────────────────────────────────────────────────────

router.get("/admin/stats", async (req, res) => {
  try {
    const [row] = (await db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM users) as total_users,
        (SELECT COUNT(*)::int FROM doctors) as total_doctors,
        (SELECT COUNT(*)::int FROM doctors WHERE status = 'pending') as pending_doctors,
        (SELECT COUNT(*)::int FROM doctors WHERE status = 'approved') as approved_doctors,
        (SELECT COUNT(*)::int FROM appointments) as total_appointments,
        (SELECT COUNT(*)::int FROM appointments WHERE status = 'completed') as completed_appointments,
        (SELECT COUNT(*)::int FROM reviews) as total_reviews
    `)).rows as Record<string, unknown>[];
    res.json({
      totalUsers: Number(row.total_users ?? 0),
      totalDoctors: Number(row.total_doctors ?? 0),
      pendingDoctors: Number(row.pending_doctors ?? 0),
      approvedDoctors: Number(row.approved_doctors ?? 0),
      totalAppointments: Number(row.total_appointments ?? 0),
      completedAppointments: Number(row.completed_appointments ?? 0),
      totalReviews: Number(row.total_reviews ?? 0),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get admin stats" });
  }
});

// ─── Reviews ─────────────────────────────────────────────────────────────────

router.delete("/admin/reviews/:id", async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// ─── FAQ CRUD ─────────────────────────────────────────────────────────────────

router.get("/admin/faqs", async (req, res) => {
  try {
    const rows = await db.select().from(faqsTable).orderBy(faqsTable.order, faqsTable.createdAt);
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get FAQs" });
  }
});

router.post("/admin/faqs", async (req, res) => {
  const { question, answer, order, isActive } = req.body;
  if (!question || !answer) { res.status(400).json({ error: "question এবং answer আবশ্যক" }); return; }
  try {
    const [row] = await db.insert(faqsTable).values({
      question,
      answer,
      order: order ?? 0,
      isActive: isActive !== false,
    }).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "FAQ তৈরি করতে ব্যর্থ" });
  }
});

router.put("/admin/faqs/:id", async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { question, answer, order, isActive } = req.body;
  try {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (question !== undefined) updates.question = question;
    if (answer !== undefined) updates.answer = answer;
    if (order !== undefined) updates.order = order;
    if (isActive !== undefined) updates.isActive = isActive;
    const [row] = await db.update(faqsTable).set(updates).where(eq(faqsTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "FAQ পাওয়া যায়নি" }); return; }
    res.json(row);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "FAQ আপডেট করতে ব্যর্থ" });
  }
});

router.delete("/admin/faqs/:id", async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(faqsTable).where(eq(faqsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "FAQ মুছতে ব্যর্থ" });
  }
});

// ─── Site Content ─────────────────────────────────────────────────────────────

router.get("/admin/site-content", async (req, res) => {
  try {
    const rows = await db.select().from(siteContentTable);
    const content: Record<string, string> = {};
    for (const row of rows) {
      content[row.key] = row.value;
    }
    res.json(content);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get site content" });
  }
});

router.put("/admin/site-content/:key", async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  if (typeof value !== "string") { res.status(400).json({ error: "value must be a string" }); return; }
  try {
    await db.insert(siteContentTable).values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteContentTable.key, set: { value, updatedAt: new Date() } });
    res.json({ key, value });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update site content" });
  }
});

export default router;
