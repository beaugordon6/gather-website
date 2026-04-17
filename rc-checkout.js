import { Purchases } from "https://esm.sh/@revenuecat/purchases-js@1";

// ---- Config ----
const RC_WEB_API_KEY = "rcb_vuNABllHpblkkWllnyoEZmDzNDuN";
const HOST_OFFERING_ID = "Host";
const APP_COMPLETE_URL = "https://app.letsgather.app/join-host/complete";

// ---- DOM ----
const toggleEl = document.getElementById("rc-plan-toggle");
const loadingEl = document.getElementById("rc-loading");
const redirectEl = document.getElementById("rc-redirecting");
const checkoutBtn = document.getElementById("rc-checkout-btn");
const errorEl = document.getElementById("rc-checkout-error");

// ---- State ----
const appUserId = crypto.randomUUID();
let selectedPlan = "annual"; // default
let monthlyPkg = null;
let annualPkg = null;

// ---- Plan selector (called from onclick) ----
window.selectPlan = function (plan) {
  selectedPlan = plan;
  const annualBtn = document.getElementById("rc-plan-annual");
  const monthlyBtn = document.getElementById("rc-plan-monthly");
  if (plan === "annual") {
    annualBtn.style.background = "var(--ink)";
    annualBtn.style.color = "var(--white)";
    annualBtn.style.borderColor = "var(--ink)";
    monthlyBtn.style.background = "var(--white)";
    monthlyBtn.style.color = "var(--ink)";
    monthlyBtn.style.borderColor = "var(--border)";
  } else {
    monthlyBtn.style.background = "var(--ink)";
    monthlyBtn.style.color = "var(--white)";
    monthlyBtn.style.borderColor = "var(--ink)";
    annualBtn.style.background = "var(--white)";
    annualBtn.style.color = "var(--ink)";
    annualBtn.style.borderColor = "var(--border)";
  }
};

// ---- Checkout (called from onclick) ----
window.startCheckout = async function () {
  const pkg = selectedPlan === "annual" ? annualPkg : monthlyPkg;
  if (!pkg) return;

  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Opening checkout…";
  errorEl.hidden = true;

  try {
    const result = await Purchases.getSharedInstance().purchase({
      rcPackage: pkg,
      skipSuccessPage: true,
    });

    // Success — show full-screen overlay and redirect
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:9999;background:var(--off,#F6F5F2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;font-family:var(--f,'Instrument Sans',system-ui,sans-serif)";
    overlay.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:8px;background:#E84530;color:#fff;padding:6px 16px;border-radius:999px;font-size:13px;font-weight:700">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        You're in!
      </div>
      <p style="font-size:22px;font-weight:700;color:#111110;letter-spacing:-.02em">Setting up your account…</p>
      <p style="font-size:15px;color:#4A4A46">You'll be redirected in a moment.</p>
    `;
    document.body.appendChild(overlay);

    const url = new URL(APP_COMPLETE_URL);
    url.searchParams.set("app_user_id", appUserId);
    window.location.href = url.toString();
  } catch (err) {
    // User cancelled — just reset the button
    if (err?.errorCode === "PURCHASE_CANCELLED_ERROR") {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = "Join the host program →";
      return;
    }
    console.error("Purchase failed:", err);
    errorEl.textContent =
      "Something went wrong. Please try again or email support@letsgather.app.";
    errorEl.hidden = false;
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "Try again →";
  } finally {
    document.documentElement.removeAttribute("style");
    document.body.removeAttribute("style");
  }
};

// ---- Init: fetch offerings and show toggle ----
try {
  const purchases = Purchases.configure({
    apiKey: RC_WEB_API_KEY,
    appUserId,
  });

  const offerings = await purchases.getOfferings();
  const hostOffering = offerings.all[HOST_OFFERING_ID] ?? offerings.current;

  if (!hostOffering) throw new Error("Host offering not found");

  annualPkg = hostOffering.annual;
  monthlyPkg = hostOffering.monthly;

  // Update prices from RC if available
  if (annualPkg?.webBillingProduct) {
    const p = annualPkg.webBillingProduct;
    document.getElementById("rc-price-annual").textContent =
      (p.priceString || "$99") + "/year";
    if (p.pricePerMonth) {
      document.getElementById("rc-price-annual-monthly").textContent =
        "$" + p.pricePerMonth.toFixed(2) + "/month";
    }
  }
  if (monthlyPkg?.webBillingProduct) {
    const p = monthlyPkg.webBillingProduct;
    document.getElementById("rc-price-monthly").textContent =
      (p.priceString || "$15.99") + "/month";
  }

  // Show the toggle, hide loading
  loadingEl.style.display = "none";
  toggleEl.style.display = "block";
} catch (err) {
  console.error("RC init failed:", err);
  loadingEl.innerHTML =
    '<p style="color:var(--red);font-size:14px">Checkout is currently unavailable. Please try again or email support@letsgather.app.</p>';
}
