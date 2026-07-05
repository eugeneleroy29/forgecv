"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserEntitlements } from "@/lib/entitlements";
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

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    tagline: "",
    bio: "",
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
    setLoading(false);
  };

  const updateTitle = (newTitle) => {
    setPortfolio({ ...portfolio, title: newTitle });
  };

  const updatePersonalInfo = (field, value) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
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

        <button
          onClick={savePortfolio}
          disabled={saving}
          className="mt-4 text-sm text-accent hover:underline font-medium"
        >
          {saving ? "Saving..." : "Save section"}
        </button>
      </div>

      {/* Services Section */}
      <div className="border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Services Offered</h2>
          <button
            onClick={addService}
            className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors"
          >
            + Add Service
          </button>
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
      <div className="border border-border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Tools & Skills</h2>

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

      {/* Portfolio Samples Section */}
      <div className="border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Portfolio Samples</h2>
          <button
            onClick={addPortfolioItem}
            className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors"
          >
            + Add Sample
          </button>
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
      <div className="border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Testimonials (optional)</h2>
          <button
            onClick={addTestimonial}
            className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:bg-accent/20 transition-colors"
          >
            + Add Testimonial
          </button>
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
          <div className="flex items-center gap-3">
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
