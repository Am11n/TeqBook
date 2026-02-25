"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { Section } from "@/components/marketing/Section";

type SubmitState = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, consent }),
      });

      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setState("error");
        setFeedback(result.error ?? "Could not send your message right now.");
        return;
      }

      setState("success");
      setFeedback(result.message ?? "Thanks! We will contact you shortly.");
      setName("");
      setEmail("");
      setMessage("");
      setConsent(false);
    } catch {
      setState("error");
      setFeedback("Network error. Please try again.");
    }
  }

  return (
    <>
      <Section className="bg-gradient-to-b from-blue-50/80 via-blue-100/30 to-white pb-8 pt-20 sm:pb-10 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <Image src="/Favikon.svg" alt="TeqBook" width={22} height={22} className="h-5 w-5" />
            <span className="text-xs font-semibold tracking-wide text-blue-700">TEQBOOK SUPPORT</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Contact TeqBook
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Questions about plans, onboarding, or support? Send us a message and we
            will respond as soon as possible.
          </p>
        </div>
      </Section>

      <Section className="pt-8 sm:pt-10">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-blue-100/80 bg-white/95 p-6 shadow-lg shadow-blue-100/30 backdrop-blur-sm sm:p-8"
          >
            <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-slate-700">
              Send us your message and we will follow up with practical next steps.
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="you@salon.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  maxLength={2000}
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Tell us how we can help."
                />
              </div>

              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  required
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                />
                <span>
                  I consent to TeqBook storing my inquiry so the team can respond to my
                  request.
                </span>
              </label>
            </div>

            {state !== "idle" && feedback && (
              <p
                className={`mt-4 text-sm ${
                  state === "success" ? "text-emerald-600" : "text-rose-600"
                }`}
                aria-live="polite"
              >
                {feedback}
              </p>
            )}

            <button
              type="submit"
              disabled={state === "loading"}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-colors hover:from-blue-500 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {state === "loading" ? "Sending..." : "Send message"}
            </button>
          </form>

          <aside className="rounded-3xl border border-blue-100/80 bg-gradient-to-b from-white to-blue-50/50 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Support information
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              We usually reply within one business day. For urgent plan or onboarding
              questions, include your salon name in the message.
            </p>
            <dl className="mt-6 space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border border-blue-100 bg-white/80 px-3 py-2">
                <dt className="font-medium text-slate-900">Email</dt>
                <dd>support@teqbook.com</dd>
              </div>
              <div className="rounded-xl border border-blue-100 bg-white/80 px-3 py-2">
                <dt className="font-medium text-slate-900">Phone</dt>
                <dd>+47 45 76 55 67</dd>
              </div>
              <div className="rounded-xl border border-blue-100 bg-white/80 px-3 py-2">
                <dt className="font-medium text-slate-900">Office</dt>
                <dd>Nesbru, Norway</dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>
    </>
  );
}
