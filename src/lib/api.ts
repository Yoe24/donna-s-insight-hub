import { supabase } from './supabase';

const BASE_URL = 'https://api.donna-legal.com';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function request<T = any>(method: string, path: string, body?: any, isFormData = false): Promise<T> {
  const headers = await getAuthHeaders();
  const userId = localStorage.getItem('donna_user_id');

  // Add user_id as query param for all methods
  let url = `${BASE_URL}${path}`;
  if (userId) {
    url += (url.includes('?') ? '&' : '?') + `user_id=${encodeURIComponent(userId)}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // For POST/PUT with JSON body, also inject user_id into the body
  let finalBody: any;
  if (isFormData) {
    finalBody = body;
  } else if (body) {
    finalBody = JSON.stringify(userId ? { ...body, user_id: userId } : body);
  } else if (method === 'POST' || method === 'PUT') {
    finalBody = userId ? JSON.stringify({ user_id: userId }) : undefined;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: finalBody,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API ${method} ${path} failed (${res.status}): ${errorText}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json();
  }
  return {} as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body?: any) => request<T>('POST', path, body),
  put: <T = any>(path: string, body?: any) => request<T>('PUT', path, body),
  delete: <T = any>(path: string) => request<T>('DELETE', path),
  upload: <T = any>(path: string, formData: FormData) => request<T>('POST', path, formData, true),
};
