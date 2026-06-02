// Position Description AI service
// Handles all API calls for position description analysis
// Follows the same pattern as audits.ts

import { getAccessToken } from "@/lib/authTokens";

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Position document type matching the backend response
export interface PositionDocument {
  id: string;
  documentName: string;
  status: string;
  flags: number;
  uploadedBy: string;
  date: string;
  view: string | null;
}

// Individual flag found by AI analysis
export interface PositionFlagSummary {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  evidence: string;
  explanation: string;
}

// Full detail response for a single position document
export interface PositionDocumentDetail {
  id: string;
  documentName: string;
  status: string;
  flags: number;
  uploadedBy: string;
  date: string;
  fileName: string;
  mimeType: string;
  storage: {
    publicId: string;
    secureUrl: string;
    resourceType: string;
    bytes: number;
    createdAt: string;
    originalFilename: string;
  };
  summary: string;
  overallRisk: 'low' | 'medium' | 'high';
  flagSummary: PositionFlagSummary[];
  aiRecommendations: string[];
  analystNotes: string;
  resolutionStatus: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  textPreview: string;
}

// Upload response type
export interface PositionUploadResponse {
  message: string;
  data?: unknown;
}

// Shared fetch helper for position endpoints
async function positionFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Only set Content-Type for non-FormData requests
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data as T;
}

// Get all position documents
export async function getPositionDocuments(): Promise<PositionDocument[]> {
  const res = await positionFetch<{ success: boolean; data: { documents: PositionDocument[] } }>('/position');
  return res.data.documents;
}

// Get a single position document's full detail (flags, AI recs, preview)
export async function getPositionDocumentById(id: string): Promise<PositionDocumentDetail> {
  const res = await positionFetch<{ success: boolean; data: { document: PositionDocumentDetail } }>(`/position/${id}`);
  return res.data.document;
}

// Upload a position description file for AI analysis
// Accepts .txt, .csv, .pdf, or .docx
export async function uploadPositionDocument(file: File): Promise<PositionUploadResponse> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // File uploads use FormData — do NOT set Content-Type manually
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE}/position/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Upload failed');
  return data;
}