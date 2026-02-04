import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ExternalLink, 
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Terminal,
  Sparkles,
  FileCode,
  Target,
  Zap,
  Eye,
  Shield,
  Code2
} from "lucide-react";
import type { Audit, Issue } from "@shared/schema";
import { useState } from "react";

function getSeverityConfig(type: string) {
  switch (type) {
    case "error":
      return {
        gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
        border: "border-rose-500/30",
        activeBorder: "border-rose-500/50",
        bg: "bg-rose-500/10",
        text: "text-rose-600 dark:text-rose-400",
        icon: AlertCircle,
        label: "Critical",
        ring: "ring-rose-500/20",
        glow: "shadow-rose-500/20"
      };
    case "warning":
      return {
        gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
        border: "border-amber-500/30",
        activeBorder: "border-amber-500/50",
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        icon: AlertTriangle,
        label: "Warning",
        ring: "ring-amber-500/20",
        glow: "shadow-amber-500/20"
      };
    default:
      return {
        gradient: "from-sky-500/20 via-sky-500/5 to-transparent",
        border: "border-sky-500/30",
        activeBorder: "border-sky-500/50",
        bg: "bg-sky-500/10",
        text: "text-sky-600 dark:text-sky-400",
        icon: Info,
        label: "Notice",
        ring: "ring-sky-500/20",
        glow: "shadow-sky-500/20"
      };
  }
}

function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border bg-gradient-to-b from-muted/80 to-muted/40">
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5" /> {title}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
            data-testid="button-copy-code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      )}
      <div className="relative group">
        <pre className="p-4 text-sm overflow-x-auto font-mono leading-relaxed text-foreground">
          <code>{code}</code>
        </pre>
        {!title && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
            data-testid="button-copy-code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>
    </div>
  );
}

