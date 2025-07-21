import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  trialStartDate: timestamp("trial_start_date"),
  subscriptionStatus: text("subscription_status").default("none"), // none, trial, active, expired
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;

// Verb Conjugations table for caching
export const verbConjugations = pgTable("verb_conjugations", {
  id: serial("id").primaryKey(),
  verb: text("verb").unique().notNull(),
  conjugation: json("conjugation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type VerbConjugation = typeof verbConjugations.$inferSelect;
export type InsertVerbConjugation = typeof verbConjugations.$inferInsert;
