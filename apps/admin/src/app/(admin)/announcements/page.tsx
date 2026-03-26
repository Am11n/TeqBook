"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Announcement, AnnouncementInput } from "@/lib/types/announcements";
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
} from "@/lib/services/announcements-service";

type StatusFilter = "all" | "draft" | "published";

const STATUS_BADGE: Record<StatusFilter, string> = {
  all: "bg-muted text-muted-foreground",
  draft: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
};

export default function AnnouncementsAdminPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await listAnnouncements({ status: filter });
    if (fetchError) setError(fetchError);
    else {
      setError(null);
      setItems(data);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const all = items.length;
    const draft = items.filter((i) => i.status === "draft").length;
    const published = items.filter((i) => i.status === "published").length;
    return { all, draft, published };
  }, [items]);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setBody("");
    setIsPinned(false);
    setDialogOpen(true);
  }

  function openEdit(item: Announcement) {
    setEditing(item);
    setTitle(item.title);
    setBody(item.body);
    setIsPinned(item.is_pinned);
    setDialogOpen(true);
  }

  async function submitForm() {
    const payload: AnnouncementInput = { title, body, is_pinned: isPinned };
    if (!payload.title.trim() || !payload.body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setSaving(true);
    const result = editing
      ? await updateAnnouncement(editing.id, payload)
      : await createAnnouncement(payload);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDialogOpen(false);
    await load();
  }

  async function togglePublish(item: Announcement) {
    const op = item.status === "published"
      ? await unpublishAnnouncement(item.id)
      : await publishAnnouncement(item.id);
    if (op.error) {
      setError(op.error);
      return;
    }
    await load();
  }

  return (
    <AdminShell>
      <PageLayout
        title="Announcements"
        description="Editorial announcements shown on dashboard users."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              Refresh
            </Button>
            <Button onClick={openCreate}>Create announcement</Button>
          </div>
        }
      >
        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(["all", "draft", "published"] as const).map((status) => (
            <Button
              key={status}
              type="button"
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === "all" ? "All" : status[0].toUpperCase() + status.slice(1)}
              {" "}
              ({counts[status]})
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {!loading && items.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No announcements for this filter.
              </CardContent>
            </Card>
          )}

          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Updated {new Date(item.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.is_pinned && <Badge variant="outline">Pinned</Badge>}
                    <Badge variant="outline" className={STATUS_BADGE[item.status]}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 whitespace-pre-wrap text-sm text-foreground">{item.body}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                    Edit
                  </Button>
                  <Button size="sm" onClick={() => void togglePublish(item)}>
                    {item.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit announcement" : "Create announcement"}</DialogTitle>
              <DialogDescription>
                Draft announcements are not shown on dashboard until published.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="announcement-title" className="text-sm font-medium">Title</label>
                <Input
                  id="announcement-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="announcement-body" className="text-sm font-medium">Body</label>
                <Textarea
                  id="announcement-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write announcement content"
                  rows={6}
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                />
                Pin this announcement
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => void submitForm()} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageLayout>
    </AdminShell>
  );
}
