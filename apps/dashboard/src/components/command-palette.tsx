"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCurrentSalon } from "@/components/salon-provider";
import { searchSalonEntities } from "@/lib/services/search-service";
import {
  Search,
  Calendar,
  UserCircle,
  Users,
  Scissors,
  Clock,
  Settings,
  BookOpen,
  X,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SearchResult = {
  id: string;
  type: "booking" | "customer" | "employee" | "service" | "shift" | "navigation";
  label: string;
  metadata?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
};

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

// Navigation shortcuts (static, defined outside component)
const navigationItems: SearchResult[] = [
  {
    id: "nav-dashboard",
    type: "navigation",
    label: "Go to Dashboard",
    href: "/dashboard",
    icon: Settings,
  },
  {
    id: "nav-calendar",
    type: "navigation",
    label: "Go to Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    id: "nav-create-booking",
    type: "navigation",
    label: "New booking",
    href: "/bookings?new=true",
    icon: BookOpen,
  },
  {
    id: "nav-create-customer",
    type: "navigation",
    label: "New customer",
    href: "/customers?new=true",
    icon: UserCircle,
  },
  {
    id: "nav-employees",
    type: "navigation",
    label: "Manage employees",
    href: "/employees",
    icon: Users,
  },
  {
    id: "nav-services",
    type: "navigation",
    label: "Manage services",
    href: "/services",
    icon: Scissors,
  },
  {
    id: "nav-customers",
    type: "navigation",
    label: "Manage customers",
    href: "/customers",
    icon: UserCircle,
  },
  {
    id: "nav-shifts",
    type: "navigation",
    label: "Manage shifts",
    href: "/shifts",
    icon: Clock,
  },
  {
    id: "nav-settings",
    type: "navigation",
    label: "Settings",
    href: "/settings/general",
    icon: Settings,
  },
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { salon } = useCurrentSalon();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>(navigationItems);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Search function
  useEffect(() => {
    if (!open || !salon?.id) return;

    const search = async () => {
      if (!query.trim()) {
        setResults(navigationItems);
        return;
      }

      setLoading(true);
      const term = query.toLowerCase().trim();
      const allResults: SearchResult[] = [];

      try {
        // Search using search service
        const { data: searchResults, error: searchError } = await searchSalonEntities(
          salon.id,
          term,
          5
        );

        if (searchError) {
          console.error("Search error:", searchError);
          setResults(navigationItems);
          setLoading(false);
          return;
        }

        // Map search results to SearchResult format with icons
        if (searchResults) {
          searchResults.forEach((result) => {
            let icon: React.ComponentType<{ className?: string }> = Search;
            if (result.type === "customer") icon = UserCircle;
            else if (result.type === "employee") icon = Users;
            else if (result.type === "service") icon = Scissors;
            else if (result.type === "booking") icon = Calendar;

            allResults.push({
              ...result,
              icon,
            });
          });
        }

        // Add navigation items if query matches
        const matchingNav = navigationItems.filter((item) =>
          item.label.toLowerCase().includes(term)
        );
        allResults.push(...matchingNav);

        setResults(allResults.slice(0, 10));
      } catch (error) {
        console.error("Search error:", error);
        setResults(navigationItems);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query, open, salon?.id]);

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
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
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

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults(navigationItems);
    }
  }, [open]);


  if (!open) return null;

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
              placeholder="Search bookings, customers, services..."
              className="flex-1 border-none bg-transparent text-base outline-none placeholder:text-slate-400"
            />
            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-slate-100"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* Results */}
          <div
            ref={resultsRef}
            className="max-h-[400px] overflow-y-auto p-2"
          >
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No results found
              </div>
            ) : (
              results.map((result, index) => {
                const Icon = result.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-[0_4px_14px_rgba(44,111,248,0.4)]"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isSelected ? "text-white" : "text-slate-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          isSelected ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {result.label}
                      </div>
                      {result.metadata && (
                        <div
                          className={`text-xs ${
                            isSelected ? "text-white/80" : "text-slate-500"
                          }`}
                        >
                          {result.metadata}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {result.type === "navigation" && (
                        <span
                          className={`text-xs ${
                            isSelected ? "text-white/60" : "text-slate-400"
                          }`}
                        >
                          Navigation
                        </span>
                      )}
                      <ArrowRight
                        className={`h-4 w-4 ${
                          isSelected ? "text-white/60" : "text-slate-400"
                        }`}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
              <span className="flex items-center gap-4">
                <kbd className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs">
                  ⌘K
                </kbd>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

