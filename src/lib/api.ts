// Cliente pequeño para consumir las API Routes desde las páginas.
// Si la API responde con error, lanza un Error con el mensaje que devolvió.
export async function api<T>(
  url: string,
  options?: { method?: string; body?: unknown }
): Promise<T> {
  const res = await fetch(url, {
    method: options?.method ?? 'GET',
    headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json.error ?? `Error ${res.status}`)
  }
  return json as T
}
