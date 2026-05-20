import { POKEMON_CARD_HEIGHT_CLASS } from '../../constants/grid';

interface PokemonCardProps {
  name: string;
  weightLabel: string;
  spriteUrl: string | null;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function PokemonCard({
  name,
  weightLabel,
  spriteUrl,
  selected,
  disabled,
  onClick,
}: PokemonCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex grow flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 capitalize transition-all duration-200 ${POKEMON_CARD_HEIGHT_CLASS} ${
        selected
          ? 'border-indigo-500 bg-indigo-50 shadow-sm'
          : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-white'
      } disabled:cursor-wait disabled:opacity-70`}
    >
      {spriteUrl ? (
        <img
          src={spriteUrl}
          alt={name}
          className="size-16 object-contain"
          loading="lazy"
        />
      ) : (
        <div className="size-16 rounded-full bg-slate-200" aria-hidden />
      )}
      <span className="text-sm font-medium text-slate-900">{name}</span>
      <span className="text-xs text-slate-500">{weightLabel}</span>
    </button>
  );
}
