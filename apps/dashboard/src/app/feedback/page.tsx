"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/feedback/error-message";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase-client";
import {
  Plus,
  Bug,
  Lightbulb,
  Sparkles,
  HelpCircle,
  Paperclip,
  Send,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FeedbackEntry = {
  id: string;
  salon_id: string | null;
  user_id: string | null;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  votes: number;
  created_at: string;
  updated_at: string;
};

type FeedbackComment = {
  id: string;
  feedback_id: string;
  author_user_id: string;
  author_role: string;
  message: string;
  is_internal: boolean;
  attachments: { path: string; name: string; size: number }[];
  created_at: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  planned: "bg-purple-50 text-purple-700 border-purple-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  planned: "Planned",
  in_progress: "In progress",
  delivered: "Delivered",
  rejected: "Rejected",
};

const TYPE_COLORS: Record<string, string> = {
  bug_report: "bg-red-50 text-red-700",
  feature_request: "bg-blue-50 text-blue-700",
  improvement: "bg-amber-50 text-amber-700",
  other: "bg-muted text-muted-foreground",
};

const TYPE_LABELS: Record<string, string> = {
  bug_report: "Bug report",
  feature_request: "Feature request",
  improvement: "Improvement",
  other: "Other",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-orange-50 text-orange-700",
  medium: "bg-yellow-50 text-yellow-700",
  low: "bg-muted text-muted-foreground",
};

const FEEDBACK_TYPES = [
  { value: "bug_report", label: "Report a bug", icon: Bug },
  { value: "feature_request", label: "Request a feature", icon: Lightbulb },
  { value: "improvement", label: "Suggest improvement", icon: Sparkles },
  { value: "other", label: "Other", icon: HelpCircle },
] as const;

type FilterTab = "all" | "new" | "active" | "done";

// ---------------------------------------------------------------------------
// Helper: capture client metadata
// ---------------------------------------------------------------------------
function captureMetadata(locale: string): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  return {
    page_url: window.location.pathname,
    user_agent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale,
    screen: `${window.screen.width}x${window.screen.height}`,
  };
}

// ---------------------------------------------------------------------------
// Feedback Page
// ---------------------------------------------------------------------------

export default function FeedbackPage() {
  const { salon, user, loading: ctxLoading, isReady } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale];

  // State
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<string>("feature_request");
  const [selectedEntry, setSelectedEntry] = useState<FeedbackEntry | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch entries
  // ---------------------------------------------------------------------------
  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("feedback_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setEntries((data as FeedbackEntry[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isReady) loadEntries();
  }, [isReady, loadEntries]);

  // ---------------------------------------------------------------------------
  // Filtered entries
  // ---------------------------------------------------------------------------
  const filteredEntries = useMemo(() => {
    if (filterTab === "all") return entries;
    if (filterTab === "new") return entries.filter((e) => e.status === "new");
    if (filterTab === "active")
      return entries.filter((e) => e.status === "planned" || e.status === "in_progress");
    // done
    return entries.filter((e) => e.status === "delivered" || e.status === "rejected");
  }, [entries, filterTab]);

  // Count badges
  const newCount = entries.filter((e) => e.status === "new").length;
  const activeCount = entries.filter((e) => e.status === "planned" || e.status === "in_progress").length;

  // ---------------------------------------------------------------------------
  // Open create dialog with pre-selected type
  // ---------------------------------------------------------------------------
  function openCreateDialog(type: string) {
    setDialogType(type);
    setDialogOpen(true);
  }

  // ---------------------------------------------------------------------------
  // Detail view
  // ---------------------------------------------------------------------------
  if (selectedEntry) {
    return (
      <PageLayout
        title={t.dashboard?.feedback ?? "Feedback"}
        description={t.dashboard?.feedback ?? "Feedback"}
        showCard={false}
      >
        <FeedbackDetailView
          entry={selectedEntry}
          userId={user?.id ?? ""}
          salonId={salon?.id ?? ""}
          onBack={() => {
            setSelectedEntry(null);
            loadEntries();
          }}
        />
      </PageLayout>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <PageLayout
      title={t.dashboard?.feedback ?? "Feedback"}
      description="Share your ideas, report bugs, or suggest improvements."
      actions={
        <Button size="sm" className="gap-1.5" onClick={() => openCreateDialog("feature_request")}>
          <Plus className="h-4 w-4" />
          Submit feedback
        </Button>
      }
    >
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          variant="destructive"
          className="mb-4"
        />
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border-b">
        {(
          [
            { key: "all", label: "All" },
            { key: "new", label: "New", count: newCount },
            { key: "active", label: "In progress", count: activeCount },
            { key: "done", label: "Done" },
          ] as { key: FilterTab; label: string; count?: number }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              filterTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Entries list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredEntries.length === 0 && filterTab === "all" && entries.length === 0 ? (
        <EmptyState onSelect={openCreateDialog} />
      ) : filteredEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No feedback in this category.
        </p>
      ) : (
        <div className="space-y-2">
          {filteredEntries.map((e) => (
            <FeedbackRow key={e.id} entry={e} onClick={() => setSelectedEntry(e)} />
          ))}
        </div>
      )}

      {/* New feedback dialog */}
      <NewFeedbackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        salonId={salon?.id ?? ""}
        locale={locale}
        defaultType={dialogType}
        onCreated={(entry) => {
          setDialogOpen(false);
          if (entry) {
            // Check if it was a dupe (entry already existed in our list)
            const isDupe = entries.some((e) => e.id === entry.id);
            if (isDupe) {
              setSelectedEntry(entry);
            } else {
              loadEntries();
            }
          } else {
            loadEntries();
          }
        }}
      />
    </PageLayout>
  );
}

