import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import NewsList, { NewsItem } from '../../components/News/NewsList';

const StudentNews = () => {
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
    return (
      <div className='flex items-center justify-center h-[calc(100vh-64px)]'>
        <div className='flex items-center gap-3 text-lg font-medium text-gray-400'>
          <FaSpinner className='animate-spin text-xl' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8 page-fade-in'>
      <div className='page-header mb-8 items-center'>
        <h1 className='text-xl md:text-3xl font-bold'>Berita & Artikel</h1>
        <p className='text-[var(--text-secondary)]'>
          Informasi terbaru seputar Alumni dan Sekolah
        </p>
      </div>

      <NewsList news={news} onNewsClick={handleNewsClick} />
    </div>
  );
};

export default StudentNews;
