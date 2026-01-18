import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NewsList, { NewsItem } from '../../components/News/NewsList';

import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete } from '@/utils/helpers';
import SmartLoader from '@/components/SmartLoader';

const StudentNews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get<NewsItem[]>('/api/student/news');
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsClick = (newsId: string) => {
    navigate(`/student/news/${newsId}`);
  };

  if (loading) {
    return <SmartLoader />;
  }

  if (!isStudentProfileComplete(user)) {
    return <RestrictedAccess type='profile_incomplete' role='student' />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='text-center md:text-left mb-10'>
        <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
          Berita & Artikel
        </h1>
        <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
          Informasi terbaru seputar Alumni dan SMANTA
        </p>
      </div>

      <NewsList news={news} onNewsClick={handleNewsClick} />
    </div>
  );
};

export default StudentNews;
