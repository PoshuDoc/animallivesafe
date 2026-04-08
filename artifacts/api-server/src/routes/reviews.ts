import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, reviewsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { JwtPayload } from "../middlewares/auth";
import type { Request } from "express";

const router = Router();

router.post("/reviews", requireAuth, async (req, res) => {
  const { userId, role } = (req as Request & { user: JwtPayload }).user;
  if (role !== "farmer") {
    res.status(403).json({ error: "Only farmers can write reviews" });
    return;
  }
  const { doctorId, appointmentId, rating, comment } = req.body;
  if (!doctorId || !rating) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: "Rating must be between 1 and 5" });
    return;
  }
  try {
    const [review] = await db.insert(reviewsTable).values({
      farmerId: userId,
      doctorId: parseInt(doctorId),
      appointmentId: appointmentId ? parseInt(appointmentId) : null,
      rating: parseInt(rating),
      comment: comment || null,
    }).returning();

    const [farmer] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    res.status(201).json({
      id: review.id,
      farmerId: review.farmerId,
      doctorId: review.doctorId,
      appointmentId: review.appointmentId,
      farmerName: farmer?.name ?? "Unknown",
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

export default router;
