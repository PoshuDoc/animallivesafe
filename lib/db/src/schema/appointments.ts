import { pgTable, serial, integer, text, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { doctorsTable } from "./doctors";

export const appointmentStatusEnum = pgEnum("appointment_status", ["pending", "confirmed", "cancelled", "completed"]);

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull().references(() => usersTable.id),
  doctorId: integer("doctor_id").notNull().references(() => doctorsTable.id),
  animalType: text("animal_type").notNull(),
  animalDescription: text("animal_description"),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: appointmentStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true, createdAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;
