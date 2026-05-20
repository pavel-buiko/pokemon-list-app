import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonModule } from '../pokemon/pokemon.module';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { PokemonList, PokemonListSchema } from './schemas/pokemon-list.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PokemonList.name, schema: PokemonListSchema },
    ]),
    PokemonModule,
  ],
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}
