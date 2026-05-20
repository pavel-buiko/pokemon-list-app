import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteList, downloadListExport, fetchList } from '../api/client';
import { Layout } from '../components/Layout';
import { SavedPokemonRow } from '../components/pokemon/SavedPokemonRow';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Panel } from '../components/ui/Panel';
import type { ListDetail } from '../types';

function DetailListSkeleton() {
  return (
    <ul className="mt-4 divide-y divide-slate-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex animate-pulse items-center gap-3 py-3">
          <div className="size-12 shrink-0 rounded-full bg-slate-200 sm:size-14" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-3 w-36 rounded bg-slate-200" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ViewListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<ListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    fetchList(id)
      .then(setList)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDownload() {
    if (!id || !list) {
      return;
    }
    setDownloadError(null);
    setDownloading(true);
    try {
      await downloadListExport(id, list.name);
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : 'Failed to download file',
      );
    } finally {
      setDownloading(false);
    }
  }

  async function confirmDelete() {
    if (!id || !list) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      await deleteList(id);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete list');
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  return (
    <Layout title={list?.name ?? 'List details'}>
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete list?"
        description={
          list
            ? `Delete "${list.name}"?`
            : ''
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) {
            setDeleteDialogOpen(false);
          }
        }}
      />

      <div className="flex flex-wrap gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Back
        </Link>
        <Button
          variant="primary"
          disabled={!list || downloading || deleting}
          onClick={handleDownload}
        >
          {downloading ? 'Downloading…' : 'Download list'}
        </Button>
        <Button
          variant="danger"
          disabled={!list || deleting || downloading}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete list
        </Button>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {downloadError ? <Alert variant="error">{downloadError}</Alert> : null}

      <Panel className="min-h-[20rem]">
        {loading ? (
          <>
            <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
            <DetailListSkeleton />
          </>
        ) : null}

        {list ? (
          <>
            <p className="text-sm text-slate-500">
              {list.itemCount} Pokémon · {list.totalWeight} hg total
            </p>
            <ul className="mt-4 divide-y divide-slate-100">
              {list.items.map((item) => (
                <SavedPokemonRow
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  weight={item.weight}
                />
              ))}
            </ul>
          </>
        ) : null}
      </Panel>
    </Layout>
  );
}
