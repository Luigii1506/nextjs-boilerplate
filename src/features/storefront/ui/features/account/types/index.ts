/**
 * 📋 ACCOUNT TYPES
 * ================
 *
 * Type definitions for account management components
 */

import type { LucideIcon } from "lucide-react";

export interface AccountSection {
  id: "profile" | "orders" | "addresses" | "settings" | "security";
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  avatar?: string;
  joinDate: Date;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export interface Address {
  id: string;
  type: "shipping" | "billing";
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}
