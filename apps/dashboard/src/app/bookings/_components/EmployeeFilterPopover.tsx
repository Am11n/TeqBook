import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Users, Check } from "lucide-react";

interface EmployeeFilterPopoverProps {
  employees: Array<{ id: string; full_name: string }>;
  filterEmployeeId: string;
  setFilterEmployeeId: (id: string) => void;
  translations: {
    filterEmployeeAll: string;
    filterEmployeeLabel: string;
  };
}

export function EmployeeFilterPopover({
  employees,
  filterEmployeeId,
  setFilterEmployeeId,
  translations: t,
}: EmployeeFilterPopoverProps) {
  if (employees.length <= 1) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {filterEmployeeId === "all"
            ? t.filterEmployeeAll
            : employees.find((e) => e.id === filterEmployeeId)?.full_name ?? t.filterEmployeeAll}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t.filterEmployeeLabel}
          </p>
          <button
            onClick={() => setFilterEmployeeId("all")}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
          >
            <Check className={`h-3.5 w-3.5 ${filterEmployeeId === "all" ? "opacity-100" : "opacity-0"}`} />
            {t.filterEmployeeAll}
          </button>
          {employees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => setFilterEmployeeId(emp.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Check className={`h-3.5 w-3.5 ${filterEmployeeId === emp.id ? "opacity-100" : "opacity-0"}`} />
              {emp.full_name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
