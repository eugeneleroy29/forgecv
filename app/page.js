"use client";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ResumeThumbnail from "./components/resume/ResumeThumbnail";
import PortfolioThumbnail from "./components/portfolio/PortfolioThumbnail";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";

const MARQUEE_TEMPLATES = [
  { id: "ats-harvard-classic", label: "ATS Classic" },
  { id: "ats-harvard-modern", label: "ATS Modern" },
  { id: "premium-sidebar-photo", label: "Premium Sidebar" },
  { id: "premium-topheader-photo", label: "Modern Header" },
  { id: "premium-twocol-photo", label: "Two Column" },
];

const PORTFOLIO_TEMPLATES = [
  { id: "medical_va", label: "Medical VA" },
  { id: "social_media_manager", label: "Social Media" },
  { id: "content_writer", label: "Content Writer" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "graphic_design", label: "Graphic Design" },
  { id: "basic", label: "General" },
];

// SVG Icons
const FileTextIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const LayoutTemplateIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);

const PenToolIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19 7-7 3 3-7 7-3-3z" />
    <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="m2 2 7.5 8.6" />
    <path d="M22 22l-5.5-5.5" />
  </svg>
);

const SlidersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="2" y1="14" x2="6" y2="14" />
    <line x1="10" y1="8" x2="14" y2="8" />
    <line x1="18" y1="16" x2="22" y2="16" />
  </svg>
);

const RocketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const QuoteIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  const allTemplates = [...MARQUEE_TEMPLATES, ...MARQUEE_TEMPLATES];

  const features = [
    {
      icon: <FileTextIcon />,
      title: "ATS-Friendly Resumes",
      desc: "Beat applicant tracking systems with optimized resume templates built to get you noticed by recruiters.",
    },
    {
      icon: <GlobeIcon />,
      title: "Portfolio Websites",
      desc: "Publish a stunning portfolio website tailored to your niche in just a few clicks. No coding required.",
    },
    {
      icon: <SparklesIcon />,
      title: "AI-Powered Tools",
      desc: "Generate professional summaries, check ATS scores, and optimize for any job description instantly.",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: <LayoutTemplateIcon />,
      title: "Choose a Template",
      desc: "Pick from professionally designed resume and portfolio templates tailored to your industry.",
    },
    {
      number: "02",
      icon: <PenToolIcon />,
      title: "Build Your Content",
      desc: "Fill in your details with guided forms. AI helps you write compelling summaries and descriptions.",
    },
    {
      number: "03",
      icon: <SlidersIcon />,
      title: "Customize Everything",
      desc: "Adjust colors, fonts, and layout to match your personal brand. Real-time preview as you edit.",
    },
    {
      number: "04",
      icon: <RocketIcon />,
      title: "Publish & Share",
      desc: "Download your resume as PDF or publish your portfolio with a custom URL. Ready in minutes.",
    },
  ];

  const faqs = [
    {
      question: "Is ForgeCV really free?",
      answer: "Yes. You can build unlimited resumes and portfolios with our free plan. Premium features like AI tools, custom domains, and advanced templates are available through our affordable paid plans.",
    },
    {
      question: "Are the resume templates ATS-friendly?",
      answer: "Absolutely. All our resume templates are specifically designed and tested to pass through Applicant Tracking Systems (ATS) while maintaining a clean, professional appearance.",
    },
    {
      question: "Can I use my own custom domain for my portfolio?",
      answer: "Yes. Pro and Business plans include custom domain support. You can connect your own domain to your portfolio website in just a few clicks.",
    },
    {
      question: "How does the AI content generation work?",
      answer: "Our AI analyzes your experience and the job description to generate tailored professional summaries, bullet points, and skill recommendations. You remain in full control — edit, accept, or regenerate any suggestion.",
    },
    {
      question: "Can I download my resume as a PDF?",
      answer: "Yes. All plans allow you to download your resume as a high-quality, print-ready PDF. The layout is optimized for both digital sharing and physical printing.",
    },
    {
      question: "What happens to my data?",
      answer: "Your data is securely stored and never sold to third parties. We use industry-standard encryption and comply with GDPR. You can export or delete your data at any time.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-accent/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-sm font-medium text-accent">
                Free Forever · No Credit Card Required
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
              Build resumes and portfolios
              <br className="hidden sm:block" /> that{" "}
              <span className="text-accent">get you hired</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/60 max-w-xl mx-auto mb-10 leading-relaxed">
              ATS-friendly resume builder and portfolio websites powered by AI.
              No design skills needed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <button
                onClick={() => router.push(user ? "/dashboard" : "/signup")}
                className="w-full sm:w-auto bg-accent text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                {user ? "Go to Dashboard" : "Start Building Free"}
              </button>
              <button
                onClick={() => router.push("/templates")}
                className="w-full sm:w-auto bg-card border border-border text-foreground px-8 py-4 rounded-xl text-base font-semibold hover:border-accent hover:text-accent transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Browse Templates
              </button>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background"
                      style={{ backgroundColor: color }}
                    />
                  ),
                )}
              </div>
              <p className="text-sm text-foreground/50">
                Trusted by{" "}
                <span className="font-semibold text-foreground/70">2,000+</span>{" "}
                professionals
              </p>
            </div>
          </div>

          <div className="mask-fade-x">
            <div className="flex animate-marquee gap-6 w-max py-4">
              {allTemplates.map((template, i) => (
                <div
                  key={`${template.id}-${i}`}
                  className="flex-shrink-0 group"
                >
                  <div className="bg-card border border-border rounded-2xl p-3 shadow-sm hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 hover:-translate-y-1">
                    <ResumeThumbnail template={template.id} />
                  </div>
                  <p className="text-center text-sm font-medium text-foreground/50 mt-3 group-hover:text-foreground/70 transition-colors">
                    {template.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ===== END HERO ===== */}

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent/70 mb-4">
              Why ForgeCV
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Everything you need to stand out
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
              Professional tools designed to help you land your dream role
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:bg-accent/15 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-foreground/60 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ===== END FEATURES ===== */}

      {/* ===== PORTFOLIO SHOWCASE ===== */}
      <section className="py-24 md:py-32 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent/70 mb-4">
              Portfolio Templates
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              A website for every niche
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
              Choose from 9 professionally designed portfolio templates tailored to your industry
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {PORTFOLIO_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="group bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => router.push("/templates")}
              >
                <div className="rounded-xl overflow-hidden mb-4 flex justify-center">
                  <PortfolioThumbnail template={template.id} />
                </div>
                <div className="px-2 pb-2">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                    {template.label}
                  </h3>
                  <p className="text-sm text-foreground/50 mt-1">
                    Portfolio Template
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push("/templates")}
              className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
            >
              Browse all 9 templates
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </section>
      {/* ===== END PORTFOLIO SHOWCASE ===== */}

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent/70 mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              From idea to published in minutes
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
              A simple four-step process to build your professional presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-border" />
                )}

                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-bold text-foreground/10">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-foreground/60 leading-relaxed text-sm">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ===== END HOW IT WORKS ===== */}

      {/* ===== TESTIMONIAL ===== */}
      <section className="py-24 md:py-32 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent/70 mb-8">
            What Users Say
          </span>

          <div className="mb-8">
            <div className="inline-flex text-accent/20 mb-6">
              <QuoteIcon />
            </div>
            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-medium leading-snug tracking-tight text-foreground mb-8">
              I landed three interviews within a week of updating my resume with ForgeCV. The ATS-friendly template made all the difference.
            </blockquote>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
              MS
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Maria Santos</p>
              <p className="text-sm text-foreground/60">Medical Virtual Assistant</p>
            </div>
          </div>
        </div>
      </section>
      {/* ===== END TESTIMONIAL ===== */}

      {/* ===== PRICING CTA ===== */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to build your professional presence?
          </h2>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto leading-relaxed mb-10">
            Start free today. Upgrade when you need more templates, AI credits, or custom domains.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push(user ? "/dashboard" : "/signup")}
              className="w-full sm:w-auto bg-accent text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              {user ? "Go to Dashboard" : "Start Building Free"}
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="w-full sm:w-auto bg-card border border-border text-foreground px-8 py-4 rounded-xl text-base font-semibold hover:border-accent hover:text-accent transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>
      {/* ===== END PRICING CTA ===== */}

      {/* ===== FAQ ===== */}
      <section className="py-24 md:py-32 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent/70 mb-4">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Questions? Answered.
            </h2>
            <p className="text-lg text-foreground/60 max-w-xl mx-auto leading-relaxed">
              Everything you need to know about ForgeCV
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`flex-shrink-0 text-foreground/50 transition-transform duration-300 ${openFaq === index ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${openFaq === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="px-6 pb-6 text-foreground/60 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ===== END FAQ ===== */}

      <Footer />
    </main>
  );
}