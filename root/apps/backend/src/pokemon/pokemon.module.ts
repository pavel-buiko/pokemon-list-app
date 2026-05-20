import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PokemonController } from './pokemon.controller';
import { PokemonIndexCacheService } from './pokemon-index-cache.service';
import { PokemonService } from './pokemon.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15_000,
      maxRedirects: 5,
    }),
  ],
  controllers: [PokemonController],
  providers: [PokemonService, PokemonIndexCacheService],
  exports: [PokemonService],
})
export class PokemonModule {}
