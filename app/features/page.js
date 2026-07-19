"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

// ─── SVG Icons ───────────────────────────────────────────────────────────────

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

function FileTextIcon({ className }) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

function LayoutIcon({ className }) {
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
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

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

function SparklesIcon({ className }) {
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
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

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURE_SECTIONS = [
  {
    icon: FileTextIcon,
    title: "ATS-Friendly Resume Builder",
    description:
      "Build a professional resume with 5 distinct templates — two Harvard-style ATS-optimized layouts and three premium designs with photo support. Customize accent color, font, and section order.",
    points: [
      "Live preview as you edit",
      "Reorder sections to fit your story",
      "Export directly to PDF",
      "Conditional fields — empty sections never show up",
    ],
  },
  {
    icon: LayoutIcon,
    title: "Portfolio Website Builder",
    description:
      "Publish a live portfolio website in minutes, tailored to your niche — from virtual assistants to graphic designers. Share your work with a custom public link.",
    points: [
      "9 niche-specific templates",
      "Custom accent color and font style",
      "Showcase skills and tools with a visual icon grid",
      "Get a shareable public link instantly",
    ],
  },
  {
    icon: MailIcon,
    title: "Cover Letter Generator",
    description:
      "Create tailored cover letters that match your resume and the job you are applying for. Choose from professional templates and export to PDF.",
    points: [
      "3 polished templates (Classic, Modern, Minimal)",
      "AI-powered generation from job description",
      "Live preview with real-time editing",
      "Export to print-ready PDF",
    ],
  },
  {
    icon: SparklesIcon,
    title: "AI-Powered Tools",
    description:
      "Built-in AI features to help you stand out and get past applicant tracking systems. Generate content, optimize keywords, and improve your chances.",
    points: [
      "Professional Summary Generator",
      "Skills Suggester based on your role",
      "ATS Score Checker with actionable suggestions",
      "Job Description Optimizer with match scoring",
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Features() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-12 sm:pb-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5">
          Everything you need to land your next role
        </h1>
        <p className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
          ForgeCV combines resume building, portfolio websites, cover letters,
          and AI tools in one place — built for freelancers and remote workers.
        </p>
      </section>

      {/* ─── Feature Cards ────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="flex flex-col gap-8">
          {FEATURE_SECTIONS.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="bg-card border border-border rounded-2xl p-6 sm:p-8 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4 sm:gap-5">
                  <div
                    className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "white",
                    }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                      {section.title}
                    </h2>
                    <p className="text-foreground/60 leading-relaxed mb-5 sm:mb-6">
                      {section.description}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {section.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <CheckIcon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                          <span className="text-foreground/70 leading-relaxed">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32 text-center">
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3">
            Ready to build your profile?
          </h2>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto">
            Join thousands of remote workers who use ForgeCV to stand out and
            land better opportunities.
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