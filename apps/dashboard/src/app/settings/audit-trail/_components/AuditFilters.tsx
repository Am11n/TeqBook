"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import { actionLabels, resourceTypeLabels } from "./constants";

interface AuditFiltersProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
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
  searchQuery, setSearchQuery, actionFilter, setActionFilter,
  resourceTypeFilter, setResourceTypeFilter,
  startDate, setStartDate, endDate, setEndDate,
  availableActions, availableResourceTypes, onReset,
}: AuditFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" /> Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search activity..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Action</label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger><SelectValue placeholder="All actions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {availableActions.map((action) => (
                  <SelectItem key={action} value={action}>{actionLabels[action] || action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Resource Type</label>
            <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {availableResourceTypes.map((type) => (
                  <SelectItem key={type} value={type}>{resourceTypeLabels[type] || type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" onClick={onReset}>Reset Filters</Button>
        </div>
      </CardContent>
    </Card>
  );
}
