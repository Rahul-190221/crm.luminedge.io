const BASE = '/api';

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function uploadDocument(token: string, formData: FormData, isStudent: boolean) {
  const endpoint = isStudent ? '/student/documents/upload' : '/documents/upload';
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: authHeader(token),
    body: formData,
  });
  return res.json();
}

export async function getMyDocuments(token: string) {
  const res = await fetch(`${BASE}/student/documents`, {
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function getStudentDocuments(token: string, studentId: string) {
  const res = await fetch(`${BASE}/documents/${studentId}`, {
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function requestDocument(token: string, data: {
  studentId: string;
  documentType: string;
  applicationId?: string;
  requestNote?: string;
}) {
  const res = await fetch(`${BASE}/documents/request`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function reviewDocument(token: string, docId: string, status: string, reviewNote?: string) {
  const res = await fetch(`${BASE}/documents/${docId}/review`, {
    method: 'PATCH',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reviewNote }),
  });
  return res.json();
}
