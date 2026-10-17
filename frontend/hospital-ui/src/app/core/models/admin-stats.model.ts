export interface AdminDashboardStats {
  users: { role: string; status: string; count: number }[];
  appointments: { status: string; count: number }[];
  revenue: { total_revenue: number; total_transactions: number };
}