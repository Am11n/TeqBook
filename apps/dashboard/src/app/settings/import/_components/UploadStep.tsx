import type { DragEvent, ChangeEvent, RefObject } from "react";
import { Upload } from "lucide-react";
import type { ImportPreset } from "@/lib/constants/import-presets";
import { applyTemplate } from "@/i18n/apply-template";

interface UploadStepProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  presets: ImportPreset[];
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  dropPrompt: string;
  sizeHint: string;
  presetsLineTemplate: string;
}

export function UploadStep({
  fileInputRef,
  presets,
  onDrop,
  onFileSelect,
  dropPrompt,
  sizeHint,
  presetsLineTemplate,
}: UploadStepProps) {
  const presetNames = [...new Set(presets.map((p) => p.name))].join(", ");

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => fileInputRef.current?.click()}
    >
      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
      <p className="text-sm font-medium">{dropPrompt}</p>
      <p className="text-xs text-muted-foreground mt-1">{sizeHint}</p>
      {presets.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {applyTemplate(presetsLineTemplate, { names: presetNames })}
        </p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={onFileSelect}
      />
    </div>
  );
}
