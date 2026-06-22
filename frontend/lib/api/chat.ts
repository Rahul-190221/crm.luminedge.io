const BASE = '/api';

function authHeader(token: string, isStudent = false) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function getConversations(token: string, isStudent: boolean) {
  const endpoint = isStudent ? '/conversations/student' : '/conversations/staff';
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: authHeader(token, isStudent),
  });
  return res.json();
}

export async function getMessages(token: string, conversationId: string, isStudent: boolean, page = 1) {
  const endpoint = isStudent
    ? `/conversations/${conversationId}/messages/student`
    : `/conversations/${conversationId}/messages/staff`;
  const res = await fetch(`${BASE}${endpoint}?page=${page}`, {
    headers: authHeader(token, isStudent),
  });
  return res.json();
}

export async function sendMessage(token: string, conversationId: string, content: string, isStudent: boolean) {
  const endpoint = isStudent
    ? `/conversations/${conversationId}/messages/student`
    : `/conversations/${conversationId}/messages/staff`;
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: authHeader(token, isStudent),
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function createConversation(token: string, data: {
  participants: Array<{ participantId: string; participantType: string; name: string; role: string }>;
  applicationId?: string;
  title?: string;
}) {
  const res = await fetch(`${BASE}/conversations`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getAllConversations(token: string) {
  const res = await fetch(`${BASE}/admin/conversations`, {
    headers: authHeader(token),
  });
  return res.json();
}
