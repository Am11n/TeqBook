import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/marketing/Section";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Privacy Policy | TeqBook",
    description:
      "Learn how TeqBook collects, uses and protects personal data across our website and salon platform.",
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  return (
    <>
      <Section className="bg-gradient-to-b from-blue-50/80 via-blue-100/30 to-white pb-8 pt-20 sm:pb-10 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 shadow-sm">
            <Image src="/Favikon.svg" alt="TeqBook" width={22} height={22} className="h-5 w-5" />
            <span className="text-xs font-semibold tracking-wide text-blue-700">PRIVACY</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Privacy policy
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            We are committed to handling salon and customer data responsibly.
          </p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Effective date: 25 February 2026
          </p>
        </div>
      </Section>

      <Section className="py-10 sm:py-12">
        <div className="mx-auto max-w-4xl space-y-4 text-slate-700">
          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">1. Data we collect</h2>
            <p className="mt-3 leading-7">
              We collect personal and business information required to operate the
              TeqBook platform. Categories include:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>
                <span className="font-medium text-slate-900">Account data:</span>{" "}
                name, email address, role, and authentication details.
              </li>
              <li>
                <span className="font-medium text-slate-900">Salon data:</span>{" "}
                salon profile details, staff information, and service setup.
              </li>
              <li>
                <span className="font-medium text-slate-900">Booking data:</span>{" "}
                customer names, appointment times, booked services, and notes added by
                authorized staff.
              </li>
              <li>
                <span className="font-medium text-slate-900">Technical usage data:</span>{" "}
                device/browser information, logs, and security events used for service
                reliability and fraud prevention.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">
              2. How and why we process data
            </h2>
            <p className="mt-3 leading-7">
              We process personal data to provide, secure, and improve TeqBook. Main
              purposes include:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>Deliver bookings, reminders, and operational workflows.</li>
              <li>Provide customer support and service communication.</li>
              <li>Maintain security, monitor abuse, and investigate incidents.</li>
              <li>Meet legal and accounting obligations.</li>
            </ul>
            <p className="mt-3 leading-7">
              Legal basis generally includes contract performance, legitimate interests,
              compliance with legal obligations, and consent where required.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">
              3. Sharing, storage and retention
            </h2>
            <p className="mt-3 leading-7">
              We only share data with trusted processors necessary to run the service
              (for example infrastructure, email delivery and analytics providers),
              under contractual safeguards.
            </p>
            <p className="mt-3 leading-7">
              Data is stored in secure systems with access controls, encryption in
              transit, and role-based permissions. Retention periods depend on account
              status, legal obligations, and business need.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">4. Your rights</h2>
            <p className="mt-3 leading-7">Depending on applicable law, you may request:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>Access to personal data we hold about you.</li>
              <li>Correction of inaccurate or incomplete information.</li>
              <li>Deletion or restriction of processing in specific cases.</li>
              <li>Export of data in a portable format where technically feasible.</li>
              <li>Objection to processing based on legitimate interests.</li>
            </ul>
            <p className="mt-3 leading-7">
              Requests can be sent to support@teqbook.com. We may verify identity before
              fulfilling a request.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">
              5. International transfers and policy updates
            </h2>
            <p className="mt-3 leading-7">
              If data is transferred outside your country, we use appropriate safeguards
              required by law. We may update this policy to reflect legal, technical, or
              product changes.
            </p>
          </section>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 px-6 py-5 text-sm text-slate-700 sm:px-7">
            For privacy questions, rights requests, or complaints, contact:
            <span className="ml-1 font-semibold text-slate-900">support@teqbook.com</span>.
          </div>
        </div>
      </Section>
    </>
  );
}
