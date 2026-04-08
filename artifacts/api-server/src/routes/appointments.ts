import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, doctorsTable, appointmentsTable } from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { JwtPayload } from "../middlewares/auth";
import type { Request } from "express";

const router = Router();

function formatAppointment(
  appt: typeof appointmentsTable.$inferSelect,
  farmerName: string,
  doctorName: string
) {
  return {
    id: appt.id,
    farmerId: appt.farmerId,
    doctorId: appt.doctorId,
    farmerName,
    doctorName,
    animalType: appt.animalType,
    animalDescription: appt.animalDescription,
    appointmentDate: appt.appointmentDate,
    appointmentTime: appt.appointmentTime,
    status: appt.status,
    notes: appt.notes,
    createdAt: appt.createdAt,
  };
}

router.get("/appointments", requireAuth, async (req, res) => {
  const { userId, role } = (req as Request & { user: JwtPayload }).user;
  const { status } = req.query as { status?: string };

  try {
    let query = db
      .select()
      .from(appointmentsTable)
      .leftJoin(usersTable, eq(appointmentsTable.farmerId, usersTable.id))
      .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id));

    let results;
    if (role === "farmer") {
      results = await db
        .select()
        .from(appointmentsTable)
        .where(status
          ? and(eq(appointmentsTable.farmerId, userId), eq(appointmentsTable.status, status as "pending" | "confirmed" | "cancelled" | "completed"))
          : eq(appointmentsTable.farmerId, userId));
    } else if (role === "doctor") {
      const [doctorRow] = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId)).limit(1);
      if (!doctorRow) {
        res.json([]);
        return;
      }
      results = await db
        .select()
        .from(appointmentsTable)
        .where(status
          ? and(eq(appointmentsTable.doctorId, doctorRow.id), eq(appointmentsTable.status, status as "pending" | "confirmed" | "cancelled" | "completed"))
          : eq(appointmentsTable.doctorId, doctorRow.id));
    } else {
      results = await db.select().from(appointmentsTable);
    }

    const formatted = await Promise.all(results.map(async (appt) => {
      const [farmer] = await db.select().from(usersTable).where(eq(usersTable.id, appt.farmerId)).limit(1);
      const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, appt.doctorId)).limit(1);
      const [doctorUser] = doctor ? await db.select().from(usersTable).where(eq(usersTable.id, doctor.userId)).limit(1) : [null];
      return formatAppointment(appt, farmer?.name ?? "Unknown", doctorUser?.name ?? "Unknown");
    }));

    res.json(formatted);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list appointments" });
  }
});

router.post("/appointments", requireAuth, async (req, res) => {
  const { userId, role } = (req as Request & { user: JwtPayload }).user;
  if (role !== "farmer") {
    res.status(403).json({ error: "Only farmers can book appointments" });
    return;
  }
  const { doctorId, animalType, animalDescription, appointmentDate, appointmentTime, notes } = req.body;
  if (!doctorId || !animalType || !appointmentDate || !appointmentTime) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const [appt] = await db.insert(appointmentsTable).values({
      farmerId: userId,
      doctorId: parseInt(doctorId),
      animalType,
      animalDescription: animalDescription || null,
      appointmentDate,
      appointmentTime,
      notes: notes || null,
      status: "pending",
    }).returning();

    const [farmer] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, appt.doctorId)).limit(1);
    const [doctorUser] = doctor ? await db.select().from(usersTable).where(eq(usersTable.id, doctor.userId)).limit(1) : [null];

    res.status(201).json(formatAppointment(appt, farmer?.name ?? "Unknown", doctorUser?.name ?? "Unknown"));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

router.get("/appointments/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [appt] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id)).limit(1);
    if (!appt) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    const [farmer] = await db.select().from(usersTable).where(eq(usersTable.id, appt.farmerId)).limit(1);
    const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, appt.doctorId)).limit(1);
    const [doctorUser] = doctor ? await db.select().from(usersTable).where(eq(usersTable.id, doctor.userId)).limit(1) : [null];
    res.json(formatAppointment(appt, farmer?.name ?? "Unknown", doctorUser?.name ?? "Unknown"));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get appointment" });
  }
});

router.patch("/appointments/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const { userId, role } = (req as Request & { user: JwtPayload }).user;
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [appt] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id)).limit(1);
    if (!appt) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const { status, notes } = req.body;
    const [updated] = await db.update(appointmentsTable).set({
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
    }).where(eq(appointmentsTable.id, id)).returning();

    const [farmer] = await db.select().from(usersTable).where(eq(usersTable.id, updated.farmerId)).limit(1);
    const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, updated.doctorId)).limit(1);
    const [doctorUser] = doctor ? await db.select().from(usersTable).where(eq(usersTable.id, doctor.userId)).limit(1) : [null];
    res.json(formatAppointment(updated, farmer?.name ?? "Unknown", doctorUser?.name ?? "Unknown"));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

export default router;
