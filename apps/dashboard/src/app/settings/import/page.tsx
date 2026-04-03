"use client";

import { useMemo } from "react";
import { ErrorMessage } from "@/components/feedback/error-message";
import { useCurrentSalon } from "@/components/salon-provider";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { resolveSettings } from "@/app/settings/_helpers/resolve-settings";
import { useImportWizard } from "./_hooks/useImportWizard";
import { IMPORT_TYPES, type ImportType } from "./_components/types";
import { UploadStep } from "./_components/UploadStep";
import { MappingStep } from "./_components/MappingStep";
import { PreviewStep } from "./_components/PreviewStep";
import { ImportingStep } from "./_components/ImportingStep";
import { DoneStep } from "./_components/DoneStep";
import { ImportHistory } from "./_components/ImportHistory";

export default function ImportPage() {
  const { salon } = useCurrentSalon();
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  const t = resolveSettings(translations[appLocale].settings);
  const w = useImportWizard({ salonId: salon?.id });

  const tabLabels = useMemo(
    () =>
      ({
        customers: t.importTabCustomers,
        services: t.importTabServices,
        employees: t.importTabEmployees,
        bookings: t.importTabBookings,
      }) satisfies Record<ImportType, string>,
    [t.importTabBookings, t.importTabCustomers, t.importTabEmployees, t.importTabServices],
  );

  const tabs = useMemo(
    () => IMPORT_TYPES.map((key) => ({ key, label: tabLabels[key] })),
    [tabLabels],
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-sm font-semibold">{t.importPageTitle}</h3>
        <p className="text-xs text-muted-foreground mt-1">{t.importPageDescription}</p>
      </div>

      {w.error && (
        <ErrorMessage message={w.error} onDismiss={() => w.setError(null)} variant="destructive" />
      )}

      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
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
          dropPrompt={t.importUploadDropPrompt}
          sizeHint={t.importUploadSizeHint}
          presetsLineTemplate={t.importUploadPresetsLine}
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
