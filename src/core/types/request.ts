/**
 * 🌍 ENHANCED REQUEST TYPES
 * ========================
 *
 * Professional types for Next.js requests with geo data
 * Eliminates hacky `as any` casts
 *
 * Created: 2025-01-29 - Enterprise-grade type safety
 */

import type { NextRequest } from "next/server";

// 📍 Geo data interface from Edge Runtime
export interface RequestGeoData {
  city?: string;
  country?: string;
  region?: string;
  latitude?: string;
  longitude?: string;
}

// 🔒 Enhanced NextRequest with proper geo typing
export interface EnhancedNextRequest extends NextRequest {
  geo: RequestGeoData;
}

// 🛡️ Type guard to check if request has geo data
export function hasGeoData(
  request: NextRequest
): request is EnhancedNextRequest {
  return "geo" in request && request.geo !== undefined;
}

// 🎯 Safe geo data extractor with defaults
export function extractGeoData(request: NextRequest): {
  country: string;
  city: string;
  userAgent: string;
} {
  if (hasGeoData(request)) {
    return {
      country: request.geo.country ?? "unknown",
      city: request.geo.city ?? "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    };
  }

  return {
    country: "unknown",
    city: "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
  };
}
