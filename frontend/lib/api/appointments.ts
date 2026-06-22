const BASE = '/api';

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function requestAppointment(token: string, data: {
  type: string;
  scheduledAt: string;
  durationMinutes?: number;
  notes?: string;
}) {
  const res = await fetch(`${BASE}/student/appointments`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getMyAppointments(token: string) {
  const res = await fetch(`${BASE}/student/appointments`, {
    headers: authHeader(token),
  });
  return res.json();
}

export async function getAllAppointments(token: string, status?: string) {
  const qs = status ? `?status=${status}` : '';
  const res = await fetch(`${BASE}/appointments${qs}`, {
    headers: authHeader(token),
  });
  return res.json();
}

export async function updateAppointment(token: string, id: string, data: Partial<{
  status: string;
  scheduledAt: string;
  staffId: string;
  staffType: string;
  notes: string;
  meetingLink: string;
}>) {
  const res = await fetch(`${BASE}/appointments/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
  return res.json();
}
