import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NewsList, { NewsItem } from '../../components/News/NewsList';

import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete } from '@/utils/helpers';
import SmartLoader from '@/components/SmartLoader';
import PageHeader from '@/components/common/PageHeader';

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
      <PageHeader
        title='Berita & Artikel'
        description='Informasi terbaru seputar Alumni dan SMANTA'
      />

      <NewsList news={news} onNewsClick={handleNewsClick} />
    </div>
  );
};

export default StudentNews;
