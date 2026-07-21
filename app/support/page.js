"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useState } from "react";

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function MailIcon({ className }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function FileQuestionIcon({ className }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 17h.01" />
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
      <path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CopyIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// ─── Components ──────────────────────────────────────────────────────────────

function SupportEmailButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("support@forgecv.org");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = "mailto:support@forgecv.org";
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10 hover:shadow-accent/20"
    >
      {copied ? (
        <>
          <CheckIcon className="w-4 h-4" />
          Copied to clipboard
        </>
      ) : (
        <>
          <CopyIcon className="w-4 h-4" />
          support@forgecv.org
        </>
      )}
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Support() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-10 sm:pb-14 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5">
          Support
        </h1>
        <p className="text-base sm:text-lg text-foreground/60 max-w-lg mx-auto leading-relaxed">
          Have a question or run into an issue? We are here to help.
        </p>
      </section>

      {/* ─── Contact Cards ────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Email Card */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-5">
              <MailIcon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold tracking-tight mb-2">Email us</h2>
            <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
              Send us a message and we will get back to you, typically within
              24 hours.
            </p>
            <SupportEmailButton />
          </div>

          {/* FAQ Card */}
          <a
            href="/faq"
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-5 group-hover:bg-accent/15 transition-colors">
              <FileQuestionIcon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold tracking-tight mb-2">
              Browse FAQ
            </h2>
            <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
              Find instant answers to common questions about plans, payments,
              resumes, portfolios, and cover letters.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
              Go to FAQ
              <ArrowRightIcon className="w-4 h-4" />
            </span>
          </a>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32 text-center">
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3">
            Ready to get started?
          </h2>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto leading-relaxed">
            Build your resume, portfolio, or cover letter in minutes. No credit
            card required.
          </p>
          <button
            onClick={() => router.push(user ? "/dashboard" : "/signup")}
            className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10 hover:shadow-accent/20"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}