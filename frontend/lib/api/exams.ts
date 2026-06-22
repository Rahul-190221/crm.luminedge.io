import type { Exam, FilterState } from '@/types/admin';

import { API_URL as API_BASE_URL } from './base';

const getAuthHeader = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const getExams = async (filters?: FilterState): Promise<Exam[]> => {
  const params = new URLSearchParams();
  if (filters?.testType && filters.testType !== 'all') params.append('testType', filters.testType);
  if (filters?.examType && filters.examType !== 'all') params.append('examType', filters.examType);
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);

  const response = await fetch(`${API_BASE_URL}/exams?${params}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch exams');
  return response.json();
};

export const getExam = async (id: string): Promise<Exam> => {
  const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch exam');
  return response.json();
};

export const createExam = async (examData: Omit<Exam, '_id' | 'createdAt' | 'updatedAt'>): Promise<Exam> => {
  const response = await fetch(`${API_BASE_URL}/exams`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(examData)
  });
  if (!response.ok) throw new Error('Failed to create exam');
  return response.json();
};

export const updateExam = async (id: string, examData: Partial<Exam>): Promise<Exam> => {
  const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify(examData)
  });
  if (!response.ok) throw new Error('Failed to update exam');
  return response.json();
};

export const deleteExam = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to delete exam');
};
