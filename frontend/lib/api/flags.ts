import { getAccessToken } from '@/lib/authTokens';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface FlagResults {
  jobTitle?: string;
  stage?: string;
  demographicGroup?: string;
  fourFifthsRule?: number;
  chiSquare?: number;
  fishersExact?: number;
}

export interface FlagItem {
  _id: string;
  name?: string;              // flag name e.g. "Position - Selection - J"
  testType: string;
  auditId?: string;
  group: string;              // demographic group e.g. Female
  referenceGroup: string;     // comparison group e.g. Male
  selected: number;
  total: number;
  selectionRate: number;
  impactRatio: number;
  threshold: number;
  pValue: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  assignedTo: string;
  results?: FlagResults;
  createdAt: string;
  updatedAt: string;
}

export interface GetFlagsParams {
  auditId?: string;
  status?: string;
  severity?: string;
  testType?: string;
  page?: number;
  limit?: number;
}

async function flagFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data as T;
}

export async function getFlags(params: GetFlagsParams = {}): Promise<{ flags: FlagItem[]; total: number }> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) qs.set(k, String(v));
  });

  const res = await flagFetch<{ data: { flags: FlagItem[]; total: number } }>(`/flags?${qs}`);
  return res.data;
}

export async function getFlagById(id: string): Promise<FlagItem> {
  const res = await flagFetch<{ data: FlagItem }>(`/flags/${id}`);
  return res.data;
}

// Decision data for analyst workflow
export interface DecideOnFlagData {
  decision: 'reviewed' | 'dismissed'
  rationale: string
}

// Assign flag data
export interface AssignFlagData {
  analystId: string
}

// Submit analyst decision on a flag
export function decideOnFlag(id: string, data: DecideOnFlagData) {
  return flagFetch<FlagItem>(`/flags/${id}/decide`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Assign a flag to an analyst
export function assignFlag(id: string, data: AssignFlagData) {
  return flagFetch<FlagItem>(`/flags/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}