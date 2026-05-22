// Dashboard API service
// Handles all API calls related to the dashboard summary and export
// Follows the same pattern as audits.ts

import { getAccessToken } from "@/lib/authTokens";

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Shared fetch helper for dashboard endpoints
// Automatically attaches the access token to every request
async function dashboardFetch<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const token = getAccessToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Request failed");
    return data as T;
}

// --- TypeScript interfaces ---

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

export interface DashboardCreatedBy {
    email: string;
    role: string;
}

export interface DashboardRecentAudit {
    _id: string;
    name: string;
    description?: string;
    status: "draft" | "processing" | "completed" | "flagged";
    organization?: string;
    createdBy: DashboardCreatedBy;
    createdAt: string;
    updatedAt: string;
}

export interface DashboardRecentFlag {
    _id: string;
    auditId: string;
    group: string;
    referenceGroup: string;
    selected: number;
    total: number;
    selectionRate: number;
    impactRatio: number;
    threshold: number;
    testType: string;
    pValue: number;
    severity: "low" | "medium" | "high";
    status: "open" | "reviewed" | "dismissed";
    createdAt: string;
    updatedAt: string;
}

export interface DashboardSummary {
    totalAudits: number;
    auditsByStatus: AuditsByStatus;
    totalFlags: number;
    flagsBySeverity: FlagsBySeverity;
    flagsByStatus: FlagsByStatus;
    recentAudits: DashboardRecentAudit[];
    recentFlags: DashboardRecentFlag[];
}

export interface DashboardExport {
    audits: DashboardRecentAudit[];
    flags: DashboardRecentFlag[];
}

// --- API functions ---

// Get dashboard summary (counts, breakdowns, recent audits & flags)
export async function getDashboardSummary(): Promise<DashboardSummary> {
    const response = await dashboardFetch<{ success: boolean; data: DashboardSummary }>(
        "/dashboard/summary"
    );
    return response.data;
}

// Export all dashboard data (requires analyst or admin role)
export async function getDashboardExport(): Promise<DashboardExport> {
    const response = await dashboardFetch<{ success: boolean; data: DashboardExport }>(
        "/dashboard/export"
    );
    return response.data;
}
