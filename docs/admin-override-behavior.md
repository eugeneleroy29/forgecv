# ForgeCV Admin Override Behavior Documentation

**Last Updated:** 2026-07-18
**Applies to:** Admin Users Panel (`/dashboard/admin/users`)

---

## Overview

The admin override panel allows you to manually change a user's plan, subscription status, AI usage, and portfolio slots. However, some fields interact with Stripe/PayMongo webhooks in ways that may cause unexpected overrides. This document explains exactly what happens when you change each field.

---

## 1. Plan Tier (`subscription_tier`)

### What It Does
Changes the user's plan between `free`, `starter`, and `pro`.

### What Happens When You Change It
- The admin API updates `profiles.subscription_tier` immediately.
- The admin API also inserts/updates a record in the `subscriptions` table with `provider: 'stripe'` (due to DB constraint).
- **No expiration date is automatically set.** The `current_period_end` field in `subscriptions` is NOT populated by the admin API.

### Important Behavior
| Scenario | Result |
|----------|--------|
| Free → Starter/Pro | User gets plan features immediately. Subscription never auto-expires because no `current_period_end` is set. |
| Starter/Pro → Free | User loses plan features immediately. AI quota drops to free tier. |

### Webhook Interaction ⚠️
- **High risk of override.** Stripe/PayMongo webhooks sync `subscription_tier` back to `profiles` on every checkout, invoice, or subscription event.
- If you manually upgrade a user but they later interact with Stripe (e.g., cancel, upgrade themselves), webhooks will overwrite your admin setting.

### Best Practice
- Use admin override for temporary grants, testing, or compensating users.
- For permanent upgrades, prefer the actual checkout flow so Stripe owns the billing lifecycle.

---

## 2. Subscription Status (`subscription_status`)

### What It Does
Changes the user's subscription status: `active`, `past_due`, `canceled`, `expired`.

### What Happens When You Change It
- Updates `profiles.subscription_status` immediately.
- Syncs to `subscriptions.status` in the DB.

### Important Behavior
| Status | Effect on User |
|--------|----------------|
| `active` | Full access to plan features |
| `past_due` | Usually same as active (grace period), but may trigger warnings |
| `canceled` | User keeps features until `current_period_end`, then downgraded to free |
| `expired` | Immediately treated as free tier |

### Webhook Interaction ⚠️
- **Very high risk of override.** Webhooks are the source of truth for subscription status.
- If you set status to `canceled` but Stripe still shows `active`, the next webhook will revert it.
- If you set status to `active` but Stripe shows `canceled`, the next webhook will revert it.

### Best Practice
- Only use this for immediate support actions (e.g., manually canceling a subscription when Stripe is out of sync).
- Do not rely on admin-override status for long-term state — webhooks always win.

---

## 3. AI Generations Used (`ai_generations_used`)

### What It Does
Tracks how many AI generations the user has consumed in the current billing period.

### What Happens When You Change It
- Direct integer counter update. No side effects.
- **Not touched by webhooks.** This field is purely internal.

### Important Behavior
| Value | Effect |
|-------|--------|
| `0` | User gets a full fresh quota for their plan |
| High number (e.g., 999) | User immediately blocked from AI features |
| Any number | Compared against plan quota in `lib/entitlements.js` |

### Reset Behavior
- The `ai_generations_reset_date` field controls monthly resets.
- When the reset date passes, a cron job (or login check) should set `ai_generations_used = 0`.
- Admin override bypasses this — you can reset manually anytime.

### Best Practice
- Set to `0` to give a user a "fresh month" of AI quota.
- Use to compensate users who hit limits due to bugs.
- Monitor this field in the admin panel to spot abuse.

---

## 4. Portfolio Slots (`portfolio_slots`)

### What It Does
Controls how many portfolios a user can create.

### What Happens When You Change It
- Direct integer update. Immediate effect.
- **Not touched by webhooks.** This field is purely internal.

### Important Behavior
| Change | Effect |
|--------|--------|
| Increase (e.g., 1 → 3) | User can create more portfolios immediately. No payment required. |
| Decrease (e.g., 3 → 1) | User blocked from creating new portfolios. **Existing portfolios are NOT deleted.** |

### Edge Case
- If a user has 3 portfolios and you drop slots to 1, they keep all 3 existing ones.
- They cannot create a 4th.
- Whether they can edit existing portfolios depends on your frontend checks (usually yes).

### Best Practice
- Use to compensate users (e.g., "sorry for the bug, here's a free slot").
- Lifetime slot purchases normally increment this via webhook. Admin override bypasses payment.
- Be careful decreasing slots — users may have published portfolios they rely on.

---

## Quick Reference: Webhook Override Risk

| Field | Webhook Can Override? | Source of Truth |
|-------|----------------------|-----------------|
| `subscription_tier` | ✅ Yes | Stripe/PayMongo subscriptions table |
| `subscription_status` | ✅ Yes | Stripe/PayMongo subscriptions table |
| `ai_generations_used` | ❌ No | Internal counter |
| `portfolio_slots` | ❌ No | Internal counter |

---

## Admin Override Best Practices

1. **Use for support/compensation, not permanent billing.** Stripe/PayMongo should own the billing lifecycle.
2. **Document why you changed something.** Add a note in your support system (e.g., "Gave 3 free slots for bug #123").
3. **Check webhook logs after overriding.** If webhooks revert your change, investigate the root cause in Stripe/PayMongo dashboard.
4. **Never use admin override to bypass paid features for yourself.** This creates accounting/tax issues.
5. **Test in staging first.** Admin override affects real user data.

---

## Related Files

- `app/api/admin/users/route.js` — Admin override API
- `app/api/webhooks/stripe/route.js` — Stripe webhook handler
- `app/api/webhooks/paymongo/route.js` — PayMongo webhook handler
- `lib/entitlements.js` — Client-side plan quota checks
