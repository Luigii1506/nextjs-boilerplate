import type { RoleName } from "@/core/auth/permissions";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: RoleName; // Now supports: super_admin | admin | user
  image?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastLogin?: string;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: string | null;
  status?: "active" | "banned";
}

export interface UserFormData {
  name: string;
  email: string;
  role: RoleName; // Now supports: super_admin | admin | user
  password?: string;
}

export interface UserStats {
  total: number;
  active: number;
  banned: number;
  admins: number;
}

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  permissions?: string[];
  image?: string | null;
};

export type Session = { user: SessionUser } | null;
