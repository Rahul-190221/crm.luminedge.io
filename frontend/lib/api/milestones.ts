const BASE = '/api';

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function getMyMilestones(token: string) {
  const res = await fetch(`${BASE}/student/milestones`, {
    headers: authHeader(token),
  });
  return res.json();
}

export async function getStudentMilestones(token: string, studentId: string) {
  const res = await fetch(`${BASE}/milestones/${studentId}`, {
    headers: authHeader(token),
  });
  return res.json();
}

export async function updateMilestone(token: string, milestoneId: string, data: { status: string; notes?: string }) {
  const res = await fetch(`${BASE}/milestones/${milestoneId}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
  return res.json();
}
