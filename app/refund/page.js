"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function ArrowUpIcon({ className }) {
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
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function RefreshCcwIcon({ className }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "subscriptions",
    heading: "1. Subscriptions (Starter and Pro)",
    body: [
      "Starter and Pro subscription payments, whether billed monthly or annually, are non-refundable.",
      "You can cancel your subscription at any time from your Billing page. When you cancel, you will keep access to your paid plan features until the end of your current billing period. After that, your account reverts to the Free plan limits. Your data, resumes, and portfolio content are never deleted when you cancel or downgrade.",
    ],
  },
  {
    id: "lifetime",
    heading: "2. Lifetime Portfolio Slots",
    body: [
      "Lifetime portfolio publish slots (1-slot or 3-slot, one-time purchase) are eligible for a full refund within 7 days of purchase, provided the slot has not yet been used to publish a portfolio.",
      "Once a lifetime slot has been used to publish a portfolio live, it is no longer eligible for a refund.",
      "To request a refund on an unused lifetime slot within the 7-day window, contact us at support@forgecv.com with your account email and purchase date.",
    ],
  },
  {
    id: "billing-errors",
    heading: "3. Billing Errors",
    body: [
      "If you believe you were charged in error, such as a duplicate charge or a charge after a subscription was already cancelled, contact us at support@forgecv.com and we will look into it.",
    ],
  },
  {
    id: "how-request",
    heading: "4. How to Request a Refund",
    body: [
      "Where a refund applies under this policy, email us at support@forgecv.com with your account email, the date of purchase, and the reason for your request. We will review your request and respond as soon as possible.",
    ],
  },
  {
    id: "changes",
    heading: "5. Changes to This Policy",
    body: [
      "We may update this Refund Policy from time to time. If we make material changes, we will update the date below.",
    ],
  },
  {
    id: "contact",
    heading: "6. Contact Us",
    body: [
      "If you have any questions about this Refund Policy, contact us at support@forgecv.com.",
    ],
  },
];

// ─── Components ──────────────────────────────────────────────────────────────

function TableOfContents({ sections, activeId }) {
  return (
    <nav className="hidden lg:block sticky top-24 self-start">
      <div className="bg-card border border-border rounded-2xl p-5 w-64">
        <h3 className="text-sm font-semibold text-foreground/50 uppercase tracking-wide mb-4">
          Contents
        </h3>
        <ul className="flex flex-col gap-1">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`block text-sm py-1.5 px-2 rounded-lg transition-all ${
                  activeId === section.id
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted"
                }`}
              >
                {section.heading}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 bg-card border border-border rounded-xl p-3 shadow-lg hover:shadow-accent/5 hover:border-accent/30 transition-all z-40"
      aria-label="Back to top"
    >
      <ArrowUpIcon className="w-4 h-4 text-foreground/60" />
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Refund() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveId(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-10 sm:pb-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <RefreshCcwIcon className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Refund Policy
          </h1>
          <p className="text-sm text-foreground/50">Last updated: July 2026</p>
        </div>
      </section>

      {/* ─── Content ──────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32">
        <div className="flex gap-10">
          <TableOfContents sections={SECTIONS} activeId={activeId} />

          <div className="flex-1 min-w-0 max-w-3xl">
            <div className="flex flex-col gap-8">
              {SECTIONS.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-card border border-border rounded-2xl p-6 sm:p-8 scroll-mt-28"
                >
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-4">
                    {section.heading}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {section.body.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-sm sm:text-base text-foreground/70 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BackToTop />
      <Footer />
    </main>
  );
}