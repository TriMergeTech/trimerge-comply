// Audits API service
// Handles all API calls related to audits
// Follows the same pattern as auth.ts

import { getAccessToken } from "@/lib/authTokens";

const BASE = "http://localhost:4000/api";

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
  email: string;
  role: string;
}

export interface Audit {
  _id: string;
  name: string;
  description?: string
  status: "draft" | "processing" | "completed" | "flagged";
  organization?: string;
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

// Get all audits
export async function getAudits() {
  const response = await auditFetch<{ success: boolean; message: string; data: { audits: Audit[], total: number } }>("/audits");
  return response.data.audits
}

// Get a single audit by ID
export function getAuditById(id: string) {
  return auditFetch<Audit>(`/audits/${id}`);
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