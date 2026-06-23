// Audits API service
// Handles all API calls related to audits
// Follows the same pattern as auth.ts

import { getAccessToken } from "@/lib/authTokens";

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
// Shared fetch helper for audits
// Automatically attaches the access token to every request
async function auditFetch<T>(
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

// Audit data types matching the backend schema
export interface AuditCreatedBy {
  _id?: string;
  email: string;
  role: string;
  name?: string;
  companyName?: string;
}

export interface Audit {
  _id: string;
  name: string;
  description?: string | null;
  status: "draft" | "processing" | "completed" | "flagged";
  organization?: string | null;
  clientName?: string;
  auditType?: string;
  companyName?: string;
  createdBy: AuditCreatedBy;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAuditData {
  name: string;
  description?: string;
  organization?: string;
}

export interface UpdateAuditData {
  name?: string;
  description?: string;
  organization?: string;
  status?: "draft" | "processing" | "completed" | "flagged";
}

// Filter parameters for audits
export interface AuditFilters {
  status?: string;
  clientName?: string;
  auditType?: string;
  search?: string;
}

// Get all audits
export async function getAudits() {
  const response = await auditFetch<{ success: boolean; message: string; data: { audits: Audit[], total: number } }>('/audits');
  return response.data.audits
}

// Get a single audit by ID
export async function getAuditById(id: string): Promise<Audit> {
  const res = await auditFetch<{ data: { audit: Audit } }>(`/audits/${id}`);
  return res.data.audit;
}

// Create a new audit
export function createAudit(data: CreateAuditData) {
  return auditFetch<Audit>("/audits", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Update an audit
export function updateAudit(id: string, data: UpdateAuditData) {
  return auditFetch<Audit>(`/audits/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Delete an audit
export function deleteAudit(id: string) {
  return auditFetch<{ message: string }>(`/audits/${id}`, {
    method: "DELETE",
  });
}

export interface DeletionRequest {
  _id: string;
  auditId: { _id: string; name: string; status: string };
  auditSnapshot: unknown;
  requestedBy: { name: string; email: string; role: string };
  deletionNotes: string;
  directorId: { name: string; email: string };
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: unknown;
  reviewedAt: string;
  approvalNotes: string;
  createdAt: string;
}

export function submitDeletionRequest(auditId: string, data: { deletionNotes: string; directorId: string }) {
  return auditFetch<{ success: boolean }>(`/audits/${auditId}/deletion-request`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getDeletionRequests(status?: 'pending' | 'approved' | 'rejected') {
  const qs = status ? `?status=${status}` : '';
  return auditFetch<{ success: boolean; data: { requests: DeletionRequest[]; total: number } }>(`/audits/deletion-requests${qs}`);
}

export function reviewDeletionRequest(requestId: string, data: { decision: 'approved' | 'rejected'; approvalNotes: string }) {
  return auditFetch<{ success: boolean }>(`/audits/deletion-requests/${requestId}/review`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}