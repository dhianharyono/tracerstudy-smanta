import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '@/components/toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import NewsDetail from '../../components/News/NewsDetail';

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
      Toast(error.response?.data?.message || 'Gagal memuat detail news', 'error');
      navigate('/student/news');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/student/news');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!news) {
    return (
      <div className='card'>
        <div className='text-center p-10 text-[var(--text-tertiary)]'>
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

export default StudentNewsDetail;
