import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PokemonIndexCacheService } from './pokemon-index-cache.service';
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
export class PokemonController {
  constructor(
    private readonly pokemonService: PokemonService,
    private readonly indexCache: PokemonIndexCacheService,
  ) {}

  @Get('search')
  search(
    @Query('q') query = '',
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.indexCache.search(query, limit ?? 20);
  }

  @Get()
  getCatalog(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.pokemonService.getCatalog(limit ?? 20, offset ?? 0);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.pokemonService.getCatalogItemById(id);
  }
}
