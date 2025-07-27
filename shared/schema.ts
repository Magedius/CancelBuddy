import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User sessions table for unique user identification
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionKey: varchar("session_key").unique().notNull(),
  isActivated: boolean("is_activated").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => userSessions.id).notNull(),
  name: text("name").notNull(),
  plan: text("plan"),
  price: real("price").notNull(),
  currency: text("currency").default("EUR"),
  startDate: timestamp("start_date").notNull(),
  cancelByDate: timestamp("cancel_by_date"),
  cancelUrl: text("cancel_url"),
  logoUrl: text("logo_url"),
  status: text("status", { enum: ["safe", "warning", "urgent"] }).notNull(),
});

export const notificationSettings = pgTable("notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => userSessions.id).notNull(),
  pushEnabled: boolean("push_enabled").default(true),
  emailEnabled: boolean("email_enabled").default(false),
  smsEnabled: boolean("sms_enabled").default(false),
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  reminderDays: integer("reminder_days").default(3),
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  status: true,
  sessionId: true,
});

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({
  id: true,
  sessionId: true,
});

export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
