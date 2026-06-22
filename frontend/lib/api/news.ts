const BASE = '/api';

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function getNews(category?: string) {
  const qs = category ? `?category=${category}` : '';
  const res = await fetch(`${BASE}/news${qs}`);
  return res.json();
}

export async function createNews(token: string, data: {
  title: string;
  content: string;
  category: string;
  isPinned?: boolean;
}) {
  const res = await fetch(`${BASE}/admin/news`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateNews(token: string, id: string, data: Partial<{
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isActive: boolean;
}>) {
  const res = await fetch(`${BASE}/admin/news/${id}`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteNews(token: string, id: string) {
  const res = await fetch(`${BASE}/admin/news/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  return res.json();
}
