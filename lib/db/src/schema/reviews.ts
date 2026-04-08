import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { doctorsTable } from "./doctors";
import { appointmentsTable } from "./appointments";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull().references(() => usersTable.id),
  doctorId: integer("doctor_id").notNull().references(() => doctorsTable.id),
  appointmentId: integer("appointment_id").references(() => appointmentsTable.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
