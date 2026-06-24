import type { Course, FilterState } from '@/types/admin';

import { API_URL as API_BASE_URL } from './base';

import { getToken } from '../helpers/jwt';

const getAuthHeader = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const getCourses = async (filters?: FilterState): Promise<Course[]> => {
  const params = new URLSearchParams();
  if (filters?.testType && filters.testType !== 'all') params.append('testType', filters.testType);
  if (filters?.status) params.append('isActive', filters.status === 'active' ? 'true' : 'false');
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);

  const response = await fetch(`${API_BASE_URL}/courses?${params}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch courses');
  return response.json();
};

export const getCourse = async (id: string): Promise<Course> => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch course');
  return response.json();
};

export const createCourse = async (courseData: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>): Promise<Course> => {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(courseData)
  });
  if (!response.ok) throw new Error('Failed to create course');
  return response.json();
};

export const updateCourse = async (id: string, courseData: Partial<Course>): Promise<Course> => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify(courseData)
  });
  if (!response.ok) throw new Error('Failed to update course');
  return response.json();
};

export const deleteCourse = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to delete course');
};
