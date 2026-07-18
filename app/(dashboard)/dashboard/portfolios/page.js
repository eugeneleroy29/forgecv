"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { getUserEntitlements } from "@/lib/entitlements";

// SVG Icons
const GlobeIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const ExternalLinkIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const AlertTriangleIcon = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export default function Portfolios() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entitlements, setEntitlements] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPortfolios();
      getUserEntitlements(user.id).then(setEntitlements);
    }
  }, [user]);

  const fetchPortfolios = async () => {
    const { data, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setPortfolios(data);
    setLoading(false);
  };

  const createPortfolio = () => {
    if (entitlements && portfolios.length >= entitlements.portfolioLimit) {
      setShowLimitModal(true);
      return;
    }
    window.location.href = "/dashboard/portfolios/new";
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase
      .from("portfolios")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      setPortfolios((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  const confirmRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setRenaming(true);
    const { error } = await supabase
      .from("portfolios")
      .update({ title: renameValue.trim(), updated_at: new Date().toISOString() })
      .eq("id", renameTarget.id);

    if (!error) {
      setPortfolios((prev) =>
        prev.map((p) => (p.id === renameTarget.id ? { ...p, title: renameValue.trim() } : p))
      );
      setRenameTarget(null);
      setRenameValue("");
    }
    setRenaming(false);
  };

  const getPortfolioUrl = (slug) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/portfolio/${slug}`;
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <p className="text-foreground/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">My Portfolio</h1>
          <p className="text-foreground/60 text-sm">Manage and publish your portfolio websites</p>
        </div>
        <button
          onClick={createPortfolio}
          className="inline-flex items-center justify-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 w-full sm:w-auto"
        >
          <PlusIcon />
          New Portfolio
        </button>
      </div>

      {/* Empty State */}
      {portfolios.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-6">
            <GlobeIcon className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No portfolios yet</h3>
          <p className="text-sm text-foreground/60 mb-6 max-w-sm mx-auto">
            Create your first portfolio website to showcase your work
          </p>
          <button
            onClick={createPortfolio}
            className="inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20"
          >
            <PlusIcon />
            Create Portfolio
          </button>
        </div>
      ) : (
        /* Portfolio Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 transition-all duration-300"
            >
              {/* Action buttons — always visible on mobile, hover-only on desktop */}
              <div className="flex items-center gap-1 absolute top-4 right-4">
                {portfolio.is_published && (
                  <Link
                    href={getPortfolioUrl(portfolio.slug)}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg text-foreground/40 hover:text-accent hover:bg-accent/10 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="View portfolio"
                  >
                    <ExternalLinkIcon />
                  </Link>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameTarget(portfolio);
                    setRenameValue(portfolio.title);
                  }}
                  className="p-2 rounded-lg text-foreground/40 hover:text-accent hover:bg-accent/10 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Rename portfolio"
                >
                  <PencilIcon />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(portfolio);
                  }}
                  className="p-2 rounded-lg text-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Delete portfolio"
                >
                  <TrashIcon />
                </button>
              </div>

              <Link href={`/dashboard/portfolios/${portfolio.id}`} className="block">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                  <GlobeIcon />
                </div>
                <h3 className="font-semibold mb-1 pr-20 sm:pr-16 truncate">{portfolio.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${portfolio.is_published ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${portfolio.is_published ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {portfolio.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-xs text-foreground/40">
                  Updated {new Date(portfolio.updated_at).toLocaleDateString()}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-elevated">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
              <AlertTriangleIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Portfolio limit reached</h3>
            <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
              You've used all {entitlements?.portfolioLimit} portfolio
              {entitlements?.portfolioLimit === 1 ? "" : "s"} on your current plan.
              Upgrade to create more.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/pricing"
                className="bg-accent text-white text-center py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20"
              >
                View Plans
              </Link>
              <button
                onClick={() => setShowLimitModal(false)}
                className="text-foreground/60 text-sm font-medium py-2.5 hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-elevated">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Delete portfolio?</h3>
            <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
              This will permanently delete "{deleteTarget.title}". This can't be
              undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-500 text-white text-center py-3 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Portfolio"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="text-foreground/60 text-sm font-medium py-2.5 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-elevated">
            <h3 className="text-xl font-bold tracking-tight mb-2">Rename Portfolio</h3>
            <p className="text-foreground/60 text-sm mb-4">
              Enter a new name for your portfolio.
            </p>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmRename()}
              placeholder="Enter new name"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors mb-6"
              autoFocus
            />
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmRename}
                disabled={renaming || !renameValue.trim()}
                className="bg-accent text-white text-center py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50"
              >
                {renaming ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => { setRenameTarget(null); setRenameValue(""); }}
                disabled={renaming}
                className="text-foreground/60 text-sm font-medium py-2.5 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}