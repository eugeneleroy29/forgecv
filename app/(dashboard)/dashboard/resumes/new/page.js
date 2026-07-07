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
      <div className="px-8 py-8">
        <p className="text-foreground/60">Loading...</p>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="px-8 py-8">
        <div className="border border-border rounded-xl p-8 max-w-md">
          <h3 className="text-xl font-bold mb-2">Resume limit reached</h3>
          <p className="text-foreground/60 text-sm mb-6">
            You've used all {entitlements?.resumeLimit} resume
            {entitlements?.resumeLimit === 1 ? "" : "s"} on your current plan.
            Upgrade to create more.
          </p>
          <a href="/pricing" className="bg-accent text-white text-center block py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
            View Plans
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Choose a Template</h1>
        <p className="text-foreground/60">
          Pick the style that best fits your profession. You can customize everything after.
        </p>
      </div>
      {error && (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATE_OPTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => createResume(id, label)}
            disabled={creating}
            className="text-left border border-border rounded-xl p-4 hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-3"
          >
            <ResumeThumbnail template={id} />
            <h3 className="font-semibold">{label}</h3>
          </button>
        ))}
      </div>
      {creating && (
        <p className="text-sm text-foreground/60 mt-6">Creating your resume...</p>
      )}
    </div>
  );
}
