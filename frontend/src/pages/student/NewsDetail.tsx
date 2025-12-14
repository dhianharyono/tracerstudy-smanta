import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const StudentNewsDetail = () => {
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
      const response = await axios.get(`/api/student/news/${id}`);
      setNews(response.data);

      await axios.post(`/api/student/news/${id}/read`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memuat detail news');
      navigate('/student/news');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className='loading'>⏳ Loading...</div>;
  }

  if (!news) {
    return (
      <div className='card'>
        <div className='text-center p-10 text-[var(--text-tertiary)]'>
          <p>News tidak ditemukan</p>
          <button
            onClick={() => navigate('/student/news')}
            className='btn btn-primary mt-4'
          >
            Kembali ke News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='page-header'>
        <button
          onClick={() => navigate('/student/news')}
          className='btn btn-secondary mr-4'
        >
          ← Kembali
        </button>
        <h1 className='page-title'>{news.title}</h1>
      </div>

      <div className='card'>
        <div
          className='mb-6 pb-4'
          style={{
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div className='flex justify-center items-center flex-wrap gap-3'>
            <div>
              <span className='text-sm text-[var(--text-secondary)]'>
                Oleh:{' '}
                <strong className='text[var(--text-primary)]'>
                  {news.author?.username || 'Admin'}
                </strong>
              </span>
            </div>
            <div className='text[var(--text-primary)] text-sm'>
              {new Date(news.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        <div
          className='text-[var(--text-primary)] text-[16px]'
          style={{
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

export default StudentNewsDetail;
