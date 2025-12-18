import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';
import NewsDetail from '../../components/News/NewsDetail';

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

  const handleBack = () => {
    navigate('/alumni/news');
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
            onClick={handleBack}
            className='btn btn-primary mt-4'
          >
            Kembali ke News
          </button>
        </div>
      </div>
    );
  }

  return <NewsDetail news={news} onBack={handleBack} />;
};

export default AlumniNewsDetail;
