import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: DataTablePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of{" "}
        {total.toLocaleString()}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline" size="sm" className="h-8 w-8 p-0"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          {page + 1} / {totalPages}
        </span>
        <Button
          variant="outline" size="sm" className="h-8 w-8 p-0"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
}
