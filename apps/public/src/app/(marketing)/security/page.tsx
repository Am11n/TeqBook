import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Database,
  ShieldCheck,
  UserCheck,
  HardDriveDownload,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/marketing/Section";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Security & Data Protection | TeqBook",
    description:
      "How TeqBook protects your salon data with secure hosting, access control, encryption and backups.",
    path: "/security",
  });
}

const TRUST_STRIP = [
  "Secure EU hosting",
  "Encrypted connections",
  "Role-based access",
  "Automatic backups",
];

const SECURITY_SECTIONS = [
  {
    id: "data-protection",
    title: "Data protection",
    description:
      "We protect salon data with modern infrastructure and strong encryption.",
    icon: ShieldCheck,
    points: [
      "Your data is hosted on secure infrastructure in the EU.",
      "All traffic is encrypted in transit with HTTPS/TLS.",
      "Database storage is encrypted to protect sensitive information.",
      "Infrastructure is continuously monitored for unusual activity.",
    ],
  },
  {
    id: "access-control",
    title: "Access control & permissions",
    description:
      "Only the right people get access to the right data at the right time.",
    icon: UserCheck,
    points: [
      "Role-based access is available for owners, managers, and staff.",
      "Each salon has isolated data boundaries.",
      "Authentication flows are designed for secure account access.",
      "Sessions are managed to reduce unauthorized account use.",
    ],
  },
  {
    id: "backups-reliability",
    title: "Backups & reliability",
    description:
      "We keep your system dependable so your daily operations can continue smoothly.",
    icon: Database,
    points: [
      "Backups run automatically to reduce risk of data loss.",
      "Redundant infrastructure supports service continuity.",
      "The platform is configured for high availability.",
      "Recovery procedures are in place for critical incidents.",
    ],
  },
  {
    id: "data-ownership",
    title: "Your data, your control",
    description:
      "Your business data remains yours, with clear control over access and lifecycle.",
    icon: HardDriveDownload,
    points: [
      "You can request full data export when needed.",
      "TeqBook does not sell salon or customer data.",
      "Account deletion can be requested when you choose to leave.",
      "Data handling follows GDPR-aligned practices.",
    ],
  },
];

export default function SecurityPage() {
  return (
    <>
      <Section className="bg-gradient-to-b from-slate-50 via-blue-50/30 to-white pb-10 pt-20 sm:pb-12 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Security & data protection
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Your salon data stays protected, private, and under your control.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-600 sm:gap-x-8">
            {TRUST_STRIP.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {SECURITY_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/30 sm:p-7"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {section.description}
                </p>
                <ul className="mt-5 space-y-3">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <span className="leading-7">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <Section className="py-10 sm:py-12">
        <div className="mx-auto max-w-3xl rounded-xl border border-blue-100 bg-blue-50/40 px-6 py-8 sm:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Technical overview
          </h2>
          <p className="mt-3 leading-7 text-slate-700">
            TeqBook runs on modern cloud infrastructure with strict data
            isolation between salons. Core services are monitored continuously,
            with backup and recovery controls designed to protect business
            continuity.
          </p>
        </div>
      </Section>

      <Section className="pt-6 sm:pt-8">
        <div className="mx-auto max-w-3xl border-t border-slate-200 pt-10 text-center sm:pt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Your data stays yours.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            We never sell or share customer data. Ever.
          </p>
          <div className="mt-8">
            <Link
              href="/#demo"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Contact support
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
