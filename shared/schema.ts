import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Accessibility Audits table
export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  status: text("status").notNull().default("pending"), // pending, scanning, analyzing, completed, failed
  errorCount: integer("error_count").default(0),
  warningCount: integer("warning_count").default(0),
  noticeCount: integer("notice_count").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Accessibility Issues table
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id").notNull().references(() => audits.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  type: text("type").notNull(), // error, warning, notice
  message: text("message").notNull(),
  context: text("context"),
  selector: text("selector"),
  aiSuggestion: text("ai_suggestion"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Insert schemas
export const insertAuditSchema = createInsertSchema(audits).omit({
  id: true,
  createdAt: true,
  errorCount: true,
  warningCount: true,
  noticeCount: true,
  status: true,
});

export const insertIssueSchema = createInsertSchema(issues).omit({
  id: true,
  createdAt: true,
  aiSuggestion: true,
});

// Types
export type Audit = typeof audits.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;

// Users table (keeping from template)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
