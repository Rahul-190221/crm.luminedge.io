import { API_ORIGIN } from './base'

export const userAttendanceCount = async (userId: string) => {
  const response = await fetch(
    `${API_ORIGIN}/api/v1/user/attendance-count/${userId}`
  );
  return response.json();
};

export const userBookingRequests = async (userId: string) => {
  const response = await fetch(
    `${API_ORIGIN}/api/v1/user/booking-requests/${userId}`
  );
  return response.json();
};

export const getAllUsers = async () => {
  const response = await fetch(`${API_ORIGIN}/api/v1/users`);
  return response.json();
};

export const getUserById = async (userId: string) => {
  const response = await fetch(`${API_ORIGIN}/api/v1/users/${userId}`);
  return response.json();
};
