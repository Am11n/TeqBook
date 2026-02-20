"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, ArrowRight, RotateCcw, Download, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/feedback/error-message";
import { useCurrentSalon } from "@/components/salon-provider";
import {
  validateImportRows,
  executeImport,
  rollbackImport,
  getHistory,
  type ImportBatch,
  type ValidatedRow,
} from "@/lib/services/import-service";
import {
  getPresetsForType,
  autoSuggestMapping,
  getTargetFields,
  type ImportPreset,
} from "@/lib/constants/import-presets";

type ImportStep = "upload" | "mapping" | "preview" | "importing" | "done";
type ImportType = "customers" | "services" | "employees" | "bookings";

const TABS: { key: ImportType; label: string }[] = [
  { key: "customers", label: "Customers" },
  { key: "services", label: "Services" },
  { key: "employees", label: "Employees" },
  { key: "bookings", label: "Bookings" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ImportPage() {
  const { salon } = useCurrentSalon();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ImportType>("customers");
  const [step, setStep] = useState<ImportStep>("upload");
  const [error, setError] = useState<string | null>(null);

  // File / CSV state
  const [fileName, setFileName] = useState<string>("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);

  // Mapping state
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [presets, setPresets] = useState<ImportPreset[]>([]);

  // Validation / preview
  const [validRows, setValidRows] = useState<ValidatedRow[]>([]);
  const [errorRows, setErrorRows] = useState<ValidatedRow[]>([]);

  // Import progress
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [resultBatch, setResultBatch] = useState<ImportBatch | null>(null);

  // History
  const [history, setHistory] = useState<ImportBatch[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load presets when tab changes
  useEffect(() => {
    setPresets(getPresetsForType(activeTab));
    resetImportState();
  }, [activeTab]);

  // Load history
  useEffect(() => {
    if (!salon?.id) return;
    setLoadingHistory(true);
    getHistory(salon.id).then(({ data }) => {
      setHistory(data ?? []);
      setLoadingHistory(false);
    });
  }, [salon?.id, resultBatch]);

  const resetImportState = () => {
    setStep("upload");
    setFileName("");
    setCsvHeaders([]);
    setCsvRows([]);
    setMapping({});
    setValidRows([]);
    setErrorRows([]);
    setProgress(0);
    setProgressTotal(0);
    setResultBatch(null);
    setError(null);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [activeTab]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large (max 10MB)");
      return;
    }

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      setError("Please upload a CSV file");
      return;
    }

    setFileName(file.name);
    setError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }

        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        setCsvRows(results.data);

        // Auto-suggest mapping
        const suggested = autoSuggestMapping(headers, activeTab);
        setMapping(suggested);
        setStep("mapping");
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleApplyPreset = (preset: ImportPreset) => {
    const newMapping: Record<string, string> = {};
    for (const header of csvHeaders) {
      if (preset.mappings[header]) {
        newMapping[header] = preset.mappings[header];
      } else if (mapping[header]) {
        newMapping[header] = mapping[header];
      }
    }
    setMapping(newMapping);
  };

  const handleMappingChange = (csvCol: string, tbField: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (tbField === "") {
        delete next[csvCol];
      } else {
        next[csvCol] = tbField;
      }
      return next;
    });
  };

  const handleValidate = () => {
    const { valid, errors } = validateImportRows(activeTab, csvRows, mapping);
    setValidRows(valid);
    setErrorRows(errors);
    setStep("preview");
  };

  const handleExecute = async () => {
    if (!salon?.id) return;
    setStep("importing");
    setProgressTotal(validRows.length);

    const { batch, error } = await executeImport(
      salon.id,
      activeTab,
      validRows,
      mapping,
      fileName,
      (done, total) => {
        setProgress(done);
        setProgressTotal(total);
      }
    );

    if (error) {
      setError(error);
      setStep("preview");
      return;
    }

    setResultBatch(batch);
    setStep("done");
  };

  const handleRollback = async (batchId: string) => {
    if (!salon?.id) return;
    const { error } = await rollbackImport(salon.id, batchId);
    if (error) {
      setError(error);
      return;
    }
    // Refresh history
    const { data } = await getHistory(salon.id);
    setHistory(data ?? []);
  };

  const handleDownloadErrors = () => {
    if (errorRows.length === 0) return;
    const header = "Row,Field,Error\n";
    const rows = errorRows.flatMap((r) =>
      r.errors.map((e) => `${e.row},"${e.field}","${e.error}"`)
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `import-errors-${activeTab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const targetFields = getTargetFields(activeTab);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-sm font-semibold">Data Import</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Import customers, services, employees, and bookings from a CSV file.
          Supports Timma, Fresha, and Setmore exports.
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} variant="destructive" />}

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Drop CSV file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Max 10MB. Supports comma, semicolon, and tab delimiters.</p>
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
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* Step: Mapping */}
      {step === "mapping" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                {fileName} ({csvRows.length} rows)
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={resetImportState}>Start over</Button>
          </div>

          {/* Preset selector */}
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
                    if (preset) handleApplyPreset(preset);
                  }}
                >
                  {name}
                </Button>
              ))}
            </div>
          )}

          {/* Column mapper */}
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
                  onChange={(e) => handleMappingChange(header, e.target.value)}
                  className="flex-1 h-8 rounded-md border bg-background px-2 text-xs"
                >
                  <option value="">Skip</option>
                  {targetFields.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}{f.required ? " *" : ""}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <Button onClick={handleValidate} disabled={Object.keys(mapping).length === 0}>
            Validate & Preview
          </Button>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
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
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={handleDownloadErrors}>
                  <Download className="h-3 w-3 mr-1" /> Download errors
                </Button>
              </div>
            )}
          </div>

          {/* Preview table (first 10 rows) */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground">#</th>
                  {Object.values(mapping).map((field) => (
                    <th key={field} className="py-2 px-3 text-left font-medium text-muted-foreground">{field}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {validRows.slice(0, 10).map((row) => (
                  <tr key={row.rowIndex} className="border-b last:border-0">
                    <td className="py-1.5 px-3 text-muted-foreground">{row.rowIndex + 1}</td>
                    {Object.values(mapping).map((field) => (
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
            <p className="text-[10px] text-muted-foreground">Showing first 10 of {validRows.length} valid rows</p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("mapping")}>Back to mapping</Button>
            <Button onClick={handleExecute} disabled={validRows.length === 0}>
              Import {validRows.length} rows
            </Button>
          </div>
        </div>
      )}

      {/* Step: Importing */}
      {step === "importing" && (
        <div className="text-center py-8 space-y-4">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
          <p className="text-sm font-medium">Importing...</p>
          <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progressTotal > 0 ? (progress / progressTotal) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{progress} / {progressTotal} rows</p>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && resultBatch && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-green-600 mb-3" />
            <p className="text-sm font-semibold">Import Complete</p>
            <div className="flex justify-center gap-4 mt-3 text-xs">
              <span className="text-green-600">{resultBatch.success_count} imported</span>
              {resultBatch.failed_count > 0 && (
                <span className="text-red-600">{resultBatch.failed_count} failed</span>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={resetImportState}>Import more</Button>
            <Button
              variant="ghost"
              className="text-red-600"
              onClick={() => handleRollback(resultBatch.id)}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Rollback
            </Button>
          </div>
        </div>
      )}

      {/* Import History */}
      {history.length > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Import History</h3>
          {loadingHistory ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="divide-y">
              {history.map((batch) => {
                const canRollback =
                  batch.status === "completed" &&
                  (Date.now() - new Date(batch.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000;

                return (
                  <div key={batch.id} className="flex items-center justify-between py-2 text-xs">
                    <div>
                      <span className="font-medium capitalize">{batch.import_type}</span>
                      {batch.file_name && <span className="text-muted-foreground ml-2">{batch.file_name}</span>}
                      <span className="text-muted-foreground ml-2">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-green-600">{batch.success_count}</span>
                      {batch.failed_count > 0 && <span className="text-red-600">{batch.failed_count} failed</span>}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${
                        batch.status === "completed" ? "bg-green-100 text-green-700" :
                        batch.status === "rolled_back" ? "bg-gray-100 text-gray-500" :
                        batch.status === "failed" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {batch.status}
                      </span>
                      {canRollback && (
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] text-red-600" onClick={() => handleRollback(batch.id)}>
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
