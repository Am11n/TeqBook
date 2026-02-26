"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogSelect } from "@/components/ui/dialog-select";
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
import { Paperclip, Loader2 } from "lucide-react";
import { FEEDBACK_TYPES, captureMetadata, type FeedbackEntry } from "./types";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";

interface NewFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string;
  locale: string;
  defaultType: string;
  onCreated: (entry: FeedbackEntry | null) => void;
}

export function NewFeedbackDialog({
  open,
  onOpenChange,
  salonId,
  locale,
  defaultType,
  onCreated,
}: NewFeedbackDialogProps) {
  const { locale: appRawLocale } = useLocale();
  const appLocale = normalizeLocale(appRawLocale);
  const t = translations[appLocale].dashboard;
  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dupeEntry, setDupeEntry] = useState<FeedbackEntry | null>(null);

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
      const attachmentPaths: { path: string; name: string; size: number }[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${salonId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("feedback-attachments")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (uploadErr) {
          setError(`${t.feedbackUploadFailed ?? "Failed to upload"} ${file.name}: ${uploadErr.message}`);
          setSubmitting(false);
          return;
        }
        attachmentPaths.push({ path, name: file.name, size: file.size });
      }

      const metadata = captureMetadata(locale);

      const { data, error: rpcError } = await supabase.rpc("create_feedback_entry_for_salon", {
        p_title: title.trim(),
        p_description: description.trim() || null,
        p_type: type,
        p_attachment_paths: attachmentPaths,
        p_metadata: metadata,
      });

      if (rpcError) {
        if (rpcError.message.includes("Rate limit")) {
          setError(t.feedbackRateLimitError ?? "You've reached the submission limit. Please try again later.");
        } else {
          setError(rpcError.message);
        }
        setSubmitting(false);
        return;
      }

      const returnedEntry = data as FeedbackEntry | null;

      if (returnedEntry && returnedEntry.created_at) {
        const age = Date.now() - new Date(returnedEntry.created_at).getTime();
        if (age > 10000) {
          setDupeEntry(returnedEntry);
          setSubmitting(false);
          return;
        }
      }

      onCreated(returnedEntry);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.feedbackUnknownError ?? "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.feedbackDialogTitle ?? "Submit feedback"}</DialogTitle>
          <DialogDescription>
            {t.feedbackDialogDescription ?? "Help us improve by sharing your thoughts, reporting bugs, or requesting features."}
          </DialogDescription>
        </DialogHeader>

        {dupeEntry && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-medium text-amber-800 mb-1">
              {t.feedbackDupeTitle ?? "We're already tracking this"}
            </p>
            <p className="text-xs text-amber-700 mb-2">
              {t.feedbackDupeFound ?? "A similar feedback entry was found:"} &quot;{dupeEntry.title}&quot;
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
                {t.feedbackViewExisting ?? "View existing"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => setDupeEntry(null)}
              >
                {t.feedbackDismiss ?? "Dismiss"}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-type">{t.feedbackType ?? "Type"}</Label>
            <DialogSelect
              value={type}
              onChange={setType}
              options={FEEDBACK_TYPES.map((entry) => ({
                value: entry.value,
                label:
                  entry.value === "bug_report"
                    ? appLocale === "nb"
                      ? "Rapporter en feil"
                      : "Report a bug"
                    : entry.value === "feature_request"
                      ? appLocale === "nb"
                        ? "Be om en funksjon"
                        : "Request a feature"
                      : entry.value === "improvement"
                        ? appLocale === "nb"
                          ? "Foresla forbedring"
                          : "Suggest improvement"
                        : appLocale === "nb"
                          ? "Annet"
                          : "Other",
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-title">{t.feedbackTitle ?? "Title"}</Label>
            <Input
              id="feedback-title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 200))}
              placeholder={t.feedbackTitlePlaceholder ?? "Brief summary"}
              required
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/200</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-description">
              {(t.feedbackDescriptionLabel ?? "Description")}{" "}
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
                  ? t.feedbackBugDescriptionPlaceholder ?? "What happened? What did you expect? Steps to reproduce..."
                  : t.feedbackDescriptionPlaceholder ?? "Describe your idea or suggestion..."
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

          <div className="space-y-2">
            <Label htmlFor="feedback-files">
              {t.feedbackScreenshots ?? "Screenshots"}{" "}
              <span className="text-muted-foreground font-normal">
                {t.feedbackScreenshotsHint ?? "(optional, max 3 images, 5MB each)"}
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
              {t.feedbackCancel ?? "Cancel"}
            </Button>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  {t.feedbackSubmitting ?? "Submitting..."}
                </>
              ) : (
                t.feedbackSubmit ?? "Submit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
