import { API_URL } from './base'

export const getReports = async (token: string, options: { range?: string, bdm?: string, startDate?: string, endDate?: string, month?: number, year?: number }) => {
  const params = new URLSearchParams();
  if (options.range) params.append('range', options.range);
  if (options.bdm) params.append('bdm', options.bdm);
  if (options.startDate) params.append('startDate', options.startDate);
  if (options.endDate) params.append('endDate', options.endDate);
  if (options.month !== undefined) params.append('month', options.month.toString());
  if (options.year !== undefined) params.append('year', options.year.toString());
  
  const url = `${API_URL}/reports/bdm?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch reports');
  return data;
};

export const getTaskStatus = async (token: string, bdmId: string, date?: string) => {
  const params = new URLSearchParams();
  params.append('bdmId', bdmId);
  if (date) params.append('date', date);

  const url = `${API_URL}/reports/task-status?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch task status');
  return data;
};
