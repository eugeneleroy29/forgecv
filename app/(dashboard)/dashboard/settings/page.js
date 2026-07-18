"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// SVG Icons
const UserIcon = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const KeyIcon = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);

const SaveIcon = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function Settings() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", user.id)
      .single();

    if (!error) {
      setProfile({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: user.email || "",
      });
    }
    setLoading(false);
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
      })
      .eq("id", user.id);

    if (error) {
      setMessage("Failed to update profile.");
    } else {
      setMessage("Profile updated successfully.");
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    setPasswordMessage("");

    if (passwords.new !== passwords.confirm) {
      setPasswordMessage("New passwords do not match.");
      return;
    }
    if (passwords.new.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });

    if (error) {
      setPasswordMessage(error.message);
    } else {
      setPasswordMessage("Password updated successfully.");
      setPasswords({ current: "", new: "", confirm: "" });
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <p className="text-foreground/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-foreground/60 text-sm">
          Manage your profile and account preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Profile</h2>
            <p className="text-sm text-foreground/60">
              Update your personal information
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                First name
              </label>
              <input
                type="text"
                value={profile.first_name}
                onChange={(e) =>
                  setProfile({ ...profile, first_name: e.target.value })
                }
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Last name
              </label>
              <input
                type="text"
                value={profile.last_name}
                onChange={(e) =>
                  setProfile({ ...profile, last_name: e.target.value })
                }
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-foreground/40 flex-shrink-0">
                <MailIcon className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-muted/30 text-foreground/60 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-foreground/40 mt-2">
              Email cannot be changed
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-4 rounded-xl text-sm flex items-center gap-3 ${
              message.includes("success")
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.includes("success") ? (
              <CheckIcon className="w-5 h-5" />
            ) : null}
            {message}
          </div>
        )}

        <button
          onClick={handleProfileUpdate}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50"
        >
          <SaveIcon />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Password Section */}
      {user?.app_metadata?.provider === "email" && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <KeyIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Password</h2>
              <p className="text-sm text-foreground/60">
                Change your account password
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                New Password
              </label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                placeholder="••••••••"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                placeholder="••••••••"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              />
            </div>
          </div>

          {passwordMessage && (
            <div
              className={`mb-4 p-4 rounded-xl text-sm ${
                passwordMessage.includes("success")
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {passwordMessage}
            </div>
          )}

          <button
            onClick={handlePasswordChange}
            className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:border-accent hover:text-accent transition-all"
          >
            <KeyIcon />
            Update Password
          </button>
        </div>
      )}
    </div>
  );
}
