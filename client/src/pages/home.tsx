import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Search, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  Globe,
  ArrowRight,
  Zap,
  Shield,
  Eye,
  Wand2,
  Scan
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Audit } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

function getStatusConfig(status: string) {
  switch (status) {
    case "completed":
      return { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 };
    case "failed":
      return { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", icon: AlertCircle };
    case "scanning":
    case "analyzing":
      return { bg: "bg-primary/10", text: "text-primary", icon: Loader2 };
    default:
      return { bg: "bg-muted", text: "text-muted-foreground", icon: Info };
  }
}

function formatUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
  } catch {
    return url;
  }
}

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-medium text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: audits, isLoading } = useQuery<Audit[]>({
    queryKey: ["/api/audits"],
    refetchInterval: 3000,
  });

  const createAuditMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/audits", { url });
      return res.json();
    },
    onSuccess: (data: Audit) => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      setUrl("");
      toast({
        title: "Audit started",
        description: "Scanning and analyzing accessibility issues...",
      });
      setLocation(`/audit/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start audit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAuditMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/audits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Audit deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }
    createAuditMutation.mutate(finalUrl);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 via-violet-500/20 to-cyan-500/20 border border-primary/30 mb-8 backdrop-blur-sm">
            <div className="relative">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <span className="text-sm font-medium bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              AI-Powered Accessibility Testing
            </span>
          </div>
          
          <div className="mb-6">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Access
              </span>
              <span className="text-foreground">Lens</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium tracking-widest uppercase">See What Others Can't</span>
            </div>
          </div>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Instantly scan any website for accessibility barriers and get 
            <span className="text-primary font-medium"> AI-powered code fixes</span> to make the web inclusive for everyone.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
            <FeatureCard 
              icon={Scan} 
              title="Deep Scanning" 
              description="WCAG 2.1 compliant checks"
            />
            <FeatureCard 
              icon={Wand2} 
              title="Smart Fixes" 
              description="AI-generated code solutions"
            />
            <FeatureCard 
              icon={Shield} 
              title="Full Reports" 
              description="Detailed issue breakdowns"
            />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-violet-500 to-cyan-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-all duration-500" />
            <Card className="relative rounded-2xl border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-2 flex gap-2">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Globe className="h-5 w-5 text-primary shrink-0" />
                  <Input
                    type="text"
                    placeholder="Enter any website URL to scan..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 h-14 text-lg border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground"
                    data-testid="input-url"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={createAuditMutation.isPending || !url.trim()}
                  className="h-14 px-8 rounded-xl font-semibold text-base bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 border-0 shadow-lg shadow-primary/25"
                  data-testid="button-submit"
                >
                  {createAuditMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Scan className="h-5 w-5 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Try it with any public website — results in seconds
          </p>
        </form>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Recent Scans</h2>
              <p className="text-sm text-muted-foreground">Your accessibility audit history</p>
            </div>
            {audits && audits.length > 0 && (
              <Badge variant="outline" className="px-3 py-1">
                {audits.length} scan{audits.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !audits || audits.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">No scans yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Enter a URL above to run your first accessibility audit and discover issues.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {audits.map((audit) => {
                const statusConfig = getStatusConfig(audit.status);
                const StatusIcon = statusConfig.icon;
                const isProcessing = audit.status === "scanning" || audit.status === "analyzing";
                
                return (
                  <Card
                    key={audit.id}
                    className="group cursor-pointer hover-elevate transition-all duration-200"
                    onClick={() => setLocation(`/audit/${audit.id}`)}
                    data-testid={`card-audit-${audit.id}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground truncate">
                              {formatUrl(audit.url)}
                            </h3>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(audit.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAuditMutation.mutate(audit.id);
                          }}
                          data-testid={`button-delete-${audit.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`${statusConfig.bg} ${statusConfig.text} border-none`}>
                          <StatusIcon className={`h-3 w-3 mr-1 ${isProcessing ? 'animate-spin' : ''}`} />
                          <span className="capitalize">{audit.status}</span>
                        </Badge>
                        
                        {audit.status === "completed" && (
                          <>
                            {(audit.errorCount ?? 0) > 0 && (
                              <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {audit.errorCount} error{audit.errorCount !== 1 ? 's' : ''}
                              </Badge>
                            )}
                            {(audit.warningCount ?? 0) > 0 && (
                              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {audit.warningCount}
                              </Badge>
                            )}
                            {(audit.noticeCount ?? 0) > 0 && (
                              <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-none">
                                <Info className="h-3 w-3 mr-1" />
                                {audit.noticeCount}
                              </Badge>
                            )}
                            {audit.errorCount === 0 && audit.warningCount === 0 && audit.noticeCount === 0 && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                All clear
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      
                      {isProcessing && (
                        <div className="mt-3 h-1 bg-muted overflow-hidden rounded-full">
                          <div className="h-full w-1/3 bg-gradient-to-r from-primary to-orange-500 animate-pulse rounded-full" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Powered by <span className="text-foreground font-medium">pa11y</span> + <span className="text-foreground font-medium">OpenAI</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
