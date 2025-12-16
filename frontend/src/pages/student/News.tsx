import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { stripHtml } from '../../utils/helpers';
import { FaSpinner } from 'react-icons/fa';

interface NewsAuthor {
  username?: string;
}

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  author: NewsAuthor;
}

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
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='page-header'>
        <h1 className='text-xl md:text-2xl'>News</h1>
      </div>

      {news.length === 0 ? (
        <div className='card'>
          <div className='p-10 text-xs md:text-sm text-center text-[color:var(--text-tertiary)]'>
            <div className='mb-4 text-3xl sm:text-6xl'>📰</div>
            <p>Belum ada news yang tersedia</p>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6'>
          {news.map((newsItem) => (
            <div
              key={newsItem._id}
              onClick={() => handleNewsClick(newsItem._id)}
              className='cursor-pointer rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-6 transition-all duration-200 ease-in-out hover:translate-y-[-4px] hover:shadow-lg hover:bg-[color:var(--bg-card-hover)]'
            >
              <h3 className='mb-3 text-sm md:text-xl font-semibold leading-snug text-[color:var(--text-primary)]'>
                {newsItem.title}
              </h3>
              <p className='mb-4 text-xs md:text-sm leading-relaxed text-[color:var(--text-secondary)] line-clamp-3'>
                {(() => {
                  const plainText = stripHtml(newsItem.content || '');
                  return plainText.length > 90
                    ? `${plainText.substring(0, 90)}...`
                    : plainText;
                })()}
              </p>
              <div className='flex items-center justify-between border-t border-[color:var(--border-color)] pt-3 text-xs text-[color:var(--text-tertiary)]'>
                <span>{newsItem.author?.username || 'Admin'}</span>
                <span>
                  {new Date(newsItem.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNews;
