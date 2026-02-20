import { FileSpreadsheet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImportPreset } from "@/lib/constants/import-presets";

interface TargetField {
  key: string;
  label: string;
  required?: boolean;
}

interface MappingStepProps {
  fileName: string;
  rowCount: number;
  csvHeaders: string[];
  mapping: Record<string, string>;
  presets: ImportPreset[];
  targetFields: TargetField[];
  onMappingChange: (csvCol: string, tbField: string) => void;
  onApplyPreset: (preset: ImportPreset) => void;
  onValidate: () => void;
  onReset: () => void;
}

export function MappingStep({
  fileName,
  rowCount,
  csvHeaders,
  mapping,
  presets,
  targetFields,
  onMappingChange,
  onApplyPreset,
  onValidate,
  onReset,
}: MappingStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          {fileName} ({rowCount} rows)
        </p>
        <Button size="sm" variant="ghost" onClick={onReset}>
          Start over
        </Button>
      </div>

      {presets.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Apply preset:</span>
          {[...new Set(presets.map((p) => p.name))].map((name) => (
            <Button
              key={name}
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => {
                const preset = presets.find((p) => p.name === name);
                if (preset) onApplyPreset(preset);
              }}
            >
              {name}
            </Button>
          ))}
        </div>
      )}

      <div className="rounded-lg border p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Map CSV columns to TeqBook fields
        </p>
        {csvHeaders.map((header) => (
          <div key={header} className="flex items-center gap-3">
            <span className="text-xs w-1/3 truncate font-mono">{header}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <select
              value={mapping[header] || ""}
              onChange={(e) => onMappingChange(header, e.target.value)}
              className="flex-1 h-8 rounded-md border bg-background px-2 text-xs"
            >
              <option value="">Skip</option>
              {targetFields.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                  {f.required ? " *" : ""}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <Button onClick={onValidate} disabled={Object.keys(mapping).length === 0}>
        Validate &amp; Preview
      </Button>
    </div>
  );
}