function IssueListItem({ 
  issue, 
  isActive, 
  onClick 
}: { 
  issue: Issue; 
  isActive: boolean; 
  onClick: () => void;
}) {
  const config = getSeverityConfig(issue.type);
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-xl transition-all duration-200 group relative
        ${isActive 
          ? `bg-gradient-to-r ${config.gradient} border-2 ${config.activeBorder} shadow-lg ${config.glow}` 
          : 'hover:bg-muted/50 border border-transparent hover:border-border'
        }
      `}
      data-testid={`issue-item-${issue.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={`
          h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
          ${isActive ? `${config.bg} ring-2 ${config.ring}` : 'bg-muted group-hover:bg-muted'}
        `}>
          <Icon className={`h-5 w-5 ${isActive ? config.text : 'text-muted-foreground group-hover:text-foreground'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className={`
              text-[10px] font-bold uppercase tracking-wider px-2 py-0.5
              ${isActive ? `${config.bg} ${config.text} border-none` : ''}
            `}>
              {config.label}
            </Badge>
            {issue.aiSuggestion && (
              <Sparkles className="h-3 w-3 text-primary" />
            )}
            {!issue.aiSuggestion && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className={`text-sm leading-snug line-clamp-2 ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>
            {issue.message}
          </p>
        </div>
      </div>
    </button>
  );
}

function IssueDetail({ issue }: { issue: Issue }) {
  const config = getSeverityConfig(issue.type);
  const Icon = config.icon;

  return (
    <div className="h-full flex flex-col">
      <div className={`p-6 bg-gradient-to-br ${config.gradient} border-b relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/50" />
        <div className="relative flex items-start gap-4">
          <div className={`h-14 w-14 rounded-2xl ${config.bg} flex items-center justify-center shrink-0 ring-2 ${config.ring} shadow-lg ${config.glow}`}>
            <Icon className={`h-7 w-7 ${config.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${config.bg} ${config.text} border-none text-xs font-bold uppercase tracking-wider px-3 py-1`}>
                {config.label}
              </Badge>
              <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md font-mono">
                {issue.code}
              </code>
            </div>
            <h2 className="text-xl font-semibold text-foreground leading-relaxed">
              {issue.message}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {issue.selector && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-violet-500" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Target Element
                </h3>
              </div>
              <Card className="bg-muted/30">
                <CardContent className="p-4 font-mono text-sm text-foreground break-all">
                  {issue.selector}
                </CardContent>
              </Card>
            </div>
          )}

          {issue.context && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Code2 className="h-4 w-4 text-cyan-500" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Current Code
                </h3>
              </div>
              <CodeBlock code={issue.context} title="Source" />
            </div>
          )}

          {issue.aiSuggestion ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    AI-Powered Fix
                  </h3>
                </div>
                <Badge className="bg-gradient-to-r from-primary/20 to-orange-500/20 text-primary border-none text-xs font-bold uppercase tracking-wider">
                  <Zap className="h-3 w-3 mr-1" />
                  Smart Suggestion
                </Badge>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-primary/10 via-orange-500/5 to-transparent p-[2px]">
                <div className="rounded-[10px] overflow-hidden">
                  <CodeBlock code={issue.aiSuggestion} title="Recommended Fix" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground">
                  AI-Powered Fix
                </h3>
              </div>
              <Card className="border-dashed">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Generating smart fix...</p>
                  <p className="text-xs text-muted-foreground">AI is analyzing the issue and creating a solution</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBadge({ 
  label, 
  value, 
  type 
}: { 
  label: string; 
  value: number | null; 
  type: "error" | "warning" | "notice";
}) {
  const config = getSeverityConfig(type);
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${config.bg} border ${config.border}`}>
      <Icon className={`h-4 w-4 ${config.text}`} />
      <span className={`text-lg font-bold ${config.text}`}>{value ?? 0}</span>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

export default function AuditDetail() {
  const { id } = useParams<{ id: string }>();
  const auditId = parseInt(id || "0");
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);

  const { data: audit, isLoading: auditLoading } = useQuery<Audit>({
    queryKey: ["/api/audits", auditId],
    enabled: !!auditId,
    refetchInterval: (query) => {
      const data = query.state.data as Audit | undefined;
      return data?.status === "scanning" || data?.status === "analyzing" ? 2000 : false;
    },
  });

  const { data: issues, isLoading: issuesLoading } = useQuery<Issue[]>({
    queryKey: ["/api/audits", auditId, "issues"],
    enabled: !!auditId,
    refetchInterval: (query) => {
      const data = query.state.data;
      return audit?.status !== "completed" || (Array.isArray(data) && data.some(issue => !issue.aiSuggestion)) ? 3000 : false;
    },
  });

  const selectedIssue = issues?.find(i => i.id === selectedIssueId) || issues?.[0];

  if (auditLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Loading audit details...</p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="h-20 w-20 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-rose-500" />
          </div>
          <h2 className="font-bold text-2xl mb-3 text-foreground">Audit Not Found</h2>
          <p className="text-muted-foreground mb-8">
            This audit may have been deleted or the link is invalid.
          </p>
          <Link href="/">
            <Button size="lg" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isProcessing = audit.status === "scanning" || audit.status === "analyzing";
  const errors = issues?.filter(i => i.type === "error") || [];
  const warnings = issues?.filter(i => i.type === "warning") || [];
  const notices = issues?.filter(i => i.type === "notice") || [];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="shrink-0 px-6 py-4 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/">
              <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10 rounded-xl" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-primary" />
                <h1 className="text-base font-semibold text-foreground truncate">{audit.url}</h1>
                <a
                  href={audit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                Scanned on {new Date(audit.createdAt).toLocaleDateString()} at {new Date(audit.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <StatBadge label="errors" value={audit.errorCount} type="error" />
            <StatBadge label="warnings" value={audit.warningCount} type="warning" />
            <StatBadge label="notices" value={audit.noticeCount} type="notice" />
            
            {isProcessing && (
              <Badge className="bg-gradient-to-r from-primary/20 to-orange-500/20 text-primary border-none ml-2 px-4 py-2">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {audit.status === "scanning" ? "Scanning..." : "Analyzing..."}
              </Badge>
            )}
            {audit.status === "completed" && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none ml-2 px-4 py-2">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete
              </Badge>
            )}
            {audit.status === "failed" && (
              <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none ml-2 px-4 py-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                Failed
              </Badge>
            )}
          </div>
        </div>
      </header>

      {isProcessing && (
        <div className="shrink-0 px-6 py-4 bg-gradient-to-r from-primary/10 via-orange-500/5 to-transparent border-b border-primary/20">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                {audit.status === "scanning" ? "Scanning for accessibility issues..." : "AI is analyzing issues..."}
              </p>
              <p className="text-sm text-muted-foreground">
                {audit.status === "scanning" ? "Running comprehensive WCAG 2.1 tests" : "Generating intelligent code fixes"}
              </p>
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-primary to-orange-500 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {audit.status === "failed" && (
        <div className="shrink-0 px-6 py-4 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-b border-rose-500/20">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Scan Failed</p>
              <p className="text-sm text-muted-foreground">
                Unable to complete the accessibility audit. The website may be inaccessible or blocking our scanner.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {issues && issues.length > 0 ? (
          <>
            <aside className="w-[400px] shrink-0 border-r bg-card/50 flex flex-col">
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">
                      Issues Found
                    </h2>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {issues.length} total
                  </Badge>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 space-y-2">
                  {errors.length > 0 && (
                    <div className="mb-4">
                      <p className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        Errors ({errors.length})
                      </p>
                      <div className="space-y-2">
                        {errors.map(issue => (
                          <IssueListItem
                            key={issue.id}
                            issue={issue}
                            isActive={(selectedIssue?.id || issues[0]?.id) === issue.id}
                            onClick={() => setSelectedIssueId(issue.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {warnings.length > 0 && (
                    <div className="mb-4">
                      <p className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" />
                        Warnings ({warnings.length})
                      </p>
                      <div className="space-y-2">
                        {warnings.map(issue => (
                          <IssueListItem
                            key={issue.id}
                            issue={issue}
                            isActive={(selectedIssue?.id || issues[0]?.id) === issue.id}
                            onClick={() => setSelectedIssueId(issue.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {notices.length > 0 && (
                    <div className="mb-4">
                      <p className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 flex items-center gap-2">
                        <Info className="h-3 w-3" />
                        Notices ({notices.length})
                      </p>
                      <div className="space-y-2">
                        {notices.map(issue => (
                          <IssueListItem
                            key={issue.id}
                            issue={issue}
                            isActive={(selectedIssue?.id || issues[0]?.id) === issue.id}
                            onClick={() => setSelectedIssueId(issue.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            <main className="flex-1 bg-background overflow-hidden">
              {selectedIssue && <IssueDetail issue={selectedIssue} />}
            </main>
          </>
        ) : issuesLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Loading issues...</p>
            </div>
          </div>
        ) : audit.status === "completed" ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-6 ring-2 ring-emerald-500/20">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <h3 className="font-bold text-2xl mb-3 text-foreground">Perfect Score!</h3>
              <p className="text-muted-foreground leading-relaxed">
                This website passed all accessibility checks. It follows WCAG guidelines and provides a great experience for all users.
              </p>
              <div className="mt-8">
                <Link href="/">
                  <Button variant="outline" size="lg">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Scan Another Site
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
