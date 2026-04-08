import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, doctorsTable, appointmentsTable, reviewsTable } from "@workspace/db";
import { eq, count, avg, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

function formatDoctor(doctor: typeof doctorsTable.$inferSelect, user: typeof usersTable.$inferSelect, avgRating?: number, totalReviews?: number) {
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
    totalAppointments: 0,
    createdAt: doctor.createdAt,
  };
}

router.use(requireAuth, requireRole("admin"));

router.get("/admin/doctors", async (req, res) => {
  const { status } = req.query as { status?: string };
  try {
    const rows = await db
      .select()
      .from(doctorsTable)
      .innerJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
      .where(status ? eq(doctorsTable.status, status as "pending" | "approved" | "rejected") : undefined);

    const result = await Promise.all(rows.map(async (row) => {
      const [ratingRow] = await db
        .select({ avg: avg(reviewsTable.rating), cnt: count() })
        .from(reviewsTable)
        .where(eq(reviewsTable.doctorId, row.doctors.id));
      return formatDoctor(row.doctors, row.users, ratingRow?.avg ? parseFloat(ratingRow.avg) : 0, ratingRow?.cnt ?? 0);
    }));

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list doctors" });
  }
});

router.patch("/admin/doctors/:id/approve", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const { status, isFeatured } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  try {
    const [updated] = await db.update(doctorsTable).set({
      status,
      ...(isFeatured !== undefined && { isFeatured }),
    }).where(eq(doctorsTable.id, id)).returning();
    if (!updated) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId)).limit(1);
    res.json(formatDoctor(updated, user, 0, 0));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update doctor" });
  }
});

router.get("/admin/appointments", async (req, res) => {
  try {
    const appts = await db.select().from(appointmentsTable);
    const formatted = await Promise.all(appts.map(async (appt) => {
      const [farmer] = await db.select().from(usersTable).where(eq(usersTable.id, appt.farmerId)).limit(1);
      const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, appt.doctorId)).limit(1);
      const [doctorUser] = doctor ? await db.select().from(usersTable).where(eq(usersTable.id, doctor.userId)).limit(1) : [null];
      return {
        id: appt.id,
        farmerId: appt.farmerId,
        doctorId: appt.doctorId,
        farmerName: farmer?.name ?? "Unknown",
        doctorName: doctorUser?.name ?? "Unknown",
        animalType: appt.animalType,
        animalDescription: appt.animalDescription,
        appointmentDate: appt.appointmentDate,
        appointmentTime: appt.appointmentTime,
        status: appt.status,
        notes: appt.notes,
        createdAt: appt.createdAt,
      };
    }));
    res.json(formatted);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list appointments" });
  }
});

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

router.get("/admin/stats", async (req, res) => {
  try {
    const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(usersTable);
    const [{ totalDoctors }] = await db.select({ totalDoctors: count() }).from(doctorsTable);
    const [{ pendingDoctors }] = await db.select({ pendingDoctors: count() }).from(doctorsTable).where(eq(doctorsTable.status, "pending"));
    const [{ approvedDoctors }] = await db.select({ approvedDoctors: count() }).from(doctorsTable).where(eq(doctorsTable.status, "approved"));
    const [{ totalAppointments }] = await db.select({ totalAppointments: count() }).from(appointmentsTable);
    const [{ pendingAppointments }] = await db.select({ pendingAppointments: count() }).from(appointmentsTable).where(eq(appointmentsTable.status, "pending"));
    const [{ completedAppointments }] = await db.select({ completedAppointments: count() }).from(appointmentsTable).where(eq(appointmentsTable.status, "completed"));
    const [{ totalReviews }] = await db.select({ totalReviews: count() }).from(reviewsTable);

    res.json({
      totalUsers,
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalReviews,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get admin stats" });
  }
});

router.delete("/admin/reviews/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
