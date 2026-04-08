import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const doctorStatusEnum = pgEnum("doctor_status", ["pending", "approved", "rejected"]);

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  specialties: text("specialties").array().notNull().default([]),
  district: text("district").notNull(),
  upazila: text("upazila"),
  clinicName: text("clinic_name"),
  chamberAddress: text("chamber_address"),
  bio: text("bio"),
  yearsExperience: integer("years_experience").default(0),
  consultationFee: integer("consultation_fee").default(0),
  status: doctorStatusEnum("status").notNull().default("pending"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDoctorSchema = createInsertSchema(doctorsTable).omit({ id: true, createdAt: true });
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctorsTable.$inferSelect;
