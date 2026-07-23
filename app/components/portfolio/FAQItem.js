"use client";

import { useState } from "react";

/**
 * FAQItem — Accordion-style FAQ item.
 * 
 * Props:
 *   faq: { question: string, answer: string }
 *   accentColor → string (hex)
 *   className   → string
 *   defaultOpen → boolean
 */

const ChevronIcon = ({ className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function FAQItem({ faq, accentColor = "#4F46E5", className = "", defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { question, answer } = faq;

  return (
    <div
      className={`border border-border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? "shadow-sm" : ""} ${className}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-accent/[0.02] transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base font-medium pr-4">{question}</span>
        <ChevronIcon
          className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: isOpen ? accentColor : undefined }}
        />
      </button>
      <div
        className="grid transition-all duration-300"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-foreground/70 leading-relaxed border-t border-border/50 pt-4">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}