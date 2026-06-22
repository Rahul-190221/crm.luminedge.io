import { API_URL } from './base'

export const getNotifications = async (token: string, limit = 50) => {
    const response = await fetch(`${API_URL}/notifications?limit=${limit}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch notifications');
    }

    return data;
};

export const markNotificationAsRead = async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to mark notification as read');
    }

    return data;
};

export const markAllNotificationsAsRead = async (token: string) => {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to mark all as read');
    }

    return data;
};
