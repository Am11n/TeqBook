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
import { CATEGORIES } from "./types";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";

interface NewCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string;
  salonName: string;
  salonPlan: string;
  onCreated: () => void;
}

export function NewCaseDialog({
  open,
  onOpenChange,
  salonId,
  salonName,
  salonPlan,
  onCreated,
}: NewCaseDialogProps) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].dashboard;
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const valid = selected.filter((f) => f.size <= 5 * 1024 * 1024).slice(0, 3);
    setFiles(valid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const attachmentPaths: { path: string; name: string; size: number }[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${salonId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("support-attachments")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (uploadErr) {
          setError(`${t.supportUploadFailed ?? "Failed to upload"} ${file.name}: ${uploadErr.message}`);
          setSubmitting(false);
          return;
        }
        attachmentPaths.push({ path, name: file.name, size: file.size });
      }

      const { error: rpcError } = await supabase.rpc("create_support_case_for_salon", {
        p_title: title.trim(),
        p_description: description.trim() || null,
        p_category: category,
        p_attachment_paths: attachmentPaths,
      });

      if (rpcError) {
        if (rpcError.message.includes("Rate limit")) {
          setError(t.supportRateLimitError ?? "You've reached the limit of 5 support cases per hour. Please try again later.");
        } else {
          setError(rpcError.message);
        }
        setSubmitting(false);
        return;
      }

      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.supportUnknownError ?? "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.supportDialogTitle ?? "New support case"}</DialogTitle>
          <DialogDescription>
            {t.supportDialogDescription ?? "Describe your issue and we'll get back to you as soon as possible."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">{t.supportSalonLabel ?? "Salon:"}</span>
          <span className="font-medium">{salonName}</span>
          <Badge variant="outline" className="ml-auto text-xs capitalize">
            {salonPlan}
          </Badge>
        </div>

        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="case-category">{t.supportCategory ?? "Category"}</Label>
            <DialogSelect
              value={category}
              onChange={setCategory}
              options={CATEGORIES.map((c) => ({
                value: c.value,
                label:
                  c.value === "general"
                    ? appLocale === "nb"
                      ? "Generelt"
                      : "General"
                    : c.value === "booking_issue"
                      ? appLocale === "nb"
                        ? "Bookingproblem"
                        : "Booking issue"
                      : c.value === "payment_issue"
                        ? appLocale === "nb"
                          ? "Betalingsproblem"
                          : "Payment issue"
                        : c.value === "account_issue"
                          ? appLocale === "nb"
                            ? "Kontoproblem"
                            : "Account issue"
                          : c.value === "feature_request"
                            ? appLocale === "nb"
                              ? "Funksjonsønske"
                              : "Feature request"
                            : appLocale === "nb"
                              ? "Annet"
                              : "Other",
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="case-title">{t.supportSubject ?? "Subject"}</Label>
            <Input
              id="case-title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 200))}
              placeholder={t.supportSubjectPlaceholder ?? "Brief summary of the issue"}
              required
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/200</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="case-description">{t.supportDescriptionLabel ?? "Description"}</Label>
            <textarea
              id="case-description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
              placeholder={t.supportDescriptionPlaceholder ?? "Describe the issue in detail..."}
              rows={4}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/0 transition placeholder:text-muted-foreground focus-visible:ring-2 resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/2000
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="case-files">
              {t.supportAttachments ?? "Attachments"}{" "}
              <span className="text-muted-foreground font-normal">
                {t.supportAttachmentsHint ?? "(optional, max 3 files, 5MB each)"}
              </span>
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
              {t.supportCancel ?? "Cancel"}
            </Button>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  {t.supportSubmitting ?? "Submitting..."}
                </>
              ) : (
                t.supportSubmitCase ?? "Submit case"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
