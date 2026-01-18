import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NewsList, { NewsItem } from '../../components/News/NewsList';

import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import SmartLoader from '@/components/SmartLoader';

const AlumniNews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get<NewsItem[]>('/api/alumni/news');
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsClick = (newsId: string) => {
    navigate(`/alumni/news/${newsId}`);
  };

  if (loading) {
    return <SmartLoader />;
  }

  if (user?.questionnaireCompleted === false) {
    return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='text-center md:text-left mb-10'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Berita & Artikel
        </h1>
        <p className='text-[color:var(--text-secondary)]'>
          Informasi terbaru seputar Alumni dan SMANTA
        </p>
      </div>
      <NewsList news={news} onNewsClick={handleNewsClick} />
    </div>
  );
};

export default AlumniNews;
