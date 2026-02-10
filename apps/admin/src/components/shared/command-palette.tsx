"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-client";
import {
  Building2,
  Users,
  Search,
  Calendar,
  FileText,
  Inbox,
  HeartPulse,
  BarChart3,
  Shield,
  ToggleRight,
  Database,
  AlertTriangle,
  GitBranch,
  CreditCard,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

type SearchResult = {
  id: string;
  type: "salon" | "user" | "page" | "action";
  title: string;
  subtitle?: string;
  icon: typeof Building2;
  href?: string;
  action?: () => void;
};

const PAGES: SearchResult[] = [
  { id: "dashboard", type: "page", title: "Dashboard", icon: BarChart3, href: "/" },
  { id: "system-health", type: "page", title: "System Health", icon: HeartPulse, href: "/system-health" },
  { id: "support", type: "page", title: "Support Inbox", icon: Inbox, href: "/support" },
  { id: "incidents", type: "page", title: "Incidents", icon: AlertTriangle, href: "/incidents" },
  { id: "salons", type: "page", title: "Salons", icon: Building2, href: "/salons" },
  { id: "onboarding", type: "page", title: "Onboarding", icon: GitBranch, href: "/onboarding" },
  { id: "plans", type: "page", title: "Plans & Billing", icon: CreditCard, href: "/plans" },
  { id: "users", type: "page", title: "Users", icon: Users, href: "/users" },
  { id: "admins", type: "page", title: "Admins", icon: Shield, href: "/admins" },
  { id: "audit-logs", type: "page", title: "Audit Logs", icon: FileText, href: "/audit-logs" },
  { id: "security-events", type: "page", title: "Security Events", icon: Shield, href: "/security-events" },
  { id: "data-tools", type: "page", title: "Data Tools", icon: Database, href: "/data-tools" },
  { id: "analytics", type: "page", title: "Metrics", icon: BarChart3, href: "/analytics" },
  { id: "cohorts", type: "page", title: "Cohorts", icon: BarChart3, href: "/analytics/cohorts" },
  { id: "feature-flags", type: "page", title: "Feature Flags", icon: ToggleRight, href: "/feature-flags" },
  { id: "changelog", type: "page", title: "Changelog", icon: MessageSquare, href: "/changelog" },
  { id: "feedback", type: "page", title: "Feedback", icon: MessageSquare, href: "/feedback" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(PAGES.slice(0, 6));
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(PAGES.slice(0, 6)); return; }
    setLoading(true);
    const lower = q.toLowerCase();

    // Filter pages
    const pageResults = PAGES.filter((p) => p.title.toLowerCase().includes(lower));

    // Search salons
    const { data: salons } = await supabase
      .from("salons")
      .select("id, name, slug")
      .ilike("name", `%${q}%`)
      .limit(5);

    const salonResults: SearchResult[] = (salons ?? []).map((s) => ({
      id: s.id,
      type: "salon" as const,
      title: s.name,
      subtitle: s.slug,
      icon: Building2,
      href: "/salons",
    }));

    // Search users
    const { data: users } = await supabase
      .from("profiles")
      .select("user_id, email")
      .ilike("email", `%${q}%`)
      .limit(5);

    const userResults: SearchResult[] = (users ?? []).map((u) => ({
      id: u.user_id,
      type: "user" as const,
      title: u.email,
      icon: Users,
      href: "/users",
    }));

    setResults([...pageResults, ...salonResults, ...userResults]);
    setSelectedIdx(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (query) search(query); else setResults(PAGES.slice(0, 6)); }, 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  function handleSelect(result: SearchResult) {
    setOpen(false);
    if (result.href) router.push(result.href);
    if (result.action) result.action();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[selectedIdx]) { handleSelect(results[selectedIdx]); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-x-0 top-[20%] mx-auto max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="bg-background rounded-xl border shadow-2xl overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search salons, users, pages..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] text-muted-foreground">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto p-1">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No results found</p>
            ) : (
              results.map((result, i) => (
                <button
                  key={result.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors",
                    i === selectedIdx ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIdx(i)}
                >
                  <result.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate">{result.title}</span>
                    {result.subtitle && <span className="text-xs text-muted-foreground">{result.subtitle}</span>}
                  </div>
                  <span className="text-[10px] text-muted-foreground capitalize">{result.type}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
            <span><kbd className="border rounded px-1">↑↓</kbd> Navigate</span>
            <span><kbd className="border rounded px-1">↵</kbd> Select</span>
            <span><kbd className="border rounded px-1">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
