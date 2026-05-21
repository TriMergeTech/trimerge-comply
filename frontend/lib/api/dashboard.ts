// Dashboard API service
// Used by:
//   - /compliance page (flags data, severity charts, recent flag activity)
//   - /dashboard page (total audits, recent audits, audit status)
//   - /reports page (export all audits and flags)

import { getAccessToken } from "@/lib/authTokens";
import { FlagItem } from "@/lib/api/flags";
import { Audit } from "@/lib/api/audits";

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Dashboard summary response types
export interface AuditsByStatus {
  draft: number;
  processing: number;
  completed: number;
  flagged: number;
}

export interface FlagsBySeverity {
  low: number;
  medium: number;
  high: number;
}

export interface FlagsByStatus {
  open: number;
  reviewed: number;
  dismissed: number;
}

export interface DashboardSummary {
  totalAudits: number;
  auditsByStatus: AuditsByStatus;
  totalFlags: number;
  flagsBySeverity: FlagsBySeverity;
  flagsByStatus: FlagsByStatus;
  overallRisk: 'high' | 'medium' | 'low' | 'none';
  auditRiskSummaries: Audit[];
  recentAudits: Audit[];
  recentFlags: FlagItem[];
}

export interface DashboardExport {
  audits: Audit[];
  flags: FlagItem[];
}

// Fetch dashboard summary data
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/dashboard/summary`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data.data;
}

// Fetch all data for export
export async function getDashboardExport(): Promise<DashboardExport> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/dashboard/export`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data.data;
}