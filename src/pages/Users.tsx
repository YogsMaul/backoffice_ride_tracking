import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, AlertCircle, Inbox, UserPlus, Pencil, Trash2, Shield } from 'lucide-react';
import { usersAPI, type UserRow, type UserFormPayload, type UserUpdatePayload } from '../lib/api';
import UserFormModal from '../components/UserFormModal';
import ConfirmModal from '../components/ConfirmModal';
import { useSnackbar } from '../components/Snackbar';

type FormMode = 'create' | 'edit';

function extractErrorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: string } }; message?: string };
  return e?.response?.data?.error || e?.message || fallback;
}

function formatJoined(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Users() {
  const [q, setQ] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const snackbar = useSnackbar();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await usersAPI.getAll()).data as { users?: UserRow[] },
  });

  const users: UserRow[] = data?.users ?? [];

  const filtered = q.trim()
    ? users.filter(
        (u) =>
          (u.name || '').toLowerCase().includes(q.toLowerCase()) ||
          (u.email || '').toLowerCase().includes(q.toLowerCase()),
      )
    : users;

  const createMut = useMutation({
    mutationFn: (payload: UserFormPayload) => usersAPI.create(payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      snackbar.success('Pengguna berhasil ditambahkan.');
      closeForm();
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Gagal menambahkan pengguna.');
      setFormError(msg);
      snackbar.error(msg);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserUpdatePayload }) =>
      usersAPI.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      snackbar.success('Pengguna berhasil diperbarui.');
      closeForm();
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Gagal memperbarui pengguna.');
      setFormError(msg);
      snackbar.error(msg);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => usersAPI.remove(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      snackbar.success(`Pengguna ${confirmDelete?.name} berhasil dihapus.`);
      setConfirmDelete(null);
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Gagal menghapus pengguna.');
      snackbar.error(msg);
      setConfirmDelete(null);
    },
  });

  const openCreate = () => {
    setFormMode('create');
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setFormMode('edit');
    setEditing(u);
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setFormError(null);
  };

  const handleSubmit = async (payload: UserFormPayload | UserUpdatePayload) => {
    setFormError(null);
    if (formMode === 'create') {
      await createMut.mutateAsync(payload as UserFormPayload);
    } else if (editing) {
      await updateMut.mutateAsync({ id: editing.id, payload: payload as UserUpdatePayload });
    }
  };

  // Self-delete guard: backend sudah blokir `cannot delete your own account`
  // (400) — frontend disable-delete jujur pakai decode dari admin_token,
  // tapi karena AuthContext tidak simpan user object, guard UI di sini
  // disederhanakan ke server-enforced check (error ditampilkan via snackbar
  // pada onError/deleteMut). Tidak mencoba klaim knowledge identitas lokal.
  const isLastAdmin = (u: UserRow) =>
    u.role === 'admin' && users.filter((x) => x.role === 'admin').length === 1;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-2 border-b border-line pb-5">
        <p className="ops-eyebrow text-[10px] text-moss">Pengguna</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Manajemen Pengguna
        </h1>
        <p className="text-sm text-muted">Lihat, tambah, ubah, dan nonaktifkan pengguna sistem.</p>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari pengguna berdasarkan nama atau email"
              aria-label="Cari pengguna berdasarkan nama atau email"
              className="w-full rounded-lg border border-line bg-paper py-2 pl-10 pr-4 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="ops-figures font-mono text-xs text-muted">
              {filtered.length} dari {users.length} pengguna
            </span>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-moss px-3 py-1.5 text-xs font-medium text-card shadow-sm hover:bg-moss/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss"
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
              Tambah Pengguna
            </button>
          </div>
        </div>

        {isError && (
          <div
            role="alert"
            className="m-4 flex items-start gap-3 rounded-xl border border-warn-line bg-warn-fill p-4"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warn-ink" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warn-ink">Gagal memuat pengguna</p>
              <p className="mt-1 text-xs text-warn-ink/90">
                {error instanceof Error ? error.message : 'Gangguan koneksi'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-xs font-medium text-warn-ink underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-moss rounded"
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {!isError && isLoading && (
          <p className="p-8 text-center text-sm text-muted" role="status">
            Memuat pengguna…
          </p>
        )}

        {!isError && !isLoading && users.length === 0 && (
          <div className="p-8 text-center">
            <Inbox className="mx-auto mb-2 h-10 w-10 text-muted" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">Belum ada pengguna</p>
            <p className="mt-1 text-xs text-muted">
              Tambahkan pengguna pertama kamu dengan tombol &ldquo;Tambah Pengguna&rdquo; di atas.
            </p>
          </div>
        )}

        {!isError && !isLoading && users.length > 0 && filtered.length === 0 && (
          <div className="p-8 text-center">
            <Search className="mx-auto mb-2 h-10 w-10 text-muted" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">Tidak ada pengguna yang cocok dengan &ldquo;{q}&rdquo;</p>
            <button
              type="button"
              onClick={() => setQ('')}
              className="mt-2 text-xs font-medium text-moss underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-moss rounded"
            >
              Hapus pencarian
            </button>
          </div>
        )}

        {!isError && !isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-line bg-paper">
                <tr>
                  <th scope="col" className="ops-eyebrow px-6 py-3 text-left text-[10px] text-muted">Pengguna</th>
                  <th scope="col" className="ops-eyebrow px-6 py-3 text-left text-[10px] text-muted">Email</th>
                  <th scope="col" className="ops-eyebrow px-6 py-3 text-left text-[10px] text-muted">Peran</th>
                  <th scope="col" className="ops-eyebrow px-6 py-3 text-left text-[10px] text-muted">Bergabung</th>
                  <th scope="col" className="ops-eyebrow px-6 py-3 text-right text-[10px] text-muted">Perjalanan</th>
                  <th scope="col" className="ops-eyebrow px-6 py-3 text-right text-[10px] text-muted">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((user) => {
                  const rowBusy =
                    updateMut.isPending && updateMut.variables?.id === user.id;
                  const deleteBusy =
                    deleteMut.isPending && deleteMut.variables === user.id;
                  const rowLoading = rowBusy || deleteBusy;

                  return (
                    <tr key={user.id} className="transition-colors hover:bg-moss-soft/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-moss-soft text-sm font-semibold text-moss ring-1 ring-line"
                            aria-hidden="true"
                          >
                            {user.name?.[0]?.toUpperCase() ?? '?'}
                          </span>
                          <span className="font-medium text-ink">{user.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink">{user.email}</td>
                      <td className="px-6 py-4">
                        <RolePill role={user.role} />
                      </td>
                      <td className="ops-figures px-6 py-4 font-mono text-xs text-muted">
                        {formatJoined(user.created_at)}
                      </td>
                      <td className="ops-figures px-6 py-4 text-right font-mono text-sm font-semibold text-ink">
                        {user.ridesCount ?? 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            disabled={rowLoading}
                            aria-label={`Edit ${user.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:opacity-50"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(user)}
                            disabled={rowLoading || isLastAdmin(user)}
                            title={
                              isLastAdmin(user)
                                ? 'Tidak bisa menghapus admin terakhir'
                                : 'Hapus user'
                            }
                            aria-label={`Delete ${user.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-warn-fill hover:text-warn-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <UserFormModal
        open={formOpen}
        mode={formMode}
        initial={editing}
        loading={createMut.isPending || updateMut.isPending}
        error={formError}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={!!confirmDelete}
        title={`Hapus ${confirmDelete?.name || 'pengguna'}?`}
        message="Pengguna tidak akan bisa login lagi. Data perjalanan dan log aktivitas mereka tetap tersimpan."
        confirmText="Hapus"
        cancelText="Batal"
        loading={deleteMut.isPending}
        onConfirm={() => {
          if (confirmDelete) deleteMut.mutate(confirmDelete.id);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function RolePill({ role }: { role?: string }) {
  const isAdmin = role === 'admin';
  return (
    <span
      className={
        isAdmin
          ? 'inline-flex items-center gap-1.5 rounded-full bg-moss-soft px-2 py-0.5 text-[11px] font-medium text-moss'
          : 'inline-flex items-center gap-1.5 text-xs text-muted'
      }
    >
      {isAdmin ? (
        <Shield className="h-3 w-3" aria-hidden="true" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-muted" aria-hidden="true" />
      )}
      {isAdmin ? 'Admin' : 'Pengguna'}
    </span>
  );
}
