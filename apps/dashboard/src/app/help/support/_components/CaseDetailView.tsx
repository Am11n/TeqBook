"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/feedback/error-message";
import { supabase } from "@/lib/supabase-client";
import {
  Paperclip,
  Send,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  PRIORITY_COLORS,
  type SupportCase,
  type CaseMessage,
} from "./types";

interface CaseDetailViewProps {
  supportCase: SupportCase;
  userId: string;
  salonId: string;
  onBack: () => void;
}

export function CaseDetailView({
  supportCase,
  userId,
  salonId,
  onBack,
}: CaseDetailViewProps) {
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

  const StatusIcon = supportCase.status === "resolved" || supportCase.status === "closed"
    ? CheckCircle2
    : supportCase.status === "waiting_on_salon"
      ? AlertCircle
      : Clock;

  const isClosed = supportCase.status === "resolved" || supportCase.status === "closed";

  return (
    <div className="space-y-6">
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
