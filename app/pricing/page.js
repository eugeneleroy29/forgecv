"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { detectPaymentProviderAsync } from "@/lib/payments/detectProvider";

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const CheckIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const GlobeIcon = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const RocketIcon = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const LoaderIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const AlertTriangleIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

// ─── Plan Data ───────────────────────────────────────────────────────────────

const PLANS = {
  starter: {
    name: "Starter",
    tagline: "For active job seekers",
    monthlyPrice: 149,
    annualPrice: 1490,
    monthlyPriceUSD: 2.99,
    annualPriceUSD: 29.99,
    monthlyKey: "starter_monthly",
    annualKey: "starter_annual",
    features: [
      "3 resumes",
      "All resume templates (up to 3 in use)",
      "Unlimited downloads",
      "1 portfolio publish slot",
      "All premium portfolio templates",
      "Custom portfolio sections",
      "30 AI generations/month",
      "Professional Summary AI",
      "ATS Score Checker",
      "Skills Suggester",
      "Job Description Optimizer",
      "Portfolio Bio Generator",
    ],
  },
  pro: {
    name: "Pro",
    tagline: "For serious professionals",
    monthlyPrice: 299,
    annualPrice: 2990,
    monthlyPriceUSD: 5.99,
    annualPriceUSD: 59.99,
    monthlyKey: "pro_monthly",
    annualKey: "pro_annual",
    features: [
      "Unlimited resumes",
      "All resume templates, unlimited use",
      "Unlimited downloads",
      "3 portfolio publish slots",
      "All premium portfolio templates",
      "Custom portfolio sections",
      "Portfolio analytics",
      "60 AI generations/month",
      "Professional Summary AI",
      "ATS Score Checker",
      "Skills Suggester",
      "Job Description Optimizer",
      "Portfolio Bio Generator",
      "Priority support",
    ],
  },
};

const LIFETIME_PLANS = [
  {
    key: "lifetime_1_slot",
    slots: 1,
    pricePHP: 499,
    priceUSD: 9.99,
    icon: GlobeIcon,
    name: "1 Portfolio",
    desc: "Premium template, live forever",
  },
  {
    key: "lifetime_3_slots",
    slots: 3,
    pricePHP: 999,
    priceUSD: 19.99,
    icon: RocketIcon,
    name: "3 Portfolios",
    desc: "Premium templates, live forever",
  },
];

const PLAN_HIERARCHY = {
  free: 0,
  starter: 1,
  pro: 2,
};

function isUpgrade(currentPlan, currentCycle, targetPlan, targetCycle) {
  const currentTier = PLAN_HIERARCHY[currentPlan] || 0;
  const targetTier = PLAN_HIERARCHY[targetPlan] || 0;
  if (targetTier > currentTier) return true;
  if (
    targetTier === currentTier &&
    currentCycle === "monthly" &&
    targetCycle === "annual"
  )
    return true;
  return false;
}

function isCurrentPlan(currentPlan, currentCycle, targetPlan, targetCycle) {
  return currentPlan === targetPlan && currentCycle === targetCycle;
}

// ─── Toggle Switch Component ─────────────────────────────────────────────────

