import { getPokemonSpriteUrl } from '../../utils/pokemonSprite';

interface SavedPokemonRowProps {
  id: number;
  name: string;
  weight: number;
}

export function SavedPokemonRow({ id, name, weight }: SavedPokemonRowProps) {
  return (
    <li className="flex items-center gap-3 py-3">
      <img
        src={getPokemonSpriteUrl(id)}
        alt={name}
        width={56}
        height={56}
        className="size-12 shrink-0 object-contain sm:size-14"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium capitalize text-slate-900">{name}</p>
        <p className="text-sm text-slate-500">
          #{id} · {weight} hg
        </p>
      </div>
    </li>
  );
}
