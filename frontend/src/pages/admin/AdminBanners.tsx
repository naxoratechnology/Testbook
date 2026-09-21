import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ImageIcon, PlusIcon, XIcon } from 'lucide-react';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { PageShell } from '../../components/ui/PageShell';
import { Badge, Button, Field, Input, Select, StatusBadge, Textarea } from '../../components/ui/Primitives';
import { bannersApi, type Banner, type BannerPayload } from '../../services/banners/banners.api';

const empty: BannerPayload = {
  title: '',
  subtitle: '',
  buttonLabel: '',
  buttonUrl: '/courses',
  placement: 'both',
  status: 'published',
  order: 0,
};

export function AdminBanners() {
  const [items, setItems] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerPayload>(empty);
  const [image, setImage] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const previewUrl = useMemo(() => image ? URL.createObjectURL(image) : editing?.thumbnail || '', [image, editing]);

  useEffect(() => () => {
    if (image && previewUrl) URL.revokeObjectURL(previewUrl);
  }, [image, previewUrl]);

  const load = async () => {
    const response = await bannersApi.list();
    setItems(response.data.data.banners);
  };

  useEffect(() => {
    load()
      .catch(() => setError('Unable to load banners.'))
      .finally(() => setLoading(false));
  }, []);

  const openForm = (item?: Banner) => {
    setEditing(item || null);
    setImage(null);
    setError('');
    setForm(item ? {
      title: item.title,
      subtitle: item.subtitle,
      buttonLabel: item.buttonLabel,
      buttonUrl: item.buttonUrl,
      placement: item.placement,
      status: item.status,
      order: item.order,
    } : { ...empty });
    setModalOpen(true);
  };

  const closeForm = () => {
    if (busy) return;
    setModalOpen(false);
    setEditing(null);
    setImage(null);
    setError('');
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing && !image) {
      setError('Choose a banner image.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const saved = editing
        ? (await bannersApi.update(editing._id, form)).data.data.banner
        : (await bannersApi.create(form)).data.data.banner;
      if (image) await bannersApi.upload(saved._id, image);
      await load();
      setModalOpen(false);
      setEditing(null);
      setImage(null);
    } catch (failure) {
      setError((failure as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Unable to save banner.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this banner and its uploaded image?')) return;
    try {
      await bannersApi.remove(id);
      await load();
      if (editing?._id === id) closeForm();
    } catch (failure) {
      setError((failure as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Unable to delete banner.');
    }
  };

  return (
    <PageShell
      title="Home & Dashboard Banners"
      subtitle="Manage promotional slides for the public home page and student dashboard."
      actions={<Button onClick={() => openForm()}><PlusIcon className="h-4 w-4" />Upload Banner</Button>}
      width="max-w-[1400px]"
    >
      {!modalOpen && error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <TableWrap footer={`${items.length} banner${items.length === 1 ? '' : 's'}`}>
        <Table>
          <thead>
            <tr>
              <Th>Preview</Th>
              <Th>Banner</Th>
              <Th>Placement</Th>
              <Th>Order</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-canvas/60">
                <Td>
                  <div className="flex h-14 w-28 items-center justify-center overflow-hidden rounded-lg border border-line bg-canvas">
                    {item.thumbnail
                      ? <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                      : <ImageIcon className="h-6 w-6 text-ink-muted" />}
                  </div>
                </Td>
                <Td>
                  <p className="font-medium text-ink">{item.title}</p>
                  <p className="mt-0.5 max-w-sm truncate text-xs text-ink-muted">{item.subtitle || 'No subtitle'}</p>
                </Td>
                <Td><Badge tone="brand">{item.placement === 'both' ? 'Home + Dashboard' : item.placement}</Badge></Td>
                <Td>{item.order}</Td>
                <Td><StatusBadge status={item.status} /></Td>
                <Td><RowActions onEdit={() => openForm(item)} onDelete={() => remove(item._id)} /></Td>
              </tr>
            ))}
            {!loading && !items.length && (
              <tr><Td className="py-12 text-center" colSpan={6}>No banners uploaded yet.</Td></tr>
            )}
            {loading && (
              <tr><Td className="py-12 text-center" colSpan={6}>Loading banners...</Td></tr>
            )}
          </tbody>
        </Table>
      </TableWrap>

      {modalOpen && (
        <BannerDialog title={editing ? 'Edit Banner' : 'Upload Banner'} busy={busy} onClose={closeForm}>
          <form onSubmit={save} className="space-y-4">
            {previewUrl && <img src={previewUrl} alt="Banner preview" className="aspect-[16/6] w-full rounded-xl border border-line object-cover" />}
            <Field label="Banner image" hint={editing ? 'Choose a file only if you want to replace the current image.' : 'Wide JPG, PNG or WebP · up to 5 MB'}>
              <Input required={!editing} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] || null)} />
            </Field>
            <Field label="Title"><Input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
            <Field label="Subtitle"><Textarea rows={3} value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button label"><Input value={form.buttonLabel} onChange={(event) => setForm({ ...form, buttonLabel: event.target.value })} /></Field>
              <Field label="Button link"><Input value={form.buttonUrl} onChange={(event) => setForm({ ...form, buttonUrl: event.target.value })} /></Field>
              <Field label="Show on">
                <Select value={form.placement} onChange={(event) => setForm({ ...form, placement: event.target.value as BannerPayload['placement'] })}>
                  <option value="both">Home + Dashboard</option>
                  <option value="home">Home only</option>
                  <option value="dashboard">Dashboard only</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as BannerPayload['status'] })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </Field>
              <Field label="Display order"><Input type="number" min="0" value={form.order} onChange={(event) => setForm({ ...form, order: Number(event.target.value) })} /></Field>
            </div>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" disabled={busy} onClick={closeForm}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? 'Saving...' : editing ? 'Update Banner' : 'Upload Banner'}</Button>
            </div>
          </form>
        </BannerDialog>
      )}
    </PageShell>
  );
}

function BannerDialog({ title, busy, onClose, children }: { title: string; busy: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="banner-dialog-title"
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-line bg-white p-0 text-ink shadow-lift backdrop:bg-slate-900/50"
    >
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="banner-dialog-title" className="text-lg font-semibold">{title}</h2>
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onClose} aria-label="Close dialog"><XIcon className="h-4 w-4" /></Button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
