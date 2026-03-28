const BASE_URL = 'https://api.donna-legal.com';

import { getUserId } from '@/lib/auth';

// Public GET — no user_id required (e.g. Gmail OAuth URL)
export async function apiPublicGet<T = any>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API GET ${endpoint} failed (${res.status}): ${errorText}`);
  }
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) return res.json();
  return {} as T;
}

function buildUrl(endpoint: string): string {
  const userId = getUserId();
  const url = `${BASE_URL}${endpoint}`;
  return url + (url.includes('?') ? '&' : '?') + `user_id=${encodeURIComponent(userId)}`;
}

export async function apiGet<T = any>(endpoint: string): Promise<T> {
  const url = buildUrl(endpoint);
  const res = await fetch(url);

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API GET ${endpoint} failed (${res.status}): ${errorText}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json();
  }
  return {} as T;
}

export async function apiPost<T = any>(endpoint: string, body?: object): Promise<T> {
  const userId = getUserId();
  const url = `${BASE_URL}${endpoint}` + (endpoint.includes('?') ? '&' : '?') + `user_id=${encodeURIComponent(userId)}`;
  const finalBody = body ? { ...body, user_id: userId } : { user_id: userId };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(finalBody),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API POST ${endpoint} failed (${res.status}): ${errorText}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json();
  }
  return {} as T;
}

export async function apiPut<T = any>(endpoint: string, body?: object): Promise<T> {
  const userId = getUserId();
  const url = `${BASE_URL}${endpoint}` + (endpoint.includes('?') ? '&' : '?') + `user_id=${encodeURIComponent(userId)}`;
  const finalBody = body ? { ...body, user_id: userId } : { user_id: userId };

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(finalBody),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API PUT ${endpoint} failed (${res.status}): ${errorText}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json();
  }
  return {} as T;
}

export async function apiDelete<T = any>(endpoint: string): Promise<T> {
  const userId = getUserId();
  const url = `${BASE_URL}${endpoint}` + (endpoint.includes('?') ? '&' : '?') + `user_id=${encodeURIComponent(userId)}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API DELETE ${endpoint} failed (${res.status}): ${errorText}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json();
  }
  return {} as T;
}
