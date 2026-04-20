import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '@/components/toast';
import NewsDetail from '../../components/News/NewsDetail';
import SmartLoader from '@/components/SmartLoader';
import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isUniversityIncomplete } from '@/utils/validation';

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
  const { user } = useAuth();

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
      Toast(errorMessage, 'error');
      navigate('/alumni/news');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/alumni/news');
  };

  if (loading) {
    return <SmartLoader />;
  }

  if (user?.questionnaireCompleted === false) {
    return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
  }

  if (user && isUniversityIncomplete(user)) {
    return <RestrictedAccess type='university_incomplete' role='alumni' />;
  }

  if (!news) {
    return (
      <div className='card'>
        <div className='p-10 text-center text-[color:var(--text-tertiary)]'>
          <p>News tidak ditemukan</p>
          <button onClick={handleBack} className='btn btn-primary mt-4'>
            Kembali ke News
          </button>
        </div>
      </div>
    );
  }

  return <NewsDetail news={news} onBack={handleBack} />;
};

export default AlumniNewsDetail;
