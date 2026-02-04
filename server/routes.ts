import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAuditSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
});

// Type for pa11y issues
interface Pa11yIssue {
  code: string;
  type: "error" | "warning" | "notice";
  message: string;
  context?: string;
  selector?: string;
}

// Dynamic import for pa11y (ESM module)
async function runPa11y(url: string): Promise<Pa11yIssue[]> {
  try {
    const pa11y = (await import("pa11y")).default;

    // Build chromeLaunchConfig - only include executablePath if explicitly set
    const chromeLaunchConfig: any = {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    };

    // Use explicit path for Replit, otherwise let puppeteer find Chrome
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      chromeLaunchConfig.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    } else if (process.env.REPL_SLUG) {
      // Running on Replit - use the Nix store path
      chromeLaunchConfig.executablePath = "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium";
    }

    // For local dev, don't set executablePath - let puppeteer use its bundled Chrome

    const results = await pa11y(url, {
      chromeLaunchConfig,
      timeout: 60000,
      wait: 2000,
    });








    // const results = await pa11y(url, {
    //   chromeLaunchConfig: {
    //     executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium",
    //     args: [
    //       "--no-sandbox",
    //       "--disable-setuid-sandbox",
    //       "--disable-dev-shm-usage",
    //       "--disable-gpu",
    //     ],
    //   },
    //   timeout: 60000,
    //   wait: 2000,
    // });

    return results.issues.map((issue: any) => ({
      code: issue.code || "unknown",
      type: issue.type || "notice",
      message: issue.message || "Unknown issue",
      context: issue.context || null,
      selector: issue.selector || null,
    }));
  } catch (error) {
    console.error("Pa11y error:", error);
    throw error;
  }
}

// Generate AI fix for an accessibility issue
async function generateAiFix(issue: Pa11yIssue): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `You are an accessibility expert. Provide concise HTML/code fixes for accessibility issues. 
Only provide the corrected code snippet without explanation. Keep fixes minimal and focused.
If the context is not HTML, provide the appropriate fix in the relevant format.`,
        },
        {
          role: "user",
          content: `Fix this accessibility ${issue.type}: "${issue.message}"
${issue.context ? `\nOriginal code: ${issue.context}` : ""}
${issue.selector ? `\nSelector: ${issue.selector}` : ""}

Provide only the corrected code snippet.`,
        },
      ],
      max_completion_tokens: 500,
    });

    return response.choices[0]?.message?.content?.trim() || "Unable to generate fix suggestion.";
  } catch (error) {
    console.error("AI fix error:", error);
    return "AI suggestion unavailable. Please manually review this issue.";
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all audits
  app.get("/api/audits", async (req, res) => {
    try {
      const audits = await storage.getAllAudits();
      res.json(audits);
    } catch (error) {
      console.error("Error fetching audits:", error);
      res.status(500).json({ error: "Failed to fetch audits" });
    }
  });

  // Get single audit
  app.get("/api/audits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const audit = await storage.getAudit(id);
      if (!audit) {
        return res.status(404).json({ error: "Audit not found" });
      }
      res.json(audit);
    } catch (error) {
      console.error("Error fetching audit:", error);
      res.status(500).json({ error: "Failed to fetch audit" });
    }
  });

  // Get issues for an audit
  app.get("/api/audits/:id/issues", async (req, res) => {
    try {
      const auditId = parseInt(req.params.id);
      const issues = await storage.getIssuesByAudit(auditId);
      res.json(issues);
    } catch (error) {
      console.error("Error fetching issues:", error);
      res.status(500).json({ error: "Failed to fetch issues" });
    }
  });

  // Create new audit and start scanning
  app.post("/api/audits", async (req, res) => {
    try {
      const parsed = insertAuditSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid URL" });
      }

      // Create audit record
      const audit = await storage.createAudit(parsed.data);

      // Start scanning in background
      processAudit(audit.id, parsed.data.url);

      res.status(201).json(audit);
    } catch (error) {
      console.error("Error creating audit:", error);
      res.status(500).json({ error: "Failed to create audit" });
    }
  });

  // Delete audit
  app.delete("/api/audits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAudit(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting audit:", error);
      res.status(500).json({ error: "Failed to delete audit" });
    }
  });

  return httpServer;
}

// Background processing function
async function processAudit(auditId: number, url: string) {
  try {
    // Update status to scanning
    await storage.updateAuditStatus(auditId, "scanning");

    // Run pa11y scan
    const pa11yIssues = await runPa11y(url);

    // Count issues by type
    const errorCount = pa11yIssues.filter((i) => i.type === "error").length;
    const warningCount = pa11yIssues.filter((i) => i.type === "warning").length;
    const noticeCount = pa11yIssues.filter((i) => i.type === "notice").length;

    // Update counts
    await storage.updateAuditCounts(auditId, errorCount, warningCount, noticeCount);

    // Update status to analyzing
    await storage.updateAuditStatus(auditId, "analyzing");

    // Create issues and generate AI fixes
    for (const issue of pa11yIssues) {
      // Create issue first without AI suggestion
      const createdIssue = await storage.createIssue({
        auditId,
        code: issue.code,
        type: issue.type,
        message: issue.message,
        context: issue.context || null,
        selector: issue.selector || null,
      });

      // Generate AI fix in background
      generateAiFix(issue).then((fix) => {
        storage.updateIssueFix(createdIssue.id, fix);
      });
    }

    // Update status to completed
    await storage.updateAuditStatus(auditId, "completed");
  } catch (error) {
    console.error("Error processing audit:", error);
    await storage.updateAuditStatus(auditId, "failed");
  }
}
