"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { FeedbackComment } from "./types";

interface ConversationSectionProps {
  comments: FeedbackComment[];
  loading: boolean;
  userId: string;
  isDone: boolean;
  replyText: string;
  setReplyText: (text: string) => void;
  sending: boolean;
  onSendReply: () => void;
}

export function ConversationSection({
  comments, loading, userId, isDone,
  replyText, setReplyText, sending, onSendReply,
}: ConversationSectionProps) {
  return (
    <>
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
                <div key={comment.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
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
                    <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {format(new Date(comment.created_at), "dd.MM.yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
            <Button size="sm" onClick={onSendReply} disabled={sending || !replyText.trim()} className="gap-1.5">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            This feedback has been marked as delivered. Thank you for your input!
          </p>
        </div>
      )}
    </>
  );
}
