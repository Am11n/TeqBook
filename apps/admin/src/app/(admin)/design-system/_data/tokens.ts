export const COLOR_TOKENS = [
  { name: "background", css: "bg-background", border: true },
  { name: "foreground", css: "bg-foreground" },
  { name: "primary", css: "bg-primary" },
  { name: "primary-fg", css: "bg-primary-foreground", border: true },
  { name: "secondary", css: "bg-secondary", border: true },
  { name: "secondary-fg", css: "bg-secondary-foreground" },
  { name: "muted", css: "bg-muted", border: true },
  { name: "muted-fg", css: "bg-muted-foreground" },
  { name: "accent", css: "bg-accent", border: true },
  { name: "destructive", css: "bg-destructive" },
  { name: "border", css: "bg-border", border: true },
  { name: "card", css: "bg-card", border: true },
];

export const SEMANTIC_BADGES = [
  { label: "Active / Success", classes: "border-emerald-200 bg-emerald-50 text-emerald-700 border" },
  { label: "Warning / Pending", classes: "border-amber-200 bg-amber-50 text-amber-700 border" },
  { label: "Error / Critical", classes: "border-red-200 bg-red-50 text-red-700 border" },
  { label: "Info / In Progress", classes: "border-blue-200 bg-blue-50 text-blue-700 border" },
  { label: "Special / Admin", classes: "border-purple-200 bg-purple-50 text-purple-700 border" },
  { label: "Neutral / Inactive", classes: "bg-muted text-muted-foreground" },
];
