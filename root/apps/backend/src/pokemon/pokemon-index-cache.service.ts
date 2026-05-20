import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { POKEAPI_BASE_URL, POKEMON_INDEX_LIMIT } from '../shared/constants';

export interface PokemonIndexEntry {
  id: number;
  name: string;
  url: string;
}

interface PokemonListResponse {
  results: { name: string; url: string }[];
}

@Injectable()
export class PokemonIndexCacheService implements OnModuleInit {
  private readonly logger = new Logger(PokemonIndexCacheService.name);
  private entries: PokemonIndexEntry[] = [];
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor(private readonly httpService: HttpService) {}

  onModuleInit(): void {
    this.ensureLoaded().catch(() => {
      this.logger.warn('Pokémon index preload failed');
    });
  }

  async search(query: string, limit = 20): Promise<PokemonIndexEntry[]> {
    await this.ensureLoaded();

    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    const matches: PokemonIndexEntry[] = [];
    for (const entry of this.entries) {
      if (entry.name.includes(normalized)) {
        matches.push(entry);
        if (matches.length >= limit) {
          break;
        }
      }
    }
    return matches;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) {
      return;
    }
    if (!this.loadPromise) {
      this.loadPromise = this.loadIndex();
    }
    await this.loadPromise;
  }

  private async loadIndex(): Promise<void> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<PokemonListResponse>(
          `${POKEAPI_BASE_URL}/pokemon`,
          { params: { limit: POKEMON_INDEX_LIMIT, offset: 0 } },
        ),
      );

      this.entries = data.results.map((row) => ({
        id: this.extractIdFromUrl(row.url),
        name: row.name,
        url: row.url,
      }));
      this.loaded = true;
      this.logger.log(`Cached ${this.entries.length} Pokémon names`);
    } catch (error) {
      this.loadPromise = null;
      if (error instanceof AxiosError) {
        throw new ServiceUnavailableException(
          'Could not reach PokeAPI. Try again in a moment.',
        );
      }
      throw error;
    }
  }

  private extractIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }
}
