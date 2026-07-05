"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import PortfolioThumbnail from "@/app/components/portfolio/PortfolioThumbnail";
import { getPortfolioTheme } from "@/app/components/portfolio/portfolioThemes";

const TEMPLATE_IDS = [
  "medical_va",
  "social_media_manager",
  "data_entry",
  "content_writer",
  "ecommerce",
  "customer_service",
  "bookkeeping",
  "graphic_design",
  "basic",
];

export default function NewPortfolio() {
  const { user } = useAuth();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const createPortfolio = async (templateId, templateName) => {
    if (creating) return;
    setCreating(true);
    setError(null);

    const { data, error } = await supabase
      .from("portfolios")
      .insert({
        user_id: user.id,
        title: `My ${templateName} Portfolio`,
        content: {},
        template: templateId,
      })
      .select()
      .single();

    if (error) {
      setError("Something went wrong creating your portfolio. Please try again.");
      setCreating(false);
      return;
    }

    router.push(`/dashboard/portfolios/${data.id}`);
  };

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Choose a Template</h1>
        <p className="text-foreground/60">
          Pick the niche that best matches your skills. You can customize everything after.
        </p>
      </div>

      {error && (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATE_IDS.map((templateId) => {
          const theme = getPortfolioTheme(templateId);
          return (
            <button
              key={templateId}
              onClick={() => createPortfolio(templateId, theme.label)}
              disabled={creating}
              className="text-left border border-border rounded-xl p-4 hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-3"
            >
              <PortfolioThumbnail template={templateId} />
              <h3 className="font-semibold">{theme.label}</h3>
            </button>
          );
        })}
      </div>

      {creating && (
        <p className="text-sm text-foreground/60 mt-6">Creating your portfolio...</p>
      )}
    </div>
  );
}
