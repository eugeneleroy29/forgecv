"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserEntitlements } from "@/lib/entitlements";
import { getTemplateComponent } from "@/app/components/resume/templates";
import PrintPortal from "@/app/components/resume/PrintPortal";
import ResumePreviewPanel from "@/app/components/ui/ResumePreviewPanel";

const ArrowUpIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const ArrowDownIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

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

const TargetIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const BriefcaseIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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

const CheckIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const WrenchIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const KeyIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);

const LightbulbIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
);

const UploadIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const AlertTriangleIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

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

const SectionCard = ({ sectionKey, title, children, actionButton, emptyState, effectiveOrder, onMoveUp, onMoveDown }) => {
  const orderIndex = effectiveOrder.indexOf(sectionKey);
  const isFirst = orderIndex === 0;
  const isLast = orderIndex === effectiveOrder.length - 1;
  return (
    <div
      className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
      style={{ order: orderIndex >= 0 ? orderIndex : 99 }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onMoveUp(sectionKey)}
              disabled={isFirst}
              className="p-1 rounded-lg text-foreground/30 hover:text-accent hover:bg-accent/5 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-foreground/30 transition-all"
              aria-label="Move section up"
            >
              <ArrowUpIcon />
            </button>
            <button
              onClick={() => onMoveDown(sectionKey)}
              disabled={isLast}
              className="p-1 rounded-lg text-foreground/30 hover:text-accent hover:bg-accent/5 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-foreground/30 transition-all"
              aria-label="Move section down"
            >
              <ArrowDownIcon />
            </button>
          </div>
        </div>
        {actionButton}
      </div>
      {children}
      {emptyState}
    </div>
  );
};

