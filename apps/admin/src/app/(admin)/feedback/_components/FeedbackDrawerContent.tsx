"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogSelect } from "@/components/ui/dialog-select";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/feedback/error-message";
import { supabase } from "@/lib/supabase-client";
import {
  Send, Loader2, Paperclip, ArrowRightLeft,
  AlertTriangle, GitBranch, Lock, Eye,
} from "lucide-react";
import { format } from "date-fns";
import {
  TYPE_COLORS, STATUS_COLORS, PRIORITY_COLORS, STATUSES,
  type FeedbackEntry,
} from "./types";
import { useFeedbackDrawer } from "./useFeedbackDrawer";

interface FeedbackDrawerContentProps {
  entry: FeedbackEntry;
  onStatusChange: (status: string) => void;
  onRefresh: () => void;
  onEntryUpdate: (updated: FeedbackEntry) => void;
}

export function FeedbackDrawerContent({
  entry, onStatusChange, onRefresh, onEntryUpdate,
}: FeedbackDrawerContentProps) {
  const {
    comments, commentsLoading,
    replyText, setReplyText, isInternal, setIsInternal,
    sending, error, setError,
    changelogEntries, converting, assigningOwner,
    loadChangelogEntries,
    handleSendComment, handleAssignSelf,
    handleConvertToSupportCase, handleConvertToIncident,
    handleLinkChangelog,
  } = useFeedbackDrawer(entry, onRefresh, onEntryUpdate);

  const meta = entry.metadata as Record<string, unknown> | null;
  const attachments = (() => {
    const atts = meta?.attachments;
    if (!Array.isArray(atts) || atts.length === 0) return null;
    return atts as { path: string; name: string }[];
  })();

  const descriptionText: string | null = entry.description as string | null;
  const salonName: string = (meta?.salon_name as string) ?? entry.salon_id ?? "\u2014";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Type:</span>{" "}
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[entry.type]}`}>
            {entry.type.replace(/_/g, " ")}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Status:</span>{" "}
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[entry.status]}`}>
            {entry.status.replace(/_/g, " ")}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Priority:</span>{" "}
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[entry.priority]}`}>
            {entry.priority}
          </span>
        </div>
        <div><span className="text-muted-foreground">Votes:</span> {entry.votes}</div>
        <div><span className="text-muted-foreground">Created:</span> {format(new Date(entry.created_at), "PPP")}</div>
        <div><span className="text-muted-foreground">Salon:</span> {salonName}</div>
        {entry.admin_owner_id && (
          <div className="col-span-2">
            <span className="text-muted-foreground">Assigned to:</span>{" "}
            <span className="text-xs font-mono">{entry.admin_owner_id.slice(0, 8)}...</span>
          </div>
        )}
      </div>

      {descriptionText && (
        <div>
          <p className="text-sm font-medium mb-1">Description</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{descriptionText}</p>
        </div>
      )}

      {attachments && (
        <div className="flex flex-wrap gap-1">
          {attachments.map((att, i) => (
            <button
              key={i}
              type="button"
              onClick={async () => {
                const { data, error } = await supabase.storage.from("feedback-attachments").createSignedUrl(att.path, 300);
                if (error || !data?.signedUrl) return;
                window.open(data.signedUrl, "_blank");
              }}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              <Paperclip className="h-3 w-3" />{att.name}
            </button>
          ))}
        </div>
      )}

      {meta && !!(meta.page_url || meta.user_agent || meta.timezone) && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground font-medium">Client metadata</summary>
          <div className="mt-1 space-y-0.5 text-muted-foreground font-mono bg-muted/50 rounded p-2">
            {meta.page_url ? <p>Route: {String(meta.page_url)}</p> : null}
            {meta.user_agent ? <p>UA: {String(meta.user_agent).slice(0, 100)}...</p> : null}
            {meta.timezone ? <p>TZ: {String(meta.timezone)}</p> : null}
            {meta.locale ? <p>Locale: {String(meta.locale)}</p> : null}
            {meta.screen ? <p>Screen: {String(meta.screen)}</p> : null}
          </div>
        </details>
      )}

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" />}

      <div>
        <p className="text-sm font-medium mb-2">Update status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Button key={s} variant={entry.status === s ? "secondary" : "outline"} size="sm" className="text-xs capitalize" disabled={entry.status === s} onClick={() => onStatusChange(s)}>
              {s.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Actions</p>
        <div className="flex flex-wrap gap-2">
          {!entry.admin_owner_id && (
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handleAssignSelf} disabled={assigningOwner}>
              {assigningOwner ? <Loader2 className="h-3 w-3 animate-spin" /> : null}Assign to me
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handleConvertToSupportCase} disabled={converting}>
            <ArrowRightLeft className="h-3 w-3" />Convert to Support Case
          </Button>
          {entry.type === "bug_report" && (
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handleConvertToIncident} disabled={converting}>
              <AlertTriangle className="h-3 w-3" />Convert to Incident
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => { if (changelogEntries.length === 0) loadChangelogEntries(); }}>
            <GitBranch className="h-3 w-3" />Link to Changelog
          </Button>
        </div>
      </div>

      {changelogEntries.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="changelog-link" className="text-xs">Link to Changelog entry</Label>
          <DialogSelect
            value={entry.changelog_entry_id ?? ""}
            onChange={handleLinkChangelog}
            placeholder="None"
            options={[
              { value: "", label: "None" },
              ...changelogEntries.map((ce) => ({ value: ce.id, label: `${ce.version ? `[${ce.version}] ` : ""}${ce.title}` })),
            ]}
          />
        </div>
      )}

      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-3">Conversation ({comments.length})</p>
        {commentsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 text-center">No comments yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {comments.map((c) => (
              <div key={c.id} className={`rounded-lg px-3 py-2 text-sm ${c.is_internal ? "bg-amber-50 border border-amber-200" : c.author_role === "admin" ? "bg-muted" : "bg-blue-50 border border-blue-200"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{c.author_role === "admin" ? "Admin" : "Salon owner"}</span>
                  {c.is_internal && <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 font-medium"><Lock className="h-2.5 w-2.5" />Internal</span>}
                  <span className="text-[10px] text-muted-foreground ml-auto">{format(new Date(c.created_at), "dd.MM.yyyy HH:mm")}</span>
                </div>
                <p className="whitespace-pre-wrap text-xs">{c.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={isInternal ? "Internal note (not visible to salon)..." : "Reply to salon owner..."}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/0 transition placeholder:text-muted-foreground focus-visible:ring-2 resize-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded border-input" />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {isInternal ? <Lock className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {isInternal ? "Internal note" : "Public reply"}
              </span>
            </label>
            <Button size="sm" onClick={handleSendComment} disabled={sending || !replyText.trim()} className="gap-1.5 text-xs">
              {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
