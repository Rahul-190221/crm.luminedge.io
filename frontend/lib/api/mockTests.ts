import type { MockTestPackage, MockTestSchedule, FilterState, LuminedgeSchedule } from '@/types/admin';

import { API_ORIGIN } from './base'
const API_BASE_URL = `${API_ORIGIN}/api`;
/** When `/api/schedules` fails (e.g. local Node cannot reach Vercel), same source as `HomePage` schedules. */
const LUMINEDGE_PUBLIC_SCHEDULES_URL =
  process.env.NEXT_PUBLIC_LUMINEDGE_SCHEDULES_URL?.trim() ||
  'https://luminedge-server.vercel.app/api/v1/admin/get-schedules';

const getAuthHeader = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Legacy functions
export const updateMockNumber = async (userId: string, mockData: any) => {
  const response = await fetch(`${API_ORIGIN}/api/v1/user/mock-tests/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockData),
  });
  return response.json();
};

export const getMockTests = async (userId: string) => {
  const response = await fetch(`${API_ORIGIN}/api/v1/user/mock-tests/${userId}`);
  return response.json();
};

// Mock Test Packages
export const getMockTestPackages = async (): Promise<MockTestPackage[]> => {
  const response = await fetch(`${API_BASE_URL}/mock-test-packages`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch mock test packages');
  return response.json();
};

export const getMockTestPackage = async (testType: string): Promise<MockTestPackage> => {
  const response = await fetch(`${API_BASE_URL}/mock-test-packages/${testType}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch mock test package');
  return response.json();
};

export const createMockTestPackage = async (data: Omit<MockTestPackage, '_id' | 'createdAt' | 'updatedAt'>): Promise<MockTestPackage> => {
  const response = await fetch(`${API_BASE_URL}/mock-test-packages`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create mock test package');
  return response.json();
};

export const updateMockTestPackage = async (testType: string, data: { features: string[]; pricing: { testCount: number; fee: number }[] }): Promise<MockTestPackage> => {
  const response = await fetch(`${API_BASE_URL}/mock-test-packages/${testType}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update mock test package');
  return response.json();
};

export const deleteMockTestPackage = async (testType: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/mock-test-packages/${testType}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to delete mock test package');
};

export const seedMockTestPackages = async (): Promise<{ message: string; count: number }> => {
  const response = await fetch(`${API_BASE_URL}/mock-test-packages/seed`, {
    method: 'POST',
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to seed mock test packages');
  return response.json();
};

// Mock Test Schedules
export const getMockTestSchedules = async (filters?: FilterState): Promise<MockTestSchedule[]> => {
  const params = new URLSearchParams();
  if (filters?.testType && filters.testType !== 'all') params.append('testType', filters.testType);
  if (filters?.examType && filters.examType !== 'all') params.append('examType', filters.examType);
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);

  const response = await fetch(`${API_BASE_URL}/mock-tests/schedules?${params}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch mock test schedules');
  return response.json();
};

export const getMockTestSchedule = async (id: string): Promise<MockTestSchedule> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/schedules/${id}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch mock test schedule');
  return response.json();
};

export const createMockTestSchedule = async (data: Omit<MockTestSchedule, '_id' | 'createdAt' | 'updatedAt'>): Promise<MockTestSchedule> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/schedules`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create mock test schedule');
  return response.json();
};

export const updateMockTestSchedule = async (id: string, data: Partial<MockTestSchedule>): Promise<MockTestSchedule> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/schedules/${id}`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update mock test schedule');
  return response.json();
};

export const deleteMockTestSchedule = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/schedules/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to delete mock test schedule');
};

function asScheduleList(payload: unknown): LuminedgeSchedule[] {
  return Array.isArray(payload) ? (payload as LuminedgeSchedule[]) : [];
}

// Luminedge Available Schedules (CRM proxy first, then browser-direct public API)
export const getAvailableSchedulesFromLuminedge = async (): Promise<LuminedgeSchedule[]> => {
  const proxyRes = await fetch(`${API_BASE_URL}/schedules`, {
    headers: getAuthHeader()
  });
  if (proxyRes.ok) {
    return asScheduleList(await proxyRes.json());
  }

  const directRes = await fetch(LUMINEDGE_PUBLIC_SCHEDULES_URL);
  if (directRes.ok) {
    return asScheduleList(await directRes.json());
  }

  throw new Error('Failed to fetch available schedules');
};
