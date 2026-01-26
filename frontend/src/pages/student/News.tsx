import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NewsList, { NewsItem } from '../../components/News/NewsList';
import { useAuth } from '@/contexts/AuthContext';
import RestrictedAccess from '@/components/RestrictedAccess';
import { isStudentProfileComplete } from '@/utils/helpers';
import SmartLoader from '@/components/SmartLoader';
import PageHeader from '@/components/common/PageHeader';
import { FaSearch } from 'react-icons/fa';

const StudentNews = () => {
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

  const filteredNews = useMemo(() => {
    return news.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [news, searchQuery]);

  if (loading) {
    return <SmartLoader />;
  }

  if (!isStudentProfileComplete(user)) {
    return <RestrictedAccess type='profile_incomplete' role='student' />;
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
        <PageHeader
          title='Berita & Artikel'
          description='Informasi terbaru seputar Alumni dan SMANTA'
        />

        <div className='relative w-full md:w-64 md:mt-0'>
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

export default StudentNews;
