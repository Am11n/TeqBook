"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/feedback/error-message";
import { supabase } from "@/lib/supabase-client";
import { Paperclip, ArrowLeft, Clock, CheckCircle2, XCircle, Loader2, Pencil } from "lucide-react";
import { format } from "date-fns";
import {
  STATUS_COLORS, STATUS_LABELS, TYPE_COLORS, TYPE_LABELS, PRIORITY_COLORS,
  type FeedbackEntry, type FeedbackComment,
} from "./types";
import { ConversationSection } from "./ConversationSection";

interface FeedbackDetailViewProps {
  entry: FeedbackEntry;
  userId: string;
  salonId: string;
  onBack: () => void;
}

export function FeedbackDetailView({
  entry,
  userId,
  salonId,
  onBack,
}: FeedbackDetailViewProps) {
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title);
  const [editDescription, setEditDescription] = useState(entry.description ?? "");
  const [saving, setSaving] = useState(false);

  const canEdit = entry.status === "new" && entry.user_id === userId;

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

      entry.title = editTitle.trim();
      entry.description = editDescription.trim() || null;
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const StatusIcon =
    entry.status === "delivered"
      ? CheckCircle2
      : entry.status === "rejected"
        ? XCircle
        : Clock;

  const isDone = entry.status === "delivered" || entry.status === "rejected";

  const attachments = (() => {
    const atts = entry.metadata?.attachments;
    if (!Array.isArray(atts) || atts.length === 0) return null;
    return atts as { path: string; name: string }[];
  })();

  return (
    <div className="space-y-6">
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

      <ConversationSection
        comments={comments}
        loading={loading}
        userId={userId}
        isDone={isDone}
        replyText={replyText}
        setReplyText={setReplyText}
        sending={sending}
        onSendReply={handleSendReply}
      />
    </div>
  );
}
