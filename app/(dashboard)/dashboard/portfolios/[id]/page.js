"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserEntitlements } from "@/lib/entitlements";
import { TOOLS_CATALOG } from "@/app/components/portfolio/toolsCatalog";
import { getPortfolioTheme } from "@/app/components/portfolio/portfolioThemes";
import BrandIcon from "@/app/components/portfolio/BrandIcon";
import PublicPortfolio from "@/app/components/portfolio/PublicPortfolio";
import Link from "next/link";
import PortfolioPreviewPanel from "@/app/components/ui/PortfolioPreviewPanel";

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

const PlusIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" /><path d="M12 5v14" />
  </svg>
);

const LoaderIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
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

const GlobeIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const CopyIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
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

const UnpublishIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><line x1="15" x2="9" y1="9" y2="15" /><line x1="9" x2="15" y1="9" y2="15" />
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

const SectionCard = ({ title, children, actionButton, emptyState, sectionKey, sectionOrder, onMoveUp, onMoveDown }) => {
  const orderIndex = sectionOrder.indexOf(sectionKey);
  const isFirst = orderIndex === 0;
  const isLast = orderIndex === sectionOrder.length - 1;
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
  const [accentColor, setAccentColor] = useState("");
  const [fontStyle, setFontStyle] = useState("sans");
  const [photoShape, setPhotoShape] = useState("circle");
  const [mobileView, setMobileView] = useState("edit");
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
    if (data.content?.portfolioItems) setPortfolioItems(data.content.portfolioItems);
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
    if (data.content?.customization?.accentColor) setAccentColor(data.content.customization.accentColor);
    if (data.content?.customization?.fontStyle) setFontStyle(data.content.customization.fontStyle);
    if (data.content?.customization?.photoShape) setPhotoShape(data.content.customization.photoShape);
    setLoading(false);
  };

  const updateTitle = (newTitle) => {
    setPortfolio({ ...portfolio, title: newTitle });
  };

  const updatePersonalInfo = (field, value) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
  };

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

  const MAX_CUSTOM_ICON_SIZE = 500 * 1024;

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
      customization: { accentColor, fontStyle, photoShape },
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
      // Clipboard API unavailable
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <p className="text-foreground/60">Loading...</p>
      </div>
    );
  }

  const theme = getPortfolioTheme(portfolio.template);

  const previewPortfolio = {
    template: portfolio.template,
    slug: portfolio.slug,
    content: {
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
      customization: { accentColor, fontStyle, photoShape },
    },
  };

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

      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        <div className={`w-full xl:max-w-2xl xl:w-auto ${mobileView === "preview" ? "hidden xl:block" : ""}`}>
          <div className="mb-8">
            <input
              type="text"
              value={portfolio.title}
              onChange={(e) => updateTitle(e.target.value)}
              onBlur={savePortfolio}
              className="text-2xl sm:text-3xl font-bold bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none transition-colors pb-1 w-full mb-4"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={savePortfolio}
                disabled={saving}
                className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-accent/10 hover:shadow-accent/20"
              >
                {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            <h2 className="font-semibold text-lg tracking-tight mb-5">Personal Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input label="Full Name" type="text" placeholder="Juan Dela Cruz" value={personalInfo.fullName} onChange={(e) => updatePersonalInfo("fullName", e.target.value)} />
              <Input label="Tagline" type="text" placeholder="Medical Virtual Assistant | 5+ Years Experience" value={personalInfo.tagline} onChange={(e) => updatePersonalInfo("tagline", e.target.value)} />
            </div>
            <TextArea label="Bio" placeholder="Tell clients about yourself..." value={personalInfo.bio} onChange={(e) => updatePersonalInfo("bio", e.target.value)} rows={4} />

            <label className="text-sm font-medium mb-1.5 block text-foreground/80 mt-4">Profile Photo (JPG/PNG, max 2MB)</label>
            <div className="flex flex-wrap items-center gap-3">
              {personalInfo.photoUrl && (
                <img src={personalInfo.photoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-border shrink-0" />
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

            <button onClick={savePortfolio} disabled={saving} className="mt-5 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
              {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>

          <div className="flex flex-col">
            <SectionCard
              title="Services Offered"
              sectionKey="services"
              sectionOrder={sectionOrder}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              actionButton={
                <button onClick={addService} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors flex items-center gap-1">
                  <PlusIcon /> Add Service
                </button>
              }
              emptyState={services.length === 0 && (
                <p className="text-sm text-foreground/40 text-center py-8">No services added yet</p>
              )}
            >
              <div className="flex flex-col gap-4">
                {services.map((service) => (
                  <div key={service.id} className="bg-muted/30 border border-border rounded-xl p-4 relative group">
                    <button onClick={() => removeService(service.id)} className="absolute top-3 right-3 text-foreground/30 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                      <XIcon />
                    </button>
                    <div className="pr-8">
                      <Input label="Service Name" type="text" placeholder="Inbox & Calendar Management" value={service.name} onChange={(e) => updateService(service.id, "name", e.target.value)} />
                      <div className="mt-3">
                        <TextArea label="Description" placeholder="Briefly describe this service..." value={service.description} onChange={(e) => updateService(service.id, "description", e.target.value)} rows={2} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={savePortfolio} disabled={saving} className="mt-4 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                {saving ? "Saving..." : "Save section"}
              </button>
            </SectionCard>

            <SectionCard
              title="Work Experience"
              sectionKey="experience"
              sectionOrder={sectionOrder}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              actionButton={
                <button onClick={addExperience} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors flex items-center gap-1">
                  <PlusIcon /> Add Experience
                </button>
              }
              emptyState={experience.length === 0 && (
                <p className="text-sm text-foreground/40 text-center py-8">No work experience added yet</p>
              )}
            >
              <div className="flex flex-col gap-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="bg-muted/30 border border-border rounded-xl p-4 relative group">
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
              <button onClick={savePortfolio} disabled={saving} className="mt-4 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                {saving ? "Saving..." : "Save section"}
              </button>
            </SectionCard>

            <SectionCard
              title="Tools & Skills"
              sectionKey="tools"
              sectionOrder={sectionOrder}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              actionButton={null}
            >
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Type a tool or skill and press Enter"
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  onKeyDown={handleToolKeyDown}
                  className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                />
                <button onClick={addTool} className="border border-border px-4 py-2.5 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-all">
                  Add
                </button>
              </div>
              {tools.length === 0 ? (
                <p className="text-sm text-foreground/40 text-center py-4">No tools added yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <span key={tool} className="bg-accent/10 text-accent text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                      {tool}
                      <button onClick={() => removeTool(tool)} className="hover:text-red-500 transition-colors">
                        <XIcon />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <button onClick={savePortfolio} disabled={saving} className="mt-4 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                {saving ? "Saving..." : "Save section"}
              </button>
            </SectionCard>

            <SectionCard
              title="Skills & Tools I Use"
              sectionKey="skillsTools"
              sectionOrder={sectionOrder}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              actionButton={null}
            >
              <p className="text-sm text-foreground/60 mb-4">Pick the tools you use — shown as a categorized icon grid on your public portfolio.</p>
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                <input
                  type="text"
                  placeholder="Search tools (e.g. Canva, Slack, Excel)..."
                  value={toolSearch}
                  onChange={(e) => setToolSearch(e.target.value)}
                  className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                />
              </div>

              <div className="flex flex-col gap-5">
                {TOOLS_CATALOG.map((category) => {
                  const filteredTools = category.tools.filter((tool) =>
                    tool.name.toLowerCase().includes(toolSearch.toLowerCase())
                  );
                  if (toolSearch && filteredTools.length === 0) return null;
                  return (
                    <div key={category.id}>
                      <h3 className="text-sm font-semibold text-foreground/70 mb-2">{category.label}</h3>
                      <div className="flex flex-wrap gap-2">
                        {filteredTools.map((tool) => {
                          const selected = isToolSelected(tool.slug);
                          return (
                            <button
                              key={tool.slug}
                              type="button"
                              onClick={() => toggleCatalogTool(category.id, tool)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
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

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground/70 mb-2">Can&apos;t find your tool? Add it manually</h3>
                <div className="flex flex-col md:flex-row gap-2 items-start md:items-center flex-wrap">
                  <input
                    type="text"
                    placeholder="Tool name"
                    value={customToolName}
                    onChange={(e) => setCustomToolName(e.target.value)}
                    className="border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                  />
                  <select
                    value={customToolCategory}
                    onChange={(e) => setCustomToolCategory(e.target.value)}
                    className="border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                  >
                    {TOOLS_CATALOG.map((category) => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </select>
                  <input type="file" accept="image/jpeg,image/png" onChange={handleCustomIconUpload} disabled={uploadingCustomIcon} className="text-sm" />
                  {pendingCustomIconUrl && (
                    <img src={pendingCustomIconUrl} alt="" className="w-6 h-6 rounded" />
                  )}
                  <button
                    type="button"
                    onClick={addCustomTool}
                    disabled={!customToolName.trim() || !pendingCustomIconUrl}
                    className="border border-border px-4 py-2 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-all disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
                {uploadingCustomIcon && <p className="text-xs text-foreground/60 mt-2">Uploading icon...</p>}
                {customIconError && <p className="text-xs text-red-500 mt-2">{customIconError}</p>}
                <p className="text-xs text-foreground/40 mt-2">Icon must be JPG or PNG, under 500KB.</p>
              </div>

              {skillsTools.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground/70 mb-2">Selected ({skillsTools.length})</h3>
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
                        <button onClick={() => removeSkillTool(index)} className="hover:text-red-500 transition-colors">
                          <XIcon />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={savePortfolio} disabled={saving} className="mt-6 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                {saving ? "Saving..." : "Save section"}
              </button>
            </SectionCard>

            <SectionCard
              title="Additional Information"
              sectionKey="customSections"
              sectionOrder={sectionOrder}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              actionButton={
                <button onClick={addCustomSection} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors flex items-center gap-1">
                  <PlusIcon /> Add Section
                </button>
              }
              emptyState={customSections.length === 0 && (
                <p className="text-sm text-foreground/40 text-center py-8">No additional sections added yet</p>
              )}
            >
              <div className="flex flex-col gap-4">
                {customSections.map((section) => (
                  <div key={section.id} className="bg-muted/30 border border-border rounded-xl p-4 relative group">
                    <button onClick={() => removeCustomSection(section.id)} className="absolute top-3 right-3 text-foreground/30 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                      <XIcon />
                    </button>
                    <div className="pr-8">
                      <Input label="Section Title" type="text" placeholder="e.g. Certifications, Languages, Availability" value={section.title} onChange={(e) => updateCustomSectionTitle(section.id, e.target.value)} />
                      <div className="flex flex-col gap-2 mt-3">
                        {section.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="e.g. HIPAA Certified Virtual Assistant"
                              value={item.text}
                              onChange={(e) => updateCustomSectionItem(section.id, item.id, e.target.value)}
                              className="flex-1 border border-border rounded-xl px-4 py-2 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                            />
                            <button onClick={() => removeCustomSectionItem(section.id, item.id)} className="text-foreground/30 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                              <XIcon />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => addCustomSectionItem(section.id)} className="mt-2 text-xs text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1">
                        <PlusIcon /> Add Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={savePortfolio} disabled={saving} className="mt-4 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                {saving ? "Saving..." : "Save section"}
              </button>
            </SectionCard>

            <SectionCard
              title="Portfolio Samples"
              sectionKey="portfolioItems"
              sectionOrder={sectionOrder}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              actionButton={
                <button onClick={addPortfolioItem} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors flex items-center gap-1">
                  <PlusIcon /> Add Sample
                </button>
              }
              emptyState={portfolioItems.length === 0 && (
                <p className="text-sm text-foreground/40 text-center py-8">No samples added yet</p>
              )}
            >
              <div className="flex flex-col gap-4">
                {portfolioItems.map((item) => (
                  <div key={item.id} className="bg-muted/30 border border-border rounded-xl p-4 relative group">
                    <button onClick={() => removePortfolioItem(item.id)} className="absolute top-3 right-3 text-foreground/30 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                      <XIcon />
                    </button>
                    <div className="pr-8">
                      <Input label="Title" type="text" placeholder="E-commerce Product Descriptions" value={item.title} onChange={(e) => updatePortfolioItem(item.id, "title", e.target.value)} />
                      <div className="mt-3">
                        <TextArea label="Description" placeholder="Briefly describe this piece of work..." value={item.description} onChange={(e) => updatePortfolioItem(item.id, "description", e.target.value)} rows={2} />
                      </div>
                      <div className="mt-3">
                        <Input label="Link (optional)" type="text" placeholder="https://..." value={item.link} onChange={(e) => updatePortfolioItem(item.id, "link", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={savePortfolio} disabled={saving} className="mt-4 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                {saving ? "Saving..." : "Save section"}
              </button>
            </SectionCard>

            <SectionCard
              title="Testimonials"
              sectionKey="testimonials"
              sectionOrder={sectionOrder}
              onMoveUp={moveSectionUp}
              onMoveDown={moveSectionDown}
              actionButton={
                <button onClick={addTestimonial} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors flex items-center gap-1">
                  <PlusIcon /> Add Testimonial
                </button>
              }
              emptyState={testimonials.length === 0 && (
                <p className="text-sm text-foreground/40 text-center py-8">No testimonials added yet</p>
              )}
            >
              <div className="flex flex-col gap-4">
                {testimonials.map((t) => (
                  <div key={t.id} className="bg-muted/30 border border-border rounded-xl p-4 relative group">
                    <button onClick={() => removeTestimonial(t.id)} className="absolute top-3 right-3 text-foreground/30 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                      <XIcon />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 pr-8">
                      <Input label="Name" type="text" placeholder="Maria Santos" value={t.name} onChange={(e) => updateTestimonial(t.id, "name", e.target.value)} />
                      <Input label="Role / Company" type="text" placeholder="Founder, ABC Store" value={t.role} onChange={(e) => updateTestimonial(t.id, "role", e.target.value)} />
                    </div>
                    <TextArea label="Quote" placeholder="What did they say about your work?" value={t.quote} onChange={(e) => updateTestimonial(t.id, "quote", e.target.value)} rows={2} />
                  </div>
                ))}
              </div>
              <button onClick={savePortfolio} disabled={saving} className="mt-4 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
                {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
                {saving ? "Saving..." : "Save section"}
              </button>
            </SectionCard>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            <h2 className="font-semibold text-lg tracking-tight mb-5">Contact & Socials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Email" type="email" placeholder="juan@example.com" value={contact.email} onChange={(e) => updateContact("email", e.target.value)} />
              <Input label="LinkedIn" type="text" placeholder="linkedin.com/in/juandelacruz" value={contact.linkedin} onChange={(e) => updateContact("linkedin", e.target.value)} />
              <div className="md:col-span-2">
                <Input label="Website (optional)" type="text" placeholder="https://..." value={contact.website} onChange={(e) => updateContact("website", e.target.value)} />
              </div>
            </div>
            <button onClick={savePortfolio} disabled={saving} className="mt-5 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
              {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            <h2 className="font-semibold text-lg tracking-tight mb-5">Customization</h2>
            <label className="text-sm font-medium mb-1.5 block text-foreground/80">Accent Color</label>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <input
                type="color"
                value={accentColor || theme.accent}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-12 h-12 border border-border rounded-xl cursor-pointer"
              />
              <span className="text-sm text-foreground/60 font-mono">{accentColor || `${theme.accent} (default)`}</span>
              {accentColor && (
                <button onClick={() => setAccentColor("")} className="text-sm text-accent hover:text-accent-hover font-medium transition-colors">
                  Reset to default
                </button>
              )}
            </div>
            <label className="text-sm font-medium mb-1.5 block text-foreground/80">Font Style</label>
            <select
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all mb-4"
            >
              <option value="sans">Modern (Sans-serif)</option>
              <option value="serif">Classic (Serif)</option>
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
            <button onClick={savePortfolio} disabled={saving} className="mt-5 text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1.5">
              {saving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
              {saving ? "Saving..." : "Save section"}
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 mb-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
            <h2 className="font-semibold text-lg tracking-tight mb-5">Publish</h2>
            <label className="text-sm font-medium mb-1.5 block text-foreground/80">Portfolio URL</label>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-foreground/40 whitespace-nowrap">forgecv.com/p/</span>
              <input
                type="text"
                placeholder="your-name"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
              />
            </div>

            {publishError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {publishError}
              </div>
            )}

            {portfolio.is_published ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
                    <CheckIcon /> Published
                  </span>
                  <button
                    onClick={unpublishPortfolio}
                    disabled={saving}
                    className="text-sm text-foreground/60 hover:text-red-500 font-medium transition-colors flex items-center gap-1"
                  >
                    <UnpublishIcon /> Unpublish
                  </button>
                </div>
                <label className="text-sm font-medium mb-1.5 block text-foreground/80">Here&apos;s your live portfolio link</label>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://forgecv.com/p/${portfolio.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-background text-accent hover:underline truncate flex items-center gap-2"
                  >
                    <GlobeIcon /> forgecv.com/p/{portfolio.slug}
                  </a>
                  <button
                    onClick={copyPortfolioLink}
                    className="border border-border px-4 py-2.5 rounded-xl text-sm font-medium hover:border-accent hover:text-accent transition-all whitespace-nowrap flex items-center gap-1.5"
                  >
                    <CopyIcon /> {linkCopied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handlePublishClick}
                disabled={saving}
                className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-accent/10 hover:shadow-accent/20"
              >
                <GlobeIcon />
                {saving ? "Publishing..." : "Publish Portfolio"}
              </button>
            )}
          </div>
        </div>

        <div className={`w-full xl:flex-1 xl:min-w-0 ${mobileView === "edit" ? "hidden xl:block" : ""}`}>
          <div className="sticky top-6 md:top-8 h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] flex flex-col">
            <PortfolioPreviewPanel
              title="Portfolio Preview"
              className="h-full"
              externalLink={portfolio?.slug ? `https://forgecv.com/p/${portfolio.slug}` : null}
            >
              <PublicPortfolio portfolio={previewPortfolio} />
            </PortfolioPreviewPanel>
          </div>
        </div>
      </div>

      {showPaywallModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-elevated max-w-md w-full p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <AlertTriangleIcon />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Ready to go live?</h3>
            </div>
            <p className="text-foreground/60 text-sm mb-6">
              You&apos;ve used all your available portfolio publish slots. Upgrade your plan or grab a one-time slot to publish this portfolio.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/pricing"
                className="bg-accent text-white text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10"
              >
                View Plans
              </Link>
              <button
                onClick={() => setShowPaywallModal(false)}
                className="text-foreground/60 text-sm font-medium py-2 hover:text-foreground transition-colors"
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