"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { getUserEntitlements } from "@/lib/entitlements";

export default function CoverLetters() {
  const { user } = useAuth();
  const [coverLetters, setCoverLetters] = useState([]);
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
      fetchCoverLetters();
      getUserEntitlements(user.id).then(setEntitlements);
    }
  }, [user]);

  const fetchCoverLetters = async () => {
    const { data, error } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setCoverLetters(data);
    setLoading(false);
  };

  const createCoverLetter = () => {
    if (entitlements && coverLetters.length >= entitlements.coverLetterLimit) {
      setShowLimitModal(true);
      return;
    }
    window.location.href = "/dashboard/cover-letters/new";
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase
      .from("cover_letters")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      setCoverLetters((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  const confirmRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setRenaming(true);
    const { error } = await supabase
      .from("cover_letters")
      .update({ title: renameValue.trim(), updated_at: new Date().toISOString() })
      .eq("id", renameTarget.id);

    if (!error) {
      setCoverLetters((prev) =>
        prev.map((c) => (c.id === renameTarget.id ? { ...c, title: renameValue.trim() } : c))
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Cover Letters</h1>
          <p className="text-foreground/60">Manage and edit your cover letters</p>
        </div>
        <button
          onClick={createCoverLetter}
          className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          + New Cover Letter
        </button>
      </div>

      {coverLetters.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h3 className="font-semibold mb-2">No cover letters yet</h3>
          <p className="text-sm text-foreground/60 mb-6">
            Create your first cover letter to get started
          </p>
          <button
            onClick={createCoverLetter}
            className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            + Create Cover Letter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coverLetters.map((cl) => (
            <div
              key={cl.id}
              className="relative border border-border rounded-xl p-6 hover:border-accent transition-colors group"
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameTarget(cl);
                  }}
                  className="text-foreground/30 hover:text-accent transition-colors text-sm mr-3"
                  aria-label="Rename cover letter"
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(cl);
                  }}
                  className="text-foreground/30 hover:text-red-500 transition-colors text-sm"
                  aria-label="Delete cover letter"
                >
                  ✕
                </button>
              </div>
              <Link href={`/dashboard/cover-letters/${cl.id}`} className="block">
                <div className="text-2xl mb-3">✉️</div>
                <h3 className="font-semibold mb-1 pr-6">{cl.title}</h3>
                <p className="text-xs text-foreground/40">
                  Updated {new Date(cl.updated_at).toLocaleDateString()}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-background border border-border rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Cover letter limit reached</h3>
            <p className="text-foreground/60 text-sm mb-6">
              You've used all {entitlements?.coverLetterLimit} cover letter
              {entitlements?.coverLetterLimit === 1 ? "" : "s"} on your current plan.
              Upgrade to create more.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/pricing"
                className="bg-accent text-white text-center py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                View Plans
              </Link>
              <button
                onClick={() => setShowLimitModal(false)}
                className="text-foreground/60 text-sm font-medium py-2"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-background border border-border rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Delete cover letter?</h3>
            <p className="text-foreground/60 text-sm mb-6">
              This will permanently delete "{deleteTarget.title}". This can't be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-500 text-white text-center py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="text-foreground/60 text-sm font-medium py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-background border border-border rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Rename Cover Letter</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmRename()}
              placeholder="Enter new name"
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors mb-6"
              autoFocus
            />
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmRename}
                disabled={renaming || !renameValue.trim()}
                className="bg-accent text-white text-center py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {renaming ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => { setRenameTarget(null); setRenameValue(""); }}
                disabled={renaming}
                className="text-foreground/60 text-sm font-medium py-2"
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