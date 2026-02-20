"use client";

import { ErrorMessage } from "@/components/feedback/error-message";
import { useCurrentSalon } from "@/components/salon-provider";
import { useImportWizard } from "./_hooks/useImportWizard";
import { TABS } from "./_components/types";
import { UploadStep } from "./_components/UploadStep";
import { MappingStep } from "./_components/MappingStep";
import { PreviewStep } from "./_components/PreviewStep";
import { ImportingStep } from "./_components/ImportingStep";
import { DoneStep } from "./_components/DoneStep";
import { ImportHistory } from "./_components/ImportHistory";

export default function ImportPage() {
  const { salon } = useCurrentSalon();
  const w = useImportWizard({ salonId: salon?.id });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-sm font-semibold">Data Import</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Import customers, services, employees, and bookings from a CSV file.
          Supports Timma, Fresha, and Setmore exports.
        </p>
      </div>

      {w.error && (
        <ErrorMessage message={w.error} onDismiss={() => w.setError(null)} variant="destructive" />
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => w.setActiveTab(tab.key)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              w.activeTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {w.step === "upload" && (
        <UploadStep
          fileInputRef={w.fileInputRef}
          presets={w.presets}
          onDrop={w.handleFileDrop}
          onFileSelect={w.handleFileSelect}
        />
      )}

      {w.step === "mapping" && (
        <MappingStep
          fileName={w.fileName}
          rowCount={w.csvRows.length}
          csvHeaders={w.csvHeaders}
          mapping={w.mapping}
          presets={w.presets}
          targetFields={w.targetFields}
          onMappingChange={w.handleMappingChange}
          onApplyPreset={w.handleApplyPreset}
          onValidate={w.handleValidate}
          onReset={w.resetImportState}
        />
      )}

      {w.step === "preview" && (
        <PreviewStep
          validRows={w.validRows}
          errorRows={w.errorRows}
          mapping={w.mapping}
          onDownloadErrors={w.handleDownloadErrors}
          onBack={() => w.setStep("mapping")}
          onExecute={w.handleExecute}
        />
      )}

      {w.step === "importing" && (
        <ImportingStep progress={w.progress} progressTotal={w.progressTotal} />
      )}

      {w.step === "done" && w.resultBatch && (
        <DoneStep
          batch={w.resultBatch}
          onReset={w.resetImportState}
          onRollback={w.handleRollback}
        />
      )}

      <ImportHistory
        history={w.history}
        loading={w.loadingHistory}
        onRollback={w.handleRollback}
      />
    </div>
  );
}
