// src/api.js
 
// fragments microservice API to use, defaults to localhost:8080 if not set in env
const fallback =
  (typeof window !== 'undefined' && window.location && window.location.origin) ||
  'http://localhost:8080';
const apiUrl = (process.env.API_URL || fallback).replace(/\/+$/, '');

export const getApiBaseUrl = () => apiUrl;

const handleJsonResponse = async (res) => {
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message = payload?.error?.message || `${res.status} ${res.statusText}`;
    const error = new Error(message);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  return { payload, res };
};

/**
 * Request all fragments for the authenticated user.
 */
export async function getUserFragments(user, { expand = true } = {}) {
  const search = expand ? '?expand=1' : '';
  const fragmentsUrl = new URL(`/v1/fragments${search}`, apiUrl);
  const { payload } = await handleJsonResponse(
    await fetch(fragmentsUrl, {
      headers: user.authorizationHeaders(),
    })
  );
  return payload;
}

/**
 * Create a new plain-text fragment for the authenticated user.
 */
export async function createFragment(user, content, type = 'text/plain') {
  const fragmentsUrl = new URL('/v1/fragments', apiUrl);
  const response = await fetch(fragmentsUrl, {
    method: 'POST',
    headers: user.authorizationHeaders(type),
    body: content,
  });

  const { payload, res } = await handleJsonResponse(response);
  return {
    fragment: payload.fragment,
    location: res.headers.get('Location'),
  };
}
