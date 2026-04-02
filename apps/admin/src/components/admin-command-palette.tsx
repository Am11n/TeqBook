"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Search, Building2, User, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type SearchResult,
  buildAdminCommandPaletteNav,
} from "./admin-command-palette-nav";
import type { AdminConsoleMessages } from "@/i18n/admin-console";

type AdminCommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  messages: AdminConsoleMessages["commandPalette"];
};

export function AdminCommandPalette({ open, onClose, messages: cmd }: AdminCommandPaletteProps) {
  const router = useRouter();
  const { navigationItems, actionItems, groupLabel } = useMemo(
    () => buildAdminCommandPaletteNav(cmd),
    [cmd],
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const search = async () => {
      if (!query.trim()) {
        setResults([...navigationItems.slice(0, 6), ...actionItems.slice(0, 3)]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const term = query.toLowerCase().trim();
      const allResults: SearchResult[] = [];

      try {
        const matchingNav = navigationItems.filter((item) =>
          item.label.toLowerCase().includes(term)
        );
        allResults.push(...matchingNav);

        const matchingActions = actionItems.filter((item) =>
          item.label.toLowerCase().includes(term)
        );
        allResults.push(...matchingActions);

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

          const { data: userResults } = await supabase.rpc("get_users_paginated", {
            filters: { search: term },
            sort_col: "created_at",
            sort_dir: "desc",
            lim: 5,
            off: 0,
          });

          if (userResults) {
            allResults.push(
              ...(userResults as Array<Record<string, unknown>>).map((u) => {
                const uid = u.user_id as string;
                return {
                  id: `user-${uid}`,
                  type: "user" as const,
                  label: (u.email as string) ?? `${cmd.anonymousUserLabel} ${uid.slice(0, 8)}`,
                  metadata: (u.salon_name as string) ?? undefined,
                  href: `/users?highlight=${uid}`,
                  icon: User,
                };
              })
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
  }, [query, open, navigationItems, actionItems, cmd.anonymousUserLabel]);

  const handleSelect = useCallback((result: SearchResult) => {
    if (result.href) {
      router.push(result.href);
      onClose();
    }
  }, [router, onClose]);

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

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([...navigationItems.slice(0, 6), ...actionItems.slice(0, 3)]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, navigationItems, actionItems]);

  if (!open) return null;

  const groupedResults: { group: string; items: SearchResult[] }[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (!seen.has(r.type)) {
      seen.add(r.type);
      groupedResults.push({ group: r.type, items: results.filter((item) => item.type === r.type) });
    }
  }

  let flatIdx = -1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white/80 backdrop-blur-2xl border border-slate-100/60 shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" aria-hidden />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={cmd.placeholder}
              className="flex-1 border-none bg-transparent text-base outline-none placeholder:text-slate-400"
            />
            <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100" aria-label={cmd.closeLabel}>
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          <div ref={resultsRef} className="max-h-[400px] overflow-y-auto p-2">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">{cmd.searching}</div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">{cmd.empty}</div>
            ) : (
              groupedResults.map(({ group, items }) => (
                <div key={group} className="mb-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {groupLabel(group as SearchResult["type"])}
                  </p>
                  {items.map((result) => {
                    flatIdx++;
                    const currentIdx = flatIdx;
                    const Icon = result.icon;
                    const isSelected = currentIdx === selectedIndex;

                    return (
                      <button
                        type="button"
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

          <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span>{cmd.footerKeyboardHint}</span>
              <kbd className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs">⌘K</kbd>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
