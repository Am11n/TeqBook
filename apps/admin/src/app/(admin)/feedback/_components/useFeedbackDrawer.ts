"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase-client";
import type { FeedbackEntry, FeedbackComment, ChangelogEntry } from "./types";

export function useFeedbackDrawer(
  entry: FeedbackEntry,
  onRefresh: () => void,
  onEntryUpdate: (updated: FeedbackEntry) => void,
) {
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>([]);
  const [converting, setConverting] = useState(false);
  const [assigningOwner, setAssigningOwner] = useState(false);

  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
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
    setCommentsLoading(false);
  }, [entry.id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const loadChangelogEntries = useCallback(async () => {
    const { data } = await supabase
      .from("changelog_entries")
      .select("id, title, version")
      .order("created_at", { ascending: false })
      .limit(50);
    setChangelogEntries((data as ChangelogEntry[]) ?? []);
  }, []);

  const handleSendComment = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    setError(null);

    const { error: insertErr } = await supabase.from("feedback_comments").insert({
      feedback_id: entry.id,
      author_user_id: (await supabase.auth.getUser()).data.user?.id,
      author_role: "admin",
      message: replyText.trim(),
      is_internal: isInternal,
    });

    if (insertErr) {
      setError(insertErr.message);
    } else {
      setReplyText("");
      setIsInternal(false);
      loadComments();
    }
    setSending(false);
  };

  const handleAssignSelf = async () => {
    setAssigningOwner(true);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { error: err } = await supabase
      .from("feedback_entries")
      .update({ admin_owner_id: userId, updated_at: new Date().toISOString() })
      .eq("id", entry.id);

    if (err) {
      setError(err.message);
    } else {
      onEntryUpdate({ ...entry, admin_owner_id: userId ?? null });
      onRefresh();
    }
    setAssigningOwner(false);
  };

  const handleConvertToSupportCase = async () => {
    setConverting(true);
    setError(null);

    const { error: insertErr } = await supabase.from("support_cases").insert({
      salon_id: entry.salon_id,
      user_id: entry.user_id,
      type: "manual",
      status: "open",
      priority: entry.priority === "high" ? "high" : entry.priority === "medium" ? "medium" : "low",
      title: `[From Feedback] ${entry.title}`,
      description: entry.description,
      category: entry.type === "bug_report" ? "other" : "feature_request",
      metadata: {
        source: "feedback_conversion",
        original_feedback_id: entry.id,
        original_type: entry.type,
      },
    });

    if (insertErr) {
      setError(insertErr.message);
    } else {
      await supabase
        .from("feedback_entries")
        .update({
          metadata: {
            ...((entry.metadata as Record<string, unknown>) ?? {}),
            converted_to_support_case: true,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.id);
      onRefresh();
    }
    setConverting(false);
  };

  const handleConvertToIncident = async () => {
    setConverting(true);
    setError(null);

    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { error: insertErr } = await supabase.from("incidents").insert({
      title: `[From Feedback] ${entry.title}`,
      severity: entry.priority === "high" ? "major" : "minor",
      status: "investigating",
      description: entry.description,
      created_by: userId,
    });

    if (insertErr) {
      setError(insertErr.message);
    } else {
      await supabase
        .from("feedback_entries")
        .update({
          metadata: {
            ...((entry.metadata as Record<string, unknown>) ?? {}),
            converted_to_incident: true,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.id);
      onRefresh();
    }
    setConverting(false);
  };

  const handleLinkChangelog = async (changelogId: string) => {
    const { error: err } = await supabase
      .from("feedback_entries")
      .update({
        changelog_entry_id: changelogId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entry.id);

    if (err) {
      setError(err.message);
    } else {
      onEntryUpdate({ ...entry, changelog_entry_id: changelogId || null });
      onRefresh();
    }
  };

  return {
    comments, commentsLoading,
    replyText, setReplyText,
    isInternal, setIsInternal,
    sending, error, setError,
    changelogEntries, converting, assigningOwner,
    loadChangelogEntries,
    handleSendComment, handleAssignSelf,
    handleConvertToSupportCase, handleConvertToIncident,
    handleLinkChangelog,
  };
}
