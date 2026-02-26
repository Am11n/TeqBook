"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Filter, Search } from "lucide-react";
import { actionLabels, resourceTypeLabels } from "./constants";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";

interface AuditFiltersProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  showSearch?: boolean;
  actionFilter: string;
  setActionFilter: (v: string) => void;
  resourceTypeFilter: string;
  setResourceTypeFilter: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  availableActions: string[];
  availableResourceTypes: string[];
  onReset: () => void;
}

export function AuditFilters({
  searchQuery, setSearchQuery, showSearch = true, actionFilter, setActionFilter,
  resourceTypeFilter, setResourceTypeFilter,
  startDate, setStartDate, endDate, setEndDate,
  availableActions, availableResourceTypes, onReset,
}: AuditFiltersProps) {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = translations[appLocale].settings;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-6 rounded-xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" /> {t.auditFiltersTitle ?? "Filters"}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen((prev) => !prev)}
            className="gap-1.5"
          >
            {isOpen ? (t.auditFiltersHide ?? "Hide filters") : (t.auditFiltersShow ?? "Show filters")}
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
      <CardContent>
        <div className={`grid gap-4 md:grid-cols-2 ${showSearch ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
          {showSearch && (
            <div>
              <label className="text-sm font-medium mb-2 block">{t.auditSearch ?? "Search"}</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.auditSearchPlaceholder ?? "Search activity..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-2 block">{t.auditAction ?? "Action"}</label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger><SelectValue placeholder={t.auditAllActions ?? "All actions"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.auditAllActions ?? "All actions"}</SelectItem>
                {availableActions.map((action) => (
                  <SelectItem key={action} value={action}>{actionLabels[action] || action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">{t.auditResourceType ?? "Resource Type"}</label>
            <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
              <SelectTrigger><SelectValue placeholder={t.auditAllTypes ?? "All types"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.auditAllTypes ?? "All types"}</SelectItem>
                {availableResourceTypes.map((type) => (
                  <SelectItem key={type} value={type}>{resourceTypeLabels[type] || type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">{t.auditStartDate ?? "Start Date"}</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">{t.auditEndDate ?? "End Date"}</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" onClick={onReset}>{t.auditResetFilters ?? "Reset Filters"}</Button>
        </div>
      </CardContent>
      )}
    </Card>
  );
}
