import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PokemonService } from '../pokemon/pokemon.service';
import { EXPORT_SCHEMA_VERSION } from '../shared/constants';
import { CreateListDto } from './dto/create-list.dto';
import { ListExportDto } from './dto/list-export.dto';
import { validateListRules } from './list-rules.validator';
import {
  PokemonList,
  PokemonListDocument,
} from './schemas/pokemon-list.schema';

export interface ListSummaryDto {
  id: string;
  name: string;
  itemCount: number;
  totalWeight: number;
  updatedAt: Date;
  createdAt: Date;
}

@Injectable()
export class ListsService {
  constructor(
    @InjectModel(PokemonList.name)
    private readonly listModel: Model<PokemonListDocument>,
    private readonly pokemonService: PokemonService,
  ) {}

  async findAll(): Promise<ListSummaryDto[]> {
    const lists = await this.listModel.find().sort({ updatedAt: -1 }).exec();
    return lists.map((list) => this.toSummary(list));
  }

  async findOne(id: string): Promise<PokemonListDocument> {
    const list = await this.listModel.findById(id).exec();
    if (!list) {
      throw new NotFoundException(`List with id "${id}" not found`);
    }
    return list;
  }

  async create(dto: CreateListDto): Promise<PokemonListDocument> {
    const uniqueIds = [...new Set(dto.pokemonIds)];
    if (uniqueIds.length !== dto.pokemonIds.length) {
      throw new BadRequestException({
        message: 'Each Pokémon can only appear once in the list.',
        code: 'DUPLICATE_SPECIES',
      });
    }

    const pokemon = await this.pokemonService.getPokemonByIds(uniqueIds);
    const items = uniqueIds.map((id) => {
      const entry = pokemon.get(id);
      if (!entry) {
        throw new BadRequestException({
          message: `Pokémon with id ${id} was not found in PokeAPI.`,
          code: 'POKEMON_NOT_FOUND',
        });
      }
      return entry;
    });

    const validationErrors = validateListRules(items);
    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: validationErrors.map((e) => e.message).join(' '),
        errors: validationErrors,
      });
    }

    const list = await this.listModel.create({
      name: dto.name.trim(),
      items,
    });

    return list;
  }

  async remove(id: string): Promise<void> {
    const result = await this.listModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`List with id "${id}" not found`);
    }
  }

  async exportOne(id: string): Promise<ListExportDto> {
    const list = await this.findOne(id);
    return {
      version: EXPORT_SCHEMA_VERSION,
      name: list.name,
      items: list.items.map((item) => ({
        id: item.id,
        name: item.name,
        weight: item.weight,
      })),
    };
  }

  private toSummary(list: PokemonListDocument): ListSummaryDto {
    const totalWeight = list.items.reduce(
      (sum, item) => sum + item.weight,
      0,
    );
    return {
      id: list._id.toString(),
      name: list.name,
      itemCount: list.items.length,
      totalWeight,
      updatedAt: list.updatedAt,
      createdAt: list.createdAt,
    };
  }
}
