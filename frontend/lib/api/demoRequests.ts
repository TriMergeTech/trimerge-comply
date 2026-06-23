import { getAccessToken } from '@/lib/authTokens';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface DemoRequestPayload {
  firstName: string;
  lastName: string;
  workEmail: string;
  organization: string;
  jobTitle: string;
  phoneNumber?: string;
  companySize: string;
  role: string;
  interests: string[];
  additionalDetails?: string;
}

export interface DemoRequest {
  _id: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  organization: string;
  jobTitle: string;
  phoneNumber?: string;
  companySize: string;
  role: string;
  interests: string[];
  additionalDetails?: string;
  status: 'new' | 'contacted' | 'scheduled' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export type DemoRequestStatus = 'contacted' | 'scheduled' | 'closed';

async function demoFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data as T;
}

export async function submitDemoRequest(payload: DemoRequestPayload): Promise<void> {
  await fetch(`${BASE}/demo-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Submission failed');
  });
}

export async function getDemoRequests(params: { page?: number; limit?: number } = {}): Promise<{
  requests: DemoRequest[];
  total: number;
  totalPages: number;
}> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));

  const res = await demoFetch<{
    data: { requests: DemoRequest[]; pagination: { total: number; totalPages: number } };
  }>(`/demo-requests?${qs}`);

  return {
    requests: res.data.requests,
    total: res.data.pagination.total,
    totalPages: res.data.pagination.totalPages,
  };
}

export async function getDemoRequestById(id: string): Promise<DemoRequest> {
  const res = await getDemoRequests({ limit: 200 });
  const found = res.requests.find((r) => r._id === id);
  if (!found) throw new Error('Request not found.');
  return found;
}

export async function updateDemoRequestStatus(id: string, status: DemoRequestStatus): Promise<void> {
  await demoFetch(`/demo-requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
