import { Purchases } from "https://esm.sh/@revenuecat/purchases-js@1";

// ---- Config ----
const RC_WEB_API_KEY = "rcb_sb_LBvipsTzHbqGrdXwUvgFpvOaz";
const HOST_OFFERING_ID = "Host";
const APP_COMPLETE_URL = "https://app.letsgather.app/join-host/complete";

// ---- State ----
const appUserId = crypto.randomUUID();
const container = document.getElementById("rc-paywall-container");
const loadingEl = document.getElementById("rc-paywall-loading");
const errorEl = document.getElementById("rc-paywall-error");

try {
  const purchases = Purchases.configure({
    apiKey: RC_WEB_API_KEY,
    appUserId,
  });

  const offerings = await purchases.getOfferings();
  const hostOffering = offerings.all[HOST_OFFERING_ID] ?? offerings.current;

  if (!hostOffering) throw new Error("Host offering not found");

  // Hide loading state — RC will render into the container
  if (loadingEl) loadingEl.hidden = true;

  const purchaseResult = await purchases.presentPaywall({
    htmlTarget: container,
    offering: hostOffering,
  });

  // Purchase succeeded — redirect to app
  const url = new URL(APP_COMPLETE_URL);
  url.searchParams.set("app_user_id", appUserId);
  window.location.href = url.toString();
} catch (err) {
  console.error("RC error:", err);

  if (loadingEl) loadingEl.hidden = true;

  // Only show error if it's not a user cancellation
  if (err?.errorCode !== "PURCHASE_CANCELLED_ERROR") {
    errorEl.textContent =
      "Checkout is currently unavailable. Please try again or email support@letsgather.app.";
    errorEl.hidden = false;
  }
} finally {
  // RC sets inline styles on <html> and <body> during the flow — clean up
  document.documentElement.removeAttribute("style");
  document.body.removeAttribute("style");
}
