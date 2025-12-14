import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner, FaEye } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { stripHtml } from '../../utils/helpers';

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

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'size',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'script', 'indent',
    'color', 'background', 'align',
    'link', 'image'
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
    try {
      if (editingNews) {
        await axios.put(`/api/admin/news/${editingNews._id}`, formData);
        toast.success('News berhasil diperbarui!');
      } else {
        await axios.post('/api/admin/news', formData);
        toast.success('News berhasil ditambahkan!');
      }
      setShowForm(false);
      setEditingNews(null);
      setFormData({ title: '', content: '', type: 'all', isPublished: false });
      fetchNews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan news');
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
      toast.success('News berhasil dihapus!');
      fetchNews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus berita');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNews(null);
    setFormData({ title: '', content: '', type: 'all', isPublished: false });
  };

  if (loading) {
    return (
      <div
        className='loading'
        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <FaSpinner className='spinner' />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <div className='page-header'>
        <h1 className='page-title'>Kelola News</h1>
        <button onClick={() => setShowForm(true)} className='btn btn-primary'>
          + Tambah News
        </button>
      </div>

      {showForm && (
        <div className='card' style={{ marginBottom: '24px' }}>
          <h2>{editingNews ? 'Edit News' : 'Tambah News Baru'}</h2>
          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label>Judul *</label>
              <input
                type='text'
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className='form-group'>
              <label>Konten *</label>
              <div style={{ 
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(value) =>
                    setFormData({ ...formData, content: value })
                  }
                  modules={quillModules}
                  formats={quillFormats}
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <style>{`
                .ql-container {
                  background: var(--bg-secondary);
                  color: var(--text-primary);
                  border-bottom-left-radius: 8px;
                  border-bottom-right-radius: 8px;
                  border: 1px solid var(--border-color);
                  border-top: none;
                  min-height: 200px;
                }
                .ql-toolbar {
                  background: var(--bg-tertiary);
                  border-top-left-radius: 8px;
                  border-top-right-radius: 8px;
                  border: 1px solid var(--border-color);
                  border-bottom: none;
                }
                .ql-toolbar .ql-stroke {
                  stroke: var(--text-primary);
                }
                .ql-toolbar .ql-fill {
                  fill: var(--text-primary);
                }
                .ql-toolbar .ql-picker-label {
                  color: var(--text-primary);
                }
                .ql-toolbar .ql-picker-options {
                  background: var(--bg-card);
                  border: 1px solid var(--border-color);
                  color: var(--text-primary);
                }
                .ql-toolbar button:hover,
                .ql-toolbar button.ql-active {
                  background: var(--bg-secondary);
                }
                .ql-editor {
                  min-height: 200px;
                  color: var(--text-primary);
                }
                .ql-editor.ql-blank::before {
                  color: var(--text-muted);
                  font-style: normal;
                }
                .ql-editor a {
                  color: var(--primary-light);
                }
                .ql-editor img {
                  max-width: 100%;
                  height: auto;
                }
                .ql-editor ol,
                .ql-editor ul {
                  padding-left: 1.5em;
                }
                .ql-editor h1,
                .ql-editor h2,
                .ql-editor h3,
                .ql-editor h4,
                .ql-editor h5,
                .ql-editor h6 {
                  color: var(--text-primary);
                }
              `}</style>
            </div>
            <div className='form-group'>
              <label>Tipe News *</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
              >
                <option value='all'>Semua (Student & Alumni)</option>
                <option value='student'>Student</option>
                <option value='alumni'>Alumni</option>
              </select>
            </div>
            <div className='form-group'>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type='checkbox'
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span>Publish</span>
              </label>
            </div>
            <div className='flex gap-3 flex-wrap'>
              <button type='submit' className='btn btn-primary'>
                {editingNews ? 'Update' : 'Simpan'}
              </button>
              <button
                type='button'
                onClick={handleCancel}
                className='btn btn-secondary'
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className='card max-w-sm md:max-w-md lg:max-w-full'>
        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>Judul</th>
                <th>Konten</th>
                <th>Tipe</th>
                <th>Author</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {news.map((newsItem) => (
                <tr key={newsItem._id}>
                  <td>{newsItem.title}</td>
                  <td
                    style={{
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {newsItem.content ? stripHtml(newsItem.content).substring(0, 100) : '-'}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        background:
                          newsItem.type === 'all'
                            ? 'var(--primary)'
                            : newsItem.type === 'student'
                            ? '#3b82f6'
                            : '#8b5cf6',
                        color: 'white',
                      }}
                    >
                      {newsItem.type === 'all'
                        ? 'Semua'
                        : newsItem.type === 'student'
                        ? 'Student'
                        : 'Alumni'}
                    </span>
                  </td>
                  <td>{newsItem.author?.username || '-'}</td>
                  <td>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        background: newsItem.isPublished
                          ? 'var(--success)'
                          : 'var(--bg-tertiary)',
                        color: newsItem.isPublished
                          ? 'white'
                          : 'var(--text-secondary)',
                      }}
                    >
                      {newsItem.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    {new Date(newsItem.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td>
                    <div
                      style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
                    >
                      <button
                        onClick={() => navigate(`/admin/news/${newsItem._id}`)}
                        className='btn btn-secondary'
                        style={{
                          padding: '5px 10px',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <FaEye />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(newsItem)}
                        className='btn btn-secondary'
                        style={{
                          padding: '5px 10px',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(newsItem._id)}
                        className='btn btn-secondary'
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNews;
