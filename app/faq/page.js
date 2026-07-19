"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function ChevronDownIcon({ className }) {
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
      <path d="m6 9 6 6 6-6" />
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

function HelpCircleIcon({ className }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

// ─── Data — verified against entitlements.js and pricing/page.js ─────────────

const FAQ_SECTIONS = [
  {
    category: "Getting Started",
    items: [
      {
        q: "What is ForgeCV?",
        a: "ForgeCV is an AI-powered resume builder, portfolio website generator, and cover letter creator built for virtual assistants, freelancers, and remote workers. You can build a professional resume, a live portfolio website, and tailored cover letters in one place.",
      },
      {
        q: "Do I need a credit card to sign up?",
        a: "No. The Free plan lets you build one resume and experiment with portfolio building with no payment required. A card is only needed if you upgrade to Starter or Pro, or purchase a lifetime portfolio slot.",
      },
      {
        q: "Can I use ForgeCV if I am not a Filipino VA?",
        a: "Yes. While several templates are designed with virtual assistant niches in mind, ForgeCV works for any freelancer or remote worker building a resume, portfolio, or cover letter.",
      },
    ],
  },
  {
    category: "Plans and Pricing",
    items: [
      {
        q: "What is the difference between Free, Starter, and Pro?",
        a: "Free includes 1 resume, 1 resume template, portfolio building (but no publishing), and no AI generations. Starter (PHP 149/mo or PHP 1,490/yr) includes 3 resumes, up to 3 templates, 3 cover letters, 1 portfolio publish slot, and 30 AI generations per month. Pro (PHP 299/mo or PHP 2,990/yr) includes unlimited resumes, templates, and cover letters, 3 portfolio publish slots, 60 AI generations per month, portfolio analytics, and priority support.",
      },
      {
        q: "Can I switch between monthly and annual billing?",
        a: "Yes, you can change your plan or billing cycle anytime from your Billing page. If you have questions about how a mid-cycle switch is charged, our support team can help.",
      },
      {
        q: "What happens to my data if I cancel or downgrade?",
        a: "You can cancel anytime. Your access continues until the end of your current billing period, and your data is never deleted. Paid features simply lock again until you resubscribe.",
      },
      {
        q: "Do lifetime portfolio slots stack with my subscription?",
        a: "Yes. Lifetime portfolio slots are permanent and stack on top of whatever publish slots your current subscription plan provides. For example, a Starter subscriber with 1 lifetime slot would have 2 total publish slots.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "International cards, Apple Pay, and Google Pay via Stripe, plus GCash, Maya, and local cards via PayMongo for Philippine customers.",
      },
      {
        q: "Why do I see prices in pesos or dollars?",
        a: "ForgeCV automatically detects your location. Visitors in the Philippines see pricing in pesos (PHP), and international visitors see pricing in US dollars (USD).",
      },
      {
        q: "Is my subscription auto-renewing?",
        a: "Subscriptions paid through Stripe renew automatically. Subscriptions paid through PayMongo currently renew manually, and you will receive a reminder email before your plan expires.",
      },
      {
        q: "How do I get a refund?",
        a: "Please see our Refund Policy for full details, or contact support if you have questions about a specific charge.",
      },
    ],
  },
  {
    category: "Resume Builder",
    items: [
      {
        q: "How many resumes and templates can I create?",
        a: "This depends on your plan: 1 resume and 1 template on Free, 3 resumes and up to 3 templates on Starter, and unlimited on Pro. ForgeCV offers 5 resume templates in total, including 2 ATS-friendly Harvard-style layouts and 3 premium designs with photo support.",
      },
      {
        q: "What do the AI features actually do?",
        a: "ForgeCV includes AI-powered tools inside the resume editor: a Professional Summary Generator, a Skills Suggester based on your role, an ATS Score Checker with actionable suggestions, and a Job Description Optimizer that compares your resume against a pasted job posting. Free users do not have access to AI features.",
      },
      {
        q: "Can I download my resume as a PDF?",
        a: "Yes. Use the Print / Save as PDF button in the resume editor to export a print-ready PDF at any time. PDF export is available on all plans, including Free.",
      },
    ],
  },
  {
    category: "Cover Letter Builder",
    items: [
      {
        q: "How many cover letters can I create?",
        a: "This depends on your plan: 0 on Free, 3 on Starter, and unlimited on Pro. You can create, edit, and export cover letters just like resumes.",
      },
      {
        q: "Can the AI generate a cover letter for me?",
        a: "Yes. Paste a job description and your resume details, and the AI will generate a tailored cover letter. You can then edit it in real time before exporting to PDF. AI cover letter generation counts toward your monthly AI generation limit.",
      },
      {
        q: "What templates are available for cover letters?",
        a: "There are 3 templates: ATS Classic, ATS Modern, and Premium Minimal. Each is designed to look professional and print-ready.",
      },
    ],
  },
  {
    category: "Portfolio Builder",
    items: [
      {
        q: "What is the difference between building and publishing a portfolio?",
        a: "You can build a portfolio using any of the 9 available templates for free. Publishing it to a live public URL requires an available publish slot from a Starter, Pro, or lifetime plan. Free users can build but cannot publish.",
      },
      {
        q: "How many portfolio templates are there?",
        a: "There are 9 templates in total: 8 designed for specific virtual assistant niches, and 1 general template that fits any role.",
      },
      {
        q: "Can I customize colors and fonts?",
        a: "Yes. You can set a custom accent color, switch between sans-serif and serif fonts, reorder sections, and showcase your skills and tools with a visual icon grid.",
      },
      {
        q: "What are lifetime portfolio slots?",
        a: "Lifetime slots are one-time purchases that give you permanent portfolio publish slots without a subscription. A 1-slot pack costs PHP 499 (USD 9.99) and a 3-slot pack costs PHP 999 (USD 19.99). They never expire and stack with your subscription slots.",
      },
    ],
  },
  {
    category: "Account and Support",
    items: [
      {
        q: "I forgot my password. What do I do?",
        a: 'Click "Forgot password" on the login page and enter your email. You will receive a link to reset your password. If the link has expired, you can request a new one from the same page.',
      },
      {
        q: "How do I contact support?",
        a: "Visit our Support page to reach out to our team.",
      },
      {
        q: "How do I delete my account?",
        a: "Contact our support team to request account deletion.",
      },
    ],
  },
];

// ─── Components ──────────────────────────────────────────────────────────────

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 text-left py-4 sm:py-5 group"
      >
        <span className="font-medium text-foreground/90 group-hover:text-foreground transition-colors text-sm sm:text-base leading-relaxed">
          {item.q}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 shrink-0 text-foreground/40 transition-transform duration-300 mt-0.5 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-foreground/60 pb-4 sm:pb-5 pr-8 leading-relaxed">
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FAQ() {
  const router = useRouter();
  const { user } = useAuth();
  const [openKey, setOpenKey] = useState(null);

  const toggle = (key) => {
    setOpenKey(openKey === key ? null : key);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-12 sm:pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <HelpCircleIcon className="w-4 h-4" />
          Help Center
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5">
          Frequently Asked Questions
        </h1>
        <p className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about plans, payments, and building your
          resume, portfolio, or cover letter with ForgeCV.
        </p>
      </section>

      {/* ─── FAQ Sections ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="flex flex-col gap-8">
          {FAQ_SECTIONS.map((section, sectionIdx) => (
            <div
              key={section.category}
              className="bg-card border border-border rounded-2xl p-5 sm:p-8 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
            >
              <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-1 sm:mb-2 text-foreground">
                {section.category}
              </h2>
              <p className="text-sm text-foreground/40 mb-4 sm:mb-5">
                {section.items.length}{" "}
                {section.items.length === 1 ? "question" : "questions"}
              </p>
              <div className="flex flex-col">
                {section.items.map((item, itemIdx) => {
                  const key = `${sectionIdx}-${itemIdx}`;
                  return (
                    <FAQItem
                      key={key}
                      item={item}
                      isOpen={openKey === key}
                      onToggle={() => toggle(key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32 text-center">
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3">
            Still have questions?
          </h2>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto leading-relaxed">
            Our support team is here to help. Reach out and we will get back to
            you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push("/support")}
              className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-xl text-sm font-semibold text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-all"
            >
              Contact Support
            </button>
            <button
              onClick={() => router.push(user ? "/dashboard" : "/signup")}
              className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10 hover:shadow-accent/20"
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}