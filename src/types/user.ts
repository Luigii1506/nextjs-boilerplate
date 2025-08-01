import type { RoleName } from "@/lib/auth/permissions";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: RoleName;
  status: "active" | "banned";
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: string | null;
}

export interface UserFormData {
  name: string;
  email: string;
  role: RoleName;
  password?: string;
}

export interface UserStats {
  total: number;
  active: number;
  banned: number;
  admins: number;
}
