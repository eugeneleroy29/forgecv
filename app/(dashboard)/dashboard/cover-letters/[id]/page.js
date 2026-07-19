"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserEntitlements } from "@/lib/entitlements";
import { getCoverLetterTemplateComponent } from "@/app/components/cover-letter/templates";
import CoverLetterPreviewPanel from "@/app/components/ui/CoverLetterPreviewPanel";
import PrintPortal from "@/app/components/resume/PrintPortal";

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const SparklesIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1-1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);

const LoaderIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const PrinterIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" />
  </svg>
);

const SaveIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" /><path d="M7 3v4a1 1 0 0 0 1 1h7" />
  </svg>
);

const WandIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 4V2" /><path d="M15 16v-2" /><path d="M8 9h2" /><path d="M20 9h2" /><path d="m17.8 11.8 1.4-1.4" /><path d="m17.8 6.2 1.4 1.4" /><path d="m6.2 11.8-1.4-1.4" /><path d="m6.2 6.2-1.4 1.4" /><path d="M13 12h-1v-1" /><rect width="8" height="4" x="7" y="16" rx="1" />
  </svg>
);

const AlertTriangleIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ChevronUpIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);

// ─── Top-Level Sub-Components (prevents focus loss) ──────────────────────────

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-medium mb-1.5 block text-foreground/80">{label}</label>
    <input
      {...props}
      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
    />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-medium mb-1.5 block text-foreground/80">{label}</label>
    <textarea
      {...props}
      className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all resize-none"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="text-sm font-medium mb-1.5 block text-foreground/80">{label}</label>
    <select
      {...props}
      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all appearance-none"
    >
      {children}
    </select>
  </div>
);

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
  const [jobDescription, setJobDescription] = useState("");
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
    if (data.content?.jobDescription) {
      setJobDescription(data.content.jobDescription);
    }
    if (data.content?.currentRole) {
      setCurrentRole(data.content.currentRole);
    }

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
            jobDescription,
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
      jobDescription,
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Mobile View Toggle */}
      <div className="flex xl:hidden gap-2 mb-6">
        <button
          onClick={() => setMobileView("edit")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mobileView === "edit"
              ? "bg-accent text-white shadow-lg shadow-accent/20"
              : "border border-border text-foreground/60 hover:border-accent/50"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mobileView === "preview"
              ? "bg-accent text-white shadow-lg shadow-accent/20"
              : "border border-border text-foreground/60 hover:border-accent/50"
          }`}
        >
          Preview
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        {/* Editor Panel */}
        <div className={`w-full xl:max-w-2xl xl:w-auto ${mobileView === "preview" ? "hidden xl:block" : ""}`}>
          {/* Header */}
          <div className="mb-8">
            <input
              type="text"
              value={coverLetter.title}
              onChange={(e) => updateTitle(e.target.value)}
              onBlur={saveCoverLetter}
              className="text-2xl sm:text-3xl font-bold bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none transition-colors pb-1 w-full mb-4"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAiPanel(!showAiPanel)}
                disabled={aiLoading}
                className="border border-border px-3.5 py-2 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {showAiPanel ? <ChevronUpIcon /> : <ChevronDownIcon />}
                {aiLoading ? "Generating..." : "AI Generate"}
              </button>
              <button
                onClick={() => window.print()}
                className="border border-border px-3.5 py-2 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-all flex items-center gap-1.5"
              >
                <PrinterIcon />
                Print / PDF
              </button>
              <button
                onClick={saveCoverLetter}
                disabled={saving}
                className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-accent/10 hover:shadow-accent/20"
              >
                {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* AI Generate Panel */}
          {showAiPanel && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <WandIcon />
                </div>
                <h2 className="font-semibold text-lg tracking-tight">Generate with AI</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input label="Job Title" type="text" placeholder="e.g. Virtual Assistant" value={recipient.jobTitle} onChange={(e) => updateRecipient("jobTitle", e.target.value)} />
                <Input label="Company" type="text" placeholder="e.g. ABC Corp" value={recipient.company} onChange={(e) => updateRecipient("company", e.target.value)} />
                <Input label="Hiring Manager (optional)" type="text" placeholder="e.g. Jane Smith" value={recipient.hiringManager} onChange={(e) => updateRecipient("hiringManager", e.target.value)} />
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground/80">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all appearance-none"
                  >
                    <option value="professional">Professional</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="formal">Formal</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <Input label="Current/Recent Role" type="text" placeholder="e.g. Administrative Assistant at XYZ Inc" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} />
              </div>
              <div className="mb-4">
                <TextArea label="Key Skills/Experience (optional)" placeholder="e.g. 5 years customer service, CRM management, data entry..." value={keySkills} onChange={(e) => setKeySkills(e.target.value)} rows={3} />
              </div>
              <div className="mb-4">
                <TextArea label="Job Description (optional)" placeholder="Paste the job description here for a more tailored cover letter..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={4} />
              </div>
              <button
                onClick={generateCoverLetter}
                disabled={aiLoading || !recipient.jobTitle || !recipient.company}
                className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-accent/10 hover:shadow-accent/20"
              >
                {aiLoading ? <LoaderIcon className="animate-spin" /> : <SparklesIcon />}
                {aiLoading ? "Generating..." : "Generate Cover Letter"}
              </button>
            </div>
          )}

          {/* Personal Info Section */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            <h2 className="font-semibold text-lg tracking-tight mb-5">Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" type="text" placeholder="Juan Dela Cruz" value={personalInfo.fullName} onChange={(e) => updatePersonalInfo("fullName", e.target.value)} />
              <Input label="Email" type="email" placeholder="juan@example.com" value={personalInfo.email} onChange={(e) => updatePersonalInfo("email", e.target.value)} />
              <Input label="Phone" type="text" placeholder="+63 912 345 6789" value={personalInfo.phone} onChange={(e) => updatePersonalInfo("phone", e.target.value)} />
              <Input label="Location" type="text" placeholder="Manila, Philippines" value={personalInfo.location} onChange={(e) => updatePersonalInfo("location", e.target.value)} />
              <div className="md:col-span-2">
                <Input label="LinkedIn (optional)" type="text" placeholder="linkedin.com/in/juandelacruz" value={personalInfo.linkedin} onChange={(e) => updatePersonalInfo("linkedin", e.target.value)} />
              </div>
            </div>
            <button onClick={saveCoverLetter} disabled={saving} className="mt-5 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
              {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>

          {/* Recipient Section */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            <h2 className="font-semibold text-lg tracking-tight mb-5">Recipient</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Hiring Manager" type="text" placeholder="Jane Smith" value={recipient.hiringManager} onChange={(e) => updateRecipient("hiringManager", e.target.value)} />
              <Input label="Company" type="text" placeholder="ABC Corporation" value={recipient.company} onChange={(e) => updateRecipient("company", e.target.value)} />
            </div>
            <button onClick={saveCoverLetter} disabled={saving} className="mt-5 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
              {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>

          {/* Body Section */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            <h2 className="font-semibold text-lg tracking-tight mb-5">Cover Letter Body</h2>
            <TextArea
              placeholder="Write your cover letter here, or use AI Generate..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
            />
            <button onClick={saveCoverLetter} disabled={saving} className="mt-5 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
              {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>

          {/* Closing Section */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            <h2 className="font-semibold text-lg tracking-tight mb-5">Closing</h2>
            <input
              type="text"
              placeholder="Sincerely,"
              value={closing}
              onChange={(e) => setClosing(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all mb-4"
            />
            <button onClick={saveCoverLetter} disabled={saving} className="text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
              {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>

          {/* Customization Section */}
          {coverLetter?.template?.startsWith("premium") && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
              <h2 className="font-semibold text-lg tracking-tight mb-5">Customization</h2>
              <label className="text-sm font-medium mb-1.5 block text-foreground/80">Accent Color</label>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-12 border border-border rounded-xl cursor-pointer"
                />
                <span className="text-sm text-foreground/60 font-mono">{accentColor}</span>
              </div>
              <label className="text-sm font-medium mb-1.5 block text-foreground/80">Font Style</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all mb-4"
              >
                <option value="inter">Modern (Inter)</option>
                <option value="georgia">Classic (Georgia)</option>
              </select>
              <button onClick={saveCoverLetter} disabled={saving} className="text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                {saving ? "Saving..." : "Save section"}
              </button>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className={`w-full xl:flex-1 xl:min-w-0 ${mobileView === "edit" ? "hidden xl:block" : ""}`}>
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

      {/* AI Limit Modal */}
      {showAiLimitModal && !aiUsage.isAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-elevated max-w-md w-full p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <AlertTriangleIcon />
              </div>
              <h3 className="text-xl font-bold tracking-tight">AI generation limit reached</h3>
            </div>
            <p className="text-foreground/60 text-sm mb-6">
              {aiUsage.plan === "pro" ? (
                <>You&apos;ve used all {aiUsage.limit} AI generation{aiUsage.limit === 1 ? "" : "s"} on your Pro plan.</>
              ) : (
                <>You&apos;ve used all {aiUsage.limit} AI generation{aiUsage.limit === 1 ? "" : "s"} on your current plan. Upgrade to get more.</>
              )}
            </p>
            <div className="flex flex-col gap-3">
              {aiUsage.plan !== "pro" ? (
                <a
                  href="/pricing"
                  className="bg-accent text-white text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10"
                >
                  View Plans
                </a>
              ) : (
                <button
                  onClick={() => setShowAiLimitModal(false)}
                  className="bg-accent text-white text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10"
                >
                  Got it
                </button>
              )}
              <button
                onClick={() => setShowAiLimitModal(false)}
                className="text-foreground/60 text-sm font-medium py-2 hover:text-foreground transition-colors"
              >
                {aiUsage.plan === "pro" ? "Close" : "Maybe later"}
              </button>
            </div>
          </div>
        </div>
      )}

      <PrintPortal>
        <div id="print-only-cover-letter" style={{ display: 'none' }}>
          {(() => {
            const TemplateComponent = getCoverLetterTemplateComponent(coverLetter.template);
            return <TemplateComponent content={previewContent} />;
          })()}
        </div>
      </PrintPortal>
    </div>
  );
}