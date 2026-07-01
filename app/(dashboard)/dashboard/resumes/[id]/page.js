"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import ResumePreview from "@/app/components/resume/ResumePreview";
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
  });

  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAts, setShowAts] = useState(false);
  const [atsResult, setAtsResult] = useState(null);

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
    setLoading(false);
  };

  const updateTitle = (newTitle) => {
    setResume({ ...resume, title: newTitle });
  };

  const updatePersonalInfo = (field, value) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
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

  const saveResume = async () => {
    setSaving(true);
    const updatedContent = {
      ...resume.content,
      personalInfo,
      summary,
      experience,
      education,
      skills,
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

  return (
    <div className="px-8 py-8 max-w-4xl">
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
            onClick={() => setShowPreview(true)}
            className="border border-border px-5 py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors"
          >
            Preview & Download
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

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 no-print">
          <div className="bg-background rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background">
              <h3 className="font-semibold">Resume Preview</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  🖨️ Print / Save as PDF
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-foreground/60 hover:text-foreground text-sm"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <ResumePreview
              content={{ personalInfo, summary, experience, education, skills }}
            />
          </div>
        </div>
      )}

      {showPreview && (
        <PrintPortal>
          <div id="print-only-resume">
            <ResumePreview
              content={{ personalInfo, summary, experience, education, skills }}
            />
          </div>
        </PrintPortal>
      )}
    </div>
  );
}
