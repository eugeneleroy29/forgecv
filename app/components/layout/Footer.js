import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: "Templates", href: "/templates" },
      { label: "Pricing", href: "/pricing" },
      { label: "Features", href: "/features" },
    ],
    Resources: [
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
      { label: "Support", href: "/support" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
  };

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link
              href="/"
              className="text-accent font-bold text-xl tracking-tight hover:opacity-80 transition-opacity inline-block mb-4"
            >
              ForgeCV
            </Link>
            <p className="text-sm text-foreground/60 leading-relaxed max-w-sm mb-6">
              Build ATS-friendly resumes and stunning portfolio websites. Powered by AI. Designed for freelancers, remote workers, and job seekers worldwide.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-foreground/50 font-medium">
                All systems operational
              </span>
            </div>
          </div>

          {/* Link Columns */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-3 gap-8">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-4">
                    {category}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground/40">
            © {currentYear} ForgeCV. All rights reserved.
          </p>
          <p className="text-xs text-foreground/40">
            Built for professionals worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}