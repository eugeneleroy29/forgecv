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

function ShieldIcon({ className }) {
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
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "introduction",
    heading: "1. Introduction",
    body: [
      'ForgeCV ("we", "us", or "our") provides an online resume builder and portfolio website generator. This Privacy Policy explains what information we collect, how we use it, and the choices you have.',
      "By using ForgeCV, you agree to the collection and use of information as described in this policy.",
    ],
  },
  {
    id: "information-collect",
    heading: "2. Information We Collect",
    body: [
      "Account information: your name and email address when you sign up, either directly or through a supported sign-in provider.",
      "Resume and portfolio content: the information you enter into the resume builder and portfolio builder, including work experience, education, skills, profile photos, and any custom sections you add.",
      "Payment information: when you subscribe to a paid plan, payment is processed by Stripe or PayMongo. We do not store your full card number or payment credentials on our servers — these are handled directly by our payment processors.",
      "Usage information: basic technical data such as your general location (used only to determine currency and payment provider), browser type, and how you interact with the app, used to keep the service running and improve it.",
    ],
  },
  {
    id: "how-use",
    heading: "3. How We Use Your Information",
    body: [
      "To create and manage your account.",
      "To generate, save, and display your resumes and portfolio websites, including publishing your portfolio to a public URL if you choose to do so.",
      "To process payments and manage your subscription, including renewal reminders for manually-renewed plans.",
      "To provide customer support and respond to your questions.",
      "To improve ForgeCV and fix issues.",
    ],
  },
  {
    id: "ai-features",
    heading: "4. AI-Powered Features",
    body: [
      "ForgeCV includes AI features (such as generating a professional summary, suggesting skills, or scoring your resume against a job description) powered by Google's Gemini API. When you use these features, the relevant resume content or job description text you provide is sent to Google's API to generate a response.",
      "We do not use your resume or portfolio content to train AI models.",
    ],
  },
  {
    id: "security",
    heading: "5. Data Storage and Security",
    body: [
      "Your account data, resume content, and portfolio content are stored using Supabase, which provides authentication, database, and file storage services. We use reasonable technical and organizational measures to protect your information, but no method of storage or transmission is completely secure.",
    ],
  },
  {
    id: "retention",
    heading: "6. Data Retention",
    body: [
      "If you cancel a subscription or your plan expires, your account data and content are not deleted. Your access to paid features is simply restricted until you resubscribe, so you do not lose your resumes or portfolio content.",
      "If you would like your account and associated data permanently deleted, you can contact us at support@forgecv.org to request this.",
    ],
  },
  {
    id: "sharing",
    heading: "7. Sharing of Information",
    body: [
      "We do not sell your personal information. We share information only with the third-party services necessary to operate ForgeCV, including Supabase (hosting and storage), Stripe and PayMongo (payment processing), Google (AI features), and Vercel (application hosting).",
      "If you choose to publish a portfolio, the content of that portfolio is publicly accessible at the URL you are given, by design.",
    ],
  },
  {
    id: "rights",
    heading: "8. Your Rights",
    body: [
      "Depending on your location, you may have rights to access, correct, or delete your personal information. You can update most of your account information directly from your dashboard, or contact us at support@forgecv.org for anything else.",
    ],
  },
  {
    id: "children",
    heading: "9. Children's Privacy",
    body: [
      "ForgeCV is not directed at children under 13, and we do not knowingly collect personal information from children under 13.",
    ],
  },
  {
    id: "changes",
    heading: "10. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. If we make material changes, we will update the date below and, where appropriate, notify you.",
    ],
  },
  {
    id: "contact",
    heading: "11. Contact Us",
    body: [
      "If you have any questions about this Privacy Policy, contact us at support@forgecv.org.",
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

export default function Privacy() {
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
            <ShieldIcon className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Privacy Policy
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