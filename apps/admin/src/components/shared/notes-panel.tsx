"use client";

import { useState, useCallback, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Tag } from "lucide-react";
import { format } from "date-fns";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NoteTag = "vip" | "high_risk" | "needs_follow_up";

export type AdminNote = {
  id: string;
  entity_type: string;
  entity_id: string;
  author_id: string;
  author_email?: string;
  content: string;
  tags: NoteTag[];
  created_at: string;
};

type NotesPanelProps = {
  /** Entity type (salon, user, case) */
  entityType: string;
  /** Entity ID */
  entityId: string;
  /** Existing notes */
  notes: AdminNote[];
  /** Whether notes are loading */
  loading?: boolean;
  /** Callback to create a new note */
  onCreateNote: (content: string, tags: NoteTag[]) => Promise<void>;
  /** Additional CSS classes */
  className?: string;
};

// ---------------------------------------------------------------------------
// Tag config
// ---------------------------------------------------------------------------

const TAG_CONFIG: Record<NoteTag, { label: string; className: string }> = {
  vip: { label: "VIP", className: "bg-amber-50 text-amber-700 border-amber-200" },
  high_risk: {
    label: "High Risk",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  needs_follow_up: {
    label: "Follow-up",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotesPanel({
  entityType,
  entityId,
  notes,
  loading = false,
  onCreateNote,
  className,
}: NotesPanelProps) {
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<NoteTag>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = useCallback((tag: NoteTag) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!content.trim() || submitting) return;

      setSubmitting(true);
      try {
        await onCreateNote(content.trim(), [...selectedTags]);
        setContent("");
        setSelectedTags(new Set());
      } finally {
        setSubmitting(false);
      }
    },
    [content, selectedTags, submitting, onCreateNote]
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Internal Notes</h3>
        <span className="text-xs text-muted-foreground">
          ({notes.length})
        </span>
      </div>

      {/* New note form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add an internal note..."
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 resize-none"
        />

        <div className="flex items-center justify-between gap-2">
          {/* Tag toggles */}
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {(Object.entries(TAG_CONFIG) as [NoteTag, typeof TAG_CONFIG[NoteTag]][]).map(
              ([tag, config]) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
                    selectedTags.has(tag)
                      ? config.className
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {config.label}
                </button>
              )
            )}
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || submitting}
            className="h-7 gap-1 text-xs"
          >
            <Send className="h-3 w-3" />
            {submitting ? "Saving..." : "Add Note"}
          </Button>
        </div>
      </form>

      {/* Notes list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border p-3 space-y-2 animate-pulse"
            >
              <div className="h-3 w-32 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
          ))
        ) : notes.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No notes yet
          </p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="rounded-lg border p-3 space-y-1.5">
              {/* Meta row */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {note.author_email ?? note.author_id.substring(0, 8)}
                </span>
                <span>&middot;</span>
                <span>
                  {format(new Date(note.created_at), "MMM d, yyyy HH:mm")}
                </span>
              </div>

              {/* Content */}
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex items-center gap-1 pt-0.5">
                  {note.tags.map((tag) => {
                    const config = TAG_CONFIG[tag];
                    return config ? (
                      <span
                        key={tag}
                        className={cn(
                          "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                          config.className
                        )}
                      >
                        {config.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
