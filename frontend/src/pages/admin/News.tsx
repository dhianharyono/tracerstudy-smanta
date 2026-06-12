import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '@/components/toast';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaTimes,
  FaSave,
} from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { stripHtml } from '../../utils/helpers';
import SmartLoader from '@/components/SmartLoader';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import {
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeadCell,
} from '@/components/common/Table';

const AdminNews = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'all',
    isPublished: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link',
    'image',
  ];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get('/api/admin/news');
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingNews) {
        await axios.put(`/api/admin/news/${editingNews._id}`, formData);
        Toast('News berhasil diperbarui!', 'success');
      } else {
        await axios.post('/api/admin/news', formData);
        Toast('News berhasil ditambahkan!', 'success');
      }
      setShowForm(false);
      setEditingNews(null);
      setFormData({ title: '', content: '', type: 'all', isPublished: false });
      fetchNews();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal menyimpan news', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (newsItem: any) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      type: newsItem.type || 'all',
      isPublished: newsItem.isPublished,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus berita ini?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/news/${id}`);
      Toast('News berhasil dihapus!', 'success');
      fetchNews();
    } catch (error: any) {
      Toast(error.response?.data?.message || 'Gagal menghapus berita', 'error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNews(null);
    setFormData({ title: '', content: '', type: 'all', isPublished: false });
  };

  if (loading) {
    return <SmartLoader />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <PageHeader
        title='Kelola Berita & Pengumuman'
        description='Membuat dan mengelola berita untuk alumni dan mahasiswa'
      >
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className='flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-white transition-colors hover:bg-[var(--primary-dark)]'
          >
            <FaPlus /> Tambah Berita
          </button>
        )}
      </PageHeader>

      {showForm && (
        <Card className='mb-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-[color:var(--text-primary)]'>
              {editingNews ? 'Edit Berita' : 'Tambah Berita Baru'}
            </h2>
            <button
              onClick={handleCancel}
              className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            >
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='form-group md:col-span-2'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Judul *
                </label>
                <input
                  type='text'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  required
                />
              </div>

              <div className='form-group md:col-span-2'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Konten *
                </label>
                <div className='overflow-hidden rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]'>
                  <ReactQuill
                    theme='snow'
                    value={formData.content}
                    onChange={(value) =>
                      setFormData({ ...formData, content: value })
                    }
                    modules={quillModules}
                    formats={quillFormats}
                    className='text-[color:var(--text-primary)] bg-[color:var(--bg-tertiary)]'
                  />
                </div>
                <style>{`
                  .ql-toolbar {
                    border-color: var(--border-color) !important;
                    background: var(--bg-tertiary);
                  }
                   .ql-container {
                    border-color: var(--border-color) !important;
                    font-family: inherit;
                    min-height: 200px;
                    color: var(--text-primary);
                  }
                   .ql-stroke {
                    stroke: var(--text-secondary) !important;
                  }
                  .ql-fill {
                    fill: var(--text-secondary) !important;
                  }
                  .ql-picker {
                    color: var(--text-secondary) !important;
                  }
                `}</style>
              </div>

              <div className='form-group'>
                <label className='block text-sm font-medium text-[color:var(--text-secondary)] mb-1'>
                  Target Audience *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className='w-full appearance-none rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)] p-2.5 text-sm outline-none focus:border-[var(--primary)] text-[color:var(--text-primary)]'
                  required
                >
                  <option value='all'>Semua (Student & Alumni)</option>
                  <option value='student'>Student Only</option>
                  <option value='alumni'>Alumni Only</option>
                </select>
              </div>

              <div className='form-group flex items-end'>
                <label className='!flex items-center gap-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                    className='h-5 w-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]'
                  />
                  <span className='text-sm font-medium text-[color:var(--text-primary)] w-fit'>
                    Publish
                  </span>
                </label>
              </div>
            </div>

            <div className='mt-6 flex justify-end gap-3'>
              <button
                type='button'
                onClick={handleCancel}
                className='rounded-lg border border-[color:var(--border-color)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)]'
              >
                Batal
              </button>
              <button
                type='submit'
                disabled={isSubmitting}
                className='flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <FaSave /> {editingNews ? 'Update' : 'Simpan'}
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      )}

      <TableContainer>
        <TableHeader>
          <TableHeadCell>Judul & Konten</TableHeadCell>
          <TableHeadCell>Target</TableHeadCell>
          <TableHeadCell>Status</TableHeadCell>
          <TableHeadCell>Author</TableHeadCell>
          <TableHeadCell>Tanggal</TableHeadCell>
          <TableHeadCell className='text-center'>Aksi</TableHeadCell>
        </TableHeader>
        <TableBody>
          {news.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className='p-8 text-center text-[color:var(--text-secondary)]'
              >
                Belum ada berita yang dibuat.
              </TableCell>
            </TableRow>
          ) : (
            news.map((newsItem) => (
              <TableRow
                key={newsItem._id}
              >
                <TableCell className='max-w-xs'>
                  <div
                    className='font-semibold text-[color:var(--text-primary)] truncate'
                    title={newsItem.title}
                  >
                    {newsItem.title}
                  </div>
                  <div
                    className='text-xs text-[color:var(--text-secondary)] truncate'
                    title={stripHtml(newsItem.content)}
                  >
                    {newsItem.content ? stripHtml(newsItem.content) : '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border 
                      ${newsItem.type === 'all'
                        ? 'bg-purple-50 text-purple-750 border-purple-200/50'
                        : newsItem.type === 'student'
                          ? 'bg-blue-50 text-blue-750 border-blue-200/50'
                          : 'bg-green-50 text-green-750 border-green-200/50'
                      }`}
                  >
                    {newsItem.type === 'all'
                      ? 'Semua'
                      : newsItem.type === 'student'
                        ? 'Siswa'
                        : 'Alumni'}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border 
                      ${newsItem.isPublished
                        ? 'bg-green-50 text-green-750 border-green-200/50'
                        : 'bg-slate-100 text-slate-750 border-slate-200/50'
                      }`}
                  >
                    {newsItem.isPublished ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell className='text-[color:var(--text-secondary)]'>
                  {newsItem.author?.username || 'Admin'}
                </TableCell>
                <TableCell className='text-[color:var(--text-secondary)]'>
                  {new Date(newsItem.createdAt).toLocaleDateString(
                    'id-ID',
                    {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    },
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex items-center justify-center gap-2'>
                    <button
                      onClick={() =>
                        navigate(`/admin/news/${newsItem._id}`)
                      }
                      className='rounded p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors dark:text-blue-400 dark:hover:bg-blue-900/20'
                      title='Lihat Detail'
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEdit(newsItem)}
                      className='rounded p-2 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 transition-colors dark:text-yellow-500 dark:hover:bg-yellow-900/20'
                      title='Edit'
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(newsItem._id)}
                      className='rounded p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors dark:text-red-400 dark:hover:bg-red-900/20'
                      title='Hapus'
                    >
                      <FaTrash />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </TableContainer>
    </div>
  );
};

export default AdminNews;
