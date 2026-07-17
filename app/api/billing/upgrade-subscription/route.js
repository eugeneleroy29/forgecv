import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
  starter_annual: process.env.STRIPE_PRICE_STARTER_ANNUAL,
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
};

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return Response.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { targetPlanKey } = body;

    if (!PRICE_MAP[targetPlanKey]) {
      return Response.json({ error: "Invalid plan key" }, { status: 400 });
    }

    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("provider_subscription_id, provider, plan, billing_cycle")
      .eq("user_id", user.id)
      .eq("provider", "stripe")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError) {
      return Response.json({ error: "Database error" }, { status: 500 });
    }

    if (!subscription?.provider_subscription_id) {
      return Response.json(
        {
          error: "No active Stripe subscription found. Please subscribe first.",
          redirectToCheckout: true,
        },
        { status: 400 },
      );
    }

    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.provider_subscription_id,
    );

    if (!stripeSub.items.data[0]) {
      return Response.json(
        { error: "Subscription has no items" },
        { status: 500 },
      );
    }

    const subscriptionItemId = stripeSub.items.data[0].id;
    const newPriceId = PRICE_MAP[targetPlanKey];

    const updatedSub = await stripe.subscriptions.update(
      subscription.provider_subscription_id,
      {
        items: [
          {
            id: subscriptionItemId,
            price: newPriceId,
          },
        ],
        proration_behavior: "always_invoice",
        payment_behavior: "allow_incomplete",
      },
    );

    // Get the latest invoice to report amount charged
    const latestInvoice = updatedSub.latest_invoice
      ? await stripe.invoices.retrieve(updatedSub.latest_invoice)
      : null;

    const planParts = targetPlanKey.split("_");
    await supabaseAdmin
      .from("subscriptions")
      .update({
        plan: planParts[0],
        billing_cycle: planParts[1],
        updated_at: new Date().toISOString(),
      })
      .eq("provider_subscription_id", updatedSub.id);

    return Response.json({
      success: true,
      message: "Subscription upgraded successfully",
      newPlan: planParts[0],
      newCycle: planParts[1],
      status: updatedSub.status,
      amountCharged: latestInvoice?.amount_due
        ? (latestInvoice.amount_due / 100).toFixed(2)
        : null,
      currency: latestInvoice?.currency?.toUpperCase(),
    });
  } catch (err) {
    console.error("Upgrade subscription error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
