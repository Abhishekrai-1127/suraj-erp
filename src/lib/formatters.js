/**
 * Deterministic number and currency formatting utilities.
 * Ensures consistent string representations between Node.js SSR and client-side browsers
 * to prevent React hydration mismatches in Next.js Turbopack.
 */

export function parseAmount(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatNumber(amount, decimals = 0) {
  const num = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(num);
  } catch (e) {
    return String(num);
  }
}

export function formatCurrency(amount, decimals = 0) {
  return `₹${formatNumber(amount, decimals)}`;
}

export function formatCompactNumber(amount) {
  const num = Number(amount) || 0;
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)}Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return `₹${formatNumber(num, 0)}`;
}
