"use client";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ResumeThumbnail from "./components/resume/ResumeThumbnail";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const MARQUEE_TEMPLATES = [
  { id: "ats-harvard-classic", label: "ATS Classic" },
  { id: "ats-harvard-modern", label: "ATS Modern" },
  { id: "premium-sidebar-photo", label: "Premium Sidebar" },
  { id: "premium-topheader-photo", label: "Modern Header" },
  { id: "premium-twocol-photo", label: "Two Column" },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  // Double the templates for seamless infinite loop
  const allTemplates = [...MARQUEE_TEMPLATES, ...MARQUEE_TEMPLATES];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-accent/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          {/* Text Content */}
          <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-sm font-medium text-accent">
                Free Forever · No Credit Card Required
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
              Build resumes and portfolios
              <br className="hidden sm:block" /> that{" "}
              <span className="text-accent">get you hired</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-foreground/60 max-w-xl mx-auto mb-10 leading-relaxed">
              ATS-friendly resume builder and portfolio websites powered by AI.
              No design skills needed.
            </p>

            {/* CTAs */}
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

            {/* Trust */}
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

          {/* Infinite Marquee — Resume Templates */}
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

      {/* Features Section — UNCHANGED */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need to stand out
          </h2>
          <p className="text-foreground/60 text-xl max-w-2xl mx-auto leading-relaxed">
            Professional tools designed to help you land your dream role
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {[
              {
                icon: "📄",
                title: "ATS-Friendly Resumes",
                desc: "Beat applicant tracking systems with optimized resume templates built to get you noticed by recruiters.",
              },
              {
                icon: "🌐",
                title: "Portfolio Websites",
                desc: "Publish a stunning portfolio website tailored to your niche in just a few clicks. No coding required.",
              },
              {
                icon: "🤖",
                title: "AI-Powered Tools",
                desc: "Generate professional summaries, check ATS scores, and optimize for any job description instantly.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex-1 max-w-sm bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-foreground/60 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof — UNCHANGED */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium text-foreground/40 uppercase tracking-widest mb-8">
            Trusted by professionals worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {[
              "Freelancers",
              "Remote Workers",
              "Job Seekers",
              "Agencies",
              "Consultants",
            ].map((tag) => (
              <span
                key={tag}
                className="text-foreground/30 font-medium text-lg"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