// ---------------------------------------------------------------------------
// Empty State — three action cards
// ---------------------------------------------------------------------------

function EmptyState({ onSelect }: { onSelect: (type: string) => void }) {
  const cards = [
    {
      type: "bug_report",
      title: "Report a bug",
      description: "Something not working? Let us know.",
      icon: Bug,
      accent: "text-red-600 bg-red-50 border-red-200",
    },
    {
      type: "feature_request",
      title: "Request a feature",
      description: "Have an idea? We'd love to hear it.",
      icon: Lightbulb,
      accent: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      type: "improvement",
      title: "Suggest improvement",
      description: "Something could be better? Tell us how.",
      icon: Sparkles,
      accent: "text-amber-600 bg-amber-50 border-amber-200",
    },
  ];

  return (
    <div className="py-12">
      <p className="text-center text-muted-foreground mb-6">
        No feedback submitted yet. How can we improve?
      </p>
      <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
        {cards.map((card) => (
          <button
            key={card.type}
            onClick={() => onSelect(card.type)}
            className={`flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${card.accent}`}
          >
            <card.icon className="h-8 w-8" />
            <div>
              <p className="font-semibold text-sm">{card.title}</p>
              <p className="text-xs mt-1 opacity-70">{card.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feedback Row
// ---------------------------------------------------------------------------

function FeedbackRow({
  entry,
  onClick,
}: {
  entry: FeedbackEntry;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{entry.title}</span>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${TYPE_COLORS[entry.type] ?? ""}`}
          >
            {TYPE_LABELS[entry.type] ?? entry.type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {entry.description ?? "No description"}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[entry.status] ?? ""}`}
        >
          {STATUS_LABELS[entry.status] ?? entry.status}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[entry.priority] ?? ""}`}
        >
          {entry.priority}
        </span>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {format(new Date(entry.created_at), "dd.MM.yyyy")}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// New Feedback Dialog
// ---------------------------------------------------------------------------

function NewFeedbackDialog({
  open,
  onOpenChange,
  salonId,
  locale,
  defaultType,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string;
  locale: string;
  defaultType: string;
  onCreated: (entry: FeedbackEntry | null) => void;
}) {
  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dupeEntry, setDupeEntry] = useState<FeedbackEntry | null>(null);

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setType(defaultType);
      setTitle("");
      setDescription("");
      setFiles([]);
      setError(null);
      setDupeEntry(null);
    }
  }, [open, defaultType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    // Max 3 files, 5MB each, images only
    const valid = selected
      .filter((f) => f.size <= 5 * 1024 * 1024 && /\.(jpe?g|png|webp)$/i.test(f.name))
      .slice(0, 3);
    setFiles(valid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);
    setDupeEntry(null);

    try {
      // 1. Upload attachments if any
      const attachmentPaths: { path: string; name: string; size: number }[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${salonId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("feedback-attachments")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (uploadErr) {
          setError(`Failed to upload ${file.name}: ${uploadErr.message}`);
          setSubmitting(false);
          return;
        }
        attachmentPaths.push({ path, name: file.name, size: file.size });
      }

      // 2. Capture metadata
      const metadata = captureMetadata(locale);

      // 3. Call RPC
      const { data, error: rpcError } = await supabase.rpc("create_feedback_entry_for_salon", {
        p_title: title.trim(),
        p_description: description.trim() || null,
        p_type: type,
        p_attachment_paths: attachmentPaths,
        p_metadata: metadata,
      });

      if (rpcError) {
        if (rpcError.message.includes("Rate limit")) {
          setError("You've reached the submission limit. Please try again later.");
        } else {
          setError(rpcError.message);
        }
        setSubmitting(false);
        return;
      }

      const returnedEntry = data as FeedbackEntry | null;

      // Check if this was a dupe (created_at would be older than a few seconds)
      if (returnedEntry && returnedEntry.created_at) {
        const age = Date.now() - new Date(returnedEntry.created_at).getTime();
        if (age > 10000) {
          // Older than 10 seconds = dupe
          setDupeEntry(returnedEntry);
          setSubmitting(false);
          return;
        }
      }

      onCreated(returnedEntry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your thoughts, reporting bugs, or requesting features.
          </DialogDescription>
        </DialogHeader>

        {dupeEntry && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-medium text-amber-800 mb-1">
              We&apos;re already tracking this
            </p>
            <p className="text-xs text-amber-700 mb-2">
              A similar feedback entry was found: &quot;{dupeEntry.title}&quot;
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  onOpenChange(false);
                  onCreated(dupeEntry);
                }}
              >
                View existing
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => setDupeEntry(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type - native select per cursorrules */}
          <div className="space-y-2">
            <Label htmlFor="feedback-type">Type</Label>
            <select
              id="feedback-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
            >
              {FEEDBACK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="feedback-title">Title</Label>
            <Input
              id="feedback-title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 200))}
              placeholder="Brief summary"
              required
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/200</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="feedback-description">
              Description{" "}
              {type === "bug_report" && (
                <span className="text-red-500 font-normal">*</span>
              )}
            </Label>
            <textarea
              id="feedback-description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
              placeholder={
                type === "bug_report"
                  ? "What happened? What did you expect? Steps to reproduce..."
                  : "Describe your idea or suggestion..."
              }
              rows={4}
              required={type === "bug_report"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/0 transition placeholder:text-muted-foreground focus-visible:ring-2 resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/2000
            </p>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label htmlFor="feedback-files">
              Screenshots{" "}
              <span className="text-muted-foreground font-normal">
                (optional, max 3 images, 5MB each)
              </span>
            </Label>
            <Input
              id="feedback-files"
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {files.map((f, i) => (
                  <Badge key={i} variant="secondary" className="text-xs gap-1">
                    <Paperclip className="h-3 w-3" />
                    {f.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Feedback Detail View
// ---------------------------------------------------------------------------

function FeedbackDetailView({
  entry,
  userId,
  salonId,
  onBack,
}: {
  entry: FeedbackEntry;
  userId: string;
  salonId: string;
  onBack: () => void;
}) {
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable description state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title);
  const [editDescription, setEditDescription] = useState(entry.description ?? "");
  const [saving, setSaving] = useState(false);

  const canEdit = entry.status === "new" && entry.user_id === userId;

  // ---------------------------------------------------------------------------
  // Load comments
  // ---------------------------------------------------------------------------
  const loadComments = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("feedback_comments")
      .select("*")
      .eq("feedback_id", entry.id)
      .order("created_at", { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setComments((data as FeedbackComment[]) ?? []);
    }
    setLoading(false);
  }, [entry.id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // ---------------------------------------------------------------------------
  // Send reply
  // ---------------------------------------------------------------------------
  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    setError(null);

    try {
      const { error: insertErr } = await supabase
        .from("feedback_comments")
        .insert({
          feedback_id: entry.id,
          author_user_id: userId,
          author_role: "salon",
          message: replyText.trim(),
          is_internal: false,
        });

      if (insertErr) {
        setError(insertErr.message);
        setSending(false);
        return;
      }

      setReplyText("");
      loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSending(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Save edit
  // ---------------------------------------------------------------------------
  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const { error: updateErr } = await supabase
        .from("feedback_entries")
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.id);

      if (updateErr) {
        setError(updateErr.message);
        setSaving(false);
        return;
      }

      // Update local state
      entry.title = editTitle.trim();
      entry.description = editDescription.trim() || null;
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  // Status icon
  const StatusIcon =
    entry.status === "delivered"
      ? CheckCircle2
      : entry.status === "rejected"
        ? XCircle
        : Clock;

  const isDone = entry.status === "delivered" || entry.status === "rejected";

  // Attachments from metadata
  const attachments = (() => {
    const atts = entry.metadata?.attachments;
    if (!Array.isArray(atts) || atts.length === 0) return null;
    return atts as { path: string; name: string }[];
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="mt-0.5 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">{entry.title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[entry.status] ?? ""}`}
            >
              <StatusIcon className="h-3 w-3" />
              {STATUS_LABELS[entry.status] ?? entry.status}
            </span>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[entry.type] ?? ""}`}
            >
              {TYPE_LABELS[entry.type] ?? entry.type}
            </span>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[entry.priority] ?? ""}`}
            >
              {entry.priority}
            </span>
            <span className="text-xs text-muted-foreground">
              Created {format(new Date(entry.created_at), "dd.MM.yyyy HH:mm")}
            </span>
          </div>
        </div>
      </div>

      {/* Description card (editable when status = new) */}
      <div className="rounded-lg border bg-card p-4">
        {editing ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value.slice(0, 200))}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <textarea
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value.slice(0, 2000))}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/0 transition placeholder:text-muted-foreground focus-visible:ring-2 resize-none"
                maxLength={2000}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} disabled={saving || !editTitle.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setEditTitle(entry.title);
                  setEditDescription(entry.description ?? "");
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">Description</p>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {entry.description || "No description provided."}
            </p>
            {attachments && (
              <div className="mt-3 flex flex-wrap gap-1">
                {attachments.map((att, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={async () => {
                      const { data, error } = await supabase.storage
                        .from("feedback-attachments")
                        .createSignedUrl(att.path, 300);
                      if (error || !data?.signedUrl) return;
                      window.open(data.signedUrl, "_blank");
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                  >
                    <Paperclip className="h-3 w-3" />
                    {att.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" />
      )}

      {/* Comments thread */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Conversation</h3>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No messages yet. Add a comment below.
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => {
              const isOwn = comment.author_user_id === userId;
              return (
                <div
                  key={comment.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {!isOwn && (
                      <p className={`text-xs font-medium mb-1 ${isOwn ? "text-primary-foreground/70" : "text-foreground/70"}`}>
                        TeqBook Team
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{comment.message}</p>
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {comment.attachments.map((att, i) => (
                          <Badge key={i} variant="secondary" className="text-xs gap-1">
                            <Paperclip className="h-3 w-3" />
                            {att.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      {format(new Date(comment.created_at), "dd.MM.yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply form */}
      {!isDone ? (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/0 transition placeholder:text-muted-foreground focus-visible:ring-2 resize-none"
          />
          <div className="flex items-center justify-end">
            <Button
              size="sm"
              onClick={handleSendReply}
              disabled={sending || !replyText.trim()}
              className="gap-1.5"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            This feedback has been marked as {entry.status}. Thank you for your input!
          </p>
        </div>
      )}
    </div>
  );
}
