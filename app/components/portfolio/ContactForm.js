"use client";

import { useState } from "react";

/**
 * ContactForm — Simple contact form for portfolio inquiries.
 * 
 * Props:
 *   email       → recipient email (for mailto fallback)
 *   accentColor → string (hex)
 *   className   → string
 *   onSubmit    → (formData) => void (optional, defaults to mailto)
 */

const SendIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
  </svg>
);

export default function ContactForm({ email, accentColor = "#4F46E5", className = "", onSubmit }) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    } else if (email) {
      const subject = `Portfolio Inquiry from ${formData.name}`;
      const body = `Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0A%0D%0AMessage:%0D%0A${formData.message}`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground/70 mb-1.5 block">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground/70 mb-1.5 block">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
            placeholder="you@company.com"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground/70 mb-1.5 block">Message</label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all resize-none"
          placeholder="Tell me about your project..."
        />
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-white shadow-lg transition-all duration-300 hover:shadow-xl flex items-center justify-center gap-2"
        style={{ backgroundColor: accentColor }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "brightness(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "brightness(1)";
        }}
      >
        <SendIcon />
        {submitted ? "Message Sent!" : "Send Message"}
      </button>
    </form>
  );
}