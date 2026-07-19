"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { getUserEntitlements } from "@/lib/entitlements";
import CoverLetterThumbnail from "@/app/components/cover-letter/CoverLetterThumbnail";

const TEMPLATE_OPTIONS = [
  { id: "ats-classic", label: "ATS Classic", description: "Traditional format with clean spacing for maximum readability." },
  { id: "ats-modern", label: "ATS Modern", description: "Contemporary header with accent line and structured layout." },
  { id: "premium-minimal", label: "Premium Minimal", description: "Elegant centered header with accent color and generous whitespace." },
];

function ArrowLeftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

function LoaderIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function AlertTriangleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function NewCoverLetter() {
  const { user } = useAuth();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [entitlements, setEntitlements] = useState(null);

  useEffect(() => {
    if (user?.id) {
      checkLimit();
    }
  }, [user]);

  const checkLimit = async () => {
    const [ent, { count }] = await Promise.all([
      getUserEntitlements(user.id),
      supabase
        .from("cover_letters")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);
    setEntitlements(ent);
    if (count >= ent.coverLetterLimit) {
      setLimitReached(true);
    }
    setCheckingLimit(false);
  };

  const createCoverLetter = async (templateId, templateLabel) => {
    if (creating || limitReached) return;
    setCreating(true);
    setError(null);

    const { data, error } = await supabase
      .from("cover_letters")
      .insert({
        user_id: user.id,
        title: `My ${templateLabel} Cover Letter`,
        content: {},
        template: templateId,
      })
      .select()
      .single();

    if (error) {
      setError("Something went wrong creating your cover letter. Please try again.");
      setCreating(false);
      return;
    }
    router.push(`/dashboard/cover-letters/${data.id}`);
  };

  if (checkingLimit) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-foreground/60">
          <LoaderIcon className="w-4 h-4 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <AlertTriangleIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Cover letter limit reached</h3>
          </div>
          <p className="text-foreground/60 text-sm mb-6">
            You&apos;ve used all {entitlements?.coverLetterLimit} cover letter
            {entitlements?.coverLetterLimit === 1 ? "" : "s"} on your current plan.
            Upgrade to create more.
          </p>
          <a
            href="/pricing"
            className="bg-accent text-white text-center block py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10 flex items-center justify-center gap-1.5"
          >
            View Plans
            <ArrowRightIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => router.push('/dashboard/cover-letters')}
        className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-accent transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Cover Letters
      </button>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Choose a Template</h1>
        <p className="text-foreground/60">
          Pick the style that best fits your application. You can customize everything after.
        </p>
      </div>

      {error && (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
        {TEMPLATE_OPTIONS.map(({ id, label, description }) => (
          <button
            key={id}
            onClick={() => createCoverLetter(id, label)}
            disabled={creating}
            className="text-left bg-white border border-border rounded-2xl p-5 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-4 group"
          >
            <div className="relative">
              <CoverLetterThumbnail template={id} />
            </div>
            <div className="w-full">
              <h3 className="font-semibold text-sm text-center group-hover:text-accent transition-colors">{label}</h3>
              <p className="text-xs text-foreground/40 text-center mt-1 leading-relaxed">{description}</p>
            </div>
          </button>
        ))}
      </div>

      {creating && (
        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-foreground/60">
          <LoaderIcon className="w-4 h-4 animate-spin" />
          Creating your cover letter...
        </div>
      )}
    </div>
  );
}