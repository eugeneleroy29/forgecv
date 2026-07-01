import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand */}
          <div className="col-span-1">
            <span className="text-accent font-bold text-xl tracking-tight">ForgeCV</span>
            <p className="text-sm text-foreground/60 mt-3 leading-relaxed">
              Build ATS-friendly resumes and stunning portfolio websites. Powered by AI.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <div className="flex flex-col gap-3">
              <Link href="/templates" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Templates
              </Link>
              <Link href="/pricing" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/features" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Features
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Resources</h4>
            <div className="flex flex-col gap-3">
              <Link href="/blog" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/faq" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link href="/support" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link href="/privacy" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/refund" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground/40">
            © {new Date().getFullYear()} ForgeCV. All rights reserved.
          </p>
          <p className="text-xs text-foreground/40">
            Made with ❤️ for freelancers and professionals worldwide
          </p>
        </div>

      </div>
    </footer>
  )
}