import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/marketing/Section";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Terms of Service | TeqBook",
    description:
      "Read the terms that govern your use of TeqBook, including subscriptions, billing and acceptable use.",
    path: "/terms",
  });
}

export default function TermsPage() {
  return (
    <>
      <Section className="bg-gradient-to-b from-blue-50/80 via-blue-100/30 to-white pb-8 pt-20 sm:pb-10 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 shadow-sm">
            <Image src="/Favikon.svg" alt="TeqBook" width={22} height={22} className="h-5 w-5" />
            <span className="text-xs font-semibold tracking-wide text-blue-700">TERMS</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Terms of service
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            These terms explain the responsibilities and rights of TeqBook and its
            customers.
          </p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Effective date: 25 February 2026
          </p>
        </div>
      </Section>

      <Section className="py-10 sm:py-12">
        <div className="mx-auto max-w-4xl space-y-4 text-slate-700">
          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">1. Agreement scope</h2>
            <p className="mt-3 leading-7">
              These Terms of Service govern your access to and use of TeqBook products,
              websites, applications and related services. By creating an account or
              using the platform, you accept these terms.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">
              2. Accounts, roles and responsibilities
            </h2>
            <p className="mt-3 leading-7">
              Account owners are responsible for team access, permissions and activity
              under their organization account. You must provide accurate information and
              protect login credentials.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">
              3. Subscriptions, fees and billing
            </h2>
            <p className="mt-3 leading-7">
              Paid plans are billed according to the selected subscription period.
              Upgrades, downgrades, and add-ons may change future invoices based on your
              active plan and usage limits.
            </p>
            <p className="mt-3 leading-7">
              Unless otherwise stated, fees are non-refundable for already delivered
              service periods, subject to mandatory consumer law where applicable.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">4. Acceptable use</h2>
            <p className="mt-3 leading-7">You agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>Use TeqBook for unlawful activity or fraudulent behavior.</li>
              <li>Attempt unauthorized access to systems, accounts or data.</li>
              <li>Interfere with service stability, security or other users.</li>
              <li>Upload harmful code, malware or abusive content.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">
              5. Data ownership and privacy
            </h2>
            <p className="mt-3 leading-7">
              You retain ownership of your business data. TeqBook processes personal data
              according to our Privacy Policy and applicable data protection law.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">
              6. Service availability and changes
            </h2>
            <p className="mt-3 leading-7">
              We continuously improve the platform and may update features, limits, and
              integrations. Planned maintenance and security updates may temporarily
              affect availability.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">
              7. Limitation of liability
            </h2>
            <p className="mt-3 leading-7">
              To the extent permitted by law, TeqBook is not liable for indirect,
              incidental or consequential losses arising from service use, downtime, or
              third-party integrations.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">
              8. Termination and suspension
            </h2>
            <p className="mt-3 leading-7">
              You may stop using the service at any time. We may suspend or terminate
              accounts that violate these terms, applicable law, or security policies.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">
              9. Governing law and contact
            </h2>
            <p className="mt-3 leading-7">
              These terms are governed by applicable law in the jurisdiction where
              TeqBook is established, unless mandatory local law provides otherwise.
            </p>
            <p className="mt-3 leading-7">
              For legal or contractual questions, contact support@teqbook.com.
            </p>
          </section>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 px-6 py-5 text-sm text-slate-700 sm:px-7">
            By using TeqBook, you confirm that you have read and accepted these Terms of
            Service and the Privacy Policy.
          </div>
        </div>
      </Section>
    </>
  );
}
