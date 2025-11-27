"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { FormLayout } from "@/components/form-layout";
import { useLocale } from "@/components/locale-provider";
import { translations } from "@/i18n/translations";

export default function OnboardingPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const appLocale =
    locale === "nb"
      ? "nb"
      : locale === "ar"
        ? "ar"
        : locale === "so"
          ? "so"
          : locale === "ti"
            ? "ti"
            : locale === "am"
              ? "am"
              : locale === "tr"
                ? "tr"
                : locale === "pl"
                  ? "pl"
                  : locale === "vi"
                    ? "vi"
                    : locale === "zh"
                      ? "zh"
                      : locale === "tl"
                        ? "tl"
                        : locale === "fa"
                          ? "fa"
                          : locale === "dar"
                            ? "dar"
                            : locale === "ur"
                              ? "ur"
                              : locale === "hi"
                                ? "hi"
                                : "en";
  const t = translations[appLocale].onboarding;

  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const { data, error: rpcError } = await supabase.rpc(
      "create_salon_for_current_user",
      { salon_name: name },
    );

    if (rpcError || !data) {
      setError(rpcError?.message ?? t.createError);
      setStatus("error");
      return;
    }

    setStatus("success");
    router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <FormLayout
          title={t.title}
          description={t.description}
          footer={
            <p className="mt-2 text-xs text-muted-foreground">{t.footerHint}</p>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-sm">
              <label htmlFor="name" className="font-medium">
                {t.nameLabel}
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring/0 transition focus-visible:ring-2"
                placeholder={t.namePlaceholder}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500" aria-live="polite">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? t.saving : t.saveButton}
            </button>
          </form>

          <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-lg border bg-background px-3 py-2">
              {t.step1}
            </div>
            <div className="rounded-lg border bg-background px-3 py-2">
              {t.step2}
            </div>
            <div className="rounded-lg border bg-background px-3 py-2">
              {t.step3}
            </div>
          </div>
        </FormLayout>
      </div>
    </div>
  );
}



