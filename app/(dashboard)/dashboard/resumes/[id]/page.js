"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getTemplateComponent } from "@/app/components/resume/templates";
import PrintPortal from "@/app/components/resume/PrintPortal";

export default function ResumeEditor() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    photoUrl: "",
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

  const moveSection = (index, direction) => {
    const effective = getEffectiveOrder(sectionOrder, customSections);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= effective.length) return;
    const newOrder = [...effective];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setSectionOrder(newOrder);
  };

  const [skillInput, setSkillInput] = useState("");
  const [accentColor, setAccentColor] = useState("#4F46E5");
  const [fontFamily, setFontFamily] = useState("inter");
  const [spacing, setSpacing] = useState("comfortable");
  const [mobileView, setMobileView] = useState("edit");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAts, setShowAts] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [showJobOptimizer, setShowJobOptimizer] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [jobResult, setJobResult] = useState(null)

  useEffect(() => {
    if (user?.id) {
      fetchResume();
    }
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
    if (data.content?.personalInfo) {
      setPersonalInfo(data.content.personalInfo);
    }
    if (data.content?.summary) {
      setSummary(data.content.summary);
    }
    if (data.content?.experience) {
      setExperience(data.content.experience);
    }
    if (data.content?.education) {
      setEducation(data.content.education);
    }
    if (data.content?.skills) {
      setSkills(data.content.skills);
    }
    if (data.content?.customization?.accentColor) {
      setAccentColor(data.content.customization.accentColor);
    }
    if (data.content?.customization?.fontFamily) {
      setFontFamily(data.content.customization.fontFamily);
    }
    if (data.content?.customization?.spacing) {
      setSpacing(data.content.customization.spacing);
    }
    if (data.content?.customSections) {
      setCustomSections(data.content.customSections);
    }
    if (data.content?.sectionOrder) {
      setSectionOrder(data.content.sectionOrder.filter((key) => key !== "personalInfo"));
    }
    setLoading(false);
  };

  const updateTitle = (newTitle) => {
    setResume({ ...resume, title: newTitle });
  };

  const updatePersonalInfo = (field, value) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
  };

  const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
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

    const { data: publicUrlData } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(filePath);

    updatePersonalInfo("photoUrl", publicUrlData.publicUrl);
    setUploadingPhoto(false);
  };

  const removePhoto = () => {
    updatePersonalInfo("photoUrl", "");
  };

  const addCustomSection = () => {
    setCustomSections([
      ...customSections,
      { id: `custom_${Date.now()}`, title: "New Section", items: [{ id: `item_${Date.now()}`, text: "" }] },
    ]);
  };

  const updateCustomSectionTitle = (sectionId, title) => {
    setCustomSections(
      customSections.map((s) => (s.id === sectionId ? { ...s, title } : s))
    );
  };

  const removeCustomSection = (sectionId) => {
    setCustomSections(customSections.filter((s) => s.id !== sectionId));
  };

  const addCustomSectionItem = (sectionId) => {
    setCustomSections(
      customSections.map((s) =>
        s.id === sectionId
          ? { ...s, items: [...s.items, { id: `item_${Date.now()}`, text: "" }] }
          : s
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
        s.id === sectionId
          ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
          : s
      )
    );
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        id: Date.now(),
        jobTitle: "",
        company: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ]);
  };

  const updateExperience = (id, field, value) => {
    setExperience(
      experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
    );
  };

  const removeExperience = (id) => {
    setExperience(experience.filter((exp) => exp.id !== id));
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: Date.now(),
        degree: "",
        school: "",
        startDate: "",
        endDate: "",
        current: false,
      },
    ]);
  };

  const updateEducation = (id, field, value) => {
    setEducation(
      education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu,
      ),
    );
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

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const generateSummary = async () => {
    setAiLoading(true);
    try {
      const jobTitle = experience[0]?.jobTitle || "Professional";
      const expText = experience
        .map((e) => `${e.jobTitle} at ${e.company}`)
        .join(", ");

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summary",
          data: { jobTitle, experience: expText },
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSummary(result.result);
      }
    } catch (error) {
      console.error("AI error:", error);
    }
    setAiLoading(false);
  };

  const suggestSkills = async () => {
    setAiLoading(true);
    try {
      const jobTitle = experience[0]?.jobTitle || "Virtual Assistant";

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "skills",
          data: { jobTitle },
        }),
      });
      const result = await response.json();
      if (result.success) {
        const suggestedSkills = result.result
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s && !skills.includes(s));
        setSkills([...skills, ...suggestedSkills]);
      }
    } catch (error) {
      console.error("AI error:", error);
    }
    setAiLoading(false);
  };

  const checkATSScore = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ats_score",
          data: { personalInfo, summary, experience, education, skills },
        }),
      });
      const result = await response.json()
      if (result.success) {
        const cleaned = result.result
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim()
        const parsed = JSON.parse(cleaned)
        setAtsResult(parsed)
        setShowAts(true)
      }
    } catch (error) {
      console.error("AI error:", error);
    }
    setAiLoading(false);
  };

  const optimizeForJob = async () => {
    setAiLoading(true)
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'job_optimizer',
          data: { jobDescription, skills, summary }
        })
      })
      const result = await response.json()
      if (result.success) {
        const cleaned = result.result
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim()
        const parsed = JSON.parse(cleaned)
        setJobResult(parsed)
      }
    } catch (error) {
      console.error('AI error:', error)
    }
    setAiLoading(false)
  }

  const saveResume = async () => {
    setSaving(true);
    const updatedContent = {
      ...resume.content,
      personalInfo,
      summary,
      experience,
      education,
      skills,
      customization: { ...resume.content?.customization, accentColor, fontFamily, spacing },
      customSections,
      sectionOrder: ["personalInfo", ...getEffectiveOrder(sectionOrder, customSections)],
    };
    await supabase
      .from("resumes")
      .update({
        title: resume.title,
        content: updatedContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    setResume({ ...resume, content: updatedContent });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="px-8 py-8">
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
    customization: { accentColor, fontFamily, spacing },
  };
  return (
    <div className="px-8 py-8">
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
      <div className="flex flex-col md:flex-row gap-8">
        <div className={`max-w-2xl w-full ${mobileView === "preview" ? "hidden md:block" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <input
          type="text"
          value={resume.title}
          onChange={(e) => updateTitle(e.target.value)}
          onBlur={saveResume}
          className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:border-b focus:border-accent"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={checkATSScore}
            disabled={aiLoading}
            className="border border-border px-5 py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
          >
            {aiLoading ? "⏳ Checking..." : "🎯 ATS Score"}
          </button>
          <button
            onClick={() => setShowJobOptimizer(true)}
            disabled={aiLoading}
            className="border border-border px-5 py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
          >
            💼 Job Optimizer
          </button>
          <button
            onClick={() => window.print()}
            className="border border-border px-5 py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors"
          >
            🖨️ Print / Save as PDF
          </button>
          <button
            onClick={saveResume}
            disabled={saving}
            className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Personal Info Section */}
      <div className="border border-border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Full Name
            </label>
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
            <label className="text-sm font-medium mb-1.5 block">
              LinkedIn (optional)
            </label>
            <input
              type="text"
              placeholder="linkedin.com/in/juandelacruz"
              value={personalInfo.linkedin}
              onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"     
            />
          </div>

          {["premium-sidebar-photo", "premium-topheader-photo", "premium-twocol-photo"].includes(resume.template) && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">
                Profile Photo (JPG/PNG, max 2MB)
              </label>
              <div className="flex items-center gap-4">
                {personalInfo.photoUrl && (
                  <img
                    src={personalInfo.photoUrl}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border border-border"
                  />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="text-sm"
                />
                {personalInfo.photoUrl && (
                  <button
                    onClick={removePhoto}
                    type="button"
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              {uploadingPhoto && (
                <p className="text-xs text-foreground/60 mt-2">Uploading...</p>
              )}
              {photoError && (
                <p className="text-xs text-red-500 mt-2">{photoError}</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={saveResume}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Professional Summary Section */}
      <div className="border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Professional Summary</h2>
          <button
            onClick={generateSummary}
            disabled={aiLoading}
            className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {aiLoading ? "⏳ Generating..." : "✨ Generate with AI"}
          </button>
        </div>

        <textarea
          placeholder="Write a brief summary highlighting your skills and experience..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={5}
          className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent transition-colors resize-none"
        />

        <button
          onClick={saveResume}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Work Experience Section */}
      <div className="border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Work Experience</h2>
          <button
            onClick={addExperience}
            className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors"
          >
            + Add Experience
          </button>
        </div>

        {experience.length === 0 && (
          <p className="text-sm text-foreground/40 text-center py-6">
            No work experience added yet
          </p>
        )}

        <div className="flex flex-col gap-4">
          {experience.map((exp, index) => (
            <div
              key={exp.id}
              className="border border-border rounded-lg p-4 relative"
            >
              <button
                onClick={() => removeExperience(exp.id)}
                className="absolute top-3 right-3 text-foreground/40 hover:text-red-500 text-sm"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="Customer Service Representative"
                    value={exp.jobTitle}
                    onChange={(e) =>
                      updateExperience(exp.id, "jobTitle", e.target.value)
                    }
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Company
                  </label>
                  <input
                    type="text"
                    placeholder="ABC Company"
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(exp.id, "company", e.target.value)
                    }
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Start Date
                  </label>
                  <input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(exp.id, "startDate", e.target.value)
                    }
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    End Date
                  </label>
                  <input
                    type="month"
                    value={exp.endDate}
                    disabled={exp.current}
                    onChange={(e) =>
                      updateExperience(exp.id, "endDate", e.target.value)
                    }
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                  />
                  <label className="flex items-center gap-2 mt-2 text-xs text-foreground/60">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) =>
                        updateExperience(exp.id, "current", e.target.checked)
                      }
                    />
                    I currently work here
                  </label>
                </div>
              </div>

              <label className="text-sm font-medium mb-1.5 block">
                Description
              </label>
              <textarea
                placeholder="Describe your responsibilities and achievements..."
                value={exp.description}
                onChange={(e) =>
                  updateExperience(exp.id, "description", e.target.value)
                }
                rows={3}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
          ))}
        </div>

        <button
          onClick={saveResume}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Education Section */}
      <div className="border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Education</h2>
          <button
            onClick={addEducation}
            className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors"
          >
            + Add Education
          </button>
        </div>

        {education.length === 0 && (
          <p className="text-sm text-foreground/40 text-center py-6">
            No education added yet
          </p>
        )}

        <div className="flex flex-col gap-4">
          {education.map((edu) => (
            <div
              key={edu.id}
              className="border border-border rounded-lg p-4 relative"
            >
              <button
                onClick={() => removeEducation(edu.id)}
                className="absolute top-3 right-3 text-foreground/40 hover:text-red-500 text-sm"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Degree / Course
                  </label>
                  <input
                    type="text"
                    placeholder="Bachelor of Science in Business Administration"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, "degree", e.target.value)
                    }
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    School
                  </label>
                  <input
                    type="text"
                    placeholder="University of the Philippines"
                    value={edu.school}
                    onChange={(e) =>
                      updateEducation(edu.id, "school", e.target.value)
                    }
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Start Date
                  </label>
                  <input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) =>
                      updateEducation(edu.id, "startDate", e.target.value)
                    }
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    End Date
                  </label>
                  <input
                    type="month"
                    value={edu.endDate}
                    disabled={edu.current}
                    onChange={(e) =>
                      updateEducation(edu.id, "endDate", e.target.value)
                    }
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                  />
                  <label className="flex items-center gap-2 mt-2 text-xs text-foreground/60">
                    <input
                      type="checkbox"
                      checked={edu.current}
                      onChange={(e) =>
                        updateEducation(edu.id, "current", e.target.checked)
                      }
                    />
                    Currently studying here
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={saveResume}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Skills Section */}
      <div className="border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Skills</h2>
          <button
            onClick={suggestSkills}
            disabled={aiLoading}
            className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
          >
            {aiLoading ? "⏳ Suggesting..." : "✨ Suggest Skills"}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Type a skill and press Enter"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={addSkill}
            className="border border-border px-4 py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors"
          >
            Add
          </button>
        </div>

        {skills.length === 0 ? (
          <p className="text-sm text-foreground/40 text-center py-4">
            No skills added yet
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-accent/10 text-accent text-sm px-3 py-1.5 rounded-full flex items-center gap-2"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

<button
          onClick={saveResume}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium block"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Additional Sections */}
      <div className="border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Additional Sections</h2>
          <button
            onClick={addCustomSection}
            className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors"
          >
            + Add Section
          </button>
        </div>

        {customSections.length === 0 && (
          <p className="text-sm text-foreground/40 text-center py-6">
            No additional sections yet. Add one for Certifications, Languages, Awards, etc.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {customSections.map((section) => (
            <div key={section.id} className="border border-border rounded-lg p-4 relative">
              <button
                onClick={() => removeCustomSection(section.id)}
                className="absolute top-3 right-3 text-foreground/40 hover:text-red-500 text-sm"
              >
                ✕
              </button>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateCustomSectionTitle(section.id, e.target.value)}
                placeholder="Section Title (e.g. Certifications)"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm font-semibold bg-background focus:outline-none focus:border-accent transition-colors mb-3"
              />
              <div className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateCustomSectionItem(section.id, item.id, e.target.value)}
                      placeholder="e.g. AWS Certified Solutions Architect (2024)"
                      className="flex-1 border border-border rounded-lg px-4 py-2 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      onClick={() => removeCustomSectionItem(section.id, item.id)}
                      className="text-foreground/40 hover:text-red-500 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addCustomSectionItem(section.id)}
                className="mt-3 text-xs text-accent hover:underline font-medium"
              >
                + Add Line
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={saveResume}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Section Order */}
      <div className="border border-border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Section Order</h2>
        <p className="text-sm text-foreground/60 mb-4">
          Personal Info always appears first. Reorder the rest using the arrows.
        </p>
        <div className="flex flex-col gap-2">
          {getEffectiveOrder(sectionOrder, customSections).map((key, index, arr) => (
            <div
              key={key}
              className="flex items-center justify-between border border-border rounded-lg px-4 py-2.5"
            >
              <span className="text-sm font-medium">{getSectionLabel(key)}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  className="text-foreground/60 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveSection(index, 1)}
                  disabled={index === arr.length - 1}
                  className="text-foreground/60 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ▼
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={saveResume}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Customization Section */}

      <div className="border border-border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Customization</h2>
        <label className="text-sm font-medium mb-1.5 block">Accent Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-12 h-12 border border-border rounded-lg cursor-pointer"
          />
          <span className="text-sm text-foreground/60">{accentColor}</span>
        </div>
        <label className="text-sm font-medium mb-1.5 block mt-4">Font Style</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
        >
          <option value="inter">Modern (Inter)</option>
          <option value="georgia">Classic (Georgia)</option>
        </select>
        <label className="text-sm font-medium mb-1.5 block mt-4">Spacing</label>
        <select
          value={spacing}
          onChange={(e) => setSpacing(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
        >
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </select>
        <button
          onClick={saveResume}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* ATS Score Modal */}
      {showAts && atsResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-background rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold">ATS Score</h3>
              <button
                onClick={() => setShowAts(false)}
                className="text-foreground/60 hover:text-foreground text-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6">
              {/* Score Circle */}
              <div className="text-center mb-6">
                <div
                  className={`text-6xl font-bold mb-2 ${
                    atsResult.score >= 80
                      ? "text-green-500"
                      : atsResult.score >= 60
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {atsResult.score}
                </div>
                <p className="text-foreground/60 text-sm">out of 100</p>
                <div className="w-full bg-border rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      atsResult.score >= 80
                        ? "bg-green-500"
                        : atsResult.score >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${atsResult.score}%` }}
                  />
                </div>
              </div>

              {/* Feedback */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">
                  ✅ What's working
                </h4>
                <ul className="flex flex-col gap-2">
                  {atsResult.feedback?.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-foreground/70 flex items-start gap-2"
                    >
                      <span className="text-green-500 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div>
                <h4 className="text-sm font-semibold mb-2">🔧 Improvements</h4>
                <ul className="flex flex-col gap-2">
                  {atsResult.improvements?.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-foreground/70 flex items-start gap-2"
                    >
                      <span className="text-accent mt-0.5">•</span>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-background rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold">Job Description Optimizer</h3>
              <button
                onClick={() => { setShowJobOptimizer(false); setJobResult(null) }}
                className="text-foreground/60 hover:text-foreground text-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6">
              {!jobResult ? (
                <>
                  <p className="text-sm text-foreground/60 mb-4">
                    Paste a job description below and we'll analyze how well your resume matches it.
                  </p>
                  <textarea
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={8}
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent transition-colors resize-none mb-4"
                  />
                  <button
                    onClick={optimizeForJob}
                    disabled={aiLoading || !jobDescription.trim()}
                    className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {aiLoading ? '⏳ Analyzing...' : '🔍 Analyze Match'}
                  </button>
                </>
              ) : (
                <>
                  {/* Match Score */}
                  <div className="text-center mb-6">
                    <div className={`text-6xl font-bold mb-2 ${
                      jobResult.matchScore >= 80 ? 'text-green-500' :
                      jobResult.matchScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {jobResult.matchScore}%
                    </div>
                    <p className="text-foreground/60 text-sm">match with job description</p>
                    <div className="w-full bg-border rounded-full h-2 mt-3">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          jobResult.matchScore >= 80 ? 'bg-green-500' :
                          jobResult.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${jobResult.matchScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  {jobResult.missingKeywords?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">🔑 Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {jobResult.missingKeywords.map((keyword, i) => (
                          <span
                            key={i}
                            className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2">💡 Suggestions</h4>
                    <ul className="flex flex-col gap-2">
                      {jobResult.suggestions?.map((item, i) => (
                        <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setJobResult(null)}
                    className="w-full border border-border py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors"
                  >
                    ← Try Another Job Description
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

</div>
        <div className={`flex-1 min-w-0 ${mobileView === "edit" ? "hidden md:block" : ""}`}>
          <div className="sticky top-8 border border-border rounded-xl overflow-hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div style={{ zoom: 0.6 }}>
              {(() => {
                const TemplateComponent = getTemplateComponent(resume.template);
                return <TemplateComponent content={previewContent} />;
              })()}
            </div>
          </div>
        </div>
      </div>
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
