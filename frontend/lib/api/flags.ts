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

export interface FlagAudit {
  _id: string;
  name: string;
  status: string;
  organization?: string;
}

export interface FlagItem {
  _id: string;
  name?: string;              // flag name e.g. "Position - Selection - J"
  testType: string;
  auditId?: string | FlagAudit;
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

export async function getFlags(params: GetFlagsParams = {}): Promise<{ flags: FlagItem[]; total: number; totalPages: number }> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) qs.set(k, String(v));
  });

  const res = await flagFetch<{ data: { flags: FlagItem[]; total: number; pagination: { totalPages: number } } }>(`/flags?${qs}`);
  return {
    flags: res.data.flags,
    total: res.data.total,
    totalPages: res.data.pagination?.totalPages ?? 1,
  };
}

export interface FlagDetail {
  flag: FlagItem;
  explanation: string;
}

export async function getFlagById(id: string): Promise<FlagDetail> {
  const res = await flagFetch<{ data: FlagDetail }>(`/flags/${id}`);
  return res.data;
}

export type DecisionValue = 'approved' | 'dismissed'

export async function decideFlag(id: string, decision: DecisionValue, reason: string): Promise<FlagItem> {
  const res = await flagFetch<{ data: { flag: FlagItem } }>(`/flags/${id}/decide`, {
    method: 'POST',
    body: JSON.stringify({ decision, reason }),
  });
  return res.data.flag;
}

