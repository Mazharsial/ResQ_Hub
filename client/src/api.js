let token = sessionStorage.getItem('t') || '';
export const setToken = (t) => { token = t; t ? sessionStorage.setItem('t', t) : sessionStorage.removeItem('t'); };
export async function api(path, method = 'GET', body) {
  const res = await fetch('/api' + path, { method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body && JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
export const CITIES = { Lahore: [74.35, 31.55], Islamabad: [73.05, 33.68], Peshawar: [71.5, 34.0], Karachi: [67.0, 24.86], Quetta: [66.99, 30.18] };
