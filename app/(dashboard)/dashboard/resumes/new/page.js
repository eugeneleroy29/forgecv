"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { getUserEntitlements } from "@/lib/entitlements";
import ResumeThumbnail from "@/app/components/resume/ResumeThumbnail";

const TEMPLATE_OPTIONS = [
  { id: "ats-harvard-classic", label: "ATS Classic" },
  { id: "ats-harvard-modern", label: "ATS Modern" },
  { id: "premium-sidebar-photo", label: "Sidebar" },
  { id: "premium-topheader-photo", label: "Modern Header" },
  { id: "premium-twocol-photo", label: "Two-Column" },
];

const ArrowLeftIcon = ({ className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
);

const LoaderIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const AlertTriangleIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

export default function NewResume() {
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
        .from("resumes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);
    setEntitlements(ent);
    if (count >= ent.resumeLimit) {
      setLimitReached(true);
    }
    setCheckingLimit(false);
  };

  const createResume = async (templateId, templateLabel) => {
    if (creating || limitReached) return;
    setCreating(true);
    setError(null);

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: `My ${templateLabel} Resume`,
        content: {},
        template: templateId,
      })
      .select()
      .single();

    if (error) {
      setError("Something went wrong creating your resume. Please try again.");
      setCreating(false);
      return;
    }
    router.push(`/dashboard/resumes/${data.id}`);
  };

  if (checkingLimit) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        <p className="text-foreground/60">Loading...</p>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <AlertTriangleIcon />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Resume limit reached</h3>
          </div>
          <p className="text-foreground/60 text-sm mb-6">
            You&apos;ve used all {entitlements?.resumeLimit} resume
            {entitlements?.resumeLimit === 1 ? "" : "s"} on your current plan.
            Upgrade to create more.
          </p>
          <a href="/pricing" className="bg-accent text-white text-center block py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10">
            View Plans
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Back link */}
      <a
        href="/dashboard/resumes"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-accent transition-colors mb-6"
      >
        <ArrowLeftIcon />
        Back to Resumes
      </a>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Choose a Template</h1>
        <p className="text-foreground/60">
          Pick the style that best fits your profession. You can customize everything after.
        </p>
      </div>

      {error && (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATE_OPTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => createResume(id, label)}
            disabled={creating}
            className="text-left bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-4 group"
          >
            <div className="relative">
              <ResumeThumbnail template={id} />
            </div>
            <div className="w-full">
              <h3 className="font-semibold text-center group-hover:text-accent transition-colors">{label}</h3>
              <p className="text-xs text-foreground/40 text-center mt-1">Click to create</p>
            </div>
          </button>
        ))}
      </div>

      {creating && (
        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-foreground/60">
          <LoaderIcon className="animate-spin" />
          Creating your resume...
        </div>
      )}
    </div>
  );
}