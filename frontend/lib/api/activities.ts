import { API_URL } from './base'

export const getActivities = async (token: string) => {
  const response = await fetch(`${API_URL}/activities`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch activities');
  }

  return data;
};