const ToggleSwitch = ({ checked, onChange, labelLeft, labelRight, badge }) => (
  <div className="flex items-center gap-3">
    <span className={`text-sm font-medium transition-colors ${!checked ? "text-foreground" : "text-foreground/50"}`}>
      {labelLeft}
    </span>
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${checked ? "bg-accent" : "bg-muted border border-border"}`}
      aria-label={`Switch to ${checked ? labelRight : labelLeft}`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
          checked ? "right-0.5" : "left-0.5"
        }`}
      />
    </button>
    <span className={`text-sm font-medium transition-colors ${checked ? "text-foreground" : "text-foreground/50"}`}>
      {labelRight}
    </span>
    {badge && (
      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
        {badge}
      </span>
    )}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [provider, setProvider] = useState("paymongo");
  const [currency, setCurrency] = useState("PHP");
  const [detecting, setDetecting] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  const [userPlan, setUserPlan] = useState(null);
  const [userCycle, setUserCycle] = useState("monthly");
  const [lifetimeSlotsOwned, setLifetimeSlotsOwned] = useState(0);
  const [loadingUserData, setLoadingUserData] = useState(true);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTargetPlan, setUpgradeTargetPlan] = useState(null);
  const [upgradeTargetKey, setUpgradeTargetKey] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const runDetection = async () => {
      try {
        const detected = await detectPaymentProviderAsync();
        if (!mounted) return;
        if (detected === "paymongo") {
          setProvider("paymongo");
          setCurrency("PHP");
        } else {
          setProvider("stripe");
          setCurrency("USD");
        }
      } catch (err) {
        console.error("Provider detection failed:", err);
      } finally {
        if (mounted) setDetecting(false);
      }
    };
    runDetection();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!user) {
      setLoadingUserData(false);
      return;
    }
    const loadUserData = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (profile?.is_admin) {
          setUserPlan("admin");
          setLoadingUserData(false);
          return;
        }

        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("plan, status, billing_cycle")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const plan = subscription?.plan || "free";
        const cycle = subscription?.billing_cycle || "monthly";
        setUserPlan(plan);
        setUserCycle(cycle);

        const { data: lifetimePayments } = await supabase
          .from("payments")
          .select("slots_purchased")
          .eq("user_id", user.id)
          .eq("payment_type", "lifetime_slot")
          .eq("status", "paid");

        const slots = (lifetimePayments || []).reduce(
          (sum, p) => sum + (p.slots_purchased || 0),
          0,
        );
        setLifetimeSlotsOwned(slots);
      } catch (err) {
        console.error("Failed to load user billing data:", err);
      } finally {
        setLoadingUserData(false);
      }
    };
    loadUserData();
  }, [user]);

  const isUSD = currency === "USD";

  const startCheckout = async (planKey) => {
    if (!user) {
      router.push("/login");
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ provider, planKey }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error("Checkout failed:", data.error);
      alert("Something went wrong starting checkout. Please try again.");
    }
  };

  const openUpgradeModal = (planKey) => {
    if (!user) {
      router.push("/login");
      return;
    }
    const planKeyParts = planKey.split("_");
    const planName = planKeyParts[0] === "starter" ? "Starter" : "Pro";
    const cycleName = planKeyParts[1] === "annual" ? "Annual" : "Monthly";
    setUpgradeTargetPlan(`${planName} (${cycleName})`);
    setUpgradeTargetKey(planKey);
    setShowUpgradeModal(true);
  };

  const handleUpgrade = async () => {
    if (!upgradeTargetKey) return;
    setUpgradeLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/billing/upgrade-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ targetPlanKey: upgradeTargetKey }),
      });
      const data = await res.json();
      if (data.success) {
        setShowUpgradeModal(false);
        const amountMsg = data.amountCharged
          ? ` You were charged ${data.currency === "USD" ? "$" : "₱"}${data.amountCharged} for the prorated difference.`
          : "";
        alert(`Upgrade successful!${amountMsg}`);
        window.location.reload();
      } else if (data.redirectToCheckout) {
        setShowUpgradeModal(false);
        startCheckout(upgradeTargetKey);
      } else {
        console.error("Upgrade failed:", data.error);
        alert(data.error || "Upgrade failed. Please try again.");
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setUpgradeLoading(false);
    }
  };

  const isFree = userPlan === "free" || userPlan === null;
  const isStarter = userPlan === "starter";
  const isPro = userPlan === "pro";
  const isAdmin = userPlan === "admin";

  const lifetime1Owned = lifetimeSlotsOwned >= 1 || isAdmin;
  const lifetime3Owned = lifetimeSlotsOwned >= 3 || isAdmin;

  const formatPrice = (php, usd) => {
    if (isUSD) return `$${usd.toFixed(2)}`;
    return `₱${php.toLocaleString()}`;
  };

  const renderPlanCard = (key, plan, isCurrent, isDisabled, isUpgradeable = false) => {
    const price = isUSD
      ? annual ? plan.annualPriceUSD : plan.monthlyPriceUSD
      : annual ? plan.annualPrice : plan.monthlyPrice;
    const planKey = annual ? plan.annualKey : plan.monthlyKey;
    const isStarterPlan = key === "starter";

    return (
      <div
        key={key}
        className={`rounded-2xl p-8 flex flex-col relative transition-all duration-300 ${
          isCurrent
            ? "border-2 border-accent bg-accent/[0.03] shadow-lg shadow-accent/10"
            : isDisabled
              ? "border border-border bg-muted/30 opacity-60"
              : isStarterPlan
                ? "border-2 border-accent hover:shadow-lg hover:shadow-accent/10"
                : "border border-border hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30"
        }`}
      >
        {isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg shadow-accent/20">
            Current Plan
          </div>
        )}
        {isStarterPlan && !isCurrent && !isDisabled && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg shadow-accent/20">
            Most Popular
          </div>
        )}
        <h2 className="text-lg font-semibold tracking-tight mb-1">{plan.name}</h2>
        <p className="text-foreground/60 text-sm mb-6">{plan.tagline}</p>
        <div className="mb-6">
          <span className="text-4xl font-bold tracking-tight">
            {isUSD ? `$${price.toFixed(2)}` : `₱${price.toLocaleString()}`}
          </span>
          <span className="text-foreground/50 text-sm ml-1">
            / {annual ? "year" : "month"}
          </span>
        </div>
        <ul className="flex flex-col gap-3 mb-8 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm">
              <CheckIcon className="text-accent mt-0.5 shrink-0" />
              <span className="text-foreground/80">{feature}</span>
            </li>
          ))}
        </ul>
        {isCurrent ? (
          <button
            disabled
            className="w-full bg-muted text-foreground/40 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed"
          >
            Current Plan
          </button>
        ) : isDisabled ? (
          <button
            disabled
            className="w-full bg-muted text-foreground/40 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed"
          >
            {isAdmin ? "Admin — Unlimited" : "Not Available"}
          </button>
        ) : isUpgradeable ? (
          <button
            onClick={() => openUpgradeModal(planKey)}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isStarterPlan
                ? "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/10 hover:shadow-accent/20"
                : "border border-border text-foreground hover:border-accent hover:text-accent"
            }`}
          >
            Upgrade
          </button>
        ) : (
          <button
            onClick={() => startCheckout(planKey)}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isStarterPlan
                ? "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/10 hover:shadow-accent/20"
                : "border border-border text-foreground hover:border-accent hover:text-accent"
            }`}
          >
            Get Started
          </button>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">Simple, transparent pricing</h1>
        <p className="text-foreground/60 text-lg max-w-xl mx-auto">
          Start for free. Upgrade when you need more.
        </p>

        {/* Currency Toggle + Monthly/Annual Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          {/* Currency Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-full p-1 border border-border">
            <button
              onClick={() => { setCurrency("PHP"); setProvider("paymongo"); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                currency === "PHP"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              PHP ₱
            </button>
            <button
              onClick={() => { setCurrency("USD"); setProvider("stripe"); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                currency === "USD"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              USD $
            </button>
          </div>

          {/* Monthly/Annual Toggle */}
          <ToggleSwitch
            checked={annual}
            onChange={() => setAnnual(!annual)}
            labelLeft="Monthly"
            labelRight="Annual"
            badge="Save 17%"
          />
        </div>

        {detecting && (
          <p className="text-xs text-foreground/40 mt-3">
            Detecting your region...
          </p>
        )}
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Free */}
          {renderPlanCard(
            "free",
            {
              name: "Free",
              tagline: "Perfect for getting started",
              monthlyPrice: 0,
              annualPrice: 0,
              monthlyPriceUSD: 0,
              annualPriceUSD: 0,
              features: [
                "1 resume",
                "1 resume template of your choice",
                "Unlimited downloads",
                "Build portfolios (all 9 templates)",
                "Publishing requires an upgrade",
              ],
            },
            isFree,
            !isFree,
            false,
          )}

          {/* Starter */}
          {renderPlanCard(
            "starter",
            PLANS.starter,
            isStarter,
            isPro || isAdmin,
            isUpgrade("free", userCycle, "starter", annual ? "annual" : "monthly") ||
              isUpgrade("starter", userCycle, "starter", annual ? "annual" : "monthly"),
          )}

          {/* Pro */}
          {renderPlanCard(
            "pro",
            PLANS.pro,
            isPro,
            isAdmin,
            isUpgrade("free", userCycle, "pro", annual ? "annual" : "monthly") ||
              isUpgrade("starter", userCycle, "pro", annual ? "annual" : "monthly") ||
              isUpgrade("pro", userCycle, "pro", annual ? "annual" : "monthly"),
          )}
        </div>

        {/* One-time Payment Section */}
        <div className="mt-20 bg-card border border-border rounded-2xl p-8 sm:p-10 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Just need a portfolio?</h2>
            <p className="text-foreground/60 text-sm sm:text-base">
              One-time payment. No subscription. Yours forever.
            </p>
            {lifetimeSlotsOwned > 0 && (
              <p className="text-accent text-sm mt-3 font-medium flex items-center justify-center gap-1.5">
                <CheckIcon className="text-accent" />
                You already own {lifetimeSlotsOwned} lifetime slot{lifetimeSlotsOwned === 1 ? "" : "s"}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {LIFETIME_PLANS.map((lt) => {
              const isOwned = lt.slots === 1 ? lifetime1Owned : lifetime3Owned;
              const price = isUSD ? lt.priceUSD : lt.pricePHP;
              const IconComponent = lt.icon;

              return (
                <div
                  key={lt.key}
                  className={`border rounded-2xl p-6 text-center transition-all duration-300 ${
                    isOwned
                      ? "border-border bg-muted/30 opacity-60"
                      : "border-border hover:border-accent hover:shadow-lg hover:shadow-accent/5"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-4">
                    <IconComponent />
                  </div>
                  <h3 className="font-semibold text-lg tracking-tight mb-1">{lt.name}</h3>
                  <p className="text-foreground/60 text-sm mb-4">{lt.desc}</p>
                  <div className="text-3xl font-bold tracking-tight mb-5">
                    {isUSD ? `$${price.toFixed(2)}` : `₱${price.toLocaleString()}`}
                  </div>
                  {isOwned ? (
                    <button
                      disabled
                      className="w-full bg-muted text-foreground/40 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed"
                    >
                      {isAdmin ? "Admin — Unlimited" : "Already Owned"}
                    </button>
                  ) : (
                    <button
                      onClick={() => startCheckout(lt.key)}
                      className="w-full bg-accent text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10 hover:shadow-accent/20"
                    >
                      Buy Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upgrade Confirmation Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-elevated max-w-md w-full p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <AlertTriangleIcon />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Confirm Upgrade</h3>
            </div>
            <p className="text-foreground/60 text-sm mb-6">
              You are about to upgrade to <strong className="text-foreground">{upgradeTargetPlan}</strong>.
              {provider === 'paymongo' ? (
                <> You will pay the prorated difference via QRPh. Your next renewal will be manual.</>
              ) : (
                <> You will be charged the prorated difference immediately. Your card on file will be billed automatically.</>
              )}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="bg-accent text-white text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all disabled:opacity-50 shadow-lg shadow-accent/10"
              >
                {upgradeLoading ? <span className="flex items-center justify-center gap-2"><LoaderIcon className="animate-spin" /> Processing...</span> : 'Confirm Upgrade'}
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                disabled={upgradeLoading}
                className="text-foreground/60 text-sm font-medium py-2 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}