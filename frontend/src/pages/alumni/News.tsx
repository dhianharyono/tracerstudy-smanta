import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NewsList, { NewsItem } from '../../components/News/NewsList';
import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import SmartLoader from '@/components/SmartLoader';
import { isUniversityIncomplete } from '@/utils/validation';
import { FaSearch } from 'react-icons/fa';

const AlumniNews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredNews = useMemo(() => {
    return news.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [news, searchQuery]);

  if (loading) {
    return <SmartLoader />;
  }

  const hasUniversityData = !!(user?.university?.name);
  if (user?.questionnaireCompleted === false && !hasUniversityData) {
    return <RestrictedAccess type='questionnaire_incomplete' role='alumni' />;
  }

  if (user && isUniversityIncomplete(user)) {
    return <RestrictedAccess type='university_incomplete' role='alumni' />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
        <div>
          <h1 className='text-lg md:text-2xl font-bold text-[color:var(--text-primary)] !mb-0'>
            Berita & Artikel
          </h1>
          <p className='text-[color:var(--text-secondary)] text-xs md:text-sm'>
            Informasi terbaru seputar Alumni dan SMANTA
          </p>
        </div>

        <div className='relative w-full md:w-64'>
          <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]' />
          <input
            type='text'
            placeholder='Cari berita...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg-card)] py-2 pl-10 pr-4 text-sm text-[color:var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]'
          />
        </div>
      </div>

      <NewsList news={filteredNews} onNewsClick={handleNewsClick} />
    </div>
  );
};

export default AlumniNews;
