import { API_ORIGIN } from './base';
import { getToken } from '@/lib/helpers/jwt';

const API_BASE_URL = `${API_ORIGIN}/api`;

const getAuthHeader = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...getAuthHeader(),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Request failed');
  }

  return response.json();
}

export interface LeadEditRequestPayload {
  section: string;
  payload: Record<string, any>;
  note?: string;
}

export interface LeadSnapshot {
  fullName?: string;
  email?: string;
  phone?: string;
  lifecycleStage?: string;
  source?: string;
  serviceInterest?: string[];
  assignedTo?: string;
}

export interface LeadEditRequestItem {
  _id: string;
  leadId:
    | string
    | {
        _id: string;
        fullName?: string;
        email?: string;
        phone?: string;
        lifecycleStage?: string;
        source?: string;
        serviceInterest?: string[];
        updatedAt?: string;
        assignedTo?: { _id?: string; name?: string; email?: string } | string;
      };
  section: string;
  payload: Record<string, any>;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy?:
    | string
    | {
        _id: string;
        name?: string;
        email?: string;
        role?: string;
      };
  requestedByName?: string;
  reviewedBy?:
    | string
    | {
        _id: string;
        name?: string;
        email?: string;
        role?: string;
      };
  reviewedAt?: string;
  reviewNote?: string;
  leadSnapshot?: LeadSnapshot;
  createdAt: string;
  updatedAt: string;
}

export interface LeadEditRequestResponse {
  success: boolean;
  message?: string;
  summary?: string;
  request: LeadEditRequestItem;
}

export async function submitLeadEditRequest(
  leadId: string,
  body: LeadEditRequestPayload
): Promise<LeadEditRequestResponse> {
  return request<LeadEditRequestResponse>(`/leads/${leadId}/edit-requests`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getLeadEditRequests(status = 'pending'): Promise<LeadEditRequestItem[]> {
  const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  const result = await request<{ success: boolean; requests: LeadEditRequestItem[] }>(`/lead-edit-requests${query}`);
  return result.requests || [];
}

export async function approveLeadEditRequest(requestId: string, reviewNote?: string): Promise<LeadEditRequestItem> {
  const result = await request<{ success: boolean; request: LeadEditRequestItem }>(`/lead-edit-requests/${requestId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ reviewNote }),
  });
  return result.request;
}

export async function rejectLeadEditRequest(requestId: string, reviewNote?: string): Promise<LeadEditRequestItem> {
  const result = await request<{ success: boolean; request: LeadEditRequestItem }>(`/lead-edit-requests/${requestId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reviewNote }),
  });
  return result.request;
}
