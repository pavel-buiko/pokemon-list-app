import { GRID_SLOT_COUNT, POKEMON_GRID_CLASS } from '../../constants/grid';
import { PokemonCardSkeleton } from './PokemonCardSkeleton';

interface PokemonGridShellProps {
  children: React.ReactNode[];
  loading?: boolean;
  busy?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  slotCount?: number;
  className?: string;
}

export function PokemonGridShell({
  children,
  loading = false,
  busy = false,
  empty = false,
  emptyMessage = 'No Pokémon found',
  slotCount = GRID_SLOT_COUNT,
  className = '',
}: PokemonGridShellProps) {
  const slots: React.ReactNode[] = [];

  if (loading) {
    for (let i = 0; i < slotCount; i += 1) {
      slots.push(<PokemonCardSkeleton key={`skeleton-${i}`} />);
    }
  } else {
    children.forEach((child, index) => {
      slots.push(
        <div key={`item-${index}`} className="transition-opacity duration-200">
          {child}
        </div>,
      );
    });
    while (slots.length < slotCount) {
      slots.push(
        <div
          key={`pad-${slots.length}`}
          className="min-h-36 invisible"
          aria-hidden
        />,
      );
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${POKEMON_GRID_CLASS} transition-opacity duration-200 ${
          loading || busy ? 'opacity-60' : 'opacity-100'
        }`}
        aria-busy={loading}
      >
        {slots}
      </div>
      {empty && !loading ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-white/80"
          role="status"
        >
          <p className="text-center text-sm text-slate-600">{emptyMessage}</p>
        </div>
      ) : null}
    </div>
  );
}
