import { API_URL as API_BASE_URL } from './base';
import { getToken } from '../helpers/jwt';

// Helper to get auth token
const getAuthHeader = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const fetchNoCache = (url: string) =>
  fetch(url, { headers: getAuthHeader(), cache: 'no-store' });

// BDM Dashboard APIs
export const getBDMStats = async () => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/bdm/stats`);
  if (!response.ok) throw new Error('Failed to fetch BDM stats');
  return response.json();
};

export const getRecentLeads = async (limit: number = 5) => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/bdm/recent-leads?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch recent leads');
  return response.json();
};

export const getUpcomingTasks = async (limit: number = 5) => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/bdm/upcoming-tasks?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch upcoming tasks');
  return response.json();
};

// Shared Dashboard APIs
export const getLeadStageDistribution = async () => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/lead-stage-distribution`);
  if (!response.ok) throw new Error('Failed to fetch lead stage distribution');
  return response.json();
};

export const getLeadStageTrend = async () => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/lead-stage-trend`);
  if (!response.ok) throw new Error('Failed to fetch lead stage trend');
  return response.json();
};

export const getLeadSourceDistribution = async () => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/lead-source-distribution`);
  if (!response.ok) throw new Error('Failed to fetch lead source distribution');
  return response.json();
};

export const getConversionRateTrend = async () => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/conversion-rate-trend`);
  if (!response.ok) throw new Error('Failed to fetch conversion rate trend');
  return response.json();
};

export const getStatusDistribution = async () => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/status-distribution`);
  if (!response.ok) throw new Error('Failed to fetch status distribution');
  return response.json();
};

// ─── Batch endpoints (1 request = full dashboard) ───────────────────────────
export const getBDMDashboardAll = async () => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/bdm/all`);
  if (!response.ok) throw new Error(`BDM dashboard fetch failed: ${response.status}`);
  return response.json();
};

export const getAdminDashboardAll = async () => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/admin/all`);
  if (!response.ok) throw new Error(`Admin dashboard fetch failed: ${response.status}`);
  return response.json();
};

// Admin Dashboard APIs
export const getAdminStats = async () => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/admin/stats`);
  if (!response.ok) throw new Error('Failed to fetch admin stats');
  return response.json();
};

export const getRecentActivity = async (limit: number = 5) => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/admin/recent-activity?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch recent activity');
  return response.json();
};

export const getTopPerformers = async (limit: number = 4) => {
  const response = await fetchNoCache(`${API_BASE_URL}/dashboard/admin/top-performers?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch top performers');
  return response.json();
};
