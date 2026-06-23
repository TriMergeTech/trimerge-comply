import { getAccessToken } from '@/lib/authTokens';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function findingsFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data as T;
}

export interface Finding {
  _id: string;
  findingId: string;
  auditId: string;
  flagId?: string | null;
  observation: string;
  risk: { level: 'low' | 'medium' | 'high' | 'critical'; description: string };
  criteria?: string;
  recommendation?: string;
  status: 'new' | 'under_review' | 'additional_info_required' | 'approved' | 'rejected' | 'closed';
  handbookReference?: { handbookId?: string | null; section?: string; excerpt?: string };
  aiDrafted: boolean;
  analystNotes?: string;
  createdBy?: { name: string; email: string; role: string };
  assignedTo?: { name: string; email: string } | null;
  reviewedBy?: { name: string; email: string } | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FindingsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetFindingsParams {
  auditId?: string;
  status?: string;
  riskLevel?: string;
  page?: number;
  limit?: number;
}

export async function getFindings(
  params: GetFindingsParams = {}
): Promise<{ findings: Finding[]; pagination: FindingsPagination }> {
  const qs = new URLSearchParams();
  if (params.auditId) qs.set('auditId', params.auditId);
  if (params.status) qs.set('status', params.status);
  if (params.riskLevel) qs.set('riskLevel', params.riskLevel);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const res = await findingsFetch<{
    data: { findings: Finding[]; pagination: FindingsPagination };
  }>(`/findings?${qs}`);
  return res.data;
}

export async function getAuditFindings(
  auditId: string,
  params: { status?: string; riskLevel?: string; page?: number; limit?: number } = {}
): Promise<{ findings: Finding[]; pagination: FindingsPagination }> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.riskLevel) qs.set('riskLevel', params.riskLevel);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const res = await findingsFetch<{
    data: { findings: Finding[]; pagination: FindingsPagination };
  }>(`/audits/${auditId}/findings?${qs}`);
  return res.data;
}

export async function getFindingById(id: string): Promise<Finding> {
  const res = await findingsFetch<{ data: { finding: Finding } }>(`/findings/${id}`);
  return res.data.finding;
}

export interface CreateFindingData {
  auditId: string;
  flagId?: string | null;
  observation: string;
  risk?: { level: 'low' | 'medium' | 'high' | 'critical'; description?: string };
  analystNotes?: string;
}

export async function createFinding(data: CreateFindingData): Promise<Finding> {
  const res = await findingsFetch<{ data: { finding: Finding } }>('/findings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data.finding;
}

export interface UpdateFindingData {
  observation?: string;
  risk?: { level: 'low' | 'medium' | 'high' | 'critical'; description?: string };
  criteria?: string;
  recommendation?: string;
  analystNotes?: string;
  assignedTo?: string | null;
}

export async function updateFinding(id: string, data: UpdateFindingData): Promise<Finding> {
  const res = await findingsFetch<{ data: { finding: Finding } }>(`/findings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data.finding;
}

export type FindingStatus = Finding['status'];

export async function updateFindingStatus(
  id: string,
  status: FindingStatus,
  reason?: string
): Promise<Finding> {
  const res = await findingsFetch<{ data: { finding: Finding } }>(`/findings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
  });
  return res.data.finding;
}

export async function regenerateDraft(id: string): Promise<Finding> {
  const res = await findingsFetch<{ data: { finding: Finding } }>(`/findings/${id}/regenerate-draft`, {
    method: 'POST',
  });
  return res.data.finding;
}

export async function downloadFindingsReport(auditId: string, filename: string): Promise<void> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/audits/${auditId}/report`, { headers });
  if (!res.ok) throw new Error('Failed to download report');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
