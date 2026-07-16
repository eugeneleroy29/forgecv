"use client";

import { useState, useEffect } from "react";

function CopyEmailButton({ email, theme, className, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: try to open mailto as last resort
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={className}
      style={theme ? { backgroundColor: theme.accent } : undefined}
    >
      {copied ? "Copied!" : children}
    </button>
  );
}

export default function PortfolioNavbar({ content, theme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { personalInfo = {}, contact = {} } = content;

  // Build nav items based on what sections actually exist
  const navItems = [];
  
  if (personalInfo.bio?.trim()) {
    navItems.push({ label: "About", href: "#about" });
  }
  if (content.services?.length > 0) {
    navItems.push({ label: "Services", href: "#services" });
  }
  if (content.experience?.length > 0) {
    navItems.push({ label: "Experience", href: "#experience" });
  }
  if (content.tools?.length > 0 || content.skillsTools?.length > 0) {
    navItems.push({ label: "Tools", href: "#tools" });
  }
  if (content.portfolioItems?.length > 0) {
    navItems.push({ label: "Portfolio", href: "#portfolio" });
  }
  if (content.testimonials?.length > 0) {
    navItems.push({ label: "Testimonials", href: "#testimonials" });
  }
  if (contact.email || contact.linkedin || contact.website) {
    navItems.push({ label: "Contact", href: "#contact" });
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const offset = 72; // navbar height
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  if (navItems.length === 0) return null;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100"
          : "bg-white"
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo / Name */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="font-bold text-lg truncate max-w-[200px]"
            style={{ color: theme.accent }}
          >
            {personalInfo.fullName || "Portfolio"}
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            {contact.email && (
              <CopyEmailButton
                email={contact.email}
                theme={theme}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
              Hire Me
              </CopyEmailButton>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 pb-5">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              {contact.email && (
                <CopyEmailButton
                  email={contact.email}
                  theme={theme}
                  className="mt-2 mx-3 px-5 py-2.5 rounded-lg text-sm font-medium text-white text-center transition-opacity hover:opacity-90"
                >
                Hire Me
                </CopyEmailButton>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}