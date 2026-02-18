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
import { DialogSelect } from "@/components/ui/dialog-select";
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
  MessageSquare,
  Paperclip,
  Send,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SupportCase = {
  id: string;
  salon_id: string;
  user_id: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string | null;
  category: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type CaseMessage = {
  id: string;
  case_id: string;
  sender_id: string;
  body: string;
  is_internal: boolean;
  attachments: { path: string; name: string; size: number }[];
  created_at: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-50 text-red-700 border-red-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  waiting_on_salon: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_on_salon: "Waiting on you",
  resolved: "Resolved",
  closed: "Closed",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-50 text-orange-700",
  medium: "bg-yellow-50 text-yellow-700",
  low: "bg-muted text-muted-foreground",
};

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "booking_issue", label: "Booking issue" },
  { value: "payment_issue", label: "Payment issue" },
  { value: "account_issue", label: "Account issue" },
  { value: "feature_request", label: "Feature request" },
  { value: "other", label: "Other" },
];

type FilterTab = "all" | "open" | "waiting" | "closed";

// ---------------------------------------------------------------------------
// Support Page
// ---------------------------------------------------------------------------

export default function SupportPage() {
  const { salon, profile, user, loading: ctxLoading, isReady } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale];

  // State
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch cases
  // ---------------------------------------------------------------------------
  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("support_cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setCases((data as SupportCase[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isReady) loadCases();
  }, [isReady, loadCases]);

  // ---------------------------------------------------------------------------
  // Filtered cases
  // ---------------------------------------------------------------------------
  const filteredCases = useMemo(() => {
    if (filterTab === "all") return cases;
    if (filterTab === "open")
      return cases.filter((c) => c.status === "open" || c.status === "in_progress");
    if (filterTab === "waiting")
      return cases.filter((c) => c.status === "waiting_on_salon");
    // closed
    return cases.filter((c) => c.status === "resolved" || c.status === "closed");
  }, [cases, filterTab]);

  // Count badges
  const openCount = cases.filter((c) => c.status === "open" || c.status === "in_progress").length;
  const waitingCount = cases.filter((c) => c.status === "waiting_on_salon").length;

  // ---------------------------------------------------------------------------
  // Back from detail
  // ---------------------------------------------------------------------------
  if (selectedCase) {
    return (
      <PageLayout
        title="Support"
        description={t.dashboard?.support ?? "Support"}
        showCard={false}
      >
        <CaseDetailView
          supportCase={selectedCase}
          userId={user?.id ?? ""}
          salonId={salon?.id ?? ""}
          onBack={() => {
            setSelectedCase(null);
            loadCases();
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
      title="Support"
      description="Need help? Create a support case and we'll get back to you."
      actions={
        <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New case
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
            { key: "open", label: "Open", count: openCount },
            { key: "waiting", label: "Waiting on you", count: waitingCount },
            { key: "closed", label: "Closed" },
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

      {/* Cases list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <EmptyState onNewCase={() => setDialogOpen(true)} />
      ) : (
        <div className="space-y-2">
          {filteredCases.map((c) => (
            <CaseRow key={c.id} supportCase={c} onClick={() => setSelectedCase(c)} />
          ))}
        </div>
      )}

      {/* New case dialog */}
      <NewCaseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        salonId={salon?.id ?? ""}
        salonName={salon?.name ?? ""}
        salonPlan={(salon as Record<string, unknown>)?.plan as string ?? "starter"}
        onCreated={() => {
          setDialogOpen(false);
          loadCases();
        }}
      />
    </PageLayout>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ onNewCase }: { onNewCase: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <h3 className="text-lg font-semibold mb-1">No support cases yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Need help? Create a new case and our team will assist you.
      </p>
      <Button size="sm" onClick={onNewCase} className="gap-1.5">
        <Plus className="h-4 w-4" />
        Create a new case
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Case Row
// ---------------------------------------------------------------------------

function CaseRow({
  supportCase,
  onClick,
}: {
  supportCase: SupportCase;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{supportCase.title}</span>
          {supportCase.category && (
            <Badge variant="outline" className="text-xs shrink-0">
              {supportCase.category.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {supportCase.description ?? "No description"}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[supportCase.status] ?? ""}`}
        >
          {STATUS_LABELS[supportCase.status] ?? supportCase.status}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[supportCase.priority] ?? ""}`}
        >
          {supportCase.priority}
        </span>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {format(new Date(supportCase.created_at), "dd.MM.yyyy")}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// New Case Dialog
// ---------------------------------------------------------------------------

function NewCaseDialog({
  open,
  onOpenChange,
  salonId,
  salonName,
  salonPlan,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string;
  salonName: string;
  salonPlan: string;
  onCreated: () => void;
}) {
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setCategory("general");
      setTitle("");
      setDescription("");
      setFiles([]);
      setError(null);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    // Max 3 files, 5MB each
    const valid = selected.filter((f) => f.size <= 5 * 1024 * 1024).slice(0, 3);
    setFiles(valid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      // 1. Upload attachments if any
      const attachmentPaths: { path: string; name: string; size: number }[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${salonId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("support-attachments")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (uploadErr) {
          setError(`Failed to upload ${file.name}: ${uploadErr.message}`);
          setSubmitting(false);
          return;
        }
        attachmentPaths.push({ path, name: file.name, size: file.size });
      }

      // 2. Call RPC
      const { error: rpcError } = await supabase.rpc("create_support_case_for_salon", {
        p_title: title.trim(),
        p_description: description.trim() || null,
        p_category: category,
        p_attachment_paths: attachmentPaths,
      });

      if (rpcError) {
        // Rate limit error
        if (rpcError.message.includes("Rate limit")) {
          setError("You've reached the limit of 5 support cases per hour. Please try again later.");
        } else {
          setError(rpcError.message);
        }
        setSubmitting(false);
        return;
      }

      onCreated();
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
          <DialogTitle>New support case</DialogTitle>
          <DialogDescription>
            Describe your issue and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        {/* Auto-prefill salon info */}
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Salon:</span>
          <span className="font-medium">{salonName}</span>
          <Badge variant="outline" className="ml-auto text-xs capitalize">
            {salonPlan}
          </Badge>
        </div>

        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category - native select per cursorrules */}
          <div className="space-y-2">
            <Label htmlFor="case-category">Category</Label>
            <DialogSelect
              value={category}
              onChange={setCategory}
              options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="case-title">Subject</Label>
            <Input
              id="case-title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 200))}
              placeholder="Brief summary of the issue"
              required
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/200</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="case-description">Description</Label>
            <textarea
              id="case-description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
              placeholder="Describe the issue in detail..."
              rows={4}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/0 transition placeholder:text-muted-foreground focus-visible:ring-2 resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/2000
            </p>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label htmlFor="case-files">
              Attachments <span className="text-muted-foreground font-normal">(optional, max 3 files, 5MB each)</span>
            </Label>
            <Input
              id="case-files"
              type="file"
              multiple
              accept="image/*,application/pdf"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Submitting...
                </>
              ) : (
                "Submit case"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Case Detail View
// ---------------------------------------------------------------------------

function CaseDetailView({
  supportCase,
  userId,
  salonId,
  onBack,
}: {
  supportCase: SupportCase;
  userId: string;
  salonId: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("support_case_messages")
      .select("*")
      .eq("case_id", supportCase.id)
      .order("created_at", { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setMessages((data as CaseMessage[]) ?? []);
    }
    setLoading(false);
  }, [supportCase.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    setError(null);

    try {
      // Upload attachments
      const attachments: { path: string; name: string; size: number }[] = [];
      for (const file of replyFiles) {
        const ext = file.name.split(".").pop();
        const path = `${salonId}/${supportCase.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("support-attachments")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (uploadErr) {
          setError(`Failed to upload ${file.name}: ${uploadErr.message}`);
          setSending(false);
          return;
        }
        attachments.push({ path, name: file.name, size: file.size });
      }

      // Insert message
      const { error: insertErr } = await supabase
        .from("support_case_messages")
        .insert({
          case_id: supportCase.id,
          sender_id: userId,
          body: replyText.trim(),
          is_internal: false,
          attachments,
        });

      if (insertErr) {
        setError(insertErr.message);
        setSending(false);
        return;
      }

      setReplyText("");
      setReplyFiles([]);
      loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSending(false);
    }
  };

  const handleReplyFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).filter((f) => f.size <= 5 * 1024 * 1024).slice(0, 3);
    setReplyFiles(selected);
  };

  // Status icon
  const StatusIcon = supportCase.status === "resolved" || supportCase.status === "closed"
    ? CheckCircle2
    : supportCase.status === "waiting_on_salon"
      ? AlertCircle
      : Clock;

  const isClosed = supportCase.status === "resolved" || supportCase.status === "closed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="mt-0.5 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">{supportCase.title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[supportCase.status] ?? ""}`}
            >
              <StatusIcon className="h-3 w-3" />
              {STATUS_LABELS[supportCase.status] ?? supportCase.status}
            </span>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[supportCase.priority] ?? ""}`}
            >
              {supportCase.priority}
            </span>
            {supportCase.category && (
              <Badge variant="outline" className="text-xs">
                {supportCase.category.replace(/_/g, " ")}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              Created {format(new Date(supportCase.created_at), "dd.MM.yyyy HH:mm")}
            </span>
          </div>
        </div>
      </div>

      {/* Description card */}
      {supportCase.description && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium mb-1">Description</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {supportCase.description}
          </p>
          {(() => {
            const atts = supportCase.metadata?.attachments;
            if (!Array.isArray(atts) || atts.length === 0) return null;
            return (
              <div className="mt-3 flex flex-wrap gap-1">
                {(atts as { path: string; name: string }[]).map((att, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={async () => {
                      const { data, error } = await supabase.storage
                        .from("support-attachments")
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
            );
          })()}
        </div>
      )}

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" />
      )}

      {/* Messages thread */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Messages</h3>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No messages yet. Send a reply below.
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwn = msg.sender_id === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {msg.attachments.map((att, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs gap-1"
                          >
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
                      {format(new Date(msg.created_at), "dd.MM.yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply form */}
      {!isClosed && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/0 transition placeholder:text-muted-foreground focus-visible:ring-2 resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <Paperclip className="h-4 w-4" />
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleReplyFiles}
                  className="sr-only"
                />
              </label>
              {replyFiles.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {replyFiles.length} file{replyFiles.length > 1 ? "s" : ""} attached
                </span>
              )}
            </div>
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
      )}

      {isClosed && (
        <div className="rounded-lg border bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            This case has been {supportCase.status}. If you need more help, please create a new case.
          </p>
        </div>
      )}
    </div>
  );
}
