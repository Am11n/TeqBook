import type { DragEvent, ChangeEvent, RefObject } from "react";
import { Upload } from "lucide-react";
import type { ImportPreset } from "@/lib/constants/import-presets";

interface UploadStepProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  presets: ImportPreset[];
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function UploadStep({ fileInputRef, presets, onDrop, onFileSelect }: UploadStepProps) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => fileInputRef.current?.click()}
    >
      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
      <p className="text-sm font-medium">Drop CSV file here or click to browse</p>
      <p className="text-xs text-muted-foreground mt-1">
        Max 10MB. Supports comma, semicolon, and tab delimiters.
      </p>
      {presets.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Presets available: {[...new Set(presets.map((p) => p.name))].join(", ")}
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
