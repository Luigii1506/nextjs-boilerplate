/**
 * 💰 TAX CALCULATION SERVICE
 * =========================
 *
 * Calculate taxes based on shipping address and local tax rates.
 * Following project patterns for business logic separation.
 *
 * @version 1.0.0 - Tax calculation implementation
 */

import type { Address } from "../types";
import { TAX_RATES } from "../constants";

// 🗺️ TAX RATES BY STATE/REGION
// =============================

/**
 * US State tax rates (simplified for demo)
 * In production, this would come from a tax service API
 */
const US_STATE_TAX_RATES: Record<string, number> = {
  // High tax states
  CA: 0.0875, // California
  NY: 0.08, // New York
  WA: 0.065, // Washington
  OR: 0.0, // Oregon (no sales tax)

  // Medium tax states
  TX: 0.0625, // Texas
  FL: 0.06, // Florida
  IL: 0.0625, // Illinois
  PA: 0.06, // Pennsylvania
  OH: 0.0575, // Ohio

  // Low tax states
  DE: 0.0, // Delaware
  MT: 0.0, // Montana
  NH: 0.0, // New Hampshire
  AK: 0.0, // Alaska

  // Default for other states
  DEFAULT: TAX_RATES.DEFAULT,
};

/**
 * International tax rates (VAT/GST)
 */
const INTERNATIONAL_TAX_RATES: Record<string, number> = {
  // Europe (VAT)
  GB: 0.2, // UK VAT
  DE: 0.19, // Germany VAT
  FR: 0.2, // France VAT
  ES: 0.21, // Spain VAT
  IT: 0.22, // Italy VAT

  // Americas
  CA: 0.13, // Canada (average HST/GST+PST)
  MX: 0.16, // Mexico IVA

  // Asia-Pacific
  AU: 0.1, // Australia GST
  JP: 0.1, // Japan VAT
  SG: 0.07, // Singapore GST

  // Default
  DEFAULT: TAX_RATES.DEFAULT,
};

// 🧮 TAX CALCULATION FUNCTIONS
// ============================

/**
 * Calculate tax rate based on shipping address
 */
export function calculateTaxRate(address: Address): number {
  console.log("💰 [TAX CALCULATOR] Calculating tax rate:", {
    country: address.country,
    state: address.state,
    city: address.city,
  });

  const country = address.country?.toUpperCase();
  const state = address.state?.toUpperCase();

  // US tax calculation
  if (country === "US" || country === "USA" || country === "UNITED STATES") {
    const taxRate = US_STATE_TAX_RATES[state] ?? US_STATE_TAX_RATES.DEFAULT;

    console.log("✅ [TAX CALCULATOR] US tax rate calculated:", {
      state,
      taxRate,
      percentage: `${(taxRate * 100).toFixed(2)}%`,
    });

    return taxRate;
  }

  // International tax calculation
  const taxRate =
    INTERNATIONAL_TAX_RATES[country] ?? INTERNATIONAL_TAX_RATES.DEFAULT;

  console.log("✅ [TAX CALCULATOR] International tax rate calculated:", {
    country,
    taxRate,
    percentage: `${(taxRate * 100).toFixed(2)}%`,
  });

  return taxRate;
}

/**
 * Calculate tax amount based on subtotal and address
 */
export function calculateTaxAmount(subtotal: number, address: Address): number {
  const taxRate = calculateTaxRate(address);
  const taxAmount = Math.round(subtotal * taxRate);

  console.log("💰 [TAX CALCULATOR] Tax amount calculated:", {
    subtotal,
    taxRate,
    taxAmount,
    percentage: `${(taxRate * 100).toFixed(2)}%`,
  });

  return taxAmount;
}

/**
 * Get tax breakdown for display
 */
export function getTaxBreakdown(subtotal: number, address: Address) {
  const taxRate = calculateTaxRate(address);
  const taxAmount = calculateTaxAmount(subtotal, address);

  const country = address.country?.toUpperCase();
  let taxName = "Sales Tax";

  // Customize tax name by region
  if (country === "GB") taxName = "VAT";
  else if (country === "CA") taxName = "HST/GST";
  else if (country === "AU") taxName = "GST";
  else if (
    country === "DE" ||
    country === "FR" ||
    country === "ES" ||
    country === "IT"
  )
    taxName = "VAT";
  else if (country === "MX") taxName = "IVA";
  else if (country === "JP") taxName = "消費税";

  return [
    {
      name: taxName,
      rate: taxRate,
      amount: taxAmount,
    },
  ];
}

/**
 * Check if address is tax-exempt (some states/regions)
 */
export function isTaxExempt(address: Address): boolean {
  const country = address.country?.toUpperCase();
  const state = address.state?.toUpperCase();

  // US tax-exempt states
  if (country === "US" || country === "USA") {
    const taxExemptStates = ["OR", "DE", "MT", "NH", "AK"];
    return taxExemptStates.includes(state);
  }

  return false;
}
