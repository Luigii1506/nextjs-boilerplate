// 📊 Dashboard Types
// ==================
// Tipos específicos para la feature de dashboard

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  adminUsers: number;
}

export interface DashboardActivity {
  registrations: number;
  logins: number;
  verifications: number;
}

export interface DashboardKpi {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
}
