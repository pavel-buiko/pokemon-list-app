import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PokemonListDocument = HydratedDocument<PokemonList>;

@Schema({ _id: false })
export class PokemonListItem {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  weight: number;
}

export const PokemonListItemSchema =
  SchemaFactory.createForClass(PokemonListItem);

@Schema({ timestamps: true, collection: 'pokemon_lists' })
export class PokemonList {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: [PokemonListItemSchema], required: true })
  items: PokemonListItem[];

  createdAt: Date;
  updatedAt: Date;
}

export const PokemonListSchema = SchemaFactory.createForClass(PokemonList);
