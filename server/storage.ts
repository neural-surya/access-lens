import { db } from "./db";
import { audits, issues, type Audit, type InsertAudit, type Issue, type InsertIssue } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Audit operations
  createAudit(audit: InsertAudit): Promise<Audit>;
  getAudit(id: number): Promise<Audit | undefined>;
  getAllAudits(): Promise<Audit[]>;
  updateAuditStatus(id: number, status: string): Promise<Audit | undefined>;
  updateAuditCounts(id: number, errorCount: number, warningCount: number, noticeCount: number): Promise<Audit | undefined>;
  deleteAudit(id: number): Promise<void>;

  // Issue operations
  createIssue(issue: InsertIssue): Promise<Issue>;
  getIssuesByAudit(auditId: number): Promise<Issue[]>;
  updateIssueFix(issueId: number, aiSuggestion: string): Promise<Issue | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createAudit(audit: InsertAudit): Promise<Audit> {
    const [newAudit] = await db.insert(audits).values(audit).returning();
    return newAudit;
  }

  async getAudit(id: number): Promise<Audit | undefined> {
    const [audit] = await db.select().from(audits).where(eq(audits.id, id));
    return audit;
  }

  async getAllAudits(): Promise<Audit[]> {
    return db.select().from(audits).orderBy(desc(audits.createdAt));
  }

  async updateAuditStatus(id: number, status: string): Promise<Audit | undefined> {
    const [updated] = await db.update(audits).set({ status }).where(eq(audits.id, id)).returning();
    return updated;
  }

  async updateAuditCounts(id: number, errorCount: number, warningCount: number, noticeCount: number): Promise<Audit | undefined> {
    const [updated] = await db.update(audits)
      .set({ errorCount, warningCount, noticeCount })
      .where(eq(audits.id, id))
      .returning();
    return updated;
  }

  async deleteAudit(id: number): Promise<void> {
    await db.delete(issues).where(eq(issues.auditId, id));
    await db.delete(audits).where(eq(audits.id, id));
  }

  async createIssue(issue: InsertIssue): Promise<Issue> {
    const [newIssue] = await db.insert(issues).values(issue).returning();
    return newIssue;
  }

  async getIssuesByAudit(auditId: number): Promise<Issue[]> {
    return db.select().from(issues).where(eq(issues.auditId, auditId));
  }

  async updateIssueFix(issueId: number, aiSuggestion: string): Promise<Issue | undefined> {
    const [updated] = await db.update(issues)
      .set({ aiSuggestion })
      .where(eq(issues.id, issueId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
