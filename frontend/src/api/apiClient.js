const BASE_URL = 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('access_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return null;
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail; } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export const apiClient = {
  get:      (path)         => request(path),
  post:     (path, body)   => request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
  postForm: (path, formData) => request(path, { method: 'POST', body: formData }),
  put:      (path, body)   => request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
  delete:   (path)         => request(path, { method: 'DELETE' }),
};
