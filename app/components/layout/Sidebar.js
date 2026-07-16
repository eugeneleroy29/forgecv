"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: "🏠" },
  { name: "Resumes", href: "/dashboard/resumes", icon: "📄" },
  { name: "Portfolio", href: "/dashboard/portfolios", icon: "🌐" },
  { name: "AI Tools", href: "/dashboard/ai-tools", icon: "🤖" },
  { name: "Billing", href: "/dashboard/billing", icon: "💳" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

const adminItem = { name: "Admin", href: "/dashboard/admin", icon: "🛡️" };

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      setIsAdmin(profile?.is_admin === true);
    };

    checkAdmin();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const allMenuItems = isAdmin ? [...menuItems, adminItem] : menuItems;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border border-border shadow-sm"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        w-64 border-r border-border h-screen flex-col bg-background z-50 overflow-y-auto
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen 
          ? "fixed inset-y-0 left-0 translate-x-0" 
          : "hidden md:flex md:sticky md:top-0 md:translate-x-0"
        }
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <Link
            href="/"
            className="text-accent font-bold text-xl tracking-tight"
          >
            ForgeCV
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {allMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-foreground/70 hover:bg-foreground/5"
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-border bg-background mt-auto shrink-0">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:bg-foreground/5 transition-colors w-full"
          >
            <span>🚪</span>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
