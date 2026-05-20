import {
  MAX_TOTAL_WEIGHT_HG,
  MIN_SPECIES,
} from '../shared/constants';

export type ValidationErrorCode =
  | 'MIN_SPECIES'
  | 'WEIGHT_LIMIT'
  | 'DUPLICATE_SPECIES';

export interface ListValidationError {
  code: ValidationErrorCode;
  message: string;
  details?: Record<string, number>;
}

export interface PokemonSnapshot {
  id: number;
  name: string;
  weight: number;
}

export function validateListRules(
  items: PokemonSnapshot[],
): ListValidationError[] {
  const errors: ListValidationError[] = [];
  const ids = items.map((item) => item.id);
  const uniqueIds = new Set(ids);

  if (ids.length !== uniqueIds.size) {
    errors.push({
      code: 'DUPLICATE_SPECIES',
      message: 'Each Pokémon can only appear once in the list.',
    });
  }

  if (uniqueIds.size < MIN_SPECIES) {
    errors.push({
      code: 'MIN_SPECIES',
      message: `Need at least ${MIN_SPECIES} Pokémon (you have ${uniqueIds.size}).`,
      details: { required: MIN_SPECIES, selected: uniqueIds.size },
    });
  }

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight > MAX_TOTAL_WEIGHT_HG) {
    errors.push({
      code: 'WEIGHT_LIMIT',
      message: `Weight limit is ${MAX_TOTAL_WEIGHT_HG} hg (total: ${totalWeight} hg).`,
      details: {
        limit: MAX_TOTAL_WEIGHT_HG,
        total: totalWeight,
      },
    });
  }

  return errors;
}
