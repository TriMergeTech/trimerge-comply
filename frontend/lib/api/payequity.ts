// Pay Equity API service
// Handles all API calls related to pay equity analysis
// Follows the same pattern as dashboard.ts and audits.ts

import { getAccessToken } from "@/lib/authTokens";

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Shared fetch helper for pay equity endpoints
// Automatically attaches the access token to every request
async function payEquityFetch<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const token = getAccessToken();
    const headers: Record<string, string> = {};

    // Only set Content-Type for non-multipart requests
    // (for FormData/file uploads, let the browser set it with the correct boundary)
    if (!(options?.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            ...headers,
            // Preserve any headers passed in options (but Authorization always wins)
            ...(options?.headers as Record<string, string> | undefined),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Request failed");
    return data as T;
}

// --- TypeScript interfaces ---

export interface DepartmentGap {
    department: string;
    gap: number;
}

export interface DemographicGap {
    group: string;
    unadjustedGap: number;
    adjustedGap: number;
    flagged: boolean;
}

export interface PayEquityAnalysis {
    _id: string;
    fileName: string;
    totalEmployees: number;
    departmentsAnalyzed: number;
    demographicGroupsCount: number;
    flagsGenerated: number;
    departmentGaps: DepartmentGap[];
    demographicGaps: DemographicGap[];
    createdAt: string;
    updatedAt: string;
}

// --- API functions ---

// Upload a CSV file and run pay equity analysis
// Uses FormData — Content-Type is set by the browser automatically (with boundary)
export async function uploadPayEquityFile(file: File): Promise<void> {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE}/payequity/upload/`, {
        method: 'POST',
        headers,
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Upload failed');
}

// List all pay equity analyses (newest first)
export async function getPayEquityAnalyses(): Promise<PayEquityAnalysis[]> {
    const token = getAccessToken();
    const res = await fetch(`${BASE}/payequity`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Request failed');
    const analyses: any[] = data.data?.analyses ?? data.analyses ?? [];
    return analyses.map((a) => ({
        _id: a.id,
        fileName: a.fileName,
        totalEmployees: a.uiSummary?.totalEmployees ?? 0,
        departmentsAnalyzed: a.uiSummary?.departmentsAnalyzed ?? 0,
        demographicGroupsCount: a.uiSummary?.demographicGroups ?? 0,
        flagsGenerated: a.uiSummary?.flagsGenerated ?? 0,
        departmentGaps: (a.uiSummary?.payGapsByDepartment ?? []).map((d: any) => ({
            department: d.department,
            gap: d.unadjustedGapPercent ?? 0,
        })),
        demographicGaps: (a.uiSummary?.demographicGapsOverall ?? []).map((d: any) => ({
            group: d.demographicGroup,
            unadjustedGap: d.unadjustedGapPercent ?? 0,
            adjustedGap: d.adjustedGapPercent ?? 0,
            flagged: d.flagged ?? false,
        })),
        createdAt: a.date,
        updatedAt: a.date,
    }));
}
