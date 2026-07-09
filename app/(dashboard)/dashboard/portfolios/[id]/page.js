"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserEntitlements } from "@/lib/entitlements";
import { TOOLS_CATALOG } from "@/app/components/portfolio/toolsCatalog";
import BrandIcon from "@/app/components/portfolio/BrandIcon";
import Link from "next/link";

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function PortfolioEditor() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [skillsTools, setSkillsTools] = useState([]);
  const [toolSearch, setToolSearch] = useState("");
  const [customToolName, setCustomToolName] = useState("");
  const [pendingCustomIconUrl, setPendingCustomIconUrl] = useState("");
  const [customToolCategory, setCustomToolCategory] = useState(TOOLS_CATALOG[0].id);
  const [customSections, setCustomSections] = useState([]);
  const [uploadingCustomIcon, setUploadingCustomIcon] = useState(false);
  const [customIconError, setCustomIconError] = useState(null);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    tagline: "",
    bio: "",
    photoUrl: "",
  });
  const [services, setServices] = useState([]);
  const [experience, setExperience] = useState([]);
  const [tools, setTools] = useState([]);
  const [toolInput, setToolInput] = useState("");
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [contact, setContact] = useState({
    email: "",
    linkedin: "",
    website: "",
  });
  const [slugInput, setSlugInput] = useState("");
  const [sectionOrder, setSectionOrder] = useState([
    "services",
    "experience",
    "tools",
    "skillsTools",
    "customSections",
    "portfolioItems",
    "testimonials",
  ]);

  useEffect(() => {
    if (user?.id) {
      fetchPortfolio();
    }
  }, [user, id]);

  const fetchPortfolio = async () => {
    const { data, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      router.push("/dashboard/portfolios");
      return;
    }
    setPortfolio(data);
    setSlugInput(data.slug || "");
    if (data.content?.personalInfo) setPersonalInfo(data.content.personalInfo);
    if (data.content?.services) setServices(data.content.services);
    if (data.content?.experience) setExperience(data.content.experience);
    if (data.content?.tools) setTools(data.content.tools);
    if (data.content?.portfolioItems)
      setPortfolioItems(data.content.portfolioItems);
    if (data.content?.testimonials) setTestimonials(data.content.testimonials);
    if (data.content?.contact) setContact(data.content.contact);
    if (data.content?.sectionOrder) {
      let loadedOrder = data.content.sectionOrder;
      ["skillsTools", "customSections"].forEach((key) => {
        if (!loadedOrder.includes(key)) loadedOrder = [...loadedOrder, key];
      });
      setSectionOrder(loadedOrder);
    }
    if (data.content?.skillsTools) setSkillsTools(data.content.skillsTools);
    if (data.content?.customSections) setCustomSections(data.content.customSections);
    setLoading(false);
  };

  const updateTitle = (newTitle) => {
    setPortfolio({ ...portfolio, title: newTitle });
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
    const filePath = `${user.id}/portfolio-${Date.now()}.${fileExt}`;
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

  const isToolSelected = (slug) =>
    skillsTools.some((t) => t.type === "catalog" && t.slug === slug);

  const toggleCatalogTool = (categoryId, tool) => {
    setSkillsTools((prev) => {
      const exists = prev.some((t) => t.type === "catalog" && t.slug === tool.slug);
      if (exists) {
        return prev.filter((t) => !(t.type === "catalog" && t.slug === tool.slug));
      }
      return [...prev, { type: "catalog", categoryId, slug: tool.slug, name: tool.name }];
    });
  };

  const removeSkillTool = (index) => {
    setSkillsTools(skillsTools.filter((_, i) => i !== index));
  };

  const MAX_CUSTOM_ICON_SIZE = 500 * 1024; // 500KB
  const handleCustomIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCustomIconError(null);
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setCustomIconError("Only JPG or PNG images are allowed.");
      return;
    }
    if (file.size > MAX_CUSTOM_ICON_SIZE) {
      setCustomIconError("Icon must be under 500KB.");
      return;
    }
    setUploadingCustomIcon(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/custom-tool-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      setCustomIconError("Upload failed. Please try again.");
      setUploadingCustomIcon(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(filePath);
    setPendingCustomIconUrl(publicUrlData.publicUrl);
    setUploadingCustomIcon(false);
  };

  const addCustomTool = () => {
    if (!customToolName.trim() || !pendingCustomIconUrl) return;
    setSkillsTools([
      ...skillsTools,
      {
        type: "custom",
        categoryId: customToolCategory,
        name: customToolName.trim(),
        iconUrl: pendingCustomIconUrl,
      },
    ]);
    setCustomToolName("");
    setPendingCustomIconUrl("");
  };

  const addCustomSection = () => {
    setCustomSections([
      ...customSections,
      {
        id: `custom_${Date.now()}`,
        title: "Additional Information",
        items: [{ id: `item_${Date.now()}`, text: "" }],
      },
    ]);
  };
  const removeCustomSection = (sectionId) => {
    setCustomSections(customSections.filter((s) => s.id !== sectionId));
  };
  const updateCustomSectionTitle = (sectionId, title) => {
    setCustomSections(
      customSections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    );
  };
  const addCustomSectionItem = (sectionId) => {
    setCustomSections(
      customSections.map((s) =>
        s.id === sectionId
          ? { ...s, items: [...s.items, { id: `item_${Date.now()}`, text: "" }] }
          : s,
      ),
    );
  };
  const updateCustomSectionItem = (sectionId, itemId, text) => {
    setCustomSections(
      customSections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, text } : i)) }
          : s,
      ),
    );
  };
  const removeCustomSectionItem = (sectionId, itemId) => {
    setCustomSections(
      customSections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
          : s,
      ),
    );
  };

  const addService = () => {
    setServices([...services, { id: Date.now(), name: "", description: "" }]);
  };
  const updateService = (id, field, value) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };
  const removeService = (id) => {
    setServices(services.filter((s) => s.id !== id));
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

  const addTool = () => {
    if (toolInput.trim() && !tools.includes(toolInput.trim())) {
      setTools([...tools, toolInput.trim()]);
      setToolInput("");
    }
  };
  const removeTool = (tool) => {
    setTools(tools.filter((t) => t !== tool));
  };
  const handleToolKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTool();
    }
  };

  const addPortfolioItem = () => {
    setPortfolioItems([
      ...portfolioItems,
      { id: Date.now(), title: "", description: "", link: "" },
    ]);
  };
  const updatePortfolioItem = (id, field, value) => {
    setPortfolioItems(
      portfolioItems.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };
  const removePortfolioItem = (id) => {
    setPortfolioItems(portfolioItems.filter((p) => p.id !== id));
  };

  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      { id: Date.now(), name: "", role: "", quote: "" },
    ]);
  };
  const updateTestimonial = (id, field, value) => {
    setTestimonials(
      testimonials.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  };
  const removeTestimonial = (id) => {
    setTestimonials(testimonials.filter((t) => t.id !== id));
  };

  const updateContact = (field, value) => {
    setContact({ ...contact, [field]: value });
  };

  const moveSectionUp = (key) => {
    setSectionOrder((prev) => {
      const index = prev.indexOf(key);
      if (index <= 0) return prev;
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveSectionDown = (key) => {
    setSectionOrder((prev) => {
      const index = prev.indexOf(key);
      if (index === -1 || index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const savePortfolio = async () => {
    setSaving(true);
    const updatedContent = {
      ...portfolio.content,
      personalInfo,
      services,
      experience,
      tools,
      portfolioItems,
      testimonials,
      contact,
      sectionOrder,
      skillsTools,
      customSections,
    };
    await supabase
      .from("portfolios")
      .update({
        title: portfolio.title,
        content: updatedContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    setPortfolio({ ...portfolio, content: updatedContent });
    setSaving(false);
  };

  const handlePublishClick = async () => {
    const entitlements = await getUserEntitlements(user.id);

    const { count, error: countError } = await supabase
      .from("portfolios")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_published", true);

    if (countError) {
      setPublishError(
        "Something went wrong checking your plan. Please try again.",
      );
      return;
    }

    if (count >= entitlements.totalPublishSlots) {
      setShowPaywallModal(true);
      return;
    }

    publishPortfolio();
  };

  const publishPortfolio = async () => {
    setPublishError(null);
    const finalSlug = slugify(slugInput || portfolio.title);

    if (!finalSlug) {
      setPublishError("Please enter a valid URL slug before publishing.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("portfolios")
      .update({
        slug: finalSlug,
        is_published: true,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        setPublishError(
          "That URL is already taken. Please choose a different one.",
        );
      } else {
        setPublishError(
          "Something went wrong publishing your portfolio. Please try again.",
        );
      }
      setSaving(false);
      return;
    }

    setPortfolio({ ...portfolio, slug: finalSlug, is_published: true });
    setSlugInput(finalSlug);
    setSaving(false);
  };

  const unpublishPortfolio = async () => {
    setSaving(true);
    await supabase
      .from("portfolios")
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .eq("id", id);
    setPortfolio({ ...portfolio, is_published: false });
    setSaving(false);
  };

  const copyPortfolioLink = async () => {
    const url = `https://forgecv.com/p/${portfolio.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      // Clipboard API unavailable; user can still tap/select the link manually
    }
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
          value={portfolio.title}
          onChange={(e) => updateTitle(e.target.value)}
          onBlur={savePortfolio}
          className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:border-b focus:border-accent"
        />
        <button
          onClick={savePortfolio}
          disabled={saving}
          className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Personal Info Section */}
      <div className="border border-border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Personal Info</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            <label className="text-sm font-medium mb-1.5 block">Tagline</label>
            <input
              type="text"
              placeholder="Medical Virtual Assistant | 5+ Years Experience"
              value={personalInfo.tagline}
              onChange={(e) => updatePersonalInfo("tagline", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <label className="text-sm font-medium mb-1.5 block">Bio</label>
        <textarea
          placeholder="Tell clients about yourself..."
          value={personalInfo.bio}
          onChange={(e) => updatePersonalInfo("bio", e.target.value)}
          rows={4}
          className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent transition-colors resize-none"
        />

        <label className="text-sm font-medium mb-1.5 block mt-4">
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

        <button
          onClick={savePortfolio}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
        </div>
      <div className="flex flex-col">
      {/* Services Section */}
        <div className="border border-border rounded-xl p-6 mb-6" style={{ order: sectionOrder.indexOf("services") }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Services Offered</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveSectionUp("services")}
                disabled={sectionOrder.indexOf("services") === 0}
                className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
                aria-label="Move section up"
              >
                ↑
              </button>
              <button
                onClick={() => moveSectionDown("services")}
                disabled={sectionOrder.indexOf("services") === sectionOrder.length - 1}
                className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
                aria-label="Move section down"
              >
                ↓
              </button>
            </div>
            <button
              onClick={addService}
              className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors"
            >
              + Add Service
            </button>
          </div>
        </div>

        {services.length === 0 && (
          <p className="text-sm text-foreground/40 text-center py-6">
            No services added yet
          </p>
        )}

        <div className="flex flex-col gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="border border-border rounded-lg p-4 relative"
            >
              <button
                onClick={() => removeService(service.id)}
                className="absolute top-3 right-3 text-foreground/40 hover:text-red-500 text-sm"
              >
                ✕
              </button>
              <label className="text-sm font-medium mb-1.5 block">
                Service Name
              </label>
              <input
                type="text"
                placeholder="Inbox & Calendar Management"
                value={service.name}
                onChange={(e) =>
                  updateService(service.id, "name", e.target.value)
                }
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors mb-3"
              />
              <label className="text-sm font-medium mb-1.5 block">
                Description
              </label>
              <textarea
                placeholder="Briefly describe this service..."
                value={service.description}
                onChange={(e) =>
                  updateService(service.id, "description", e.target.value)
                }
                rows={2}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
          ))}
        </div>

        <button
          onClick={savePortfolio}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Work Experience Section */}
      <div className="border border-border rounded-xl p-6 mb-6" style={{ order: sectionOrder.indexOf("experience") }}>
      <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Work Experience</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveSectionUp("experience")}
                disabled={sectionOrder.indexOf("experience") === 0}
                className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
                aria-label="Move section up"
              >
                ↑
              </button>
              <button
                onClick={() => moveSectionDown("experience")}
                disabled={sectionOrder.indexOf("experience") === sectionOrder.length - 1}
                className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
                aria-label="Move section down"
              >
                ↓
              </button>
            </div>
            <button
              onClick={addExperience}
              className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors"
            >
              + Add Experience
            </button>
          </div>
        </div>

        {experience.length === 0 && (
          <p className="text-sm text-foreground/40 text-center py-6">
            No work experience added yet
          </p>
        )}

        <div className="flex flex-col gap-4">
          {experience.map((exp) => (
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
          onClick={savePortfolio}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Tools & Skills Section */}
      <div className="border border-border rounded-xl p-6 mb-6" style={{ order: sectionOrder.indexOf("tools") }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Tools & Skills</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveSectionUp("tools")}
                disabled={sectionOrder.indexOf("tools") === 0}
                className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
                aria-label="Move section up"
              >
                ↑
              </button>
              <button
                onClick={() => moveSectionDown("tools")}
                disabled={sectionOrder.indexOf("tools") === sectionOrder.length - 1}
                className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
                aria-label="Move section down"
              >
                ↓
              </button>
            </div>
          </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Type a tool or skill and press Enter"
            value={toolInput}
            onChange={(e) => setToolInput(e.target.value)}
            onKeyDown={handleToolKeyDown}
            className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={addTool}
            className="border border-border px-4 py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors"
          >
            Add
          </button>
        </div>

        {tools.length === 0 ? (
          <p className="text-sm text-foreground/40 text-center py-4">
            No tools added yet
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool}
                className="bg-accent/10 text-accent text-sm px-3 py-1.5 rounded-full flex items-center gap-2"
              >
                {tool}
                <button
                  onClick={() => removeTool(tool)}
                  className="hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <button
          onClick={savePortfolio}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium block"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Skills & Tools Icon Grid Section */}
      <div className="border border-border rounded-xl p-6 mb-6" style={{ order: sectionOrder.indexOf("skillsTools") }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-lg">Skills & Tools I Use</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => moveSectionUp("skillsTools")}
              disabled={sectionOrder.indexOf("skillsTools") === 0}
              className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
              aria-label="Move section up"
            >
              ↑
            </button>
            <button
              onClick={() => moveSectionDown("skillsTools")}
              disabled={sectionOrder.indexOf("skillsTools") === sectionOrder.length - 1}
              className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
              aria-label="Move section down"
            >
              ↓
            </button>
          </div>
        </div>
        <p className="text-sm text-foreground/60 mb-4">
          Pick the tools you use — shown as a categorized icon grid on your public portfolio.
        </p>

        <input
          type="text"
          placeholder="Search tools (e.g. Canva, Slack, Excel)..."
          value={toolSearch}
          onChange={(e) => setToolSearch(e.target.value)}
          className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors mb-4"
        />

        <div className="flex flex-col gap-5">
          {TOOLS_CATALOG.map((category) => {
            const filteredTools = category.tools.filter((tool) =>
              tool.name.toLowerCase().includes(toolSearch.toLowerCase())
            );
            if (toolSearch && filteredTools.length === 0) return null;
            return (
              <div key={category.id}>
                <h3 className="text-sm font-semibold text-foreground/70 mb-2">
                  {category.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {filteredTools.map((tool) => {
                    const selected = isToolSelected(tool.slug);
                    return (
                      <button
                        key={tool.slug}
                        type="button"
                        onClick={() => toggleCatalogTool(category.id, tool)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                          selected
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <BrandIcon slug={tool.slug} size={16} />
                        {tool.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom tool (not in catalog) */}
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground/70 mb-2">
            Can't find your tool? Add it manually
          </h3>
          <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
            <input
              type="text"
              placeholder="Tool name"
              value={customToolName}
              onChange={(e) => setCustomToolName(e.target.value)}
              className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
            />
            <select
              value={customToolCategory}
              onChange={(e) => setCustomToolCategory(e.target.value)}
              className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
            >
              {TOOLS_CATALOG.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleCustomIconUpload}
              disabled={uploadingCustomIcon}
              className="text-sm"
            />
            {pendingCustomIconUrl && (
              <img src={pendingCustomIconUrl} alt="" className="w-6 h-6 rounded" />
            )}
            <button
              type="button"
              onClick={addCustomTool}
              disabled={!customToolName.trim() || !pendingCustomIconUrl}
              className="border border-border px-4 py-2 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
            >
              Add
            </button>
          </div>
          {uploadingCustomIcon && (
            <p className="text-xs text-foreground/60 mt-2">Uploading icon...</p>
          )}
          {customIconError && (
            <p className="text-xs text-red-500 mt-2">{customIconError}</p>
          )}
          <p className="text-xs text-foreground/40 mt-2">Icon must be JPG or PNG, under 500KB.</p>
        </div>

        {/* Selected tools preview */}
        {skillsTools.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground/70 mb-2">
              Selected ({skillsTools.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillsTools.map((tool, index) => (
                <span
                  key={`${tool.type}-${tool.slug || tool.name}-${index}`}
                  className="flex items-center gap-2 bg-accent/10 text-accent text-sm px-3 py-1.5 rounded-full"
                >
                  {tool.type === "catalog" ? (
                    <BrandIcon slug={tool.slug} size={16} />
                  ) : (
                    <img src={tool.iconUrl} alt="" className="w-4 h-4" />
                  )}
                  {tool.name}
                  <button onClick={() => removeSkillTool(index)} className="hover:text-red-500">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={savePortfolio}
          disabled={saving}
          className="mt-6 text-sm text-accent hover:underline font-medium block"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Custom "Additional Information" Sections */}
      <div className="border border-border rounded-xl p-6 mb-6" style={{ order: sectionOrder.indexOf("customSections") }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Additional Information</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveSectionUp("customSections")}
                disabled={sectionOrder.indexOf("customSections") === 0}
                className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
                aria-label="Move section up"
              >
                ↑
              </button>
              <button
                onClick={() => moveSectionDown("customSections")}
                disabled={sectionOrder.indexOf("customSections") === sectionOrder.length - 1}
                className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
                aria-label="Move section down"
              >
                ↓
              </button>
            </div>
            <button
              onClick={addCustomSection}
              className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors"
            >
              + Add Section
            </button>
          </div>
        </div>

        {customSections.length === 0 && (
          <p className="text-sm text-foreground/40 text-center py-6">
            No additional sections added yet
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
              <label className="text-sm font-medium mb-1.5 block">Section Title</label>
              <input
                type="text"
                placeholder="e.g. Certifications, Languages, Availability"
                value={section.title}
                onChange={(e) => updateCustomSectionTitle(section.id, e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors mb-3"
              />

              <label className="text-sm font-medium mb-1.5 block">Items</label>
              <div className="flex flex-col gap-2 mb-3">
                {section.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. HIPAA Certified Virtual Assistant"
                      value={item.text}
                      onChange={(e) =>
                        updateCustomSectionItem(section.id, item.id, e.target.value)
                      }
                      className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      onClick={() => removeCustomSectionItem(section.id, item.id)}
                      className="text-foreground/40 hover:text-red-500 text-sm px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addCustomSectionItem(section.id)}
                className="text-xs text-accent hover:underline font-medium"
              >
                + Add Item
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={savePortfolio}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Portfolio Samples Section */}
      <div className="border border-border rounded-xl p-6 mb-6" style={{ order: sectionOrder.indexOf("portfolioItems") }}>
      <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Portfolio Samples</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveSectionUp("portfolioItems")}
                disabled={sectionOrder.indexOf("portfolioItems") === 0}
                className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
                aria-label="Move section up"
              >
                ↑
              </button>
              <button
                onClick={() => moveSectionDown("portfolioItems")}
                disabled={sectionOrder.indexOf("portfolioItems") === sectionOrder.length - 1}
                className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
                aria-label="Move section down"
              >
                ↓
              </button>
            </div>
            <button
              onClick={addPortfolioItem}
              className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors"
            >
              + Add Sample
            </button>
          </div>
        </div>

        {portfolioItems.length === 0 && (
          <p className="text-sm text-foreground/40 text-center py-6">
            No samples added yet
          </p>
        )}

        <div className="flex flex-col gap-4">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-lg p-4 relative"
            >
              <button
                onClick={() => removePortfolioItem(item.id)}
                className="absolute top-3 right-3 text-foreground/40 hover:text-red-500 text-sm"
              >
                ✕
              </button>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <input
                type="text"
                placeholder="E-commerce Product Descriptions"
                value={item.title}
                onChange={(e) =>
                  updatePortfolioItem(item.id, "title", e.target.value)
                }
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors mb-3"
              />
              <label className="text-sm font-medium mb-1.5 block">
                Description
              </label>
              <textarea
                placeholder="Briefly describe this piece of work..."
                value={item.description}
                onChange={(e) =>
                  updatePortfolioItem(item.id, "description", e.target.value)
                }
                rows={2}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors resize-none mb-3"
              />
              <label className="text-sm font-medium mb-1.5 block">
                Link (optional)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={item.link}
                onChange={(e) =>
                  updatePortfolioItem(item.id, "link", e.target.value)
                }
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}
        </div>

        <button
          onClick={savePortfolio}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Testimonials Section */}
      <div className="border border-border rounded-xl p-6 mb-6" style={{ order: sectionOrder.indexOf("testimonials") }}>
      <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Testimonials (optional)</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveSectionUp("testimonials")}
                disabled={sectionOrder.indexOf("testimonials") === 0}
                className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
                aria-label="Move section up"
              >
                ↑
              </button>
              <button
                onClick={() => moveSectionDown("testimonials")}
                disabled={sectionOrder.indexOf("testimonials") === sectionOrder.length - 1}
                className="text-foreground/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed text-sm px-1"
                aria-label="Move section down"
              >
                ↓
              </button>
            </div>
            <button
              onClick={addTestimonial}
              className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors"
            >
              + Add Testimonial
            </button>
          </div>
        </div>

        {testimonials.length === 0 && (
          <p className="text-sm text-foreground/40 text-center py-6">
            No testimonials added yet
          </p>
        )}

        <div className="flex flex-col gap-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="border border-border rounded-lg p-4 relative"
            >
              <button
                onClick={() => removeTestimonial(t.id)}
                className="absolute top-3 right-3 text-foreground/40 hover:text-red-500 text-sm"
              >
                ✕
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Maria Santos"
                    value={t.name}
                    onChange={(e) =>
                      updateTestimonial(t.id, "name", e.target.value)
                    }
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Role / Company
                  </label>
                  <input
                    type="text"
                    placeholder="Founder, ABC Store"
                    value={t.role}
                    onChange={(e) =>
                      updateTestimonial(t.id, "role", e.target.value)
                    }
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              <label className="text-sm font-medium mb-1.5 block">Quote</label>
              <textarea
                placeholder="What did they say about your work?"
                value={t.quote}
                onChange={(e) =>
                  updateTestimonial(t.id, "quote", e.target.value)
                }
                rows={2}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
          ))}
        </div>

        <button
            onClick={savePortfolio}
            disabled={saving}
            className="mt-4 text-sm text-accent hover:underline font-medium"
          >
            {saving ? "Saving..." : "Save section"}
            </button>
        </div>
        </div>
        {/* Contact Section */}
        <div className="border border-border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Contact & Socials</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input
              type="email"
              placeholder="juan@example.com"
              value={contact.email}
              onChange={(e) => updateContact("email", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">LinkedIn</label>
            <input
              type="text"
              placeholder="linkedin.com/in/juandelacruz"
              value={contact.linkedin}
              onChange={(e) => updateContact("linkedin", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1.5 block">
              Website (optional)
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={contact.website}
              onChange={(e) => updateContact("website", e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <button
          onClick={savePortfolio}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Publish Section */}
      <div className="border border-border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Publish</h2>

        <label className="text-sm font-medium mb-1.5 block">
          Portfolio URL
        </label>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-foreground/40">forgecv.com/p/</span>
          <input
            type="text"
            placeholder="your-name"
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value)}
            className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {publishError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {publishError}
          </div>
        )}

{portfolio.is_published ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium">
                  ✓ Published
                </span>
                <button
                  onClick={unpublishPortfolio}
                  disabled={saving}
                  className="text-sm text-foreground/60 hover:text-red-500 font-medium"
                >
                  Unpublish
                </button>
              </div>

              <label className="text-sm font-medium mb-1.5 block">
                Here's your live portfolio link
              </label>
              <div className="flex items-center gap-2">
                <a href={`https://forgecv.com/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer" className="flex-1 border border-border rounded-lg px-4 py-2.5 text-sm bg-background text-accent hover:underline truncate">
                  forgecv.com/p/{portfolio.slug}
                </a>
                <button
                  onClick={copyPortfolioLink}
                  className="border border-border px-4 py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors whitespace-nowrap"
                >
                  {linkCopied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          ) : (
          <button
            onClick={handlePublishClick}
            disabled={saving}
            className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Publishing..." : "Publish Portfolio"}
          </button>
        )}
        </div>
  
        {showPaywallModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-background border border-border rounded-xl p-8 max-w-md w-full">
              <h3 className="text-xl font-bold mb-2">Ready to go live?</h3>
              <p className="text-foreground/60 text-sm mb-6">
                You've used all your available portfolio publish slots. Upgrade your plan or grab a one-time slot to publish this portfolio.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/pricing"
                  className="bg-accent text-white text-center py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  View Plans
                </Link>
                <button
                  onClick={() => setShowPaywallModal(false)}
                  className="text-foreground/60 text-sm font-medium py-2"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}
