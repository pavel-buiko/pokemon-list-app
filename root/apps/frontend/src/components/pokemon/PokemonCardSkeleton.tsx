import { POKEMON_CARD_HEIGHT_CLASS } from '../../constants/grid';

export function PokemonCardSkeleton() {
  return (
    <div
      className={`flex animate-pulse flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-3 ${POKEMON_CARD_HEIGHT_CLASS}`}
      aria-hidden
    >
      <div className="size-16 rounded-full bg-slate-200" />
      <div className="h-3 w-20 rounded bg-slate-200" />
      <div className="h-2 w-12 rounded bg-slate-200" />
    </div>
  );
}
