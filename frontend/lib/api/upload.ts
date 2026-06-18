import { getAccessToken } from '@/lib/authTokens';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface UploadRecord {
  id: string;
  fileName: string;
  datasetType: string;
  status: string;
  uploadedBy: string;
  summary: Record<string, unknown>;
  warnings: Record<string, unknown>[];
  date: string;
}

export async function uploadCsv(file: File, auditId?: string) {
  const token = getAccessToken();
  const form = new FormData();
  form.append('file', file);
  if (auditId) form.append('auditId', auditId);

  const res = await fetch(`${BASE}/upload/csv`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Upload failed');
  return data.data ?? data;
}

export async function getUploads(): Promise<UploadRecord[]> {
  const token = getAccessToken();
  const res = await fetch(`${BASE}/upload/csv`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data.data?.analyses ?? data.analyses ?? [];
}
