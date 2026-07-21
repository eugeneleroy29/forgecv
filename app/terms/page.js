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

function FileTextIcon({ className }) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "agreement",
    heading: "1. Agreement to Terms",
    body: [
      'These Terms of Service ("Terms") govern your use of ForgeCV. By creating an account or using ForgeCV, you agree to these Terms. If you do not agree, please do not use the service.',
    ],
  },
  {
    id: "account",
    heading: "2. Your Account",
    body: [
      "You must provide accurate information when creating your account and are responsible for keeping your login credentials secure. You are responsible for all activity that happens under your account.",
      "You must be at least 13 years old to use ForgeCV.",
    ],
  },
  {
    id: "billing",
    heading: "3. Plans, Billing, and Renewal",
    body: [
      "ForgeCV offers a Free plan and paid Starter and Pro plans, billed monthly or annually, as well as one-time lifetime portfolio publish slots. Current pricing is listed on our Pricing page.",
      "Subscriptions paid through Stripe renew automatically at the end of each billing period unless cancelled. Subscriptions paid through PayMongo currently renew manually — we will send you a reminder email before your plan expires, and your subscription will lapse if you do not complete the renewal payment.",
      "Lifetime portfolio publish slots are a one-time purchase and do not expire, and stack on top of the publish slots included in any active subscription plan.",
      "You can cancel a subscription at any time from your Billing page. If you cancel, you will keep access to paid features until the end of your current billing period. After that, your account reverts to the Free plan limits, but your resumes and portfolio content are not deleted.",
    ],
  },
  {
    id: "refunds",
    heading: "4. Refunds",
    body: [
      "Refund requests are handled on a case-by-case basis. Please see our Refund Policy for details, or contact us at support@forgecv.org.",
    ],
  },
  {
    id: "content",
    heading: "5. Your Content",
    body: [
      "You retain ownership of the resume and portfolio content you create using ForgeCV. By using the service, you grant us permission to store, process, and display that content as needed to provide the service to you, including making a published portfolio publicly accessible at the URL you are given.",
      "You are responsible for the accuracy and legality of the content you submit, and you agree not to upload content that is unlawful, infringes on someone else's rights, or is otherwise harmful.",
    ],
  },
  {
    id: "ai",
    heading: "6. AI-Powered Features",
    body: [
      "ForgeCV includes optional AI features that generate suggestions such as summaries, skills, and resume feedback. These suggestions are generated automatically and may not always be accurate — you are responsible for reviewing and editing any AI-generated content before using it.",
    ],
  },
  {
    id: "acceptable-use",
    heading: "7. Acceptable Use",
    body: [
      "You agree not to use ForgeCV to violate any law, infringe on intellectual property rights, distribute malware, or attempt to disrupt or gain unauthorized access to our systems.",
      "We reserve the right to suspend or terminate accounts that violate these Terms.",
    ],
  },
  {
    id: "availability",
    heading: "8. Service Availability",
    body: [
      "We aim to keep ForgeCV available and reliable, but we do not guarantee uninterrupted access. We may modify, suspend, or discontinue parts of the service at any time.",
    ],
  },
  {
    id: "liability",
    heading: "9. Disclaimer and Limitation of Liability",
    body: [
      'ForgeCV is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the service.',
    ],
  },
  {
    id: "changes",
    heading: "10. Changes to These Terms",
    body: [
      "We may update these Terms from time to time. If we make material changes, we will update the date below and, where appropriate, notify you.",
    ],
  },
  {
    id: "contact",
    heading: "11. Contact Us",
    body: [
      "If you have any questions about these Terms, contact us at support@forgecv.org.",
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

export default function Terms() {
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
            <FileTextIcon className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Terms of Service
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