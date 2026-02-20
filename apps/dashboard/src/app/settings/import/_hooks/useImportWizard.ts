import { useState, useEffect, useCallback, useRef, type DragEvent, type ChangeEvent } from "react";
import Papa from "papaparse";
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
import type { ImportStep, ImportType } from "../_components/types";
import { MAX_FILE_SIZE } from "../_components/types";

interface UseImportWizardOptions {
  salonId: string | undefined;
}

export function useImportWizard({ salonId }: UseImportWizardOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ImportType>("customers");
  const [step, setStep] = useState<ImportStep>("upload");
  const [error, setError] = useState<string | null>(null);

  const [fileName, setFileName] = useState("");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [presets, setPresets] = useState<ImportPreset[]>([]);

  const [validRows, setValidRows] = useState<ValidatedRow[]>([]);
  const [errorRows, setErrorRows] = useState<ValidatedRow[]>([]);

  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [resultBatch, setResultBatch] = useState<ImportBatch | null>(null);

  const [history, setHistory] = useState<ImportBatch[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    setPresets(getPresetsForType(activeTab));
    resetImportState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (!salonId) return;
    setLoadingHistory(true);
    getHistory(salonId).then(({ data }) => {
      setHistory(data ?? []);
      setLoadingHistory(false);
    });
  }, [salonId, resultBatch]);

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
        const suggested = autoSuggestMapping(headers, activeTab);
        setMapping(suggested);
        setStep("mapping");
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleFileDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab],
  );

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
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
    if (!salonId) return;
    setStep("importing");
    setProgressTotal(validRows.length);

    const { batch, error: execError } = await executeImport(
      salonId,
      activeTab,
      validRows,
      mapping,
      fileName,
      (done, total) => {
        setProgress(done);
        setProgressTotal(total);
      },
    );

    if (execError) {
      setError(execError);
      setStep("preview");
      return;
    }

    setResultBatch(batch);
    setStep("done");
  };

  const handleRollback = async (batchId: string) => {
    if (!salonId) return;
    const { error: rbError } = await rollbackImport(salonId, batchId);
    if (rbError) {
      setError(rbError);
      return;
    }
    const { data } = await getHistory(salonId);
    setHistory(data ?? []);
  };

  const handleDownloadErrors = () => {
    if (errorRows.length === 0) return;
    const header = "Row,Field,Error\n";
    const rows = errorRows
      .flatMap((r) => r.errors.map((e) => `${e.row},"${e.field}","${e.error}"`))
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `import-errors-${activeTab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const targetFields = getTargetFields(activeTab);

  return {
    fileInputRef,
    activeTab,
    setActiveTab,
    step,
    setStep,
    error,
    setError,
    fileName,
    csvHeaders,
    csvRows,
    mapping,
    presets,
    validRows,
    errorRows,
    progress,
    progressTotal,
    resultBatch,
    history,
    loadingHistory,
    targetFields,
    resetImportState,
    handleFileDrop,
    handleFileSelect,
    handleApplyPreset,
    handleMappingChange,
    handleValidate,
    handleExecute,
    handleRollback,
    handleDownloadErrors,
  };
}
