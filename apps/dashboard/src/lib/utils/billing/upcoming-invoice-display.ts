/** Stripe upcoming-invoice lines: presentation helpers (no Stripe types). */

export type InvoicePreviewLine = {
  description: string;
  amount_minor: number;
  quantity: number | null;
};

const PRORATION_DESC_RE = /remaining time|unused time|prorat/i;

export function isProrationInvoiceLine(description: string): boolean {
  return PRORATION_DESC_RE.test(description);
}

/** When edge omits `summary`, approximate plan vs add-on split from descriptions (recurring lines only). */
export function summarizeUpcomingLinesClient(lines: InvoicePreviewLine[]): {
  subscription_minor: number;
  addons_minor: number;
} {
  let subscription_minor = 0;
  let addons_minor = 0;
  for (const line of lines) {
    if (isProrationInvoiceLine(line.description)) continue;
    const d = line.description.toLowerCase();
    if (d.includes("extra staff") || d.includes("extra languages")) {
      addons_minor += line.amount_minor;
    } else {
      subscription_minor += line.amount_minor;
    }
  }
  return { subscription_minor, addons_minor };
}

export function partitionUpcomingInvoiceLines(lines: InvoicePreviewLine[]): {
  recurring: InvoicePreviewLine[];
  proration: InvoicePreviewLine[];
} {
  const recurring: InvoicePreviewLine[] = [];
  const proration: InvoicePreviewLine[] = [];
  for (const line of lines) {
    (isProrationInvoiceLine(line.description) ? proration : recurring).push(line);
  }
  return { recurring, proration };
}
