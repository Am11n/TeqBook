import { CheckCircle2, XCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ValidatedRow } from "@/lib/services/import-service";

interface PreviewStepProps {
  validRows: ValidatedRow[];
  errorRows: ValidatedRow[];
  mapping: Record<string, string>;
  onDownloadErrors: () => void;
  onBack: () => void;
  onExecute: () => void;
}

export function PreviewStep({
  validRows,
  errorRows,
  mapping,
  onDownloadErrors,
  onBack,
  onExecute,
}: PreviewStepProps) {
  const mappedFields = Object.values(mapping);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/30 px-3 py-1.5 text-xs text-green-700 dark:text-green-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {validRows.length} valid rows
        </div>
        {errorRows.length > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-xs text-red-700 dark:text-red-300">
            <XCircle className="h-3.5 w-3.5" />
            {errorRows.length} rows with errors
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-[10px]"
              onClick={onDownloadErrors}
            >
              <Download className="h-3 w-3 mr-1" /> Download errors
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-2 px-3 text-left font-medium text-muted-foreground">#</th>
              {mappedFields.map((field) => (
                <th key={field} className="py-2 px-3 text-left font-medium text-muted-foreground">
                  {field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {validRows.slice(0, 10).map((row) => (
              <tr key={row.rowIndex} className="border-b last:border-0">
                <td className="py-1.5 px-3 text-muted-foreground">{row.rowIndex + 1}</td>
                {mappedFields.map((field) => (
                  <td key={field} className="py-1.5 px-3 truncate max-w-[150px]">
                    {String(row.data[field] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {validRows.length > 10 && (
        <p className="text-[10px] text-muted-foreground">
          Showing first 10 of {validRows.length} valid rows
        </p>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          Back to mapping
        </Button>
        <Button onClick={onExecute} disabled={validRows.length === 0}>
          Import {validRows.length} rows
        </Button>
      </div>
    </div>
  );
}