export default function ResumeEditor() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "", email: "", phone: "", location: "", linkedin: "", photoUrl: "",
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [customSections, setCustomSections] = useState([]);
  const [sectionOrder, setSectionOrder] = useState([]);

  const DEFAULT_REORDERABLE = ["summary", "experience", "education", "skills"];

  const getEffectiveOrder = (order, sections) => {
    const customIds = sections.map((s) => s.id);
    const validExisting = order.filter(
      (key) => DEFAULT_REORDERABLE.includes(key) || customIds.includes(key)
    );
    const missingDefault = DEFAULT_REORDERABLE.filter((key) => !validExisting.includes(key));
    const missingCustom = customIds.filter((id) => !validExisting.includes(id));
    return [...validExisting, ...missingDefault, ...missingCustom];
  };

  const SECTION_LABELS = {
    summary: "Summary",
    experience: "Work Experience",
    education: "Education",
    skills: "Skills",
  };

  const getSectionLabel = (key) => {
    if (SECTION_LABELS[key]) return SECTION_LABELS[key];
    const custom = customSections.find((s) => s.id === key);
    return custom?.title || key;
  };

  const moveSectionUp = (key) => {
    setSectionOrder(() => {
      const effective = getEffectiveOrder(sectionOrder, customSections);
      const index = effective.indexOf(key);
      if (index <= 0) return effective;
      const newOrder = [...effective];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      return newOrder;
    });
  };
  const moveSectionDown = (key) => {
    setSectionOrder(() => {
      const effective = getEffectiveOrder(sectionOrder, customSections);
      const index = effective.indexOf(key);
      if (index === -1 || index >= effective.length - 1) return effective;
      const newOrder = [...effective];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      return newOrder;
    });
  };

  const [skillInput, setSkillInput] = useState("");
  const [accentColor, setAccentColor] = useState("#4F46E5");
  const [fontFamily, setFontFamily] = useState("inter");
  const [photoShape, setPhotoShape] = useState("circle");
  const [mobileView, setMobileView] = useState("edit");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 0, plan: "free", isAdmin: false });
  const [showAts, setShowAts] = useState(false);
  const [pageBreaks, setPageBreaks] = useState({});
  const [atsResult, setAtsResult] = useState(null);
  const [showJobOptimizer, setShowJobOptimizer] = useState(false);
  const [showAiLimitModal, setShowAiLimitModal] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [parseProgress, setParseProgress] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobResult, setJobResult] = useState(null);

  useEffect(() => {
    if (user?.id) fetchResume();
  }, [user, id]);

  const fetchResume = async () => {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      router.push("/dashboard/resumes");
      return;
    }
    setResume(data);
    if (data.content?.personalInfo) setPersonalInfo(data.content.personalInfo);
    if (data.content?.summary) setSummary(data.content.summary);
    if (data.content?.experience) setExperience(data.content.experience);
    if (data.content?.education) setEducation(data.content.education);
    if (data.content?.skills) setSkills(data.content.skills);
    if (data.content?.customization?.accentColor) setAccentColor(data.content.customization.accentColor);
    if (data.content?.customization?.fontFamily) setFontFamily(data.content.customization.fontFamily);
    if (data.content?.customization?.photoShape) setPhotoShape(data.content.customization.photoShape);
    if (data.content?.pageBreaks) setPageBreaks(data.content.pageBreaks);
    if (data.content?.customSections) setCustomSections(data.content.customSections);
    if (data.content?.sectionOrder) setSectionOrder(data.content.sectionOrder.filter((k) => k !== "personalInfo"));

    try {
      const entitlements = await getUserEntitlements(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("ai_generations_used, ai_generations_reset_date, is_admin")
        .eq("id", user.id)
        .single();
      setAiUsage({
        used: profile?.ai_generations_used || 0,
        limit: entitlements.aiGenerationsPerMonth || 0,
        plan: entitlements.plan || "free",
        isAdmin: profile?.is_admin === true,
      });
    } catch (e) {
      console.error("Failed to fetch entitlements:", e);
    }
    setLoading(false);
  };

  const updateTitle = (newTitle) => setResume({ ...resume, title: newTitle });
  const updatePersonalInfo = (field, value) => setPersonalInfo({ ...personalInfo, [field]: value });

  const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
  const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"];

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoError(null);
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Only JPG or PNG images are allowed.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("Photo must be under 2MB.");
      return;
    }
    setUploadingPhoto(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      setPhotoError("Upload failed. Please try again.");
      setUploadingPhoto(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from("profile-photos").getPublicUrl(filePath);
    updatePersonalInfo("photoUrl", publicUrlData.publicUrl);
    setUploadingPhoto(false);
  };

  const removePhoto = () => updatePersonalInfo("photoUrl", "");

  const addCustomSection = () => {
    setCustomSections([
      ...customSections,
      { id: `custom_${Date.now()}`, title: "New Section", items: [{ id: `item_${Date.now()}`, text: "" }] },
    ]);
  };

  const updateCustomSectionTitle = (sectionId, title) => {
    setCustomSections(customSections.map((s) => (s.id === sectionId ? { ...s, title } : s)));
  };

  const removeCustomSection = (sectionId) => {
    setCustomSections(customSections.filter((s) => s.id !== sectionId));
  };

  const addCustomSectionItem = (sectionId) => {
    setCustomSections(
      customSections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, { id: `item_${Date.now()}`, text: "" }] } : s
      )
    );
  };

  const updateCustomSectionItem = (sectionId, itemId, text) => {
    setCustomSections(
      customSections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, text } : i)) }
          : s
      )
    );
  };

  const removeCustomSectionItem = (sectionId, itemId) => {
    setCustomSections(
      customSections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s
      )
    );
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      { id: Date.now(), jobTitle: "", company: "", startDate: "", endDate: "", current: false, description: "" },
    ]);
  };

  const updateExperience = (id, field, value) => {
    setExperience(experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)));
  };

  const removeExperience = (id) => {
    setExperience(experience.filter((exp) => exp.id !== id));
  };

  const addEducation = () => {
    setEducation([
      ...education,
      { id: Date.now(), degree: "", school: "", startDate: "", endDate: "", current: false },
    ]);
  };

  const updateEducation = (id, field, value) => {
    setEducation(education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)));
  };

  const removeEducation = (id) => {
    setEducation(education.filter((edu) => edu.id !== id));
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const generateSummary = async () => {
    if (!aiUsage.isAdmin && aiUsage.used >= aiUsage.limit) {
      setShowAiLimitModal(true);
      return;
    }
    setAiLoading(true);
    try {
      const jobTitle = experience[0]?.jobTitle || "Professional";
      const expText = experience.map((e) => `${e.jobTitle} at ${e.company}`).join(", ");
      const { data: { session: aiSession } } = await supabase.auth.getSession();
      const aiToken = aiSession?.access_token;
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiToken}` },
        body: JSON.stringify({ type: "summary", data: { jobTitle, experience: expText } }),
      });
      const result = await response.json();
      if (result.success) {
        setSummary(result.result);
        if (result.used !== undefined) setAiUsage((prev) => ({ ...prev, used: result.used }));
      } else if (response.status === 403) {
        if (!aiUsage.isAdmin) setShowAiLimitModal(true);
        if (result.used !== undefined) setAiUsage((prev) => ({ ...prev, used: result.used, limit: result.limit }));
      }
    } catch (error) {
      console.error("AI error:", error);
    }
    setAiLoading(false);
  };

  const suggestSkills = async () => {
    if (!aiUsage.isAdmin && aiUsage.used >= aiUsage.limit) {
      setShowAiLimitModal(true);
      return;
    }
    setAiLoading(true);
    try {
      const jobTitle = experience[0]?.jobTitle || "Virtual Assistant";
      const { data: { session: aiSession } } = await supabase.auth.getSession();
      const aiToken = aiSession?.access_token;
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiToken}` },
        body: JSON.stringify({ type: "skills", data: { jobTitle } }),
      });
      const result = await response.json();
      if (result.success) {
        if (result.used !== undefined) setAiUsage((prev) => ({ ...prev, used: result.used }));
        const suggestedSkills = result.result.split(",").map((s) => s.trim()).filter((s) => s && !skills.includes(s));
        setSkills([...skills, ...suggestedSkills]);
      } else if (response.status === 403) {
        if (!aiUsage.isAdmin) setShowAiLimitModal(true);
        if (result.used !== undefined) setAiUsage((prev) => ({ ...prev, used: result.used, limit: result.limit }));
      }
    } catch (error) {
      console.error("AI error:", error);
    }
    setAiLoading(false);
  };

  const checkATSScore = async () => {
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiToken}` },
        body: JSON.stringify({
          type: "ats_score",
          data: { personalInfo, summary, experience, education, skills },
        }),
      });
      const result = await response.json();
      if (result.success) {
        if (result.used !== undefined) setAiUsage((prev) => ({ ...prev, used: result.used }));
        const cleaned = result.result.replace(/```json/g, "").replace(/```/g, "").trim();
        setAtsResult(JSON.parse(cleaned));
        setShowAts(true);
      } else if (response.status === 403) {
        if (!aiUsage.isAdmin) setShowAiLimitModal(true);
        if (result.used !== undefined) setAiUsage((prev) => ({ ...prev, used: result.used, limit: result.limit }));
      }
    } catch (error) {
      console.error("AI error:", error);
    }
    setAiLoading(false);
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) { alert("Please select a file first"); return; }
    if (!targetPosition.trim()) { alert("Please enter a target position"); return; }
    if (!aiUsage.isAdmin && aiUsage.used >= aiUsage.limit) {
      setShowAiLimitModal(true);
      return;
    }
    setUploadingResume(true);
    setParseProgress("Uploading file...");
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const parseRes = await fetch("/api/parse-resume", { method: "POST", body: formData });
      const parseData = await parseRes.json();
      if (!parseData.success) {
        alert(parseData.error || "Failed to parse resume");
        setUploadingResume(false);
        setParseProgress("");
        return;
      }
      setParseProgress("Analyzing with AI...");
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const transformRes = await fetch("/api/ai/transform-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ extractedText: parseData.text, targetPosition: targetPosition.trim() }),
      });
      const transformData = await transformRes.json();
      if (!transformData.success) {
        if (transformRes.status === 403) {
          setShowAiLimitModal(true);
          if (transformData.used !== undefined) setAiUsage((prev) => ({ ...prev, used: transformData.used, limit: transformData.limit }));
        } else {
          alert(transformData.error || "Failed to transform resume");
        }
        setUploadingResume(false);
        setParseProgress("");
        return;
      }
      if (transformData.data.personalInfo) setPersonalInfo((prev) => ({ ...prev, ...transformData.data.personalInfo }));
      if (transformData.data.summary) setSummary(transformData.data.summary);
      if (transformData.data.experience) setExperience(transformData.data.experience);
      if (transformData.data.education) setEducation(transformData.data.education);
      if (transformData.data.skills) setSkills(transformData.data.skills);
      if (transformData.used !== undefined) setAiUsage((prev) => ({ ...prev, used: transformData.used, limit: transformData.limit }));
      setParseProgress("Done!");
      setTimeout(() => {
        setUploadingResume(false);
        setParseProgress("");
        setResumeFile(null);
        setTargetPosition("");
      }, 1500);
    } catch (error) {
      console.error("Upload/transform error:", error);
      alert("Something went wrong. Please try again.");
      setUploadingResume(false);
      setParseProgress("");
    }
  };

  const optimizeForJob = async () => {
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiToken}` },
        body: JSON.stringify({ type: "job_optimizer", data: { jobDescription, skills, summary } }),
      });
      const result = await response.json();
      if (result.success) {
        if (result.used !== undefined) setAiUsage((prev) => ({ ...prev, used: result.used }));
        const cleaned = result.result.replace(/```json/g, "").replace(/```/g, "").trim();
        setJobResult(JSON.parse(cleaned));
      } else if (response.status === 403) {
        if (!aiUsage.isAdmin) setShowAiLimitModal(true);
        if (result.used !== undefined) setAiUsage((prev) => ({ ...prev, used: result.used, limit: result.limit }));
      }
    } catch (error) {
      console.error("AI error:", error);
    }
    setAiLoading(false);
  };

  const saveResume = async () => {
    setSaving(true);
    const updatedContent = {
      ...resume.content,
      personalInfo,
      summary,
      experience,
      education,
      skills,
      customization: { ...resume.content?.customization, accentColor, fontFamily, photoShape },
      customSections,
      sectionOrder: ["personalInfo", ...getEffectiveOrder(sectionOrder, customSections)],
      pageBreaks,
    };
    await supabase
      .from("resumes")
      .update({ title: resume.title, content: updatedContent, updated_at: new Date().toISOString() })
      .eq("id", id);
    setResume({ ...resume, content: updatedContent });
    setSaving(false);
  };

  const togglePageBreak = (sectionKey, value) => {
    setPageBreaks((prev) => ({ ...prev, [sectionKey]: value }));
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <p className="text-foreground/60">Loading...</p>
      </div>
    );
  }

  const previewContent = {
    ...resume.content,
    personalInfo,
    summary,
    experience,
    education,
    skills,
    customSections,
    sectionOrder: ["personalInfo", ...getEffectiveOrder(sectionOrder, customSections)],
    customization: { accentColor, fontFamily, photoShape },
  };

  const effectiveOrder = getEffectiveOrder(sectionOrder, customSections);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
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

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className={`w-full xl:max-w-2xl xl:w-auto ${mobileView === "preview" ? "hidden xl:block" : ""}`}>
          {/* Resume Upload */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <UploadIcon />
              </div>
              <h2 className="font-semibold text-lg tracking-tight">Upload Existing Resume</h2>
            </div>
            <p className="text-sm text-foreground/60 mb-4">
              Upload your current resume (PDF or DOCX) and we&apos;ll extract and optimize it for your target position.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent-hover file:transition-colors"
              />
              <Input
                label="Target Position"
                type="text"
                placeholder="e.g. Virtual Assistant, Data Entry Specialist"
                value={targetPosition}
                onChange={(e) => setTargetPosition(e.target.value)}
              />
              <button
                onClick={handleResumeUpload}
                disabled={uploadingResume || !resumeFile || !targetPosition.trim()}
                className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/10 hover:shadow-accent/20"
              >
                {uploadingResume ? (
                  <>
                    <LoaderIcon className="animate-spin" />
                    {parseProgress || "Processing..."}
                  </>
                ) : (
                  <>
                    <SparklesIcon />
                    Transform with AI
                  </>
                )}
              </button>
            </div>
          </div>

                    {/* Header */}
                    <div className="mb-8">
            <input
              type="text"
              value={resume.title}
              onChange={(e) => updateTitle(e.target.value)}
              onBlur={saveResume}
              className="text-2xl sm:text-3xl font-bold bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none transition-colors pb-1 w-full mb-4"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={checkATSScore}
                disabled={aiLoading}
                className="border border-border px-3.5 py-2 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {aiLoading ? <LoaderIcon className="animate-spin" /> : <TargetIcon />}
                ATS Score
              </button>
              <button
                onClick={() => setShowJobOptimizer(true)}
                disabled={aiLoading}
                className="border border-border px-3.5 py-2 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <BriefcaseIcon />
                Job Optimizer
              </button>
              <button
                onClick={() => window.print()}
                className="border border-border px-3.5 py-2 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-all flex items-center gap-1.5"
              >
                <PrinterIcon />
                Print / PDF
              </button>
              <button
                onClick={saveResume}
                disabled={saving}
                className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-accent/10 hover:shadow-accent/20"
              >
                {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            <h2 className="font-semibold text-lg tracking-tight mb-5">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" type="text" placeholder="Juan Dela Cruz" value={personalInfo.fullName} onChange={(e) => updatePersonalInfo("fullName", e.target.value)} />
              <Input label="Email" type="email" placeholder="juan@example.com" value={personalInfo.email} onChange={(e) => updatePersonalInfo("email", e.target.value)} />
              <Input label="Phone" type="text" placeholder="+63 912 345 6789" value={personalInfo.phone} onChange={(e) => updatePersonalInfo("phone", e.target.value)} />
              <Input label="Location" type="text" placeholder="Manila, Philippines" value={personalInfo.location} onChange={(e) => updatePersonalInfo("location", e.target.value)} />
              <div className="md:col-span-2">
                <Input label="LinkedIn (optional)" type="text" placeholder="linkedin.com/in/juandelacruz" value={personalInfo.linkedin} onChange={(e) => updatePersonalInfo("linkedin", e.target.value)} />
              </div>

              {["premium-sidebar-photo", "premium-topheader-photo", "premium-twocol-photo"].includes(resume.template) && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block text-foreground/80">Profile Photo (JPG/PNG, max 2MB)</label>
                  <div className="flex items-center gap-4">
                    {personalInfo.photoUrl && (
                      <img src={personalInfo.photoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-border" />
                    )}
                    <input type="file" accept="image/jpeg,image/png" onChange={handlePhotoUpload} disabled={uploadingPhoto} className="text-sm" />
                    {personalInfo.photoUrl && (
                      <button onClick={removePhoto} type="button" className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
                        Remove
                      </button>
                    )}
                  </div>
                  {uploadingPhoto && <p className="text-xs text-foreground/60 mt-2">Uploading...</p>}
                  {photoError && <p className="text-xs text-red-500 mt-2">{photoError}</p>}
                </div>
              )}
            </div>
            <button onClick={saveResume} disabled={saving} className="mt-5 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
              {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>

          {/* Reorderable Sections */}
          <div className="flex flex-col">
            {/* Summary */}
            <SectionCard
              sectionKey="summary"
              title="Professional Summary"
              effectiveOrder={effectiveOrder}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              actionButton={
                <button onClick={generateSummary} disabled={aiLoading} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {aiLoading ? <LoaderIcon className="animate-spin" /> : <SparklesIcon />}
                  {aiLoading ? "Generating..." : "Generate with AI"}
                </button>
              }
            >
              <TextArea
                placeholder="Write a brief summary highlighting your skills and experience..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={5}
              />
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 text-xs text-foreground/60 cursor-pointer">
                  <input type="checkbox" checked={pageBreaks.summary || false} onChange={(e) => togglePageBreak("summary", e.target.checked)} className="rounded border-border" />
                  Start on new page
                </label>
                <button onClick={saveResume} disabled={saving} className="text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                  {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                  {saving ? "Saving..." : "Save section"}
                </button>
              </div>
            </SectionCard>

            {/* Experience */}
            <SectionCard
              sectionKey="experience"
              title="Work Experience"
              effectiveOrder={effectiveOrder}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              actionButton={
                <button onClick={addExperience} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors flex items-center gap-1">
                  <span className="text-sm leading-none">+</span> Add Experience
                </button>
              }
              emptyState={experience.length === 0 && (
                <p className="text-sm text-foreground/40 text-center py-8">No work experience added yet</p>
              )}
            >
              <div className="flex flex-col gap-4">
                {experience.map((exp, index) => (
                  <div key={exp.id || `exp-${index}`} className="bg-muted/30 border border-border rounded-xl p-4 relative group">
                    <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 text-foreground/30 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                      <XIcon />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                      <Input label="Job Title" type="text" placeholder="Customer Service Representative" value={exp.jobTitle} onChange={(e) => updateExperience(exp.id, "jobTitle", e.target.value)} />
                      <Input label="Company" type="text" placeholder="ABC Company" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
                      <Input label="Start Date" type="month" value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} />
                      <div>
                        <Input label="End Date" type="month" value={exp.endDate} disabled={exp.current} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} />
                        <label className="flex items-center gap-2 mt-2 text-xs text-foreground/60 cursor-pointer">
                          <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, "current", e.target.checked)} className="rounded border-border" />
                          I currently work here
                        </label>
                      </div>
                    </div>
                    <TextArea label="Description" placeholder="Describe your responsibilities and achievements..." value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} rows={3} />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 text-xs text-foreground/60 cursor-pointer">
                  <input type="checkbox" checked={pageBreaks.experience || false} onChange={(e) => togglePageBreak("experience", e.target.checked)} className="rounded border-border" />
                  Start on new page
                </label>
                <button onClick={saveResume} disabled={saving} className="text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                  {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                  {saving ? "Saving..." : "Save section"}
                </button>
              </div>
            </SectionCard>

            {/* Education */}
            <SectionCard
              sectionKey="education"
              title="Education"
              effectiveOrder={effectiveOrder}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              actionButton={
                <button onClick={addEducation} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors flex items-center gap-1">
                  <span className="text-sm leading-none">+</span> Add Education
                </button>
              }
              emptyState={education.length === 0 && (
                <p className="text-sm text-foreground/40 text-center py-8">No education added yet</p>
              )}
            >
              <div className="flex flex-col gap-4">
                {education.map((edu, index) => (
                  <div key={edu.id || `edu-${index}`} className="bg-muted/30 border border-border rounded-xl p-4 relative group">
                    <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 text-foreground/30 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                      <XIcon />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                      <Input label="Degree / Course" type="text" placeholder="Bachelor of Science in Business Administration" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
                      <Input label="School" type="text" placeholder="University of the Philippines" value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} />
                      <Input label="Start Date" type="month" value={edu.startDate} onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)} />
                      <div>
                        <Input label="End Date" type="month" value={edu.endDate} disabled={edu.current} onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)} />
                        <label className="flex items-center gap-2 mt-2 text-xs text-foreground/60 cursor-pointer">
                          <input type="checkbox" checked={edu.current} onChange={(e) => updateEducation(edu.id, "current", e.target.checked)} className="rounded border-border" />
                          Currently studying here
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 text-xs text-foreground/60 cursor-pointer">
                  <input type="checkbox" checked={pageBreaks.education || false} onChange={(e) => togglePageBreak("education", e.target.checked)} className="rounded border-border" />
                  Start on new page
                </label>
                <button onClick={saveResume} disabled={saving} className="text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                  {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                  {saving ? "Saving..." : "Save section"}
                </button>
              </div>
            </SectionCard>

            {/* Skills */}
            <SectionCard
              sectionKey="skills"
              title="Skills"
              effectiveOrder={effectiveOrder}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              actionButton={
                <button onClick={suggestSkills} disabled={aiLoading} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {aiLoading ? <LoaderIcon className="animate-spin" /> : <SparklesIcon />}
                  {aiLoading ? "Suggesting..." : "Suggest Skills"}
                </button>
              }
            >
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                />
                <button onClick={addSkill} className="border border-border px-4 py-2.5 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-all">
                  Add
                </button>
              </div>
              {skills.length === 0 ? (
                <p className="text-sm text-foreground/40 text-center py-4">No skills added yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="bg-accent/10 text-accent text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                        <XIcon />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 text-xs text-foreground/60 cursor-pointer">
                  <input type="checkbox" checked={pageBreaks.skills || false} onChange={(e) => togglePageBreak("skills", e.target.checked)} className="rounded border-border" />
                  Start on new page
                </label>
                <button onClick={saveResume} disabled={saving} className="text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                  {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                  {saving ? "Saving..." : "Save section"}
                </button>
              </div>
            </SectionCard>

            {/* Custom Sections */}
            {customSections.map((section) => (
              <div
                key={section.id}
                className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 relative"
                style={{ order: effectiveOrder.indexOf(section.id) >= 0 ? effectiveOrder.indexOf(section.id) : 99 }}
              >
                <button onClick={() => removeCustomSection(section.id)} className="absolute top-4 right-4 text-foreground/30 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                  <XIcon />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => moveSectionUp(section.id)}
                      disabled={effectiveOrder.indexOf(section.id) === 0}
                      className="p-1 rounded-lg text-foreground/30 hover:text-accent hover:bg-accent/5 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-foreground/30 transition-all"
                    >
                      <ArrowUpIcon />
                    </button>
                    <button
                      onClick={() => moveSectionDown(section.id)}
                      disabled={effectiveOrder.indexOf(section.id) === effectiveOrder.length - 1}
                      className="p-1 rounded-lg text-foreground/30 hover:text-accent hover:bg-accent/5 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-foreground/30 transition-all"
                    >
                      <ArrowDownIcon />
                    </button>
                  </div>
                  <span className="text-xs font-medium text-foreground/40 uppercase tracking-wider">Custom Section</span>
                </div>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateCustomSectionTitle(section.id, e.target.value)}
                  placeholder="Section Title (e.g. Certifications)"
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-semibold bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all mb-3"
                />
                <div className="flex flex-col gap-2">
                  {section.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateCustomSectionItem(section.id, item.id, e.target.value)}
                        placeholder="e.g. AWS Certified Solutions Architect (2024)"
                        className="flex-1 border border-border rounded-xl px-4 py-2 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                      />
                      <button onClick={() => removeCustomSectionItem(section.id, item.id)} className="text-foreground/30 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                        <XIcon />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => addCustomSectionItem(section.id)} className="mt-3 text-xs text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1">
                  <span className="text-sm leading-none">+</span> Add Line
                </button>
                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center gap-2 text-xs text-foreground/60 cursor-pointer">
                    <input type="checkbox" checked={pageBreaks[section.id] || false} onChange={(e) => togglePageBreak(section.id, e.target.checked)} className="rounded border-border" />
                    Start on new page
                  </label>
                  <button onClick={saveResume} disabled={saving} className="text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                    {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                    {saving ? "Saving..." : "Save section"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Section */}
          <div className="bg-card border border-border border-dashed rounded-2xl p-6 mb-6 text-center hover:border-accent/40 transition-colors">
            {customSections.length === 0 && (
              <p className="text-sm text-foreground/40 mb-3">No additional sections yet. Add one for Certifications, Languages, Awards, etc.</p>
            )}
            <button onClick={addCustomSection} className="text-xs bg-accent/10 text-accent px-4 py-2 rounded-lg font-medium hover:bg-accent/20 transition-colors flex items-center gap-1 mx-auto">
              <span className="text-sm leading-none">+</span> Add Section
            </button>
          </div>

          {/* Customization */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            <h2 className="font-semibold text-lg tracking-tight mb-5">Customization</h2>
            {resume?.template?.startsWith("premium") && (
              <>
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
              </>
            )}
            <label className="text-sm font-medium mb-1.5 block text-foreground/80">Font Style</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all mb-4"
            >
              <option value="inter">Modern (Inter)</option>
              <option value="georgia">Classic (Georgia)</option>
            </select>
            {personalInfo.photoUrl && (
              <>
                <label className="text-sm font-medium mb-1.5 block text-foreground/80">Photo Shape</label>
                <div className="flex gap-2">
                  {[
                    { value: "circle", label: "Circle" },
                    { value: "rounded", label: "Rounded" },
                    { value: "square", label: "Square" },
                  ].map((shape) => (
                    <button
                      key={shape.value}
                      onClick={() => setPhotoShape(shape.value)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        photoShape === shape.value
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <span className={`w-4 h-4 border-2 border-current ${shape.value === "circle" ? "rounded-full" : shape.value === "rounded" ? "rounded-md" : "rounded-none"}`} />
                      {shape.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            <button onClick={saveResume} disabled={saving} className="mt-5 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
              {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div className={`w-full xl:flex-1 xl:min-w-0 ${mobileView === "edit" ? "hidden xl:block" : ""}`}>
          <div className="sticky top-6 md:top-8 h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] flex flex-col">
            <ResumePreviewPanel title="Resume Preview" className="h-full">
              {(() => {
                const TemplateComponent = getTemplateComponent(resume.template);
                return <TemplateComponent content={previewContent} />;
              })()}
            </ResumePreviewPanel>
          </div>
        </div>
      </div>

      {/* MODALS */}

      {/* ATS Score Modal */}
      {showAts && atsResult && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-elevated max-w-lg w-full overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <TargetIcon className="text-accent" />
                <h3 className="font-semibold tracking-tight">ATS Score</h3>
              </div>
              <button onClick={() => setShowAts(false)} className="text-foreground/40 hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
                <XIcon />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold mb-2 ${atsResult.score >= 80 ? "text-emerald-500" : atsResult.score >= 60 ? "text-amber-500" : "text-red-500"}`}>
                  {atsResult.score}
                </div>
                <p className="text-foreground/60 text-sm">out of 100</p>
                <div className="w-full bg-border rounded-full h-2 mt-3">
                  <div className={`h-2 rounded-full transition-all ${atsResult.score >= 80 ? "bg-emerald-500" : atsResult.score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${atsResult.score}%` }} />
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <CheckIcon className="text-emerald-500" /> What&apos;s working
                </h4>
                <ul className="flex flex-col gap-2">
                  {atsResult.feedback?.map((item, i) => (
                    <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                      <span className="text-emerald-500 mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <WrenchIcon className="text-accent" /> Improvements
                </h4>
                <ul className="flex flex-col gap-2">
                  {atsResult.improvements?.map((item, i) => (
                    <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                      <span className="text-accent mt-1.5 w-1 h-1 rounded-full bg-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Optimizer Modal */}
      {showJobOptimizer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-elevated max-w-lg w-full overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <BriefcaseIcon className="text-accent" />
                <h3 className="font-semibold tracking-tight">Job Description Optimizer</h3>
              </div>
              <button onClick={() => { setShowJobOptimizer(false); setJobResult(null); }} className="text-foreground/40 hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
                <XIcon />
              </button>
            </div>
            <div className="p-6">
              {!jobResult ? (
                <>
                  <p className="text-sm text-foreground/60 mb-4">
                    Paste a job description below and we&apos;ll analyze how well your resume matches it.
                  </p>
                  <textarea
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={8}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all resize-none mb-4"
                  />
                  <button
                    onClick={optimizeForJob}
                    disabled={aiLoading || !jobDescription.trim()}
                    className="w-full bg-accent text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/10"
                  >
                    {aiLoading ? <LoaderIcon className="animate-spin" /> : <SearchIcon />}
                    {aiLoading ? "Analyzing..." : "Analyze Match"}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className={`text-6xl font-bold mb-2 ${jobResult.matchScore >= 80 ? "text-emerald-500" : jobResult.matchScore >= 60 ? "text-amber-500" : "text-red-500"}`}>
                      {jobResult.matchScore}%
                    </div>
                    <p className="text-foreground/60 text-sm">match with job description</p>
                    <div className="w-full bg-border rounded-full h-2 mt-3">
                      <div className={`h-2 rounded-full transition-all ${jobResult.matchScore >= 80 ? "bg-emerald-500" : jobResult.matchScore >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${jobResult.matchScore}%` }} />
                    </div>
                  </div>
                  {jobResult.missingKeywords?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                        <KeyIcon className="text-red-500" /> Missing Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {jobResult.missingKeywords.map((keyword, i) => (
                          <span key={i} className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <LightbulbIcon className="text-accent" /> Suggestions
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {jobResult.suggestions?.map((item, i) => (
                        <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                          <span className="text-accent mt-1.5 w-1 h-1 rounded-full bg-accent shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setJobResult(null)}
                    className="w-full border border-border py-2.5 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeftIcon />
                    Try Another Job Description
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
                <>You&apos;ve used all {aiUsage.limit} AI generation{aiUsage.limit === 1 ? "" : "s"} on your Pro plan. You&apos;ve reached the monthly limit.</>
              ) : (
                <>You&apos;ve used all {aiUsage.limit} AI generation{aiUsage.limit === 1 ? "" : "s"} on your current plan. Upgrade to get more.</>
              )}
            </p>
            <div className="flex flex-col gap-3">
              {aiUsage.plan !== "pro" ? (
                <a href="/pricing" className="bg-accent text-white text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10">
                  View Plans
                </a>
              ) : (
                <button onClick={() => setShowAiLimitModal(false)} className="bg-accent text-white text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10">
                  Got it
                </button>
              )}
              <button onClick={() => setShowAiLimitModal(false)} className="text-foreground/60 text-sm font-medium py-2 hover:text-foreground transition-colors">
                {aiUsage.plan === "pro" ? "Close" : "Maybe later"}
              </button>
            </div>
          </div>
        </div>
      )}

      <PrintPortal>
        <div id="print-only-resume" className="hidden">
          {(() => {
            const TemplateComponent = getTemplateComponent(resume.template);
            return <TemplateComponent content={previewContent} />;
          })()}
        </div>
      </PrintPortal>
    </div>
  );
}