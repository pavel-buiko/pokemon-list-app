import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createList,
  fetchPokemonById,
  fetchPokemonCatalog,
  parseListExportFile,
  searchPokemon,
} from '../api/client';
import { Layout } from '../components/Layout';
import { PokemonCard } from '../components/pokemon/PokemonCard';
import { PokemonGridShell } from '../components/pokemon/PokemonGridShell';
import { SelectedChips } from '../components/pokemon/SelectedChips';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Field, inputClass } from '../components/ui/Field';
import { Panel } from '../components/ui/Panel';
import { Tooltip } from '../components/ui/Tooltip';
import { CATALOG_PAGE_SIZE } from '../constants/grid';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { PokemonCatalogItem, PokemonSearchResult } from '../types';

const MIN_SPECIES = 3;
const MAX_WEIGHT = 1300;
const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

export function CreateListPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [catalog, setCatalog] = useState<PokemonCatalogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [searchResults, setSearchResults] = useState<PokemonSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);

  const [listName, setListName] = useState('');
  const [selected, setSelected] = useState<Map<number, PokemonCatalogItem>>(
    new Map(),
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isSearchActive = debouncedSearch.trim().length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    if (isSearchActive) {
      return;
    }

    setLoadingCatalog(true);
    setCatalogError(null);
    fetchPokemonCatalog(CATALOG_PAGE_SIZE, offset)
      .then((page) => {
        setCatalog(page.results);
        setTotalCount(page.count);
      })
      .catch((err: Error) => setCatalogError(err.message))
      .finally(() => setLoadingCatalog(false));
  }, [offset, isSearchActive]);

  useEffect(() => {
    if (!isSearchActive) {
      setSearchResults([]);
      setSearchError(null);
      setLoadingSearch(false);
      return;
    }

    setLoadingSearch(true);
    setSearchError(null);
    searchPokemon(debouncedSearch.trim())
      .then(setSearchResults)
      .catch((err: Error) => {
        setSearchResults([]);
        setSearchError(err.message);
      })
      .finally(() => setLoadingSearch(false));
  }, [debouncedSearch, isSearchActive]);

  const selectedItems = useMemo(
    () => Array.from(selected.values()),
    [selected],
  );

  const uniqueCount = selectedItems.length;
  const totalWeight = selectedItems.reduce(
    (sum, item) => sum + item.weight,
    0,
  );

  const isListNameEmpty = listName.trim().length === 0;

  const canSave =
    !isListNameEmpty &&
    uniqueCount >= MIN_SPECIES &&
    totalWeight <= MAX_WEIGHT;

  function togglePokemon(pokemon: PokemonCatalogItem) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(pokemon.id)) {
        next.delete(pokemon.id);
      } else {
        next.set(pokemon.id, pokemon);
      }
      return next;
    });
  }

  async function handleSearchResultClick(entry: PokemonSearchResult) {
    if (selected.has(entry.id)) {
      setSelected((prev) => {
        const next = new Map(prev);
        next.delete(entry.id);
        return next;
      });
      return;
    }

    setLoadingDetailId(entry.id);
    setSearchError(null);
    try {
      const detail = await fetchPokemonById(entry.id);
      togglePokemon(detail);
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : 'Failed to load Pokémon details',
      );
    } finally {
      setLoadingDetailId(null);
    }
  }

  async function handleSave() {
    setSaveError(null);
    setSaving(true);
    try {
      const created = await createList(
        listName.trim(),
        selectedItems.map((item) => item.id),
      );
      navigate(`/lists/${created.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save list');
    } finally {
      setSaving(false);
    }
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    setUploadError(null);
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content =
          typeof reader.result === 'string' ? reader.result : '';
        const parsed = parseListExportFile(content);
        setListName(parsed.name);
        setSelected(
          new Map(parsed.items.map((item) => [item.id, { ...item, sprite: null }])),
        );
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : 'Failed to read file',
        );
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => setUploadError('Failed to read file');
    reader.readAsText(file);
  }

  const page = Math.floor(offset / CATALOG_PAGE_SIZE) + 1;
  const totalPages = Math.ceil(totalCount / CATALOG_PAGE_SIZE);

  const catalogCards = catalog.map((pokemon) => (
    <PokemonCard
      key={pokemon.id}
      name={pokemon.name}
      weightLabel={`${pokemon.weight} hg`}
      spriteUrl={pokemon.sprite}
      selected={selected.has(pokemon.id)}
      onClick={() => togglePokemon(pokemon)}
    />
  ));

  const searchCards = searchResults.map((entry) => {
    const selectedItem = selected.get(entry.id);
    return (
      <PokemonCard
        key={entry.id}
        name={entry.name}
        weightLabel={
          selectedItem
            ? `${selectedItem.weight} hg`
            : loadingDetailId === entry.id
              ? 'Loading…'
              : 'Add'
        }
        spriteUrl={selectedItem?.sprite ?? null}
        selected={selected.has(entry.id)}
        disabled={loadingDetailId === entry.id}
        onClick={() => handleSearchResultClick(entry)}
      />
    );
  });

  const showSearchSkeleton = loadingSearch && searchResults.length === 0;
  const showSearchBusy = loadingSearch && searchResults.length > 0;

  return (
    <Layout title="Create new list">
      <div className="flex flex-wrap gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Back
        </Link>
        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Upload list file
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {uploadError ? <Alert variant="error">{uploadError}</Alert> : null}

      <Panel>
        <Field label="List name">
          <input
            className={inputClass}
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="My awesome team"
          />
        </Field>

        <div className="mb-4 space-y-1 text-sm text-slate-600">
          <p>
            Selected: <strong className="text-slate-900">{uniqueCount}</strong> /{' '}
            {MIN_SPECIES} min species
          </p>
          <p>
            Total weight:{' '}
            <strong className="text-slate-900">{totalWeight}</strong> / {MAX_WEIGHT}{' '}
            hg
          </p>
          {uniqueCount < MIN_SPECIES ? (
            <Alert variant="warning">
              Need at least {MIN_SPECIES} Pokémon.
            </Alert>
          ) : null}
          {totalWeight > MAX_WEIGHT ? (
            <Alert variant="warning">
              Over the {MAX_WEIGHT} hg weight limit.
            </Alert>
          ) : null}
        </div>

        <SelectedChips items={selectedItems} onRemove={togglePokemon} />

        <Tooltip
          show={isListNameEmpty && !saving}
          content="Enter a list name first"
        >
          <Button
            variant="primary"
            disabled={!canSave || saving}
            onClick={handleSave}
          >
            {saving ? 'Saving…' : 'Save list'}
          </Button>
        </Tooltip>
        {saveError ? (
          <Alert variant="error" className="mt-3">
            {saveError}
          </Alert>
        ) : null}
      </Panel>

      <Panel title="Pokémon catalogue">
        <Field
          label="Search by name"
          hint={
            searchInput.trim().length > 0 &&
            searchInput.trim().length < MIN_SEARCH_LENGTH
              ? `Type at least ${MIN_SEARCH_LENGTH} characters to search.`
              : undefined
          }
        >
          <input
            type="search"
            className={inputClass}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="e.g. pika"
            autoComplete="off"
            aria-label="Search Pokémon by name"
          />
        </Field>

        {searchError ? (
          <Alert variant="error" className="mb-3">
            {searchError}
          </Alert>
        ) : null}
        {catalogError && !isSearchActive ? (
          <Alert variant="error" className="mb-3">
            {catalogError}
          </Alert>
        ) : null}

        {isSearchActive ? (
          <PokemonGridShell
            loading={showSearchSkeleton}
            busy={showSearchBusy}
            empty={
              !loadingSearch &&
              !searchError &&
              searchResults.length === 0
            }
            emptyMessage={`No Pokémon found for "${debouncedSearch}"`}
          >
            {searchCards}
          </PokemonGridShell>
        ) : (
          <>
            <PokemonGridShell loading={loadingCatalog}>
              {catalogCards}
            </PokemonGridShell>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                disabled={offset === 0 || loadingCatalog}
                onClick={() =>
                  setOffset((value) => Math.max(0, value - CATALOG_PAGE_SIZE))
                }
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages || 1}
              </span>
              <Button
                variant="secondary"
                disabled={
                  offset + CATALOG_PAGE_SIZE >= totalCount || loadingCatalog
                }
                onClick={() => setOffset((value) => value + CATALOG_PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </Panel>
    </Layout>
  );
}
