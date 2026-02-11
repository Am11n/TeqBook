"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import {
  Search,
  Building2,
  Users,
  User,
  TrendingUp,
  LayoutDashboard,
  X,
  ArrowRight,
  Shield,
  Inbox,
  FileText,
  Flag,
  HeartPulse,
  MessageSquare,
  Megaphone,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SearchResult = {
  id: string;
  type: "navigation" | "salon" | "user" | "action";
  label: string;
  metadata?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AdminCommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

// ── Static items ────────────────────────────────────────
const navigationItems: SearchResult[] = [
  { id: "nav-dashboard", type: "navigation", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { id: "nav-salons", type: "navigation", label: "Salons", href: "/salons", icon: Building2 },
  { id: "nav-users", type: "navigation", label: "Users", href: "/users", icon: Users },
  { id: "nav-analytics", type: "navigation", label: "Metrics", href: "/analytics", icon: TrendingUp },
  { id: "nav-support", type: "navigation", label: "Support Inbox", href: "/support", icon: Inbox },
  { id: "nav-audit", type: "navigation", label: "Audit Logs", href: "/audit-logs", icon: FileText },
  { id: "nav-health", type: "navigation", label: "System Health", href: "/system-health", icon: HeartPulse },
  { id: "nav-incidents", type: "navigation", label: "Incidents", href: "/incidents", icon: Shield },
  { id: "nav-security", type: "navigation", label: "Security Events", href: "/security-events", icon: Shield },
  { id: "nav-flags", type: "navigation", label: "Feature Flags", href: "/feature-flags", icon: Flag },
  { id: "nav-changelog", type: "navigation", label: "Changelog", href: "/changelog", icon: Megaphone },
  { id: "nav-feedback", type: "navigation", label: "Feedback", href: "/feedback", icon: MessageSquare },
  { id: "nav-onboarding", type: "navigation", label: "Onboarding", href: "/onboarding", icon: Settings },
  { id: "nav-plans", type: "navigation", label: "Plans & Billing", href: "/plans", icon: Settings },
  { id: "nav-admins", type: "navigation", label: "Admins", href: "/admins", icon: Shield },
  { id: "nav-cohorts", type: "navigation", label: "Cohorts", href: "/analytics/cohorts", icon: TrendingUp },
];

const actionItems: SearchResult[] = [
  { id: "action-create-case", type: "action", label: "Create Support Case", href: "/support", icon: Inbox, metadata: "Action" },
  { id: "action-invite-user", type: "action", label: "Invite User", href: "/users", icon: Users, metadata: "Action" },
  { id: "action-create-salon", type: "action", label: "Create Salon", href: "/salons", icon: Building2, metadata: "Action" },
  { id: "action-add-flag", type: "action", label: "Add Feature Flag", href: "/feature-flags", icon: Flag, metadata: "Action" },
  { id: "action-export", type: "action", label: "Export Report", href: "/analytics", icon: TrendingUp, metadata: "Action" },
];

// Group labels for result categories
const GROUP_LABELS: Record<string, string> = {
  navigation: "Pages",
  salon: "Salons",
  user: "Users",
  action: "Actions",
};

export function AdminCommandPalette({ open, onClose }: AdminCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Search function
  useEffect(() => {
    if (!open) return;

    const search = async () => {
      if (!query.trim()) {
        // Show a useful default: top nav items + actions
        setResults([...navigationItems.slice(0, 6), ...actionItems.slice(0, 3)]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const term = query.toLowerCase().trim();
      const allResults: SearchResult[] = [];

      try {
        // 1. Filter navigation items
        const matchingNav = navigationItems.filter((item) =>
          item.label.toLowerCase().includes(term)
        );
        allResults.push(...matchingNav);

        // 2. Filter action items
        const matchingActions = actionItems.filter((item) =>
          item.label.toLowerCase().includes(term)
        );
        allResults.push(...matchingActions);

        // 3. Search salons by name (only if query is 2+ chars)
        if (term.length >= 2) {
          const { data: salons } = await supabase
            .from("salons")
            .select("id, name, slug")
            .ilike("name", `%${term}%`)
            .limit(5);

          if (salons) {
            allResults.push(
              ...salons.map((s) => ({
                id: `salon-${s.id}`,
                type: "salon" as const,
                label: s.name,
                metadata: s.slug ?? undefined,
                href: `/salons?highlight=${s.id}`,
                icon: Building2,
              }))
            );
          }

          // 4. Search users by email via RPC (includes auth.users email)
          const { data: userResults } = await supabase.rpc("get_users_paginated", {
            filters: { search: term },
            sort_col: "created_at",
            sort_dir: "desc",
            lim: 5,
            off: 0,
          });

          if (userResults) {
            allResults.push(
              ...(userResults as Array<Record<string, unknown>>).map((u) => ({
                id: `user-${u.user_id as string}`,
                type: "user" as const,
                label: (u.email as string) ?? `User ${(u.user_id as string).slice(0, 8)}`,
                metadata: (u.salon_name as string) ?? undefined,
                href: `/users?highlight=${u.user_id as string}`,
                icon: User,
              }))
            );
          }
        }

        setResults(allResults.slice(0, 15));
      } catch (error) {
        console.error("Command palette search error:", error);
        setResults([...navigationItems.slice(0, 4)]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 200);
    return () => clearTimeout(timeoutId);
  }, [query, open]);

  const handleSelect = useCallback((result: SearchResult) => {
    if (result.href) {
      router.push(result.href);
      onClose();
    }
  }, [router, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => prev < results.length - 1 ? prev + 1 : prev);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, results, selectedIndex, onClose, handleSelect]);

  // Reset on results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([...navigationItems.slice(0, 6), ...actionItems.slice(0, 3)]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  // Group results by type for rendering
  const groupedResults: { group: string; items: SearchResult[] }[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (!seen.has(r.type)) {
      seen.add(r.type);
      groupedResults.push({ group: r.type, items: results.filter((item) => item.type === r.type) });
    }
  }

  // Flat index counter for keyboard selection
  let flatIdx = -1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white/80 backdrop-blur-2xl border border-slate-100/60 shadow-2xl"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search salons, users, or type a command..."
              className="flex-1 border-none bg-transparent text-base outline-none placeholder:text-slate-400"
            />
            <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* Results */}
          <div ref={resultsRef} className="max-h-[400px] overflow-y-auto p-2">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">Searching...</div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No results found</div>
            ) : (
              groupedResults.map(({ group, items }) => (
                <div key={group} className="mb-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {GROUP_LABELS[group] ?? group}
                  </p>
                  {items.map((result) => {
                    flatIdx++;
                    const currentIdx = flatIdx;
                    const Icon = result.icon;
                    const isSelected = currentIdx === selectedIndex;

                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(currentIdx)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-[0_4px_14px_rgba(44,111,248,0.4)]"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {result.label}
                          </div>
                          {result.metadata && (
                            <div className={`text-xs ${isSelected ? "text-white/80" : "text-slate-500"}`}>
                              {result.metadata}
                            </div>
                          )}
                        </div>
                        <ArrowRight className={`h-4 w-4 ${isSelected ? "text-white/60" : "text-slate-400"}`} />
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span>↑↓ navigate &middot; Enter select &middot; Esc close</span>
              <kbd className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs">⌘K</kbd>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
