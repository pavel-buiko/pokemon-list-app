import type {
  ApiValidationError,
  ListDetail,
  ListExportFile,
  ListSummary,
  PokemonCatalogItem,
  PokemonCatalogPage,
  PokemonSearchResult,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    let payload: ApiValidationError = {
      message: `Request failed with status ${response.status}`,
    };
    try {
      payload = (await response.json()) as ApiValidationError;
    } catch {}
    throw new Error(payload.message);
  }
  return response.json() as Promise<T>;
}

export function fetchLists(): Promise<ListSummary[]> {
  return request<ListSummary[]>('/lists');
}

export function fetchList(id: string): Promise<ListDetail> {
  return request<ListDetail>(`/lists/${id}`);
}

export async function deleteList(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/lists/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as ApiValidationError;
      message = payload.message;
    } catch {}
    throw new Error(message);
  }
}

export function createList(name: string, pokemonIds: number[]): Promise<ListDetail> {
  return request<ListDetail>('/lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, pokemonIds }),
  });
}

export function fetchPokemonCatalog(
  limit: number,
  offset: number,
): Promise<PokemonCatalogPage> {
  return request<PokemonCatalogPage>(
    `/pokemon?limit=${limit}&offset=${offset}`,
  );
}

export function searchPokemon(query: string, limit = 20): Promise<PokemonSearchResult[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  return request<PokemonSearchResult[]>(`/pokemon/search?${params}`);
}

export function fetchPokemonById(id: number): Promise<PokemonCatalogItem> {
  return request<PokemonCatalogItem>(`/pokemon/${id}`);
}

export async function downloadListExport(id: string, fallbackName: string) {
  const response = await fetch(`${API_BASE}/lists/${id}/export`);
  if (!response.ok) {
    throw new Error('Failed to download list file');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  const filenameMatch = disposition?.match(/filename="(.+)"/);
  const filename = filenameMatch?.[1] ?? `${fallbackName}.json`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseListExportFile(content: string): ListExportFile {
  const parsed = JSON.parse(content) as Partial<ListExportFile>;

  if (parsed.version !== 1) {
    throw new Error('Unsupported file version. Expected version 1.');
  }

  if (!parsed.name || typeof parsed.name !== 'string') {
    throw new Error('Invalid file: missing list name.');
  }

  if (!Array.isArray(parsed.items) || parsed.items.length === 0) {
    throw new Error('Invalid file: items array is missing or empty.');
  }

  for (const item of parsed.items) {
    if (
      typeof item.id !== 'number' ||
      typeof item.name !== 'string' ||
      typeof item.weight !== 'number'
    ) {
      throw new Error(
        'Invalid file: each item must include id, name, and weight.',
      );
    }
  }

  return parsed as ListExportFile;
}
