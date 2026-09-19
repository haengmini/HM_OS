import type { ListDirectoryResult, ReadFileResult } from '@hm-os/contracts';

type FetchInit = Parameters<typeof fetch>[1];

async function api<T>(url: string, init?: FetchInit): Promise<T> {
  const response = await fetch(url, { credentials: 'include', ...init });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? `File API failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function listDirectory(path: string) {
  return api<ListDirectoryResult>(`/api/files/list?path=${encodeURIComponent(path)}`);
}

export function readTextFile(path: string) {
  return api<ReadFileResult>(`/api/files/read?path=${encodeURIComponent(path)}`);
}

export function writeTextFile(path: string, content: string, expectedMtimeMs?: number) {
  return api<{ ok: true }>('/api/files/write', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path, content, expectedMtimeMs }),
  });
}

export function createDirectory(path: string) {
  return api<{ ok: true }>('/api/files/mkdir', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ path }),
  });
}

export function movePath(from: string, to: string) {
  return api<{ ok: true }>('/api/files/move', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ from, to }),
  });
}

export function deletePath(path: string) {
  return api<{ ok: true }>('/api/files/delete', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ path }),
  });
}

export async function uploadFile(path: string, file: File) {
  const response = await fetch(`/api/files/upload?path=${encodeURIComponent(path)}`, {
    method: 'POST', credentials: 'include', headers: { 'content-type': 'application/octet-stream' }, body: file,
  });
  if (!response.ok) throw new Error(`Upload failed (${response.status})`);
}
