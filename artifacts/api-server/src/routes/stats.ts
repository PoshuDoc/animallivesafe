import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, doctorsTable, appointmentsTable, siteContentTable, faqsTable } from "@workspace/db";
import { count, eq, asc } from "drizzle-orm";

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

router.get("/site-content", async (req, res) => {
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

router.get("/faqs", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(faqsTable)
      .where(eq(faqsTable.isActive, true))
      .orderBy(asc(faqsTable.order), asc(faqsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get FAQs" });
  }
});

export default router;
