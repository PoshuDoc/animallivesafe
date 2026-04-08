import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, doctorsTable, appointmentsTable } from "@workspace/db";
import { count, eq, sql } from "drizzle-orm";

const router = Router();

router.get("/stats/overview", async (req, res) => {
  try {
    const [{ totalDoctors }] = await db.select({ totalDoctors: count() }).from(doctorsTable).where(eq(doctorsTable.status, "approved"));
    const [{ totalFarmers }] = await db.select({ totalFarmers: count() }).from(usersTable).where(eq(usersTable.role, "farmer"));
    const [{ totalAppointments }] = await db.select({ totalAppointments: count() }).from(appointmentsTable);
    const districtResult = await db.selectDistinct({ district: doctorsTable.district }).from(doctorsTable).where(eq(doctorsTable.status, "approved"));

    res.json({
      totalDoctors,
      totalFarmers,
      totalAppointments,
      totalDistricts: districtResult.length,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
