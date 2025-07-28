import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  pin: varchar("pin", { length: 6 }).notNull(),
  saldo_tabungan: integer("saldo_tabungan").notNull().default(0),
  saldo_deposito: integer("saldo_deposito").notNull().default(0),
});

export const notifications = pgTable("notifikasi", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  isi: text("isi").notNull(),
  tipe: varchar("tipe", { length: 50 }).notNull(), // 'info' or 'popup'
  tanggal: timestamp("tanggal").notNull().defaultNow(),
  read: boolean("read").default(false),
});

export const chat = pgTable("chat", {
  id: serial("id").primaryKey(),
  sender: varchar("sender", { length: 50 }).notNull(), // 'admin' or 'user'
  message: text("message").notNull(),
  waktu: timestamp("waktu").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  tanggal: true,
  read: true,
});

export const insertChatSchema = createInsertSchema(chat).omit({
  id: true,
  waktu: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  pin: z.string().length(6, "PIN must be 6 digits"),
});

export const adminAccessSchema = z.object({
  code: z.string().length(6, "Admin code must be 6 digits"),
});

export const updateBalanceSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["tabungan", "deposito"]),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Chat = typeof chat.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type AdminAccessRequest = z.infer<typeof adminAccessSchema>;
export type UpdateBalanceRequest = z.infer<typeof updateBalanceSchema>;
