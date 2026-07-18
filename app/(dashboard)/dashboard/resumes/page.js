"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { getUserEntitlements } from "@/lib/entitlements";

// SVG Icons
const FileTextIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
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

const AlertTriangleIcon = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export default function Resumes() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
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
      fetchResumes();
      getUserEntitlements(user.id).then(setEntitlements);
    }
  }, [user]);

  const fetchResumes = async () => {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setResumes(data);
    setLoading(false);
  };

  const createResume = () => {
    if (entitlements && resumes.length >= entitlements.resumeLimit) {
      setShowLimitModal(true);
      return;
    }
    window.location.href = "/dashboard/resumes/new";
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      setResumes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  const confirmRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setRenaming(true);
    const { error } = await supabase
      .from("resumes")
      .update({ title: renameValue.trim(), updated_at: new Date().toISOString() })
      .eq("id", renameTarget.id);

    if (!error) {
      setResumes((prev) =>
        prev.map((r) => (r.id === renameTarget.id ? { ...r, title: renameValue.trim() } : r))
      );
      setRenameTarget(null);
      setRenameValue("");
    }
    setRenaming(false);
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
          <h1 className="text-2xl font-bold tracking-tight mb-1">My Resumes</h1>
          <p className="text-foreground/60 text-sm">Manage and edit your resumes</p>
        </div>
        <button
          onClick={createResume}
          className="inline-flex items-center justify-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 w-full sm:w-auto"
        >
          <PlusIcon />
          New Resume
        </button>
      </div>

      {/* Empty State */}
      {resumes.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-6">
            <FileTextIcon className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No resumes yet</h3>
          <p className="text-sm text-foreground/60 mb-6 max-w-sm mx-auto">
            Create your first resume to get started with your job search
          </p>
          <button
            onClick={createResume}
            className="inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20"
          >
            <PlusIcon />
            Create Resume
          </button>
        </div>
      ) : (
        /* Resume Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 transition-all duration-300"
            >
              {/* Action buttons — always visible on mobile, hover-only on desktop */}
              <div className="flex items-center gap-1 absolute top-4 right-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameTarget(resume);
                    setRenameValue(resume.title);
                  }}
                  className="p-2 rounded-lg text-foreground/40 hover:text-accent hover:bg-accent/10 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Rename resume"
                >
                  <PencilIcon />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(resume);
                  }}
                  className="p-2 rounded-lg text-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Delete resume"
                >
                  <TrashIcon />
                </button>
              </div>

              <Link href={`/dashboard/resumes/${resume.id}`} className="block">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                  <FileTextIcon />
                </div>
                <h3 className="font-semibold mb-1 pr-20 sm:pr-16 truncate">{resume.title}</h3>
                <p className="text-xs text-foreground/40">
                  Updated {new Date(resume.updated_at).toLocaleDateString()}
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
            <h3 className="text-xl font-bold tracking-tight mb-2">Resume limit reached</h3>
            <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
              You've used all {entitlements?.resumeLimit} resume
              {entitlements?.resumeLimit === 1 ? "" : "s"} on your current plan.
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
            <h3 className="text-xl font-bold tracking-tight mb-2">Delete resume?</h3>
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
                {deleting ? "Deleting..." : "Delete Resume"}
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
            <h3 className="text-xl font-bold tracking-tight mb-2">Rename Resume</h3>
            <p className="text-foreground/60 text-sm mb-4">
              Enter a new name for your resume.
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