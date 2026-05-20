import type { PokemonCatalogItem } from '../../types';

interface SelectedChipsProps {
  items: PokemonCatalogItem[];
  onRemove: (item: PokemonCatalogItem) => void;
}

export function SelectedChips({ items, onRemove }: SelectedChipsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="mb-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm capitalize text-indigo-900"
        >
          {item.name} ({item.weight} hg)
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="ml-0.5 rounded-full px-1 text-indigo-700 hover:bg-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={`Remove ${item.name}`}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
