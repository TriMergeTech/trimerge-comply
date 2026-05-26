// Activity Log API service
// Handles fetching activity logs for the reports page
// Follows the same pattern as audits.ts

import { getAccessToken } from "@/lib/authTokens";

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Activity log user type
export interface ActivityUser {
  name: string;
  email: string;
  role: string;
}

// Activity log target type
export interface ActivityTarget {
  type: 'audit' | 'flag';
  audit?: unknown;
  flag?: unknown;
}

// Activity log item type
export interface ActivityLog {
  id: string;
  user: ActivityUser;
  action: string;
  target: ActivityTarget;
  details: unknown;
  date: string;
}

// Pagination type
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query params for fetching activity logs
export interface GetActivityParams {
  targetType?: 'audit' | 'flag';
  action?: string;
  auditId?: string;
  performedBy?: string;
  page?: number;
  limit?: number;
}

// Fetch activity logs
export async function getActivityLogs(params: GetActivityParams = {}): Promise<{ logs: ActivityLog[]; pagination: Pagination }> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) qs.set(k, String(v));
  });

  const res = await fetch(`${BASE}/activity?${qs}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data.data;
}