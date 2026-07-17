"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Portfolios() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPortfolios();
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
          <h1 className="text-2xl font-bold mb-1">My Portfolios</h1>
          <p className="text-foreground/60">
            Manage and publish your portfolio sites
          </p>
        </div>
        <Link
          href="/dashboard/portfolios/new"
          className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          + New Portfolio
        </Link>
      </div>

      {portfolios.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🌐</div>
          <h3 className="font-semibold mb-2">No portfolios yet</h3>
          <p className="text-sm text-foreground/60 mb-6">
            Create your first portfolio to get started
          </p>
          <Link
            href="/dashboard/portfolios/new"
            className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors inline-block"
          >
            + Create Portfolio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="relative border border-border rounded-xl p-6 hover:border-accent transition-colors group"
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameTarget(portfolio);
                  }}
                  className="text-foreground/30 hover:text-accent transition-colors text-sm mr-3"
                  aria-label="Rename portfolio"
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(portfolio);
                  }}
                  className="text-foreground/30 hover:text-red-500 transition-colors text-sm"
                  aria-label="Delete portfolio"
                >
                  ✕
                </button>
              </div>
              <Link
                href={`/dashboard/portfolios/${portfolio.id}`}
                className="block"
              >
                <div className="flex items-center justify-between mb-3 pr-6">
                  <div className="text-2xl">🌐</div>
                  {portfolio.is_published ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Published
                    </span>
                  ) : (
                    <span className="text-xs bg-foreground/5 text-foreground/50 px-2 py-1 rounded-full">
                      Draft
                    </span>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{portfolio.title}</h3>
                <p className="text-xs text-foreground/40">
                  Updated {new Date(portfolio.updated_at).toLocaleDateString()}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-background border border-border rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Delete portfolio?</h3>
            <p className="text-foreground/60 text-sm mb-6">
              This will permanently delete "{deleteTarget.title}". This can't be
              undone.
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

{renameTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-background border border-border rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Rename Portfolio</h3>
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
