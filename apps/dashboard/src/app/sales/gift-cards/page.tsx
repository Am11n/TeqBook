"use client";

import { useState, useEffect } from "react";
import { Plus, Copy, Check } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared/data-table";
import { useTabActions } from "@teqbook/page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { formatPrice } from "@/lib/utils/services/services-utils";
import {
  listGiftCards,
  createGiftCard,
  deactivate,
  type GiftCard,
} from "@/lib/services/gift-card-service";

export default function GiftCardsPage() {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const salonCurrency = salon?.currency ?? "NOK";
  const fmtPrice = (cents: number) => formatPrice(cents, appLocale, salonCurrency);

  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [newValue, setNewValue] = useState("");
  const [newRecipientName, setNewRecipientName] = useState("");
  const [newRecipientEmail, setNewRecipientEmail] = useState("");
  const [creating, setCreating] = useState(false);

  const loadCards = async () => {
    if (!salon?.id) return;
    setLoading(true);
    const { data, error } = await listGiftCards(salon.id);
    setCards(data ?? []);
    if (error) setError(error);
    setLoading(false);
  };

  useEffect(() => {
    loadCards();
  }, [salon?.id]);

  useTabActions(
    <Button size="sm" onClick={() => setShowCreate(true)}>
      <Plus className="h-3.5 w-3.5 mr-1" /> New Gift Card
    </Button>
  );

  const handleCreate = async () => {
    if (!salon?.id || !newValue.trim()) return;
    setCreating(true);
    const valueCents = Math.round(parseFloat(newValue) * 100);
    if (isNaN(valueCents) || valueCents <= 0) {
      setError("Invalid value");
      setCreating(false);
      return;
    }

    const { data, error } = await createGiftCard({
      salonId: salon.id,
      valueCents,
      recipientName: newRecipientName.trim() || undefined,
      recipientEmail: newRecipientEmail.trim() || undefined,
    });

    setCreating(false);
    if (error) {
      setError(error);
      return;
    }
    if (data) setCards((prev) => [data, ...prev]);
    setShowCreate(false);
    setNewValue("");
    setNewRecipientName("");
    setNewRecipientEmail("");
  };

  const handleDeactivate = async (card: GiftCard) => {
    if (!salon?.id) return;
    await deactivate(salon.id, card.id);
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, is_active: false } : c)));
  };

  const handleCopyCode = (card: GiftCard) => {
    navigator.clipboard.writeText(card.code);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns: ColumnDef<GiftCard>[] = [
    {
      id: "code",
      header: "Code",
      cell: (card) => (
        <div className="flex items-center gap-1.5">
          <code className="text-sm font-mono font-bold tracking-wider">{card.code}</code>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyCode(card);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {copiedId === card.id ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      ),
      getValue: (card) => card.code,
    },
    {
      id: "recipient",
      header: "Recipient",
      cell: (card) => (
        <div className="text-sm text-muted-foreground">
          {card.recipient_name || card.recipient_email || "-"}
        </div>
      ),
      getValue: (card) => card.recipient_name ?? card.recipient_email ?? "",
    },
    {
      id: "value",
      header: "Value",
      cell: (card) => (
        <div className="text-sm">
          <span className="font-medium">{fmtPrice(card.remaining_value_cents)}</span>
          {card.remaining_value_cents < card.initial_value_cents && (
            <span className="text-muted-foreground text-xs ml-1">
              of {fmtPrice(card.initial_value_cents)}
            </span>
          )}
        </div>
      ),
      getValue: (card) => card.remaining_value_cents,
    },
    {
      id: "status",
      header: "Status",
      cell: (card) => (
        <Badge
          variant="outline"
          className={
            card.is_active
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-zinc-200 bg-zinc-100 text-zinc-600"
          }
        >
          {card.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
      getValue: (card) => (card.is_active ? 1 : 0),
    },
    {
      id: "created",
      header: "Created",
      cell: (card) => (
        <div className="text-sm text-muted-foreground">
          {new Date(card.created_at).toLocaleDateString(appLocale)}
        </div>
      ),
      getValue: (card) => card.created_at,
    },
  ];

  const getRowActions = (card: GiftCard): RowAction<GiftCard>[] => {
    if (!card.is_active) return [];
    return [
      {
        label: "Deactivate",
        onClick: handleDeactivate,
        variant: "destructive",
      },
    ];
  };

  const filtered = cards.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.recipient_name?.toLowerCase().includes(q) ||
      c.recipient_email?.toLowerCase().includes(q)
    );
  });

  return (
    <ErrorBoundary>
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          variant="destructive"
          className="mb-4"
        />
      )}

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        {!loading && cards.length === 0 ? (
          <EmptyState
            title="No gift cards yet"
            description="Create your first gift card to get started."
            primaryAction={
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> New Gift Card
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            rowKey={(c) => c.id}
            getRowActions={getRowActions}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by code or recipient..."
            storageKey="dashboard-gift-cards"
            emptyMessage="No gift cards found"
          />
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Gift Card</DialogTitle>
            <DialogDescription>Generate a new gift card with a unique code.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Value ({salonCurrency})</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="500"
                className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Recipient name (optional)</label>
              <input
                type="text"
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Recipient email (optional)</label>
              <input
                type="email"
                value={newRecipientEmail}
                onChange={(e) => setNewRecipientEmail(e.target.value)}
                placeholder="jane@example.com"
                className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !newValue.trim()}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
}
