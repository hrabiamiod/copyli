// Fetch wrapper z automatycznym Bearer tokenem i silent refresh na 401
// Uzywa modułowych zmiennych zamiast hooków — działa poza komponentami React

let _accessToken: string | null = null;
let _refreshFn: (() => Promise<boolean>) | null = null;
let _refreshPromise: Promise<boolean> | null = null; // kolejkowanie równoczesnych requestów

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function setRefreshFn(fn: (() => Promise<boolean>) | null) {
  _refreshFn = fn;
}

export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const makeHeaders = (token: string | null) => {
    const h = new Headers(options?.headers);
    if (token) h.set('Authorization', `Bearer ${token}`);
    h.set('X-Copyli-Client', 'web');
    return h;
  };

  const res = await fetch(url, { ...options, headers: makeHeaders(_accessToken) });

  if (res.status === 401 && _refreshFn) {
    // Kolejkuj: jeśli refresh już trwa, czekaj na ten sam promise
    if (!_refreshPromise) {
      _refreshPromise = _refreshFn().finally(() => { _refreshPromise = null; });
    }
    const refreshed = await _refreshPromise;
    if (refreshed) {
      return fetch(url, { ...options, headers: makeHeaders(_accessToken) });
    }
  }

  return res;
}

// Shorthand dla JSON API calls
export async function apiGet<T>(url: string): Promise<T> {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json() as { error?: string } & T;
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Błąd ${res.status}`);
  return data as T;
}
