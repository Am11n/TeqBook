"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Plus, Download, Trash2, Search, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export default function DesignSystemPage() {
  const [switchOn, setSwitchOn] = useState(false);

  return (
    <AdminShell>
      <PageLayout title="Design System" description="TeqBook UI component reference -- how every component looks" showCard={false}>

        {/* ─── COLOR TOKENS ─── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-1">Color Tokens</h2>
          <p className="text-sm text-muted-foreground mb-4">
            These are the CSS custom properties from <code className="text-xs bg-muted px-1.5 py-0.5 rounded">globals.css</code>. 
            <strong className="ml-1">Primary is near-black with white foreground</strong> -- used for default buttons and badges.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
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
            ].map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-1.5">
                <div className={`h-12 w-full rounded-lg ${c.css} ${c.border ? "border" : ""}`} />
                <span className="text-[10px] text-muted-foreground font-mono">--{c.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SEMANTIC COLORS ─── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-1">Semantic Colors (for status badges)</h2>
          <p className="text-sm text-muted-foreground mb-4">Use these Tailwind utility combos instead of Badge variant=&quot;default&quot;.</p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium border-emerald-200 bg-emerald-50 text-emerald-700 border">Active / Success</span>
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium border-amber-200 bg-amber-50 text-amber-700 border">Warning / Pending</span>
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium border-red-200 bg-red-50 text-red-700 border">Error / Critical</span>
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium border-blue-200 bg-blue-50 text-blue-700 border">Info / In Progress</span>
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium border-purple-200 bg-purple-50 text-purple-700 border">Special / Admin</span>
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium bg-muted text-muted-foreground">Neutral / Inactive</span>
          </div>
        </section>

        {/* ─── TYPOGRAPHY ─── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-1">Typography</h2>
          <p className="text-sm text-muted-foreground mb-4">Font: Geist Sans (--font-sans) &amp; Geist Mono (--font-mono)</p>
          <Card>
            <CardContent className="space-y-4 pt-4">
              <div><h1 className="text-3xl font-bold tracking-tight">Heading 1 -- text-3xl font-bold</h1></div>
              <div><h2 className="text-2xl font-semibold">Heading 2 -- text-2xl font-semibold</h2></div>
              <div><h3 className="text-lg font-semibold">Heading 3 -- text-lg font-semibold</h3></div>
              <div><h4 className="text-base font-medium">Heading 4 -- text-base font-medium</h4></div>
              <div><p className="text-sm">Body text -- text-sm (default for most content)</p></div>
              <div><p className="text-xs text-muted-foreground">Caption -- text-xs text-muted-foreground</p></div>
              <div><p className="text-sm font-mono">Monospace -- font-mono (IDs, codes, technical values)</p></div>
            </CardContent>
          </Card>
        </section>

        {/* ─── BUTTONS ─── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-1">Buttons</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Rule:</strong> Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded">variant=&quot;default&quot;</code> (black with white text) for primary actions. 
            Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded">variant=&quot;outline&quot;</code> for secondary actions 
            and <code className="text-xs bg-muted px-1.5 py-0.5 rounded">variant=&quot;ghost&quot;</code> for tertiary / inline actions.
          </p>
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-6">
                {/* Variants */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Variants</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button variant="default">Default (black)</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>
                {/* Sizes */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Sizes</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
                {/* With icons */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">With Icons (typical admin pattern)</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Create</Button>
                    <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" /> Export</Button>
                    <Button variant="outline" size="sm" className="gap-1"><Search className="h-4 w-4" /> Search</Button>
                    <Button variant="destructive" size="sm" className="gap-1"><Trash2 className="h-4 w-4" /> Delete</Button>
                  </div>
                </div>
                {/* Disabled */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Disabled</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button disabled>Disabled Default</Button>
                    <Button variant="outline" disabled>Disabled Outline</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ─── BADGES ─── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-1">Badges</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Rule:</strong> Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded">variant=&quot;default&quot;</code> (black + white text) for emphasis. 
            Use <code className="text-xs bg-muted px-1.5 py-0.5 rounded">variant=&quot;outline&quot;</code> + className for semantic status colors.
          </p>
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-6">
                {/* Built-in variants */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Built-in Variants</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Badge variant="default">Default (black + white text)</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </div>
                {/* Semantic status badges */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Status Badges (outline + className)</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Active</Badge>
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Pending</Badge>
                    <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Critical</Badge>
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">In Progress</Badge>
                    <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">Admin</Badge>
                    <Badge variant="secondary">Inactive</Badge>
                  </div>
                </div>
                {/* Plan badges */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Plan Badges</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Badge variant="outline">Starter</Badge>
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Pro</Badge>
                    <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">Business</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ─── CARDS ─── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-1">Cards</h2>
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description text in muted color</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Card content area. Cards use <code className="text-xs bg-muted px-1.5 py-0.5 rounded">bg-card</code> (white) with border and subtle shadow.</p>
            </CardContent>
          </Card>
        </section>

        {/* ─── FORM ELEMENTS ─── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-1">Form Elements</h2>
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-6 max-w-md">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Input</p>
                  <Input placeholder="Type something..." />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Input with icon</p>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-8" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Checkbox</p>
                  <div className="flex items-center gap-2">
                    <Checkbox id="demo-check" />
                    <label htmlFor="demo-check" className="text-sm">Check me</label>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Switch</p>
                  <div className="flex items-center gap-2">
                    <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
                    <span className="text-sm">{switchOn ? "On" : "Off"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ─── ALERTS ─── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-1">Alerts</h2>
          <div className="space-y-3">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Default Alert</AlertTitle>
              <AlertDescription>This is an informational message.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Destructive Alert</AlertTitle>
              <AlertDescription>Something went wrong.</AlertDescription>
            </Alert>
          </div>
        </section>

        {/* ─── SPACING & RADIUS ─── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-1">Border Radius</h2>
          <p className="text-sm text-muted-foreground mb-4">Base radius: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">0.625rem</code> (10px)</p>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-16 w-16 border-2 border-foreground/20 rounded-sm" />
              <span className="text-[10px] text-muted-foreground">rounded-sm</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-16 w-16 border-2 border-foreground/20 rounded-md" />
              <span className="text-[10px] text-muted-foreground">rounded-md</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-16 w-16 border-2 border-foreground/20 rounded-lg" />
              <span className="text-[10px] text-muted-foreground">rounded-lg</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-16 w-16 border-2 border-foreground/20 rounded-xl" />
              <span className="text-[10px] text-muted-foreground">rounded-xl</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-16 w-16 border-2 border-foreground/20 rounded-full" />
              <span className="text-[10px] text-muted-foreground">rounded-full</span>
            </div>
          </div>
        </section>

        {/* ─── CHEAT SHEET ─── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-1">Quick Reference</h2>
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                  <span className="font-medium">Primary action:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{`<Button size="sm">`} (default = black + white text)</code>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                  <span className="font-medium">Secondary action:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{`<Button variant="outline" size="sm">`}</code>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                  <span className="font-medium">Danger action:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{`<Button variant="destructive">`}</code>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                  <span className="font-medium">Status badge:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{`<Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">`}</code>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                  <span className="font-medium">Neutral badge:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{`<Badge variant="secondary">`}</code>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                  <span className="font-medium">Label badge:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{`<Badge variant="outline">`}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </PageLayout>
    </AdminShell>
  );
}
