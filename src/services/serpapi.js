const BASE = 'https://serpapi.com/search.json';

export async function serpapi(params){
  const api_key = import.meta.env.VITE_SERPAPI_KEY;
  if(!api_key){ throw new Error('Missing VITE_SERPAPI_KEY'); }
  const q = new URLSearchParams({ ...params, api_key });
  const url = `${BASE}?${q.toString()}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error(`SerpAPI error: ${res.status}`);
  return await res.json();
}

export function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }