import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateListDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  pokemonIds: number[];
}
