"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserEntitlements } from "@/lib/entitlements";
import { getCoverLetterTemplateComponent } from "@/app/components/cover-letter/templates";
import CoverLetterPreviewPanel from "@/app/components/ui/CoverLetterPreviewPanel";

export default function CoverLetterEditor() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
  });
  const [recipient, setRecipient] = useState({
    hiringManager: "",
    company: "",
    jobTitle: "",
  });
  const [body, setBody] = useState("");
  const [closing, setClosing] = useState("Sincerely,");
  const [tone, setTone] = useState("professional");
  const [accentColor, setAccentColor] = useState("#4F46E5");
  const [fontFamily, setFontFamily] = useState("inter");
  const [mobileView, setMobileView] = useState("edit");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 0, plan: "free", isAdmin: false });
  const [showAiLimitModal, setShowAiLimitModal] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [keySkills, setKeySkills] = useState("");
  const [currentRole, setCurrentRole] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchCoverLetter();
    }
  }, [user, id]);

  const fetchCoverLetter = async () => {
    const { data, error } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      router.push("/dashboard/cover-letters");
      return;
    }
    setCoverLetter(data);
    if (data.content?.personalInfo) {
      setPersonalInfo(data.content.personalInfo);
    }
    if (data.content?.recipient) {
      setRecipient(data.content.recipient);
    }
    if (data.content?.body) {
      setBody(data.content.body);
    }
    if (data.content?.closing) {
      setClosing(data.content.closing);
    }
    if (data.content?.tone) {
      setTone(data.content.tone);
    }
    if (data.content?.customization?.accentColor) {
      setAccentColor(data.content.customization.accentColor);
    }
    if (data.content?.customization?.fontFamily) {
      setFontFamily(data.content.customization.fontFamily);
    }
    if (data.content?.keySkills) {
      setKeySkills(data.content.keySkills);
    }
    if (data.content?.currentRole) {
      setCurrentRole(data.content.currentRole);
    }

    // Fetch AI usage
    try {
      const entitlements = await getUserEntitlements(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("ai_generations_used, ai_generations_reset_date, is_admin")
        .eq("id", user.id)
        .single();
      const used = profile?.ai_generations_used || 0;
      setAiUsage({
        used,
        limit: entitlements.aiGenerationsPerMonth || 0,
        plan: entitlements.plan || "free",
        isAdmin: profile?.is_admin === true,
      });
    } catch (e) {
      console.error("Failed to fetch entitlements:", e);
    }
    setLoading(false);
  };

  const updateTitle = (newTitle) => {
    setCoverLetter({ ...coverLetter, title: newTitle });
  };

  const updatePersonalInfo = (field, value) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
  };

  const updateRecipient = (field, value) => {
    setRecipient({ ...recipient, [field]: value });
  };

  const generateCoverLetter = async () => {
    if (!aiUsage.isAdmin && aiUsage.used >= aiUsage.limit) {
      setShowAiLimitModal(true);
      return;
    }
    setAiLoading(true);
    try {
      const { data: { session: aiSession } } = await supabase.auth.getSession();
      const aiToken = aiSession?.access_token;
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${aiToken}`,
        },
        body: JSON.stringify({
          type: "cover_letter",
          data: {
            personalInfo,
            jobTitle: recipient.jobTitle,
            company: recipient.company,
            hiringManager: recipient.hiringManager,
            tone,
            keySkills,
            currentRole,
          },
        }),
      });
      const result = await response.json();
      if (result.success) {
        setBody(result.result);
        if (result.used !== undefined) setAiUsage((prev) => ({ ...prev, used: result.used }));
        setShowAiPanel(false);
      } else if (response.status === 403) {
        if (!aiUsage.isAdmin) setShowAiLimitModal(true);
        if (result.used !== undefined) setAiUsage((prev) => ({ ...prev, used: result.used, limit: result.limit }));
      }
    } catch (error) {
      console.error("AI error:", error);
    }
    setAiLoading(false);
  };

  const saveCoverLetter = async () => {
    setSaving(true);
    const updatedContent = {
      ...coverLetter.content,
      personalInfo,
      recipient,
      body,
      closing,
      tone,
      keySkills,
      currentRole,
      customization: { accentColor, fontFamily },
    };
    await supabase
      .from("cover_letters")
      .update({
        title: coverLetter.title,
        content: updatedContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    setCoverLetter({ ...coverLetter, content: updatedContent });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <p className="text-foreground/60">Loading...</p>
      </div>
    );
  }

  const previewContent = {
    ...coverLetter.content,
    personalInfo,
    recipient,
    body,
    closing,
    customization: { accentColor, fontFamily },
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Mobile View Toggle */}
      <div className="flex md:hidden gap-2 mb-6">
        <button
          onClick={() => setMobileView("edit")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            mobileView === "edit" ? "bg-accent text-white" : "border border-border text-foreground/60"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            mobileView === "preview" ? "bg-accent text-white" : "border border-border text-foreground/60"
          }`}
        >
          Preview
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Editor Panel */}
        <div className={`w-full md:max-w-2xl md:w-auto ${mobileView === "preview" ? "hidden md:block" : ""}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <input
              type="text"
              value={coverLetter.title}
              onChange={(e) => updateTitle(e.target.value)}
              onBlur={saveCoverLetter}
              className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:border-b focus:border-accent"
            />
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowAiPanel(!showAiPanel)}
                disabled={aiLoading}
                className="border border-border px-5 py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
              >
                {aiLoading ? "⏳ Generating..." : "✨ AI Generate"}
              </button>
              <button
                onClick={() => window.print()}
                className="border border-border px-5 py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors"
              >
                🖨️ Print / Save PDF
              </button>
              <button
                onClick={saveCoverLetter}
                disabled={saving}
                className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* AI Generate Panel */}
          {showAiPanel && (
            <div className="border border-border rounded-xl p-6 mb-6 bg-accent/5">
              <h2 className="font-semibold text-lg mb-4">Generate with AI</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Virtual Assistant"
                    value={recipient.jobTitle}
                    onChange={(e) => updateRecipient("jobTitle", e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. ABC Corp"
                    value={recipient.company}
                    onChange={(e) => updateRecipient("company", e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Hiring Manager (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Smith"
                    value={recipient.hiringManager}
                    onChange={(e) => updateRecipient("hiringManager", e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="professional">Professional</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="formal">Formal</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium mb-1.5 block">Current/Recent Role</label>
                <input
                  type="text"
                  placeholder="e.g. Administrative Assistant at XYZ Inc"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium mb-1.5 block">Key Skills/Experience (optional)</label>
                <textarea
                  placeholder="e.g. 5 years customer service, CRM management, data entry..."
                  value={keySkills}
                  onChange={(e) => setKeySkills(e.target.value)}
                  rows={3}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>
              <button
                onClick={generateCoverLetter}
                disabled={aiLoading || !recipient.jobTitle || !recipient.company}
                className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {aiLoading ? "⏳ Generating..." : "✨ Generate Cover Letter"}
              </button>
            </div>
          )}

          {/* Personal Info Section */}
          <div className="border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  placeholder="Juan Dela Cruz"
                  value={personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input
                  type="email"
                  placeholder="juan@example.com"
                  value={personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone</label>
                <input
                  type="text"
                  placeholder="+63 912 345 6789"
                  value={personalInfo.phone}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Location</label>
                <input
                  type="text"
                  placeholder="Manila, Philippines"
                  value={personalInfo.location}
                  onChange={(e) => updatePersonalInfo("location", e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1.5 block">LinkedIn (optional)</label>
                <input
                  type="text"
                  placeholder="linkedin.com/in/juandelacruz"
                  value={personalInfo.linkedin}
                  onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
            <button
              onClick={saveCoverLetter}
              disabled={saving}
              className="mt-4 text-sm text-accent hover:underline font-medium"
            >
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>

          {/* Recipient Section */}
          <div className="border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Recipient</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Hiring Manager</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={recipient.hiringManager}
                  onChange={(e) => updateRecipient("hiringManager", e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Company</label>
                <input
                  type="text"
                  placeholder="ABC Corporation"
                  value={recipient.company}
                  onChange={(e) => updateRecipient("company", e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
            <button
              onClick={saveCoverLetter}
              disabled={saving}
              className="mt-4 text-sm text-accent hover:underline font-medium"
            >
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>

          {/* Body Section */}
          <div className="border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Cover Letter Body</h2>
            <textarea
              placeholder="Write your cover letter here, or use AI Generate..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent transition-colors resize-none"
            />
            <button
              onClick={saveCoverLetter}
              disabled={saving}
              className="mt-4 text-sm text-accent hover:underline font-medium"
            >
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>

          {/* Closing Section */}
          <div className="border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Closing</h2>
            <input
              type="text"
              placeholder="Sincerely,"
              value={closing}
              onChange={(e) => setClosing(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors mb-4"
            />
            <button
              onClick={saveCoverLetter}
              disabled={saving}
              className="text-sm text-accent hover:underline font-medium"
            >
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>

          {/* Customization Section */}
          {coverLetter?.template?.startsWith("premium") && (
            <div className="border border-border rounded-xl p-6 mb-6">
              <h2 className="font-semibold text-lg mb-4">Customization</h2>
              <label className="text-sm font-medium mb-1.5 block">Accent Color</label>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-12 border border-border rounded-lg cursor-pointer"
                />
                <span className="text-sm text-foreground/60">{accentColor}</span>
              </div>
              <label className="text-sm font-medium mb-1.5 block">Font Style</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
              >
                <option value="inter">Modern (Inter)</option>
                <option value="georgia">Classic (Georgia)</option>
              </select>
              <button
                onClick={saveCoverLetter}
                disabled={saving}
                className="mt-4 text-sm text-accent hover:underline font-medium"
              >
                {saving ? "Saving..." : "Save section"}
              </button>
            </div>
          )}

          {/* AI Limit Modal */}
          {showAiLimitModal && !aiUsage.isAdmin && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
              <div className="bg-background border border-border rounded-xl p-8 max-w-md w-full">
                <h3 className="text-xl font-bold mb-2">AI generation limit reached</h3>
                <p className="text-foreground/60 text-sm mb-6">
                  {aiUsage.plan === "pro" ? (
                    <>You've used all {aiUsage.limit} AI generation{aiUsage.limit === 1 ? "" : "s"} on your Pro plan.</>
                  ) : (
                    <>You've used all {aiUsage.limit} AI generation{aiUsage.limit === 1 ? "" : "s"} on your current plan. Upgrade to get more.</>
                  )}
                </p>
                <div className="flex flex-col gap-3">
                  {aiUsage.plan !== "pro" ? (
                    <a
                      href="/pricing"
                      className="bg-accent text-white text-center py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                    >
                      View Plans
                    </a>
                  ) : (
                    <button
                      onClick={() => setShowAiLimitModal(false)}
                      className="bg-accent text-white text-center py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                    >
                      Got it
                    </button>
                  )}
                  <button
                    onClick={() => setShowAiLimitModal(false)}
                    className="text-foreground/60 text-sm font-medium py-2"
                  >
                    {aiUsage.plan === "pro" ? "Close" : "Maybe later"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className={`w-full md:flex-1 md:min-w-0 ${mobileView === "edit" ? "hidden md:block" : ""}`}>
          <div className="sticky top-6 md:top-8 h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] flex flex-col">
            <CoverLetterPreviewPanel title="Cover Letter Preview" className="h-full">
              {(() => {
                const TemplateComponent = getCoverLetterTemplateComponent(coverLetter.template);
                return <TemplateComponent content={previewContent} />;
              })()}
            </CoverLetterPreviewPanel>
          </div>
        </div>
      </div>

      {/* Print-only for PDF export */}
      <div className="hidden print-only">
        {(() => {
          const TemplateComponent = getCoverLetterTemplateComponent(coverLetter.template);
          return <TemplateComponent content={previewContent} />;
        })()}
      </div>
    </div>
  );
}