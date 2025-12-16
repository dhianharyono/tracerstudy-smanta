import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

const AdminNewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchNewsDetail();
    }
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      const response = await axios.get(`/api/admin/news/${id}`);
      setNews(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memuat detail news');
      navigate('/admin/news');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-64px)]'>
        <div className='flex items-center gap-3 text-lg font-medium text-gray-400'>
          <FaSpinner className='animate-spin text-xl' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className='card'>
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-tertiary)',
          }}
        >
          <p>News tidak ditemukan</p>
          <button
            onClick={() => navigate('/admin/news')}
            className='btn btn-primary'
            style={{ marginTop: '16px' }}
          >
            Kembali ke News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='page-header'>
        <button
          onClick={() => navigate('/admin/news')}
          className='btn btn-secondary'
          style={{ marginRight: '16px' }}
        >
          ← Kembali
        </button>
        <h1 className='text-xl md:text-2xl'>{news.title}</h1>
      </div>

      <div className='card'>
        <div
          style={{
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <span
                style={{ color: 'var(--text-secondary)', fontSize: '14px' }}
              >
                Oleh:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {news.author?.username || 'Admin'}
                </strong>
              </span>
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
              {new Date(news.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  background: news.isPublished
                    ? 'var(--success)'
                    : 'var(--bg-tertiary)',
                  color: news.isPublished ? 'white' : 'var(--text-secondary)',
                }}
              >
                {news.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            color: 'var(--text-primary)',
            fontSize: '16px',
            lineHeight: '1.8',
            wordWrap: 'break-word',
          }}
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
        <style>{`
          .ql-editor {
            color: var(--text-primary);
          }
          .ql-editor a {
            color: var(--primary-light);
            text-decoration: underline;
          }
          .ql-editor img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 16px 0;
          }
          .ql-editor ol,
          .ql-editor ul {
            padding-left: 1.5em;
            margin: 12px 0;
          }
          .ql-editor h1,
          .ql-editor h2,
          .ql-editor h3,
          .ql-editor h4,
          .ql-editor h5,
          .ql-editor h6 {
            color: var(--text-primary);
            margin: 16px 0 8px 0;
          }
          .ql-editor p {
            margin: 12px 0;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminNewsDetail;
