export interface PokemonCatalogItem {
  id: number;
  name: string;
  weight: number;
  sprite: string | null;
}

export interface PokemonCatalogPage {
  count: number;
  limit: number;
  offset: number;
  results: PokemonCatalogItem[];
}

export interface PokemonSearchResult {
  id: number;
  name: string;
  url: string;
}

export interface ListSummary {
  id: string;
  name: string;
  itemCount: number;
  totalWeight: number;
  updatedAt: string;
  createdAt: string;
}

export interface ListDetail {
  id: string;
  name: string;
  items: PokemonCatalogItem[];
  itemCount: number;
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListExportFile {
  version: number;
  name: string;
  items: PokemonCatalogItem[];
}

export interface ApiValidationError {
  message: string;
  code?: string;
  errors?: Array<{
    code: string;
    message: string;
    details?: Record<string, number>;
  }>;
}
