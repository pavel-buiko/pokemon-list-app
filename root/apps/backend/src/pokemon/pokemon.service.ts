import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { PokemonSnapshot } from '../lists/list-rules.validator';
import { POKEAPI_BASE_URL } from '../shared/constants';

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

interface PokeApiPokemon {
  id: number;
  name: string;
  weight: number;
  sprites: {
    front_default: string | null;
  };
}

export interface PokemonCatalogItem extends PokemonSnapshot {
  sprite: string | null;
}

export interface PokemonCatalogPage {
  count: number;
  limit: number;
  offset: number;
  results: PokemonCatalogItem[];
}

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);
  private readonly detailCache = new Map<number, PokeApiPokemon>();

  constructor(private readonly httpService: HttpService) {}

  async getCatalog(limit = 20, offset = 0): Promise<PokemonCatalogPage> {
    const { data } = await this.fetch<PokemonListResponse>(
      `${POKEAPI_BASE_URL}/pokemon`,
      { limit, offset },
    );

    const results = await Promise.all(
      data.results.map(async (entry) => {
        const id = this.extractIdFromUrl(entry.url);
        const detail = await this.fetchPokemonDetail(id);
        return this.toCatalogItem(detail);
      }),
    );

    return {
      count: data.count,
      limit,
      offset,
      results,
    };
  }

  async getCatalogItemById(id: number): Promise<PokemonCatalogItem> {
    const detail = await this.fetchPokemonDetail(id);
    return this.toCatalogItem(detail);
  }

  async getPokemonByIds(
    ids: number[],
  ): Promise<Map<number, PokemonSnapshot>> {
    const map = new Map<number, PokemonSnapshot>();
    await Promise.all(
      ids.map(async (id) => {
        const detail = await this.fetchPokemonDetail(id);
        map.set(id, this.toSnapshot(detail));
      }),
    );
    return map;
  }

  private async fetchPokemonDetail(id: number): Promise<PokeApiPokemon> {
    const cached = this.detailCache.get(id);
    if (cached) {
      return cached;
    }

    const { data } = await this.fetch<PokeApiPokemon>(
      `${POKEAPI_BASE_URL}/pokemon/${id}`,
    );
    this.detailCache.set(id, data);
    return data;
  }

  private toSnapshot(pokemon: PokeApiPokemon): PokemonSnapshot {
    return {
      id: pokemon.id,
      name: pokemon.name,
      weight: pokemon.weight,
    };
  }

  private toCatalogItem(pokemon: PokeApiPokemon): PokemonCatalogItem {
    return {
      ...this.toSnapshot(pokemon),
      sprite: pokemon.sprites.front_default,
    };
  }

  private extractIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }

  private async fetch<T>(
    url: string,
    params?: Record<string, number>,
  ): Promise<{ data: T }> {
    try {
      return await firstValueFrom(
        this.httpService.get<T>(url, { params }),
      );
    } catch (error) {
      this.logHttpError(url, error);
      if (error instanceof AxiosError) {
        throw new ServiceUnavailableException(
          'Could not reach PokeAPI. Try again in a moment.',
        );
      }
      throw error;
    }
  }

  private logHttpError(context: string, error: unknown): void {
    if (error instanceof AxiosError) {
      this.logger.error(
        `PokeAPI error (${context}): ${error.response?.status ?? 'no status'} ${error.message}`,
      );
      return;
    }
    this.logger.error(`PokeAPI error (${context})`, error);
  }
}
