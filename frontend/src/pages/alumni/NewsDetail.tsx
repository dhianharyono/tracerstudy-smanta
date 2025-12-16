import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

interface NewsDetail {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    username?: string;
  };
}

const AlumniNewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchNewsDetail();
    }
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      const response = await axios.get<NewsDetail>(`/api/alumni/news/${id}`);
      setNews(response.data);

      await axios.post(`/api/alumni/news/${id}/read`);
    } catch (error) {
      let errorMessage = 'Gagal memuat detail news';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage =
          (error.response.data as { message?: string })?.message ||
          errorMessage;
      }
      toast.error(errorMessage);
      navigate('/alumni/news');
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
        <div className='p-10 text-center text-[color:var(--text-tertiary)]'>
          <p>News tidak ditemukan</p>
          <button
            onClick={() => navigate('/alumni/news')}
            className='btn btn-primary mt-4'
          >
            Kembali ke News
          </button>
        </div>
      </div>
    );
  }

  // Tailwind CSS classes for content styling (simulating prose/typography styles)
  const contentClasses = `
    prose max-w-none text-[color:var(--text-primary)] leading-relaxed text-base
    // Overriding default Quill/HTML styles using Tailwind JIT/Custom Utilities
    [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4
    [&_a]:text-[color:var(--primary)] [&_a]:underline
    [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-6 [&_ul]:pl-6 [&_ol]:my-3 [&_ul]:my-3
    [&_h1]:mt-4 [&_h2]:mt-4 [&_h3]:mt-4 [&_h4]:mt-4 [&_h5]:mt-4 [&_h6]:mt-4 [&_h1]:mb-2 [&_h2]:mb-2 [&_h3]:mb-2 [&_h4]:mb-2 [&_h5]:mb-2 [&_h6]:mb-2
    [&_p]:my-3
    text-xs md:text-sm
  `;

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='page-header'>
        <button
          onClick={() => navigate('/alumni/news')}
          className='btn btn-secondary mr-4 flex items-center gap-2 mb-5'
        >
          <FaArrowLeft />
          <span>Kembali</span>
        </button>
        <h1 className='text-lg md:text-xl'>{news.title}</h1>
      </div>

      <div className='card'>
        <div className='mb-6 border-b border-[color:var(--border-color)] pb-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <span className='text-sm text-[color:var(--text-secondary)]'>
                Oleh:
                <strong className='text-[color:var(--text-primary)]'>
                  {news.author?.username || 'Admin'}
                </strong>
              </span>
            </div>
            <div className='text-xs md:text-sm text-[color:var(--text-tertiary)]'>
              {new Date(news.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        <div
          className={contentClasses}
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </div>
    </div>
  );
};

export default AlumniNewsDetail;
