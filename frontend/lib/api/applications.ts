const BASE = '/api';

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function submitApplication(token: string, data: {
  serviceType: string;
  serviceDetail?: string;
  targetCountry?: string;
  targetUniversity?: string;
  targetCourse?: string;
  preferredIntake?: string;
}) {
  const res = await fetch(`${BASE}/student/applications`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getMyApplications(token: string) {
  const res = await fetch(`${BASE}/student/applications`, {
    headers: authHeader(token),
  });
  return res.json();
}

export async function getAllApplications(token: string, params?: { status?: string; serviceType?: string; page?: number }) {
  const qs = new URLSearchParams(params as any).toString();
  const res = await fetch(`${BASE}/applications?${qs}`, {
    headers: authHeader(token),
  });
  return res.json();
}

export async function getApplicationById(token: string, id: string) {
  const res = await fetch(`${BASE}/applications/${id}`, {
    headers: authHeader(token),
  });
  return res.json();
}

export async function assignStaff(token: string, id: string, data: {
  assignedBDM?: string;
}) {
  const res = await fetch(`${BASE}/applications/${id}/assign`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateApplicationStatus(token: string, id: string, status: string, note?: string) {
  const res = await fetch(`${BASE}/applications/${id}/status`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ status, note }),
  });
  return res.json();
}

export async function getStaffApplications(token: string) {
  const res = await fetch(`${BASE}/applications/my`, {
    headers: authHeader(token),
  });
  return res.json();
}
