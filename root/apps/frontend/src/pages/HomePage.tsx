import { useCallback, useEffect, useState } from 'react';
import { deleteList, fetchLists } from '../api/client';
import { Layout } from '../components/Layout';
import { Alert } from '../components/ui/Alert';
import { Button, ButtonLink } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ListCardSkeleton } from '../components/ui/ListCardSkeleton';
import type { ListSummary } from '../types';

const LIST_SKELETON_COUNT = 4;

export function HomePage() {
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListSummary | null>(null);

  const loadLists = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchLists()
      .then(setLists)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);
    setError(null);
    try {
      await deleteList(deleteTarget.id);
      setLists((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete list');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Layout title="Your collections">
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete list?"
        description={`Delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        loading={deletingId !== null}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deletingId) {
            setDeleteTarget(null);
          }
        }}
      />

      <div className="flex flex-wrap gap-3">
        <ButtonLink to="/lists/new" variant="primary">
          Create New List
        </ButtonLink>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <ul className="flex min-h-[18rem] flex-col gap-3">
        {loading
          ? Array.from({ length: LIST_SKELETON_COUNT }).map((_, i) => (
              <ListCardSkeleton key={i} />
            ))
          : null}

        {!loading && !error && lists.length === 0 ? (
          <li className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No lists yet. Create your first Pokémon collection.
          </li>
        ) : null}

        {!loading
          ? lists.map((list) => (
              <li
                key={list.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {list.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {list.itemCount} Pokémon · {list.totalWeight} hg total
                  </p>
                  <p className="text-xs text-slate-400">
                    Updated {new Date(list.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ButtonLink to={`/lists/${list.id}`} variant="secondary">
                    Open
                  </ButtonLink>
                  <Button
                    variant="danger"
                    disabled={deletingId === list.id}
                    onClick={() => setDeleteTarget(list)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))
          : null}
      </ul>
    </Layout>
  );
}
