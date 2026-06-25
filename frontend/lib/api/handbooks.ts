import { getAccessToken } from '@/lib/authTokens';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function handbooksFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data as T;
}

export interface Handbook {
  _id: string;
  name: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  textLength: number;
  chunkCount: number;
  status: 'processing' | 'ready' | 'failed';
  uploadedBy: {
    email: string;
    companyName: string;
    role: string;
  };
  storage: {
    secureUrl: string;
    publicId: string;
  };
  createdAt: string;
}

export async function getHandbooks(): Promise<{ handbooks: Handbook[]; total: number }> {
  const res = await handbooksFetch<{ data: { handbooks: Handbook[]; total: number } }>('/handbooks');
  return res.data;
}

export async function getHandbookById(id: string): Promise<Handbook> {
  const res = await handbooksFetch<{ data: { handbook: Handbook } }>(`/handbooks/${id}`);
  return res.data.handbook;
}

export interface UploadHandbookResult {
  handbookId: string;
  name: string;
  textLength: number;
  chunkCount: number;
  status: string;
  storageUrl: string;
}

export async function uploadHandbook(file: File): Promise<UploadHandbookResult> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/handbooks/upload`, {
    method: 'POST',
    headers,
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Upload failed');
  return data.data;
}

export async function deleteHandbook(id: string): Promise<void> {
  await handbooksFetch<unknown>(`/handbooks/${id}`, { method: 'DELETE' });
}
